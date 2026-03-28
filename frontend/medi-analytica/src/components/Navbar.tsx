"use client";
import { useState } from "react";
import Image from "next/image";
import { Search, LogOut } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
    userName: string;
    userRole: string;
    userImage?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
}

export default function Navbar({
    userName,
    userRole,
    userImage,
    showSearch = false,
    searchPlaceholder = "Ara..."
}: NavbarProps) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { searchQuery, setSearchQuery } = useSearch();
    const { logout } = useAuth();

    return (
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-none px-6 py-2 flex items-center justify-between h-[64px] w-full shrink-0">
            {/* SOL KISIM: Arama */}
            <div className={`flex items-center flex-1 max-w-sm ${!showSearch ? 'invisible overflow-hidden' : ''}`}>
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
                        <p className="text-[12px] font-bold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors uppercase">{userName}</p>
                        <p className="text-[9px] font-semibold text-slate-400 mt-1 tracking-wider uppercase">
                            {userRole === 'doktor' ? 'Doktor' : 'Standart Üye'}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-inner ring-2 ring-white group-hover:ring-slate-100 transition-all overflow-hidden relative">
                        {userImage ? (
                            <Image src={userImage} alt="User" fill className="object-cover" />
                        ) : (
                            userName ? userName[0] : "K"
                        )}
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <button
                            onClick={logout}
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
    );
}
