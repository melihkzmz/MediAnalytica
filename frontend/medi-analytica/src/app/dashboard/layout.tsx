"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SearchProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </SearchProvider>
    );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, loading } = useAuth();
    const pathname = usePathname();
    const { setSearchQuery } = useSearch();

    // Sadece bu sayfalarda arama çubuğunu göster
    const isHistory = pathname === '/dashboard/analiz-gecmisi';
    const isYildizli = pathname === '/dashboard/yildizli-analiz';
    const showSearch = isHistory || isYildizli;
    const searchPlaceholder = isHistory ? "Geçmişi ara (Teşhis, kategori...)" : "Yıldızlı analizlerde ara (Teşhis, kategori...)";


    if (loading || !isAuthenticated || !user) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white text-sm font-medium animate-pulse">Erişim Kontrol Ediliyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative bg-slate-50">
                <Navbar
                    userName={user.name}
                    userRole={user.role}
                    userImage={user.profileImage}
                    showSearch={showSearch}
                    searchPlaceholder={searchPlaceholder}
                />
                {children}
            </main>
        </div>
    );
}
