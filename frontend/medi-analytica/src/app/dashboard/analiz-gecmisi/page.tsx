"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useSearch } from "@/contexts/SearchContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { notify } from '@/lib/notifications';
import { AnalysisItem } from '@/types';
import {
    Activity,
    ChevronRight,
    Star,
    FolderOpen,
    Sparkles,
    X,
    Trash2,
    Stethoscope
} from 'lucide-react';
import { getSymptomHintsWithFallback, DiseaseType } from '@/lib/analysisSymptom';



export default function AnalizGecmisi() {

    const queryClient = useQueryClient();
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(null);
    const { searchQuery } = useSearch();

    // React Query ile veriyi çek
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['analysisHistory'],
        queryFn: api.getAnalysisHistory,
    });

    // Yıldızlama işlemi için mutation
    const toggleMutation = useMutation({
        mutationFn: api.toggleFavorite,
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['analysisHistory'] });
            const item = data.find(i => i.id === id);
            if (item?.isFavorite) {
                notify.success("Yıldızlı analizlere eklendi");
            } else {
                notify.info("Yıldızlı analizlerden çıkarıldı");
            }
        },
    });

    // Silme işlemi için mutation
    const deleteMutation = useMutation({
        mutationFn: api.deleteAnalysis,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analysisHistory'] });
            notify.success("Analiz başarıyla silindi");
        },
    });

    const filteredHistory = history.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (item.category && item.category.toLowerCase().includes(q)) ||
            (item.result && item.result.toLowerCase().includes(q))
        );
    });

    const toggleFavorite = (id: number) => {
        toggleMutation.mutate(id);
    };

    const handleDelete = (id: number) => {
        if (confirm("Bu analizi geçmişinizden kalıcı olarak silmek istediğinize emin misiniz?")) {
            deleteMutation.mutate(id);
        }
    };
    return (
        <div className="flex flex-col bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">


            <main className="flex-1 flex flex-col w-full">


                <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extralight tracking-tight italic text-slate-900">
                                Analiz <span className="font-bold text-blue-600 not-italic">Geçmişim</span></h1>
                            <p className="text-slate-500 mt-3 font-medium max-w-xl text-sm md:text-base leading-relaxed">
                                Sistem üzerinden daha önce gerçekleştirdiğiniz tüm tarama kayıtlarını şeffaf bir şekilde görüntüleyin ve inceleyin.
                            </p>
                        </div>
                        <Link href="/dashboard/analiz-et" className="inline-flex flex-row items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 px-7 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 whitespace-nowrap">
                            <Sparkles size={18} /> Yeni Tahlil Yükle
                        </Link>
                    </header>

                    {/* YÜKLENİYOR DURUMU */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] min-h-[400px]">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-4 text-slate-400 font-bold tracking-widest text-xs uppercase">Verileriniz getiriliyor...</p>
                        </div>
                    ) : history.length > 0 ? (
                        /* VERİ VARSA YENİ NESİL TABLO */
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">

                            {/* Table Header Wrapper Custom Box */}
                            <div className="overflow-x-auto min-h-[400px]">
                                <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left w-16"></th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Tarih</th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Görüntü Türü</th>
                                            <th className="min-w-[200px] px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">YZ Teşhisi / Durum</th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Görüntü</th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-6 md:pr-10">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredHistory.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 md:px-8 py-5 text-center">
                                                    <button
                                                        onClick={() => toggleFavorite(item.id)}
                                                        className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                                                        title="Yıldızla"
                                                    >
                                                        <Star
                                                            size={20}
                                                            fill={item.isFavorite ? "#f59e0b" : "transparent"}
                                                            className={item.isFavorite ? "text-amber-500" : "text-slate-300 group-hover:text-slate-400"}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 shrink-0 border border-slate-200/50">
                                                            <span className="text-[10px] font-black uppercase leading-none">{new Date(item.createdAt).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                                                            <span className="text-lg font-black text-slate-700 leading-none mt-0.5">{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                            {new Date(item.createdAt).getFullYear()}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className="inline-flex items-center px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100">
                                                        <Activity size={14} className="mr-1.5" /> {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <p className="text-slate-900 font-bold text-sm">{item.result}</p>
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center relative">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt="Analiz"
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <FolderOpen size={16} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-right pr-6 md:pr-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedAnalysis(item)}
                                                            className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-lg inline-flex items-center gap-2"
                                                        >
                                                            Gözden Geçir <ChevronRight size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                            title="Analizi Sil"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* VERİ YOKSA BOŞ DURUMU */
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] p-16 md:p-32 text-center animate-in zoom-in duration-500 flex flex-col items-center">
                            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                                <FolderOpen size={48} className="text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Henüz Analiziniz Bulunmuyor</h3>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto text-sm">
                                İlk tıbbi görüntünüzü sisteme yükleyip hemen analizinizi başlatın. Sonuçlar burada sağlık geçmişiniz olarak güvenle depolanacaktır.
                            </p>
                            <Link
                                href="/dashboard/analiz-et"
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 inline-flex items-center gap-2"
                            >
                                <Sparkles size={18} /> Yeni Analiz Başlat
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* İnceleme Modalı */}
            {selectedAnalysis && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="text-blue-500" size={20} /> Analiz Detayı
                            </h3>
                            <button onClick={() => setSelectedAnalysis(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex flex-col items-center justify-center text-center space-y-3">
                                {selectedAnalysis.image && (
                                    <div className="w-full max-h-48 rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-2 relative aspect-video">
                                        <Image
                                            src={selectedAnalysis.image}
                                            alt="Analiz Görüntüsü"
                                            fill
                                            className="object-contain bg-slate-50"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Yapay Zeka Teşhisi</p>
                                    <p className="text-2xl font-black text-slate-800 leading-tight">{selectedAnalysis.result}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Görüntü Türü</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedAnalysis.category}</p>
                                </div>

                                {(() => {
                                    const categoryMap: Record<string, DiseaseType> = {
                                        'Deri': 'skin',
                                        'Akciğer': 'lung',
                                        'Kemik': 'bone',
                                        'Beyin': 'brain',
                                        'Göz': 'eye'
                                    };

                                    const mappedType = categoryMap[selectedAnalysis.category] || 'skin';
                                    const hints = getSymptomHintsWithFallback(mappedType, selectedAnalysis.result);

                                    return (
                                        <div className="bg-blue-500/5 rounded-[24px] p-5 border border-blue-500/10 shadow-sm text-left">
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
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button onClick={() => setSelectedAnalysis(null)} className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-md">
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}