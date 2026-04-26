"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Message, User as Patient } from '@/types';
import { Send, UserCircle, MessageSquare, Check, CheckCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorMessagesPage() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial load & Polling
    useEffect(() => {
        if (!user) return;

        // Hastaları yükle
        const storedPatients = JSON.parse(localStorage.getItem('registeredPatients') || '[]');

        // Mesajları periyodik olarak yükle
        const fetchMessages = async () => {
            if (user?.email) {
                const msgs = await api.getMessages(user.email);
                setMessages(msgs);

                // Hastaları filtrele: Sadece daha önce mesajlaştığımız hastaları listele
                // (Eğer boşsa veya ilk defa giriliyorsa tüm hastalar da gösterilebilir ama
                // genelde doktor tarafında sadece mesaj atanlar veya hastaları listelenir)
                const interactedEmails = new Set(msgs.map(m => m.senderEmail === user.email ? m.receiverEmail : m.senderEmail));
                const interactedPatients = storedPatients.filter((p: Patient) => interactedEmails.has(p.email));

                // Eğer kimseyle mesajlaşılmamışsa tüm hastaları göster (test amaçlı)
                setPatients(interactedPatients.length > 0 ? interactedPatients : storedPatients);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);

        return () => clearInterval(interval);
    }, [user]);

    // Seçili hasta değiştiğinde veya yeni mesaj geldiğinde okundu olarak işaretle
    useEffect(() => {
        if (selectedPatient && user?.email) {
            api.markMessagesAsRead(user.email, selectedPatient.email, user.role);
        }
    }, [selectedPatient, messages, user]);

    // Otomatik kaydırma
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedPatient]);

    if (!user) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient || !newMessage.trim()) return;

        const msg: Message = {
            id: Date.now(),
            senderEmail: user.email,
            senderName: user.name,
            senderRole: 'doktor',
            receiverEmail: selectedPatient.email,
            content: newMessage.trim(),
            timestamp: Date.now(),
            isRead: false
        };

        await api.sendMessage(msg);
        setNewMessage('');
        setMessages(prev => [...prev, msg]);
    };

    const handleDeleteConversation = async () => {
        if (!selectedPatient || !user?.email) return;
        if (confirm(`${selectedPatient.name} ile olan tüm sohbet geçmişini silmek istediğinize emin misiniz?`)) {
            await api.deleteConversation(user.email, selectedPatient.email);
            setMessages(messages.filter(m => 
                !( (m.senderEmail === user.email && m.receiverEmail === selectedPatient.email) || 
                   (m.senderEmail === selectedPatient.email && m.receiverEmail === user.email) )
            ));
            toast.success("Sohbet başarıyla silindi.");
        }
    };

    const currentChatMessages = messages.filter(m =>
        (m.senderEmail === user.email && m.receiverEmail === selectedPatient?.email) ||
        (m.senderEmail === selectedPatient?.email && m.receiverEmail === user.email)
    ).sort((a, b) => a.timestamp - b.timestamp);

    const getLastMessage = (patientEmail: string) => {
        const msgs = messages.filter(m =>
            (m.senderEmail === user.email && m.receiverEmail === patientEmail) ||
            (m.senderEmail === patientEmail && m.receiverEmail === user.email)
        ).sort((a, b) => b.timestamp - a.timestamp);
        return msgs.length > 0 ? msgs[0] : null;
    };

    const getUnreadCount = (patientEmail: string) => {
        return messages.filter(m => m.senderEmail === patientEmail && m.receiverEmail === user.email && m.senderRole !== user.role && !m.isRead).length;
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-50 p-6 font-sans">
            <div className="flex w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Sol Taraf: Hasta Listesi */}
                <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
                    <div className="p-6 border-b border-slate-200 bg-white">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" size={24} />
                            Hasta Mesajları
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Hastalarınızla iletişime geçin</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {patients.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-8">Henüz bir mesajınız bulunmuyor.</p>
                        ) : (
                            patients.map(patient => {
                                const lastMsg = getLastMessage(patient.email);
                                const unreadCount = getUnreadCount(patient.email);
                                const isSelected = selectedPatient?.email === patient.email;

                                return (
                                    <button
                                        key={patient.email}
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left ${isSelected ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-slate-100 border border-transparent'}`}
                                    >
                                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center shrink-0 text-slate-500 relative">
                                            <UserCircle size={28} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{patient.name}</h3>
                                                {lastMsg && (
                                                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                                        {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-xs truncate ${unreadCount > 0 ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>
                                                {lastMsg ? lastMsg.content : 'Sohbeti başlatın...'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sağ Taraf: Sohbet Penceresi */}
                <div className="flex-1 flex flex-col bg-white relative">
                    {selectedPatient ? (
                        <>
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 shrink-0">
                                    <UserCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 leading-tight">{selectedPatient.name}</h3>
                                    <p className="text-xs font-medium text-slate-500">Hasta</p>
                                </div>
                                <button 
                                    onClick={handleDeleteConversation}
                                    title="Sohbeti Sil"
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                                {currentChatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                        <MessageSquare size={48} className="opacity-20" />
                                        <p className="text-sm font-medium">Bu hastayla henüz bir mesajlaşmanız bulunmuyor.</p>
                                    </div>
                                ) : (
                                    currentChatMessages.map((msg, idx) => {
                                        const isMine = msg.senderRole === 'doktor';
                                        return (
                                            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMine ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-200' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'}`}>
                                                    <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Hastanıza mesaj yazın..."
                                        className="w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="absolute right-2 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm"
                                    >
                                        <Send size={18} className="ml-1" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                                <MessageSquare size={40} className="text-slate-300" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Gelen Kutusu</h3>
                                <p className="text-sm font-medium">Sohbete başlamak veya cevap vermek için sol taraftan bir hasta seçin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
