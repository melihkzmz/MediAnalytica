"use client";

import React, { useState, useEffect } from 'react';

import {
    Activity,
    Calendar,
    TrendingUp,
    Sparkles,
    Clock,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { getUserKeys, ALL_APPOINTMENTS_KEY } from '@/lib/userStorage';

interface PatientAppointment {
    id: number;
    doctor: string;
    branch: string;
    title: string;
    dateMonth: string;
    dateDay: string;
    time: string;
    location: string;
    status: 'approved' | 'pending' | 'cancelled';
    timestamp: number;
}

export default function PatientDashboardPage() {
    const [patientName, setPatientName] = useState("Kullanıcı");
    const [historyCount, setHistoryCount] = useState<number>(0);
    const [appointments, setAppointments] = useState<PatientAppointment[]>([]);

    useEffect(() => {
        const loadDashboardData = () => {
            const userJson = localStorage.getItem('currentUser');
            let userEmail = 'guest';
            if (userJson) {
                const user = JSON.parse(userJson);
                setPatientName(user.name);
                if (user.email) userEmail = user.email;
            }

            const { historyKey } = getUserKeys();
            const storedData = localStorage.getItem(historyKey);
            if (storedData) {
                const history = JSON.parse(storedData);
                setHistoryCount(history.length);
            }

            const allApps = JSON.parse(localStorage.getItem(ALL_APPOINTMENTS_KEY) || '[]');
            const myApps = allApps.filter((a: any) => a.patientEmail === userEmail);
            setAppointments(myApps);
        };

        const timeout = setTimeout(() => {
            loadDashboardData();
        }, 0);
        return () => clearTimeout(timeout);
    }, []);

    const activeApptsCount = appointments.filter(a => a.status === 'approved').length;

    const stats = [
        { id: 1, title: 'Toplam Analizlerim', value: historyCount.toString(), trend: 'Bugüne kadar', icon: <Activity size={24} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { id: 2, title: 'Aktif Randevularım', value: activeApptsCount.toString(), trend: 'Yaklaşıyor', icon: <Calendar size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    ];

    return (
        <div className="flex flex-col bg-slate-50 font-sans selection:bg-blue-500 selection:text-white">


            <main className="flex-1 flex flex-col w-full">


                <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10">

                    {/* 2. HERO GREETING SECTION (HASTA) */}
                    <div className="relative bg-[#0f172a] rounded-[40px] px-8 md:px-12 py-10 md:py-14 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
                        {/* Arka Plan Dekorasyon */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/30 blur-[100px] rounded-full pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10 space-y-5 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                                Sağlık Asistanınız Hazır
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extralight text-white tracking-tight leading-tight">
                                Tekrar Hoş Geldin, <br /><span className="font-bold italic text-blue-400">{patientName}</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed max-w-xl">
                                Yeni bir tıbbi görüntünüz mü var? Sisteme yükleyerek saniyeler içinde anında yapay zeka fikir desteği alabilirsiniz.
                            </p>
                            <div className="pt-2">
                                <Link href="/dashboard/analiz-et" className="inline-flex flex-row items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-7 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all transform hover:-translate-y-1">
                                    <Sparkles size={18} /> Yeni Analiz Başlat
                                </Link>
                            </div>
                        </div>

                        <div className="relative z-10 hidden lg:block">
                            <div className="w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-[40px] rotate-12 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl">
                                <ShieldCheck size={72} className="text-white/80 -rotate-12" />
                            </div>
                        </div>
                    </div>

                    {/* 3. İSTATİSTİK KARTLARI (HASTA) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats.map((stat) => (
                            <div key={stat.id} className="bg-white p-6 md:p-8 rounded-[35px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                                <div className={`absolute -right-10 -top-10 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} border ${stat.border} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                        {stat.icon}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                                        <TrendingUp size={14} className="text-slate-400" />
                                        {stat.trend}
                                    </div>
                                </div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-2.5">{stat.title}</h3>
                                <p className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* 4. RANDEVULARIM */}
                    <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">

                        {/* YAKLAŞAN RANDEVULAR (HATIRLATMALAR) */}
                        <section className="space-y-6">
                            <div className="flex items-end justify-between px-2">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <Clock size={22} className="text-indigo-600" /> Hatırlatmalar ve Randevular
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Görüşme veya tarama planlamalarınız.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-5">

                                {/* Mevcut Onaylı Randevular (Max 3) */}
                                {appointments.filter(a => a.status === 'approved').slice(0, 3).length > 0 ? (
                                    appointments.filter(a => a.status === 'approved').slice(0, 3).map(app => (
                                        <div key={app.id} className="flex items-start gap-4 p-5 bg-indigo-50/60 rounded-[30px] border border-indigo-100 hover:border-indigo-200 transition-colors">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm border border-indigo-50 shrink-0">
                                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{app.dateMonth}</span>
                                                <span className="text-xl font-black text-indigo-600 leading-none">{app.dateDay}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <p className="font-bold text-slate-900 text-base leading-none">{app.doctor}</p>
                                                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-200/50">Onaylandı</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium">{app.branch} - {app.title}</p>
                                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"><Clock size={12} className="text-indigo-400" /> {app.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-6 text-slate-500 font-medium">
                                        <Calendar className="mx-auto mb-3 text-slate-300" size={32} />
                                        Mevcut veya yaklaşan bir randevunuz bulunmuyor.
                                    </div>
                                )}

                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}
