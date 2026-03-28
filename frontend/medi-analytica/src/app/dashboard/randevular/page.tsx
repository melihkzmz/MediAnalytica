"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import {
    CalendarCheck,
    Calendar,
    Stethoscope,
    FileText,
    Clock,
    UserCircle,
    CheckCircle2,
    CalendarPlus,
    X,
    Trash2,
    CheckCircle,
    Video,
    PhoneCall,
    Loader2
} from 'lucide-react';
import { ALL_APPOINTMENTS_KEY } from '@/lib/userStorage';
import { Appointment, User as Doctor } from '@/types';


export default function RandevularPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Modallar
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isJoiningMeeting, setIsJoiningMeeting] = useState<number | null>(null);
    const [meetingAlert, setMeetingAlert] = useState<string | null>(null);

    // Randevu Formu State'leri
    const [selectedAnalysis, setSelectedAnalysis] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Query: Doktorlar
    const { data: registeredDoctors = [] } = useQuery({
        queryKey: ['doctors'],
        queryFn: api.getRegisteredDoctors,
    });

    // Query: Randevular
    const { data: appointments = [], isLoading: loading } = useQuery({
        queryKey: ['appointments', user?.email],
        queryFn: () => api.getAppointments(user?.email || 'guest'),
        enabled: !!user,
    });

    // Mutation: Randevu Oluşturma
    const createMutation = useMutation({
        mutationFn: api.createAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            setIsBookingModalOpen(false);
            setIsSubmitted(false);
            toast.success("Randevunuz başarıyla oluşturuldu.");
            // Formu temizle
            setSelectedAnalysis("");
            setSelectedDoctor("");
            setSelectedDate("");
            setSelectedTime("");
        },
        onError: () => {
            toast.error("Randevu oluşturulurken bir hata oluştu.");
        }
    });

    // Mutation: Randevu Silme / İptal (Burada silme olarak simüle ediyoruz)
    const deleteMutation = useMutation({
        mutationFn: api.deleteAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success("Randevu başarıyla iptal edildi.");
        },
        onError: () => {
            toast.error("Randevu iptal edilirken bir hata oluştu.");
        }
    });

    // Günün tarihi ve Mesai Mantığı
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');
    const todayTimestampStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

    // Şu anki saat ve dakika (Format: HH:MM)
    const currentHourNum = now.getHours();
    const currentHourStr = currentHourNum.toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHourStr}:${currentMin}`;

    // Mesai saatleri dışında (09:00 öncesi veya 17:00 sonrası) ise bugünü seçmeyi engelle
    const isWorkingHours = currentHourNum >= 9 && currentHourNum < 17;
    const minDateObj = new Date(now);
    if (!isWorkingHours) {
        minDateObj.setDate(minDateObj.getDate() + 1);
    }
    const dynamicMinDate = minDateObj.toLocaleDateString('en-CA');

    // Eğer kullanıcı bugün içinden bir tarih seçebilmişse (isWorkingHours true) ve bugün seçiliyse geçmiş saat seçemesin
    const isSelectedDateToday = selectedDate === todayStr;
    const dynamicMinTime = (isSelectedDateToday && currentTimeStr > "09:00") ? currentTimeStr : "09:00";
    const maxTime = "17:00";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedTime < dynamicMinTime || selectedTime > maxTime) {
            toast.warning(`Lütfen ${dynamicMinTime} ile ${maxTime} mesai saatleri aralığında geçerli bir saat seçiniz.`);
            return;
        }

        setIsSubmitted(true);
        setTimeout(() => {
            const dt = new Date(selectedDate);
            const monthNames = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

            const docInfo = selectedDoctor.split(" (");
            const dName = docInfo[0];
            const dBranch = docInfo.length > 1 ? docInfo[1].replace(")", "") : "Genel";

            const newApp: Appointment = {
                id: Date.now(),
                patientEmail: user?.email || 'guest',
                patientName: user?.name || 'Kullanıcı',
                doctor: dName,
                branch: dBranch,
                title: selectedAnalysis,
                dateMonth: monthNames[dt.getMonth()],
                dateDay: dt.getDate().toString().padStart(2, '0'),
                time: selectedTime,
                location: "Online Görüşme",
                status: "pending",
                timestamp: dt.getTime(),
            };

            createMutation.mutate(newApp);
        }, 1500);
    };

    const cancelAppointment = (id: number) => {
        if (confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) {
            deleteMutation.mutate(id);
        }
    };

    const joinMeeting = (id: number) => {
        setIsJoiningMeeting(id);
        setTimeout(() => {
            setIsJoiningMeeting(null);
            setMeetingAlert("Doktor şu anda hatta bağlanıyor veya diğer görüşmesini bitiriyor, lütfen sayfada kalın.");
            setTimeout(() => setMeetingAlert(null), 5000); // 5 saniye sonra kapat
        }, 2000);
    };

    const checkIsToday = (timestamp: number) => {
        const d = new Date(timestamp);
        return new Date(d.setHours(0, 0, 0, 0)).getTime() === todayTimestampStart;
    };

    return (
        <div className="flex flex-col bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">


            <main className="flex-1 flex flex-col w-full relative">

                {/* YENİ RANDEVU MODALI */}
                {isBookingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                            <div className="p-6 md:p-8 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <Video size={24} className="text-indigo-600" />
                                    Yeni Uzman Online Görüşmesi Planla
                                </h2>
                                <button
                                    onClick={() => !isSubmitted && setIsBookingModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 rounded-full transition-colors shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 relative z-10">

                                {/* 1. Analiz Seçimi */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <FileText size={14} className="text-indigo-400" /> Hangi Tahliliniz İçin Görüşeceksiniz?
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={selectedAnalysis}
                                            onChange={(e) => {
                                                setSelectedAnalysis(e.target.value);
                                                setSelectedDoctor(""); // Analiz değiştiğinde doktoru sıfırla ki otomatik yenilensin
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium transition-all shadow-sm"
                                        >
                                            <option value="" disabled>Yapay zeka analiz türünüzü seçin...</option>
                                            <option value="Kemik (Röntgen / Tarama)">Kemik (Röntgen / Tarama)</option>
                                            <option value="Akciğer (BT / X-Ray)">Akciğer (BT / X-Ray)</option>
                                            <option value="Deri (Lezyon / Ben)">Deri (Lezyon / Ben)</option>
                                            <option value="Beyin (MR / BT)">Beyin (MR / BT)</option>
                                            <option value="Göz (Retina / Tarama)">Göz (Retina / Tarama)</option>
                                        </select>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-400 ml-1">Sistemin tahlilinize uygun branş hekimini ataması için seçin.</p>
                                </div>

                                {/* 2. Uzman Hekim Seçimi (Analize göre dinamik) */}
                                <div className="space-y-2.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <UserCircle size={14} className="text-indigo-400" /> Atanan Uzman Hekim
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            disabled={!selectedAnalysis}
                                            value={selectedDoctor}
                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                            className={`w-full border rounded-2xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium transition-all shadow-sm ${selectedAnalysis ? 'bg-indigo-50/50 border-indigo-200 text-slate-800 focus:border-indigo-400' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
                                        >
                                            <option value="" disabled>{selectedAnalysis ? "Doktor seçin" : "Önce yukarıdan tahlil türünü belirleyin"}</option>

                                            {/* Hardcoded varsayılan doktorlar */}
                                            {selectedAnalysis === "Kemik (Röntgen / Tarama)" && (
                                                <option value="Prof. Dr. Ertuğrul (Ortopedi)">Prof. Dr. Ertuğrul (Ortopedi)</option>
                                            )}
                                            {selectedAnalysis === "Akciğer (BT / X-Ray)" && (
                                                <option value="Uzm. Dr. Mehmet K. (Göğüs Hastalıkları)">Uzm. Dr. Mehmet K. (Göğüs Hastalıkları)</option>
                                            )}
                                            {selectedAnalysis === "Deri (Lezyon / Ben)" && (
                                                <option value="Doç. Dr. Ayşe Y. (Dermatoloji)">Doç. Dr. Ayşe Y. (Dermatoloji)</option>
                                            )}
                                            {selectedAnalysis === "Beyin (MR / BT)" && (
                                                <option value="Prof. Dr. Selçuk (Nöroloji)">Prof. Dr. Selçuk (Nöroloji)</option>
                                            )}
                                            {selectedAnalysis === "Göz (Retina / Tarama)" && (
                                                <option value="Doç. Dr. Canan (Oftalmoloji)">Doç. Dr. Canan (Oftalmoloji)</option>
                                            )}

                                            {/* Sisteme kayıtlı doktorlar */}
                                            {registeredDoctors.map((doc: Doctor, i: number) => (
                                                <option key={i} value={`${doc.name}`}>{doc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 3. Tarih & Saat Yan Yana */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={14} className="text-indigo-400" /> Tarih
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            min={dynamicMinDate}
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium transition-all shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={14} className="text-indigo-400" /> Saat
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            min={dynamicMinTime}
                                            max={maxTime}
                                            value={selectedTime}
                                            onChange={(e) => setSelectedTime(e.target.value)}
                                            className="w-full bg-white border border-slate-200 text-slate-800 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium transition-all shadow-sm"
                                        />
                                        <p className="text-[10px] font-medium text-slate-400 ml-1">
                                            Mesai Saatleri: {dynamicMinTime} - {maxTime}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitted}
                                    className="w-full mt-4 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isSubmitted ? (
                                        <><CheckCircle2 className="animate-bounce" size={20} /> Randevu Oluşturuluyor...</>
                                    ) : (
                                        <><CalendarCheck size={20} className="group-hover:scale-110 transition-transform" /> Görüşmeyi Planla</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MEETING ERROR ALERT */}
                {meetingAlert && (
                    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="bg-slate-900 border border-slate-700 shadow-2xl text-white px-6 py-4 rounded-2xl flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                            <p className="text-sm font-bold">{meetingAlert}</p>
                            <button onClick={() => setMeetingAlert(null)} className="ml-4 text-slate-400 hover:text-white"><X size={16} /></button>
                        </div>
                    </div>
                )}




                <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-10">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extralight tracking-tight italic text-slate-900">
                                Randevu <span className="font-bold text-blue-600 not-italic">Sistemi</span></h1>
                            <p className="text-slate-500 mt-3 font-medium max-w-xl text-sm md:text-base leading-relaxed">
                                Yapay zeka tahlillerinizi uzman doktorlarla değerlendirmek için online video görüşmesi oluşturun.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsBookingModalOpen(true)}
                            className="inline-flex flex-row items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 whitespace-nowrap group"
                        >
                            <CalendarPlus size={20} className="group-hover:scale-110 transition-transform" /> Yeni Görüşme Planla
                        </button>
                    </header>

                    {/* MEVCUT RANDEVULAR LİSTESİ */}
                    <div className="space-y-6">
                        {appointments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {appointments.map((app) => {
                                    const timeHasCome = checkIsToday(app.timestamp) && app.status === 'approved';

                                    return (
                                        <div key={app.id} className={`flex flex-col p-6 rounded-[35px] border shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] transition-all ${app.status === 'cancelled' ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xl'}`}>

                                            <div className="flex items-start gap-5">
                                                <div className={`w-20 h-20 rounded-[24px] flex flex-col items-center justify-center shadow-sm shrink-0 border ${app.status === 'cancelled' ? 'bg-slate-100 border-slate-200' : 'bg-indigo-50 border-indigo-100/50 text-indigo-600'}`}>
                                                    <span className={`text-[11px] font-black uppercase leading-none mb-1 ${app.status === 'cancelled' ? 'text-slate-400' : 'text-indigo-400'}`}>{app.dateMonth}</span>
                                                    <span className="text-3xl font-black leading-none">{app.dateDay}</span>
                                                </div>

                                                <div className="flex-1 space-y-1.5">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="font-bold text-slate-900 text-lg md:text-xl leading-tight">{app.doctor}</p>
                                                        {timeHasCome ? (
                                                            <span className="relative flex items-center justify-center">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                                <span className="text-[10px] font-black bg-rose-500 text-white px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shrink-0 z-10 shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                                                                    <PhoneCall size={10} className="animate-pulse" /> Katılmanız Bekleniyor!
                                                                </span>
                                                            </span>
                                                        ) : app.status === 'pending' ? (
                                                            <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shrink-0">⏳ Onay Bekliyor</span>
                                                        ) : app.status === 'approved' ? (
                                                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shrink-0"><CheckCircle size={10} /> Onaylı</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0">İptal Edildi</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                        <Stethoscope size={14} className={app.status === 'cancelled' ? 'text-slate-400' : 'text-indigo-400'} />
                                                        {app.branch} - {app.title}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 pt-3">
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                                            <Clock size={14} className={app.status === 'cancelled' ? 'text-slate-400' : 'text-indigo-400'} /> {app.time}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">
                                                            <Video size={14} className="text-indigo-500" /> {app.location}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {app.status === 'approved' && (
                                                <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end gap-3">

                                                    {timeHasCome && (
                                                        <button
                                                            onClick={() => joinMeeting(app.id)}
                                                            className="flex-1 px-5 py-3 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
                                                        >
                                                            {isJoiningMeeting === app.id ? (
                                                                <><Loader2 size={16} className="animate-spin" /> Bağlanıyor...</>
                                                            ) : (
                                                                <><Video size={16} /> Online Görüşmeye Katıl</>
                                                            )}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => cancelAppointment(app.id)}
                                                        className="px-5 py-3 rounded-xl text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-2 border border-rose-100 hover:border-transparent shrink-0"
                                                    >
                                                        <Trash2 size={14} /> İptal Et
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_4px_40px_-15px_rgba(0,0,0,0.05)] p-16 md:p-32 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                    <Video size={40} className="text-indigo-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Henüz Online Görüşmeniz Yok</h3>
                                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto text-sm">
                                    Yapay zeka tarama sonuçlarınızı uzman bir hekimle video konferansla değerlendirmek için yukarıdaki butondan hemen bir görüşme planlayabilirsiniz.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
