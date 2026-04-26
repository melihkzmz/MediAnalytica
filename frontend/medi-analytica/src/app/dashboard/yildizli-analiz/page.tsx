"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { useSearch } from "@/contexts/SearchContext";
import { getUserKeys } from "@/lib/userStorage";
import { notify } from '@/lib/notifications';
import { AnalysisItem } from '@/types';
import {
    Activity,
    ChevronRight,
    Star,
    FolderOpen,
    Sparkles,
    X
} from 'lucide-react';


export default function YildizliAnalizler() {

    const [history, setHistory] = useState<AnalysisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(null);

    const toggleFavorite = (id: number) => {
        setHistory(prev => {
            const itemToToggle = prev.find(item => item.id === id);
            if (itemToToggle) {
                if (itemToToggle.isFavorite) {
                    notify.info("Yıldızlı analizlerden çıkarıldı");
                } else {
                    notify.success("Yıldızlı analizlere eklendi");
                }
            }

            const newHistory = prev.map(item =>
                item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
            );
            const { historyKey } = getUserKeys();
            localStorage.setItem(historyKey, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    useEffect(() => {
        const loadFavorites = () => {
            const { historyKey } = getUserKeys();
            const storedData = localStorage.getItem(historyKey);
            if (storedData) {
                setHistory(JSON.parse(storedData));
                setLoading(false);
            } else {
                setLoading(false); // Eğer hiç analiz yapılmamışsa ve localStorage boşsa
            }
        };

        const timeout = setTimeout(() => {
            loadFavorites();
        }, 0);
        return () => clearTimeout(timeout);
    }, []);

    const { searchQuery } = useSearch();
    const favoriteAnalyses = history.filter(item => item.isFavorite);

    const filteredFavorites = favoriteAnalyses.filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (item.category && item.category.toLowerCase().includes(q)) ||
            (item.result && item.result.toLowerCase().includes(q))
        );
    });

    return (
        <div className="flex flex-col bg-slate-50 font-sans selection:bg-amber-500 selection:text-white">


            <main className="flex-1 flex flex-col w-full">


                <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extralight tracking-tight italic text-slate-900">
                                Yıldızlı <span className="font-bold text-blue-600 not-italic">Analizlerim</span></h1>
                            <p className="text-slate-500 mt-3 font-medium max-w-xl text-sm md:text-base leading-relaxed">
                                Sağlık geçmişinizde önemli bulup favorilerinize eklediğiniz tahlil sonuçları burada listelenir.
                            </p>
                        </div>
                    </header>

                    {/* YÜKLENİYOR DURUMU */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] min-h-[400px]">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
                            </div>
                            <p className="mt-4 text-slate-400 font-bold tracking-widest text-xs uppercase">Verileriniz getiriliyor...</p>
                        </div>
                    ) : favoriteAnalyses.length > 0 ? (
                        /* VERİ VARSA YENİ NESİL TABLO */
                        <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">

                            <div className="overflow-x-auto min-h-[400px]">
                                <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
                                    <thead>
                                        <tr className="bg-amber-50/50 border-b border-slate-100">
                                            <th className="px-6 md:px-8 py-5 text-[10px] font-black text-amber-600/60 uppercase tracking-widest text-left w-16"></th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Tarih</th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Görüntü Türü</th>
                                            <th className="min-w-[200px] px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">YZ Teşhisi / Durum</th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">İsabet Oranı</th>
                                            <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-6 md:pr-10">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredFavorites.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 md:px-8 py-5 text-center">
                                                    <button
                                                        onClick={() => toggleFavorite(item.id)}
                                                        className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                                                        title="Favorilerden Çıkar"
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
                                                    <div className="inline-flex items-center justify-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-sm border border-emerald-100 w-16 shadow-sm">
                                                        %{item.confidence}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-right pr-6 md:pr-8">
                                                    <button
                                                        onClick={() => setSelectedAnalysis(item)}
                                                        className="px-5 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm hover:shadow-lg inline-flex items-center gap-2"
                                                    >
                                                        İncele <ChevronRight size={14} />
                                                    </button>
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
                                <Star size={48} className="text-amber-100 fill-amber-50" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2">Yıldızlı Analiziniz Bulunmuyor</h3>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto text-sm">
                                Analiz geçmişinize giderek önemli bulduğunuz sonuçları yıldıza tıklayıp buraya ekleyebilirsiniz.
                            </p>
                            <Link
                                href="/dashboard/analiz-gecmisi"
                                className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:-translate-y-1 inline-flex items-center gap-2"
                            >
                                <FolderOpen size={18} /> Geçmişi İncele
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* İnceleme Modalı */}
            {selectedAnalysis && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Star className="text-amber-500" size={20} /> Analiz Detayı
                            </h3>
                            <button onClick={() => setSelectedAnalysis(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1">Yapay Zeka Teşhisi</p>
                                    <p className="text-2xl font-black text-slate-800 leading-tight">{selectedAnalysis.result}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Görüntü Türü</p>
                                    <p className="text-sm font-bold text-slate-700">{selectedAnalysis.category}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center">
                                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Güven Oranı</p>
                                    <p className="text-lg font-black text-emerald-600">%{selectedAnalysis.confidence}</p>
                                </div>
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
