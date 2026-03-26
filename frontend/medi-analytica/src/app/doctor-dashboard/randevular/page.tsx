"use client";
import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Stethoscope, Calendar, User, Video } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Appointment } from '@/types';


export default function DoctorAppointmentsPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const doctorName = user?.name || 'Doktor';
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Query: Doktor Randevuları
    const { data: appointments = [], isLoading: loading } = useQuery({
        queryKey: ['doctorAppointments', doctorName],
        queryFn: () => api.getDoctorAppointments(doctorName),
        enabled: !!user,
    });

    // Mutation: Durum Güncelleme
    const statusMutation = useMutation({
        mutationFn: api.updateAppointmentStatus,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
            if (variables.status === 'approved') toast.success("Randevu onaylandı.");
            if (variables.status === 'rejected') toast.error("Randevu reddedildi.");
        },
        onError: () => {
            toast.error("İşlem sırasında bir hata oluştu.");
        }
    });

    const updateStatus = (id: number, newStatus: 'approved' | 'rejected') => {
        statusMutation.mutate({ id, status: newStatus });
    };

    const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

    const statusBadge = (status: Appointment['status']) => {
        if (status === 'pending') return <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest">⏳ Bekliyor</span>;
        if (status === 'approved') return <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">✓ Onaylandı</span>;
        if (status === 'rejected') return <span className="text-[10px] font-black bg-red-100 text-red-500 px-3 py-1 rounded-full uppercase tracking-widest">✗ Reddedildi</span>;
        return <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">İptal Edildi</span>;
    };

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto w-full space-y-8">

            <header>
                <h1 className="text-4xl font-extralight tracking-tight italic text-slate-900">
                    Randevu <span className="font-bold text-indigo-600 not-italic">Yönetimi</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium text-sm">Hasta taleplerini inceleyin, onaylayın veya reddedin.</p>
            </header>

            {/* FILTER TABS */}
            <div className="flex gap-2 flex-wrap">
                {([['all', 'Tümü'], ['pending', 'Bekleyen'], ['approved', 'Onaylanan'], ['rejected', 'Reddedilen']] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${filter === v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                        {l}
                        <span className="ml-1.5 text-[10px] opacity-70">({v === 'all' ? appointments.length : appointments.filter(a => a.status === v).length})</span>
                    </button>
                ))}
            </div>

            {/* APPOINTMENTS */}
            {loading ? (
                <div className="text-center py-16 text-slate-400 font-medium">Yükleniyor...</div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-slate-200 p-16 text-center">
                    <Calendar className="mx-auto mb-4 text-slate-300" size={40} />
                    <p className="font-bold text-slate-600 text-lg">Bu kategoride randevu bulunmuyor.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(app => (
                        <div key={app.id}
                            className={`bg-white rounded-[28px] border p-6 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] transition-all
                                ${app.status === 'pending' ? 'border-amber-200 hover:border-amber-300' :
                                    app.status === 'approved' ? 'border-emerald-200' : 'border-slate-200 opacity-70'}`}>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* LEFT: Info */}
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-[20px] bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase">{app.dateMonth}</span>
                                        <span className="text-2xl font-black text-indigo-600">{app.dateDay}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="font-bold text-slate-900 text-lg leading-none">{app.patientName || 'Hasta'}</p>
                                            {statusBadge(app.status)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <User size={13} className="text-indigo-400" /> {app.patientEmail}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <Stethoscope size={13} className="text-indigo-400" /> {app.branch} — {app.title}
                                        </div>
                                        <div className="flex items-center gap-4 pt-1 flex-wrap">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                                                <Clock size={12} className="text-indigo-400" /> {app.time}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
                                                <Video size={12} /> {app.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: Action Buttons (only for pending) */}
                                {app.status === 'pending' && (
                                    <div className="flex gap-3 md:flex-col shrink-0">
                                        <button
                                            onClick={() => updateStatus(app.id, 'approved')}
                                            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-emerald-200 hover:-translate-y-0.5 whitespace-nowrap">
                                            <CheckCircle size={16} /> Onayla
                                        </button>
                                        <button
                                            onClick={() => updateStatus(app.id, 'rejected')}
                                            className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl text-sm transition-all border border-red-100 hover:border-transparent whitespace-nowrap">
                                            <XCircle size={16} /> Reddet
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
