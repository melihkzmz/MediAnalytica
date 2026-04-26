"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Message, User as Doctor } from '@/types';
import { Send, UserCircle, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientMessagesPage() {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial load & Polling
    useEffect(() => {
        if (!user) return;

        // Doktorları yükle
        api.getRegisteredDoctors().then(docs => {
            setDoctors(docs);
        });

        // Mesajları periyodik olarak yükle (Polling)
        const fetchMessages = async () => {
            if (user?.email) {
                const msgs = await api.getMessages(user.email);
                setMessages(msgs);
            }
        };

        fetchMessages(); // ilk yükleme
        const interval = setInterval(fetchMessages, 2000); // 2 saniyede bir güncelle

        return () => clearInterval(interval);
    }, [user]);

    // Seçili doktor değiştiğinde veya yeni mesaj geldiğinde okundu olarak işaretle
    useEffect(() => {
        if (selectedDoctor && user?.email) {
            api.markMessagesAsRead(user.email, selectedDoctor.email, user.role);
        }
    }, [selectedDoctor, messages, user]);

    // Otomatik kaydırma
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedDoctor]);

    if (!user) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctor || !newMessage.trim()) return;

        const msg: Message = {
            id: Date.now(),
            senderEmail: user.email,
            senderName: user.name,
            senderRole: 'Üye',
            receiverEmail: selectedDoctor.email,
            content: newMessage.trim(),
            timestamp: Date.now(),
            isRead: false
        };

        await api.sendMessage(msg);
        setNewMessage('');

        // Optimistic UI update
        setMessages(prev => [...prev, msg]);
    };

    const handleDeleteConversation = async () => {
        if (!selectedDoctor || !user?.email) return;
        if (confirm(`${selectedDoctor.name} ile olan tüm sohbet geçmişini silmek istediğinize emin misiniz?`)) {
            await api.deleteConversation(user.email, selectedDoctor.email);
            setMessages(messages.filter(m => 
                !( (m.senderEmail === user.email && m.receiverEmail === selectedDoctor.email) || 
                   (m.senderEmail === selectedDoctor.email && m.receiverEmail === user.email) )
            ));
            toast.success("Sohbet başarıyla silindi.");
        }
    };

    // İlgili sohbetteki mesajları filtrele
    const currentChatMessages = messages.filter(m =>
        (m.senderEmail === user.email && m.receiverEmail === selectedDoctor?.email) ||
        (m.senderEmail === selectedDoctor?.email && m.receiverEmail === user.email)
    ).sort((a, b) => a.timestamp - b.timestamp);

    // Son mesajı bulmak için yardımcı fonksiyon
    const getLastMessage = (doctorEmail: string) => {
        const msgs = messages.filter(m =>
            (m.senderEmail === user.email && m.receiverEmail === doctorEmail) ||
            (m.senderEmail === doctorEmail && m.receiverEmail === user.email)
        ).sort((a, b) => b.timestamp - a.timestamp);
        return msgs.length > 0 ? msgs[0] : null;
    };

    // Okunmamış mesaj sayısını bulmak için yardımcı fonksiyon
    const getUnreadCount = (doctorEmail: string) => {
        return messages.filter(m => m.senderEmail === doctorEmail && m.receiverEmail === user.email && m.senderRole !== user.role && !m.isRead).length;
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-50 p-6 font-sans">
            <div className="flex w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">

                {/* Sol Taraf: Doktor Listesi */}
                <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
                    <div className="p-6 border-b border-slate-200 bg-white">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" size={24} />
                            Mesajlar
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Doktorunuzla iletişime geçin</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {doctors.length === 0 ? (
                            <p className="text-center text-slate-400 text-sm py-8">Kayıtlı doktor bulunamadı.</p>
                        ) : (
                            doctors.map(doctor => {
                                const lastMsg = getLastMessage(doctor.email);
                                const unreadCount = getUnreadCount(doctor.email);
                                const isSelected = selectedDoctor?.email === doctor.email;

                                return (
                                    <button
                                        key={doctor.email}
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left ${isSelected ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-slate-100 border border-transparent'}`}
                                    >
                                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center shrink-0 text-slate-500 relative">
                                            {doctor.profileImage ? (
                                                <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <UserCircle size={28} />
                                            )}
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{doctor.name}</h3>
                                                {lastMsg && (
                                                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                                        {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium truncate mb-1">{doctor.specialty}</p>
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
                    {selectedDoctor ? (
                        <>
                            {/* Sohbet Başlığı */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 shrink-0">
                                    <UserCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 leading-tight">{selectedDoctor.name}</h3>
                                    <p className="text-xs font-medium text-indigo-600">{selectedDoctor.specialty}</p>
                                </div>
                                <button 
                                    onClick={handleDeleteConversation}
                                    title="Sohbeti Sil"
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {/* Mesaj Alanı */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                                {currentChatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                        <MessageSquare size={48} className="opacity-20" />
                                        <p className="text-sm font-medium">Bu doktorla henüz bir mesajlaşmanız bulunmuyor.</p>
                                    </div>
                                ) : (
                                    currentChatMessages.map((msg, idx) => {
                                        const isMine = msg.senderRole === 'Üye';
                                        return (
                                            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMine ? 'bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-200' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'}`}>
                                                    <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {/* isMine && msg.isRead okundu bilgisi de konabilir */}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Mesaj Gönderme Formu */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Mesajınızı yazın..."
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
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Mesajlarınız</h3>
                                <p className="text-sm font-medium">Sohbete başlamak için sol taraftan bir doktor seçin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
