"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
    const [isAuth, setIsAuth] = useState(false);
    const [doctorName, setDoctorName] = useState('Doktor');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = () => {
            const userJson = localStorage.getItem('currentUser');
            if (!userJson) { router.push('/login'); return; }
            const user = JSON.parse(userJson);
            if (user.role !== 'doktor') { router.push('/dashboard'); return; }
            setDoctorName(user.name);
            setIsAuth(true);
        };

        const timeout = setTimeout(() => {
            checkAuth();
        }, 0);
        return () => clearTimeout(timeout);
    }, [router]);

    if (!isAuth) return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm font-medium animate-pulse">Erişim Kontrol Ediliyor...</p>
            </div>
        </div>
    );

    const navItems = [
        { name: 'Genel Bakış', href: '/doctor-dashboard', icon: <LayoutDashboard size={22} /> },
        { name: 'Randevular', href: '/doctor-dashboard/randevular', icon: <Calendar size={22} /> },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
            {/* SIDEBAR */}
            <aside className={`${sidebarOpen ? 'w-56' : 'w-[72px]'} bg-[#0f172a] text-white transition-all duration-300 h-screen sticky top-0 flex flex-col shrink-0 z-50`}>

                {/* Flying Logo When Closed */}
                {!sidebarOpen && (
                    <Link href="/ana-menu" className="fixed top-0 left-[72px] h-[64px] flex items-center z-[70] animate-in fade-in slide-in-from-left-4 duration-300 pl-6 md:pl-8 hover:opacity-80 transition-opacity">
                        <h1 className="text-[17px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 leading-none whitespace-nowrap">
                            MediAnalytica
                        </h1>
                    </Link>
                )}

                <div className={`h-[64px] flex items-center shrink-0 ${!sidebarOpen ? 'justify-center' : 'px-4'}`}>
                    <button onClick={() => setSidebarOpen(p => !p)} className="p-2 rounded-lg text-white hover:bg-slate-800 transition-all flex items-center justify-center">
                        <Menu size={22} />
                    </button>
                    {sidebarOpen && (
                        <Link href="/ana-menu" className="ml-3 overflow-hidden hover:opacity-80 transition-opacity">
                            <h1 className="text-[17px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400 leading-none whitespace-nowrap">
                                MediAnalytica
                            </h1>
                        </Link>
                    )}
                </div>

                <nav className="flex-1 px-3 py-6 space-y-3">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center rounded-2xl transition-all ${sidebarOpen ? 'px-4 py-3.5' : 'justify-center py-3.5 mx-1'}
                                    ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}>
                                {item.icon}
                                {sidebarOpen && <span className="ml-3.5 text-[15px] font-semibold">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 mt-auto border-t border-slate-800">
                    <button
                        onClick={() => { localStorage.removeItem('isAuthenticated'); localStorage.removeItem('currentUser'); window.location.href = '/'; }}
                        className={`flex items-center transition-colors rounded-2xl w-full ${sidebarOpen ? 'px-3 py-3' : 'justify-center py-3.5 mx-1'} text-slate-400 hover:text-red-400 hover:bg-slate-800/50`}>
                        <LogOut size={22} />
                        {sidebarOpen && <span className="ml-3 text-[15px] font-semibold">Çıkış Yap</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full bg-slate-50">
                {/* NAVBAR */}
                <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl px-6 py-2 flex items-center justify-end h-[64px] w-full shrink-0 border-b border-slate-100/50">
                    <div className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-full hover:bg-slate-100/60 transition-all border border-transparent hover:border-slate-200">
                        <div className="text-right hidden sm:block pr-1">
                            <p className="text-[12px] font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{doctorName}</p>
                            <p className="text-[9px] font-semibold text-indigo-500 mt-1 tracking-wider uppercase">Doktor</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-inner ring-2 ring-white">
                            {doctorName[0]}
                        </div>
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
}
