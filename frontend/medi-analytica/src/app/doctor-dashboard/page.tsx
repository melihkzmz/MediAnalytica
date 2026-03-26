"use client";
import React from 'react';
import { Calendar, Users, CheckCircle2, Clock, ArrowRight, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types';


export default function DoctorOverviewPage() {
    const { user } = useAuth();
    const doctorName = user?.name || 'Doktor';

    // Query: Doktor Randevuları
    const { data: myApps = [] } = useQuery({
        queryKey: ['doctorAppointments', doctorName],
        queryFn: () => api.getDoctorAppointments(doctorName),
        enabled: !!user,
    });

    const pendingCount = myApps.filter(a => a.status === 'pending').length;
    const approvedCount = myApps.filter(a => a.status === 'approved').length;
    const rejectedCount = myApps.filter(a => a.status === 'rejected').length;
    const totalCount = myApps.length;

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto w-full space-y-10">

            {/* HERO */}
            <div className="relative bg-[#0f172a] rounded-[40px] px-8 md:px-12 py-10 overflow-hidden shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        Doktor Paneli
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extralight text-white tracking-tight leading-tight">
                        Hoş Geldiniz, <br />
                        <span className="font-bold italic text-indigo-400">DR. {doctorName}</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium max-w-xl">
                        Hastaların randevu taleplerine buradan göz atabilir, onaylayabilir veya reddedebilirsiniz.
                    </p>
                    <Link href="/doctor-dashboard/randevular"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-7 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-1">
                        <Calendar size={18} /> Randevuları Yönet
                    </Link>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Toplam Talep', value: totalCount, icon: <Users size={22} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: 'Tüm zamanlar' },
                    { title: 'Onay Bekleyen', value: pendingCount, icon: <Clock size={22} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', trend: 'Yanıt bekliyor' },
                    { title: 'Onaylanan', value: approvedCount, icon: <CheckCircle2 size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'Tamamlandı' },
                    { title: 'Reddedilen', value: rejectedCount, icon: <XCircle size={22} />, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', trend: 'Reddedildi' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                        <div className="flex justify-between items-start mb-5">
                            <div className={`w-12 h-12 ${s.bg} ${s.color} border ${s.border} rounded-2xl flex items-center justify-center shadow-sm`}>
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">{s.trend}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{s.title}</p>
                        <p className="text-4xl font-black text-slate-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* QUICK LINK */}
            {pendingCount > 0 && (
                <Link href="/doctor-dashboard/randevular"
                    className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-[28px] p-6 hover:bg-amber-100 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-200">
                            <Clock size={22} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{pendingCount} randevu talebiniz yanıt bekliyor</p>
                            <p className="text-sm text-slate-500 mt-0.5">Randevular sayfasından inceleyin</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                </Link>
            )}
        </div>
    );
}
