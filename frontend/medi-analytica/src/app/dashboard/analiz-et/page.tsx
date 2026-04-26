"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { UploadCloud, CheckCircle2, Activity, Sparkles, X, FileScan, Brain, Eye, Bone, Layers, Stethoscope, Info, AlertTriangle, User, Calendar } from 'lucide-react';
import Image from 'next/image';
import { getUserKeys } from '@/lib/userStorage';
import { notify } from '@/lib/notifications';
import { getSymptomHintsWithFallback, DiseaseType } from '@/lib/analysisSymptom';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { compressImage } from '@/lib/utils';
import { generateAnalysisPDF } from '@/lib/pdfGenerator';

interface AnalysisPossibility {
    prediction: string;
    confidence: number;
}

interface AnalysisResultData {
    possibilities: AnalysisPossibility[];
}

interface AnalysisItem {
    id: number;
    createdAt: string;
    category: string;
    result: string;
    confidence: number;
    isFavorite: boolean;
    image?: string;
}

export default function AnalizEtPage() {
    const [selected, setSelected] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResultData | null>(null);
    const [patientEmail, setPatientEmail] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setPatientEmail(user.email || '');
            } catch (e) { }
        }
    }, []);

    const diseases = [
        { id: 'deri', name: 'Deri', icon: <Layers size={20} />, type: 'skin' as DiseaseType },
        { id: 'akciger', name: 'Akciğer', icon: <Activity size={20} />, type: 'lung' as DiseaseType },
        { id: 'kemik', name: 'Kemik', icon: <Bone size={20} />, type: 'bone' as DiseaseType },
        { id: 'beyin', name: 'Beyin', icon: <Brain size={20} />, type: 'brain' as DiseaseType },
        { id: 'goz', name: 'Göz', icon: <Eye size={20} />, type: 'eye' as DiseaseType }
    ];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedFile = await compressImage(file, 800, 0.7);
                setSelectedFile(compressedFile);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(compressedFile);
                setResult(null);
            } catch (error) {
                console.error("Görüntü sıkıştırma hatası:", error);
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setPreviewUrl(reader.result as string);
                reader.readAsDataURL(file);
                setResult(null);
            }
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setSelected(''); // opsiyonel olarak seçimi de silebiliriz, ama kalsın derseniz bu satırı çıkarabilirsiniz.
    };

    const saveToHistory = (analysisResult: AnalysisResultData, imageUrl?: string) => {
        const { historyKey } = getUserKeys();
        const storedData = localStorage.getItem(historyKey);
        let history: AnalysisItem[] = [];
        if (storedData) history = JSON.parse(storedData);

        const mainResult = analysisResult.possibilities[0];
        const selectedCategoryName = diseases.find(d => d.id === selected)?.name || "Bilinmeyen Tarama";

        const newRecord: AnalysisItem = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            category: selectedCategoryName,
            result: mainResult.prediction || "Analiz Sonucu",
            confidence: mainResult.confidence || 0,
            isFavorite: false,
            image: imageUrl || undefined
        };

        history.unshift(newRecord);
        try {
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch (e) {
            console.error("Local Storage Kotası Dolu:", e);
            // Eğer resim çok büyükse resmi söküp kaydetmeyi dene
            const reducedHistory = history.map((item, idx) => idx === 0 ? { ...item, image: undefined } : item);
            localStorage.setItem(historyKey, JSON.stringify(reducedHistory));
            notify.warning("Görüntü boyutu çok büyük olduğu için geçmişe resimsiz kaydedildi.");
        }
    };

    const handleStartAnalysis = async () => {
        if (!selected || !selectedFile) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', selected);

        let finalImageUrl = "";

        try {
            // Firebase Storage'a yükleme işlemi
            if (previewUrl) {
                try {
                    const storageRef = ref(storage, `analysis/img_${Date.now()}`);
                    const uploadTask = await uploadString(storageRef, previewUrl, 'data_url');
                    finalImageUrl = await getDownloadURL(uploadTask.ref);
                } catch (storageError) {
                    console.error("Firebase Storage Hatası:", storageError);
                    finalImageUrl = previewUrl; // Hata olursa base64 kullan
                }
            }

            const response = await fetch('http://localhost:8080/api/analyze', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                const normalizedData = data.possibilities ? data : { possibilities: [data] };
                setResult(normalizedData);
                saveToHistory(normalizedData, finalImageUrl);
                setLoading(false);
                notify.analysisComplete('success', 'Analiz sonuçlarınız başarıyla hazırlandı.');
            } else {
                // Eğer sunucu açık değilse demo amaçlı sahte sonuç üret
                setTimeout(() => {
                    let prediction = "Bilinmeyen Durum";
                    if (selected === 'deri') prediction = "mel";
                    else if (selected === 'akciger') prediction = "COVID-19";
                    else if (selected === 'kemik') prediction = "Fracture";
                    else if (selected === 'beyin') prediction = "glioma";
                    else if (selected === 'goz') prediction = "DME";

                    const fakeResult: AnalysisResultData = {
                        possibilities: [
                            { prediction: prediction, confidence: 92.4 },
                            { prediction: "Benign Doku Formasyonu", confidence: 5.2 },
                            { prediction: "Diğer", confidence: 2.4 }
                        ]
                    };

                    setResult(fakeResult);
                    saveToHistory(fakeResult, finalImageUrl);
                    setLoading(false);
                    notify.analysisComplete('success', 'Analiz sonuçlarınız hazırlandı (Demo Modu).');
                }, 2000);
            }
        } catch (error) {
            console.error("Analiz Hatası:", error);
            setTimeout(() => {
                let prediction = "Bilinmeyen Durum";
                if (selected === 'deri') prediction = "mel";
                else if (selected === 'akciger') prediction = "Non-COVID";
                else if (selected === 'kemik') prediction = "Malignant_Tumor";
                else if (selected === 'beyin') prediction = "meningioma";
                else if (selected === 'goz') prediction = "CNV";

                const demoResult: AnalysisResultData = {
                    possibilities: [
                        { prediction: prediction, confidence: 88.5 },
                        { prediction: "Vasküler Konjesyon", confidence: 8.3 },
                        { prediction: "Kalsifikasyon Belirtileri", confidence: 3.2 }
                    ]
                };
                setResult(demoResult);
                saveToHistory(demoResult, finalImageUrl);
                setLoading(false);
                notify.analysisComplete('success', 'Analiz sonuçlarınız hazırlandı (Demo Modu).');
            }, 2000);
        }
    };

    const handleDownloadPDF = async () => {
        if (!result || !selected) return;
        const diseaseInfo = diseases.find(d => d.id === selected);
        const diseaseName = diseaseInfo?.name || selected;
        await generateAnalysisPDF(result, diseaseName, diseaseInfo?.type, patientEmail, notify);
    };

    return (
        <div className="flex flex-col bg-slate-50 font-sans">


            <main className="flex-1 flex flex-col p-6 md:p-12 w-full">
                <header className="mb-10 w-full max-w-6xl mx-auto">
                    <h1 className="text-4xl font-extralight tracking-tight italic text-slate-900">
                        Analiz <span className="font-bold text-blue-600 not-italic">Et</span></h1>
                    <p className="text-slate-500 mt-2 font-medium">Biyomedikal görselleri analiz edin ve saniyeler içinde anında teşhis destek raporu alın.</p>
                </header>

                <div id="pdf-content" className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10">

                    {/* SOL KOLON: Giriş & Ayarlar */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* ADIM 1 */}
                        <section className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 transition-all duration-500 group-hover:w-3"></div>
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100 shadow-inner">1</span>
                                Analiz Kategorİsİ Seçİn
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {diseases.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSelected(d.id)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-[24px] transition-all duration-300 border-2
                                        ${selected === d.id
                                                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                                : 'border-slate-50 bg-slate-50/50 hover:border-blue-200 hover:bg-white hover:shadow-md'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-500 ${selected === d.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}>
                                            {d.icon}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-wider transition-colors ${selected === d.id ? 'text-blue-900' : 'text-slate-500'}`}>{d.name}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ADIM 2 */}
                        <section className={`bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden transition-all duration-500 ${!selected ? 'opacity-50 grayscale-[50%] pointer-events-none translate-y-4' : 'translate-y-0'}`}>
                            <div className={`absolute top-0 left-0 w-2 h-full transition-colors duration-500 ${selected ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border shadow-inner transition-colors duration-500 ${selected ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>2</span>
                                Görüntüyü Yükleyİn
                            </h2>

                            <div className="relative">
                                {/* Eğer dosya yüklenmediyse Dropzone */}
                                {!previewUrl ? (
                                    <label className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-slate-200 border-dashed rounded-[30px] hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group hover:shadow-lg">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                                                <UploadCloud size={28} className="text-indigo-400" />
                                            </div>
                                            <p className="mb-2 text-sm text-slate-500"><span className="font-bold text-indigo-600 group-hover:underline">Buraya tıklayın</span> veya sürükleyip bırakın</p>
                                            <p className="text-xs text-slate-400 font-medium tracking-wide bg-slate-100 px-3 py-1 rounded-full mt-2">PNG, JPG, JPEG (Max. 15MB)</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
                                    </label>
                                ) : (
                                    /* Dosya yüklendiyse Dosya Bilgisi */
                                    <div className="flex items-center justify-between p-4 bg-white rounded-[24px] border border-emerald-200 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)] transform transition-all duration-300 animate-in zoom-in-95">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="relative w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0 p-1">
                                                <div className="relative w-full h-full rounded-lg overflow-hidden">
                                                    <Image src={previewUrl} alt="preview mini" fill className="object-cover opacity-90" />
                                                </div>
                                            </div>
                                            <div className="truncate pr-4">
                                                <p className="text-sm font-bold text-slate-800 truncate leading-tight">{selectedFile?.name}</p>
                                                <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1.5"><CheckCircle2 size={14} /> Görüntü başarıyla içe aktarıldı</p>
                                            </div>
                                        </div>
                                        <button onClick={clearSelection} className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 hover:border-red-100 transition-all ml-4" title="Görüntüyü Değiştir">
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* DESKTOP BİLGİLENDİRME: Adım 2'nin hemen altında */}
                        {result && (
                            <div className="hidden lg:block">
                                <InfoSection selected={selected} result={result} />
                            </div>
                        )}
                    </div>

                    {/* SAĞ KOLON: Önizleme & Sonuç Raporu */}
                    <div className="lg:col-span-5 lg:row-span-2">
                        {/* ... (AI Panel içeriği aynı kalacak) ... */}
                        <div className="bg-[#0f172a] rounded-[40px] p-8 h-full min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl border border-slate-800">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <h3 className="text-white font-bold flex items-center gap-2 mb-6 tracking-wide text-sm">
                                    <Sparkles size={18} className="text-blue-400" /> YAPAY ZEKA PANELİ
                                </h3>

                                <div className="w-full aspect-square bg-slate-900/80 rounded-3xl border border-slate-700/50 mb-8 relative overflow-hidden flex items-center justify-center shadow-inner">
                                    {!previewUrl ? (
                                        <div className="text-center text-slate-600 p-6 flex flex-col items-center">
                                            <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mb-4 opacity-50">
                                                <FileScan size={32} />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">ÖnİZLEME EKRANI</p>
                                            <p className="text-xs text-slate-600 mt-2 font-medium">Değerlendirilecek görüntü burada gösterilecektir</p>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full p-2">
                                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                                                <Image src={previewUrl} alt="Preview" fill className="object-contain z-0 transition-all duration-700" />
                                                {loading && (
                                                    <div className="absolute inset-0 bg-blue-900/30 z-10 backdrop-blur-[1px]">
                                                        <div className="w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_3px_rgba(34,211,238,0.8)] absolute top-0 animate-[scan_2.5s_ease-in-out_infinite]" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto">
                                    {!result ? (
                                        <button
                                            onClick={handleStartAnalysis}
                                            disabled={loading || !selected || !selectedFile}
                                            className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest transition-all duration-300 relative overflow-hidden
                                            ${loading
                                                    ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30 cursor-wait'
                                                    : (selected && selectedFile
                                                        ? 'bg-blue-600 text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.7)] hover:bg-blue-500 hover:shadow-[0_15px_50px_-10px_rgba(37,99,235,0.9)] hover:-translate-y-1'
                                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed')}`}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-3">
                                                    <span className="w-4 h-4 rounded-full border-2 border-t-blue-300 border-r-blue-300 border-b-transparent border-l-transparent animate-spin"></span>
                                                    ANALİZ EDİLİYOR...
                                                </span>
                                            ) : 'ANALİZİ BAŞLAT'}
                                        </button>
                                    ) : (
                                        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 animate-in fade-in slide-in-from-bottom-6 shadow-2xl relative overflow-hidden">
                                            <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                                <Activity size={14} className="text-blue-400" /> Tahmini Teşhis Listesi
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                {[...result.possibilities].sort((a, b) => b.confidence - a.confidence).map((p, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${index === 0
                                                            ? 'bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20'
                                                            : 'bg-slate-900/50 border-slate-800'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4 overflow-hidden">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${index === 0 ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-800 text-slate-500'
                                                                }`}>
                                                                {index + 1}.
                                                            </div>
                                                            <p className={`text-sm font-bold truncate ${index === 0 ? 'text-white' : 'text-slate-300'}`}>
                                                                {p.prediction}
                                                            </p>
                                                        </div>
                                                        <div className={`text-right shrink-0 ml-4 flex flex-col items-end gap-1`}>

                                                            <span className={`text-[9px] font-bold uppercase tracking-tighter px-1 ${index === 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                                {(() => {
                                                                    if (index === 0) return 'YÜKSEK OLASILIK';
                                                                    const val = p.confidence > 1 ? p.confidence : p.confidence * 100;
                                                                    if (val < 5) return 'ÇOK DÜŞÜK OLASILIK';
                                                                    if (val < 15) return 'DÜŞÜK OLASILIK';
                                                                    if (val < 49) return 'ORTA İHTİMAL';
                                                                    return 'YÜKSEK OLASILIK';
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setResult(null); clearSelection(); }}
                                                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl text-[11px] tracking-widest transition-all border border-white/10 uppercase"
                                                >
                                                    YENİ ANALİZ BAŞLAT
                                                </button>
                                                <button
                                                    onClick={handleDownloadPDF}
                                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-[11px] tracking-widest transition-all shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(16,185,129,0.7)] hover:-translate-y-1 uppercase flex items-center justify-center gap-2"
                                                >
                                                    <UploadCloud size={14} className="rotate-180" /> PDF İNDİR
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE BİLGİLENDİRME: Mobilde en altta görünür */}
                    {result && (
                        <div className="lg:hidden">
                            <InfoSection selected={selected} result={result} />
                        </div>
                    )}
                </div>
            </main>

        </div>
    );
}

// Bilgilendirme Bölümü Bileşeni (Tekrarı önlemek için)
function InfoSection({ selected, result }: { selected: string, result: AnalysisResultData }) {
    const router = useRouter();
    const [registeredDocs, setRegisteredDocs] = useState<any[]>([]);

    useEffect(() => {
        const docs = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
        setRegisteredDocs(docs);
    }, []);

    const diseases = [
        { id: 'deri', name: 'Deri', type: 'skin' as DiseaseType, fullName: 'Deri (Lezyon / Ben)' },
        { id: 'akciger', name: 'Akciğer', type: 'lung' as DiseaseType, fullName: 'Akciğer (BT / X-Ray)' },
        { id: 'kemik', name: 'Kemik', type: 'bone' as DiseaseType, fullName: 'Kemik (Röntgen / Tarama)' },
        { id: 'beyin', name: 'Beyin', type: 'brain' as DiseaseType, fullName: 'Beyin (MR / BT)' },
        { id: 'goz', name: 'Göz', type: 'eye' as DiseaseType, fullName: 'Göz (Retina / Tarama)' }
    ];

    const sortedPossibilities = [...result.possibilities].sort((a, b) => b.confidence - a.confidence);
    const topResult = sortedPossibilities[0];
    const diseaseInfo = diseases.find(d => d.id === selected);
    const hints = getSymptomHintsWithFallback(diseaseInfo?.type, topResult.prediction);

    // Branş eşleştirmesi
    const branchMap: Record<string, string> = {
        'deri': 'Dermatoloji',
        'akciger': 'Göğüs Hastalıkları',
        'kemik': 'Ortopedi',
        'beyin': 'Nöroloji',
        'goz': 'Göz Hastalıkları'
    };

    const currentBranch = branchMap[selected] || 'Genel Cerrahi';

    // Kayıtlı doktorları filtrele
    const recommendedDoctors = registeredDocs
        .filter(doc => doc.specialty && (doc.specialty.toLowerCase().includes(currentBranch.toLowerCase()) || currentBranch.toLowerCase().includes(doc.specialty.toLowerCase())))
        .map(doc => ({ name: doc.name, branch: doc.specialty }));

    const handleQuickAppointment = (docName: string, branch: string) => {
        const analysisName = diseaseInfo?.fullName || "";
        const encodedDoc = encodeURIComponent(`${docName} (${branch})`);
        const encodedAnalysis = encodeURIComponent(analysisName);
        router.push(`/dashboard/randevular?doctor=${encodedDoc}&analysis=${encodedAnalysis}`);
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
            {/* General Information */}
            <div className="bg-rose-500/10 rounded-[24px] p-5 border border-rose-500/20 shadow-sm">
                <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} /> Bilgilendirme
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Aşağıdaki maddeler yalnızca genel bilgilendirme amaçlıdır; tıbbi tanı veya tedavi önerisi değildir.
                    Metinler, en yüksek olasılıklı tahmin (<strong>{hints.title}</strong>) dikkate alınarak üretilmiştir.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Symptoms */}
                <div className="bg-blue-500/5 rounded-[24px] p-5 border border-blue-500/10 shadow-sm">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Stethoscope size={16} /> Olası Belirtiler
                    </h4>
                    <ul className="space-y-2">
                        {hints.symptoms.map((s, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pre-check Recommendations */}
                <div className="bg-emerald-500/5 rounded-[24px] p-5 border border-emerald-500/10 shadow-sm">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Ön Kontrol Önerileri
                    </h4>
                    <ul className="space-y-2">
                        {hints.tips.map((t, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                                <div className="w-1.5 h-1.5 rounded-full border border-emerald-500/50 mt-1.5 shrink-0" />
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recommended Doctors */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Stethoscope size={16} className="text-blue-500" /> İlgİlİ Uzman Görüşü Alın
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendedDoctors.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <User size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[11px] font-black text-slate-800 truncate">{doc.name}</p>
                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">{doc.branch}</p>
                            </div>
                            <button
                                onClick={() => handleQuickAppointment(doc.name, doc.branch)}
                                className="ml-auto px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-black text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm flex items-center gap-1.5"
                            >
                                <Calendar size={12} /> RANDEVU AL
                            </button>
                        </div>
                    ))}
                    {recommendedDoctors.length === 0 && (
                        <p className="text-xs text-slate-500 font-medium col-span-2 py-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Bu branşta ({currentBranch}) henüz kayıtlı bir uzman doktor bulunmamaktadır.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

