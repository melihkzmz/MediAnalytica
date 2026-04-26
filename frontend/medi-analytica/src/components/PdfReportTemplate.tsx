import React from 'react';
import Image from 'next/image';
import { Activity, Stethoscope, AlertTriangle, FileText } from 'lucide-react';
import { getSymptomHintsWithFallback } from '@/lib/analysisSymptom';

interface PdfReportTemplateProps {
    result: any;
    imageUrl: string;
    selectedCategory: string;
    patientEmail: string;
}

export default function PdfReportTemplate({ result, imageUrl, selectedCategory, patientEmail }: PdfReportTemplateProps) {
    if (!result) return null;

    const sortedPossibilities = [...result.possibilities].sort((a: any, b: any) => b.confidence - a.confidence);
    const topResult = sortedPossibilities[0];
    
    // Tür belirleme
    const typeMap: Record<string, any> = {
        'deri': 'skin',
        'akciger': 'lung',
        'kemik': 'bone',
        'beyin': 'brain',
        'goz': 'eye'
    };
    
    const categoryNameMap: Record<string, string> = {
        'deri': 'Dermatolojik Analiz',
        'akciger': 'Göğüs Hastalıkları / Akciğer Analizi',
        'kemik': 'Ortopedik / Kemik Analizi',
        'beyin': 'Nörolojik / Beyin Analizi',
        'goz': 'Oftalmolojik / Göz Analizi'
    };

    const hints = getSymptomHintsWithFallback(typeMap[selectedCategory] || 'skin', topResult.prediction);
    const currentDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div 
            id="pdf-report-container" 
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto"
            style={{ 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                padding: '20mm', // A4 margin
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">MediAnalytica</h1>
                        <p className="text-sm font-medium text-slate-500">Yapay Zeka Destekli Tıbbi Analiz Raporu</p>
                    </div>
                </div>
                <div className="text-right text-sm text-slate-600 space-y-1">
                    <p><span className="font-bold">Tarih:</span> {currentDate}</p>
                    <p><span className="font-bold">Rapor No:</span> MA-{Date.now().toString().slice(-6)}</p>
                    <p><span className="font-bold">Hasta:</span> {patientEmail || 'Kayıtsız Kullanıcı'}</p>
                </div>
            </div>

            {/* Kategori ve Ana Sonuç Özeti */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
                <div className="flex flex-col gap-4">
                    <div className="inline-flex w-fit items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                        {categoryNameMap[selectedCategory] || 'Genel Analiz'}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Tespit Edilen En Yüksek Olasılıklı Durum</h2>
                        <div className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            {topResult.prediction}
                            <span className="text-lg bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-bold">
                                {topResult.confidence.toFixed(1)}% Eşleşme
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Sol Kolon: Görüntü */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <FileText size={16} className="text-blue-500" /> Analiz Edilen Görüntü
                    </h3>
                    <div className="w-full aspect-square relative rounded-xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
                        {imageUrl ? (
                            <Image src={imageUrl} alt="Analiz Görüntüsü" fill className="object-cover" unoptimized />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Görüntü Bulunamadı</div>
                        )}
                    </div>
                </div>

                {/* Sağ Kolon: Diğer Olasılıklar */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Activity size={16} className="text-blue-500" /> Diğer Olasılıklar
                    </h3>
                    <div className="space-y-3">
                        {sortedPossibilities.slice(1).map((p: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                                <span className="font-semibold text-slate-700 text-sm">{p.prediction}</span>
                                <span className="font-bold text-slate-500 text-sm">{p.confidence.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Belirtiler ve Öneriler */}
            <div className="mb-8 page-break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Stethoscope size={16} className="text-blue-500" /> Olası Belirtiler ve Bulgular
                </h3>
                <ul className="grid grid-cols-2 gap-3">
                    {hints.symptoms.map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            {s}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Uyarı */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mt-auto page-break-inside-avoid">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={24} className="text-rose-500 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-rose-700 mb-1">Yasal Uyarı ve Bilgilendirme</h4>
                        <p className="text-xs text-rose-600 leading-relaxed font-medium">
                            Bu rapor yapay zeka algoritmaları (MediAnalytica) tarafından üretilmiş bir ön analizdir ve 
                            kesinlikle tıbbi bir teşhis, tanı veya tedavi tavsiyesi yerine geçmez. Rapor sonuçları hata payı 
                            içerebilir. Lütfen durumunuzla ilgili kesin tanı ve tedavi için ilgili branştan uzman bir hekime başvurunuz.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                MediAnalytica © {new Date().getFullYear()} - Tüm hakları saklıdır. Sistem tarafından otomatik olarak üretilmiştir.
            </div>
        </div>
    );
}
