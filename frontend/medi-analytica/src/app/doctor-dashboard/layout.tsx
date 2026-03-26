"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function DoctorDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, loading } = useAuth();
    const pathname = usePathname();


    if (loading || !isAuthenticated || !user) return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm font-medium animate-pulse">Erişim Kontrol Ediliyor...</p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
            <Sidebar />

            {/* MAIN */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full bg-slate-50">
                {/* NAVBAR */}
                <Navbar
                    userName={user.name}
                    userRole="doktor"
                    showSearch={false}
                />

                {children}
            </main>
        </div>
    );
}
