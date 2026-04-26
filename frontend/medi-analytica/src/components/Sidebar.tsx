"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2, History, Star, Calendar, Menu, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebarOpen');
            if (saved !== null) return JSON.parse(saved);
        }
        return true;
    });
    const [mounted, setMounted] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    if (!user) return null;

    const isDoctor = user.role === 'doktor';

    const menuItems = isDoctor ? [
        { name: 'Genel Bakış', href: '/doctor-dashboard', icon: <LayoutDashboard size={23} /> },
        { name: 'Randevular', href: '/doctor-dashboard/randevular', icon: <Calendar size={23} /> },
        { name: 'Mesajlar', href: '/doctor-dashboard/mesajlar', icon: <MessageSquare size={23} /> },
    ] : [
        { name: 'Genel Bakış', href: '/dashboard', icon: <LayoutDashboard size={23} /> },
        { name: 'Analiz Et', href: '/dashboard/analiz-et', icon: <BarChart2 size={23} /> },
        { name: 'Analiz Geçmişi', href: '/dashboard/analiz-gecmisi', icon: <History size={23} /> },
        { name: 'Yıldızlı Analizler', href: '/dashboard/yildizli-analiz', icon: <Star size={23} /> },
        { name: 'Randevular', href: '/dashboard/randevular', icon: <Calendar size={23} /> },
        { name: 'Mesajlar', href: '/dashboard/mesajlar', icon: <MessageSquare size={23} /> },
    ];

    useEffect(() => {
        const handleOpenStatus = () => {
            if (!isOpen) document.body.classList.add('sidebar-closed');
            else document.body.classList.remove('sidebar-closed');
            setMounted(true);
        };

        const timeout = setTimeout(() => {
            handleOpenStatus();
        }, 0);
        return () => clearTimeout(timeout);
    }, [isOpen]);

    useEffect(() => {
        if (!user) return;
        
        const fetchUnread = async () => {
            const msgs = await api.getMessages(user.email);
            const unread = msgs.filter(m => m.receiverEmail === user.email && m.senderRole !== user.role && !m.isRead).length;
            setUnreadCount(unread);
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 2000);
        return () => clearInterval(interval);
    }, [user]);

    const toggle = () => {
        const next = !isOpen;
        setIsOpen(next);
        localStorage.setItem('sidebarOpen', JSON.stringify(next));
        if (next) document.body.classList.remove('sidebar-closed');
        else document.body.classList.add('sidebar-closed');
    };

    if (!mounted) return <div className="w-[72px] h-screen bg-[#0f172a]" />;

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
            body.sidebar-closed header > div:first-child {
                margin-left: 175px !important;
                transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            body:not(.sidebar-closed) header > div:first-child {
                margin-left: 0px !important;
                transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
        `}} />

            {/* Flying Logo When Closed */}
            {!isOpen && (
                <Link href={isDoctor ? "/doctor-dashboard" : "/"} className="fixed top-0 left-[72px] h-[64px] flex items-center z-[70] animate-in fade-in slide-in-from-left-4 duration-300 pl-6 md:pl-8 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-[18px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 leading-none pb-0.5">
                            MediAnalytica
                        </h1>
                    </div>
                </Link>
            )}

            <aside className={`
            ${isOpen ? 'w-56' : 'w-[72px]'} 
            bg-[#0f172a] text-white border-none
            transition-all duration-300 ease-in-out
            h-screen sticky top-0 flex flex-col shrink-0 z-50
        `}>
                {/* Üst Kısım: Kapalıyken Beyaz Dashboard Header'ı ile Bütünleşik Gözükür */}
                <div className={`h-[64px] flex items-center shrink-0 transition-all duration-300 bg-transparent border-none ${!isOpen ? 'justify-center' : 'px-4'}`}>
                    <button onClick={toggle} className="p-2 rounded-lg text-white hover:bg-slate-800 transition-all flex items-center justify-center">
                        <Menu size={!isOpen ? 20 : 22} strokeWidth={!isOpen ? 2.5 : 2} />
                    </button>
                    {isOpen && (
                        <Link href={isDoctor ? "/doctor-dashboard" : "/"} className="ml-3 flex items-center overflow-hidden hover:opacity-80 transition-opacity">
                            <h1 className="text-[18px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 leading-none pb-0.5 whitespace-nowrap overflow-hidden">
                                MediAnalytica
                            </h1>
                        </Link>
                    )}
                </div>

                {/* Menü */}
                <nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center rounded-2xl transition-all ${isOpen ? 'px-4 py-3.5' : 'justify-center py-3.5 mx-1'} 
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}
                                `}
                            >
                                <div className="relative flex items-center justify-center">
                                    {item.icon}
                                    {!isOpen && item.name === 'Mesajlar' && unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full shadow-sm border border-[#0f172a]">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                {isOpen && <span className="ml-3.5 text-[15px] font-semibold tracking-wide flex-1">{item.name}</span>}
                                {isOpen && item.name === 'Mesajlar' && unreadCount > 0 && (
                                     <span className="bg-rose-500 text-white text-[10px] font-bold min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full shadow-sm">
                                         {unreadCount}
                                     </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Alt Kısım: Ayarlar veya Çıkış */}
                <div className="p-3 mt-auto border-t border-slate-800 transition-colors">
                    {isDoctor ? (
                        <button
                            onClick={logout}
                            className={`flex items-center transition-colors rounded-2xl w-full ${isOpen ? 'px-4 py-3.5' : 'justify-center py-3.5 mx-1'} text-slate-400 hover:text-red-400 hover:bg-slate-800/50`}>
                            <LogOut size={23} />
                            {isOpen && <span className="ml-3.5 text-[15px] font-semibold tracking-wide">Çıkış Yap</span>}
                        </button>
                    ) : (
                        <Link
                            href="/dashboard/ayarlar"
                            className={`flex items-center rounded-2xl transition-all ${isOpen ? 'px-4 py-3.5' : 'justify-center py-3.5 mx-1'} 
                                ${pathname === '/dashboard/ayarlar'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}
                            `}
                        >
                            <Settings size={23} />
                            {isOpen && <span className="ml-3.5 text-[15px] font-semibold tracking-wide">Ayarlar</span>}
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}