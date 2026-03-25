"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";

import { Search, LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SearchProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </SearchProvider>
    );
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
    const [isAuth, setIsAuth] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [patientName, setPatientName] = useState("Kullanıcı");
    const [userRole, setUserRole] = useState("hasta");
    const [userImage, setUserImage] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const { searchQuery, setSearchQuery } = useSearch();

    // Sadece bu sayfalarda arama çubuğunu göster
    const isHistory = pathname === '/dashboard/analiz-gecmisi';
    const isYildizli = pathname === '/dashboard/yildizli-analiz';
    const showSearch = isHistory || isYildizli;
    const searchPlaceholder = isHistory ? "Geçmişi ara (Teşhis, kategori...)" : "Yıldızlı analizlerde ara (Teşhis, kategori...)";

    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem("isAuthenticated");
            if (!auth) {
                router.push("/login");
            } else {
                setIsAuth(true);
                const userJson = localStorage.getItem('currentUser');
                if (userJson) {
                    const user = JSON.parse(userJson);
                    if (user.role === 'doktor') {
                        router.push('/doctor-dashboard');
                        return;
                    }
                    setPatientName(user.name);
                    setUserRole(user.role || 'hasta');
                    setUserImage(user.profileImage || '');
                }
            }
        };

        checkAuth();

        window.addEventListener('userUpdated', checkAuth);
        return () => window.removeEventListener('userUpdated', checkAuth);
    }, [router]);

    if (!isAuth) {
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
                {/* 1. YENİ MERKEZİ TOP NAVBAR */}
                <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-none px-6 py-2 flex items-center justify-between h-[64px] w-full shrink-0">
                    {/* SOL KISIM: Arama */}
                    <div className="flex items-center flex-1 max-w-sm">
                        {showSearch && (
                            <div className="flex items-center bg-slate-100/60 rounded-full px-4 py-2 border border-slate-200/80 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all w-full group animate-in fade-in slide-in-from-left-4 duration-300">
                                <Search size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="bg-transparent border-none outline-none text-[12px] font-medium w-full ml-2 text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                        )}
                    </div>

                    {/* SAĞ KISIM: Profil ve Dropdown */}
                    <div className="relative">
                        <div
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2.5 cursor-pointer group ml-4 px-2 py-1 rounded-full hover:bg-slate-100/60 transition-all border border-transparent hover:border-slate-200"
                        >
                            <div className="text-right hidden sm:block pr-1">
                                <p className="text-[12px] font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{patientName}</p>
                                <p className="text-[9px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">{userRole === 'doktor' ? 'Doktor' : 'Standart Üye'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-inner ring-2 ring-white group-hover:ring-slate-100 transition-all overflow-hidden relative">
                                {userImage ? (
                                    <Image src={userImage} alt="User" fill className="object-cover" />
                                ) : (
                                    patientName[0]
                                )}
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('isAuthenticated');
                                        localStorage.removeItem('currentUser');
                                        window.location.href = '/';
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                        <LogOut size={16} strokeWidth={2.5} />
                                    </div>
                                    Çıkış Yap
                                </button>
                            </div>
                        )}
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
