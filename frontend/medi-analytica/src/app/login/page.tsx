"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Microscope, ArrowLeft, User, Mail, Lock, Phone, GraduationCap, Stethoscope, FileText, Upload, Camera, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
    const [role, setRole] = useState<'hasta' | 'doktor'>('hasta');

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (view === 'forgot') {
            toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
            setView('login');
        } else if (view === 'login') {
            const storeKey = role === 'hasta' ? 'registeredPatients' : 'registeredDoctors';
            const users = JSON.parse(localStorage.getItem(storeKey) || '[]');
            const user = users.find((u: { email: string; password: string; role: string }) => u.email === loginEmail && u.password === loginPassword);
            if (user) {
                toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
                login(user);
            } else {
                toast.error(`${role === 'hasta' ? 'Hasta' : 'Doktor'} hesabı bulunamadı. Lütfen bilgilerinizi kontrol edin.`);
            }
        } else if (view === 'register') {
            const storeKey = role === 'hasta' ? 'registeredPatients' : 'registeredDoctors';
            const users = JSON.parse(localStorage.getItem(storeKey) || '[]');
            const exists = users.find((u: { email: string }) => u.email === registerEmail);
            if (exists) {
                toast.error('Bu e-posta adresi zaten kayıtlı.');
                return;
            }
            if (registerPassword.length < 5) {
                toast.warning('Şifreniz en az 5 karakter olmalıdır.');
                return;
            }
            if (registerName.trim() === '') {
                toast.warning('Lütfen adınızı ve soyadınızı girin.');
                return;
            }
            const newUser = { name: registerName, email: registerEmail, password: registerPassword, role };
            users.push(newUser);
            localStorage.setItem(storeKey, JSON.stringify(users));

            toast.success('Kaydınız başarıyla tamamlandı!');
            login(newUser);
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-blue-500 selection:text-white text-slate-200 relative overflow-hidden">
            {/* Background design - Dark Mode Glassmorphism */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-black -z-10"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full pointer-events-none transform translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none transform -translate-x-1/3"></div>

            {/* Back to Home Navigation */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/" className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/50 backdrop-blur-md rounded-full shadow-lg border border-slate-700/50 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all">
                    <ArrowLeft size={16} /> Ana Sayfaya Dön
                </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 lg:py-20 relative z-10 w-full min-h-screen">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 mb-10 group mt-10 md:mt-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                        <Microscope size={24} className="text-white" />
                    </div>
                    <span className="text-3xl font-black tracking-tighter text-white group-hover:opacity-80 transition-opacity">
                        Medi<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Analytica</span>
                    </span>
                </Link>

                {/* Form Container - Dark Mode */}
                <div className={`w-full ${view === 'register' && role === 'doktor' ? 'max-w-3xl' : 'max-w-md'} bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 sm:p-10 transition-all duration-500 relative overflow-hidden`}>

                    {/* Header Texts */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold text-white mb-2">
                            {view === 'login' && "Sisteme Giriş Yap"}
                            {view === 'register' && "Aramıza Katılın"}
                            {view === 'forgot' && "Şifrenizi Mi Unuttunuz?"}
                        </h1>
                        <p className="text-sm font-medium text-slate-400">
                            {view === 'login' && "Kayıtlı e-posta ve şifrenizle giriş yapabilirsiniz."}
                            {view === 'register' && "Hesap tipinizi seçerek hızlıca kayıt olabilirsiniz."}
                            {view === 'forgot' && "E-posta adresinizi girin, size bir doğrulama bağlantısı gönderelim."}
                        </p>
                    </div>

                    {/* Role Slider Toggle */}
                    {view !== 'forgot' && (
                        <div className="relative flex items-center p-1.5 bg-slate-900/80 border border-slate-700/50 rounded-full mb-8">
                            {/* The sliding background pill */}
                            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-slate-700 rounded-full shadow-md transition-transform duration-300 ease-in-out ${role === 'doktor' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}></div>

                            <button
                                type="button"
                                onClick={() => setRole('hasta')}
                                className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${role === 'hasta' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Hasta
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('doktor')}
                                className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${role === 'doktor' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Doktor
                            </button>
                        </div>
                    )}

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="relative">

                        {/* ------------- LOGIN VIEW ------------- */}
                        {view === 'login' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-300">E-posta Adresi</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                        <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="ornek@email.com" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-300">Şifre</label>
                                        <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-blue-400 hover:text-blue-300 focus:outline-none">Şifremi unuttum</button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                        <input required type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="••••••••" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-3.5 mt-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                    Giriş Yap
                                </button>
                            </div>
                        )}

                        {/* ------------- FORGOT PASSWORD VIEW ------------- */}
                        {view === 'forgot' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-300">Kayıtlı E-posta Adresiniz</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                        <input type="email" required className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="ornek@email.com" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-3.5 mt-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                    E-posta Gönder
                                </button>
                            </div>
                        )}

                        {/* ------------- REGISTER VIEW ------------- */}
                        {view === 'register' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">

                                {/* PATIENT REGISTRATION */}
                                {role === 'hasta' && (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300">Ad Soyad</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                <input required type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="Adınız ve Soyadınız" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300">E-posta Adresi</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                <input required type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="ornek@email.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-300">Şifre</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                <input required type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="Güçlü bir şifre girin" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-3.5 mt-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                            Kayıt Ol <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                )}

                                {/* DOCTOR REGISTRATION */}
                                {role === 'doktor' && (
                                    <div className="relative pt-20 md:pt-0">

                                        {/* Profile Photo Upload - Floating Top Right */}
                                        <div className="absolute top-0 right-1/2 translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 md:-top-3 w-20 h-20 rounded-full bg-slate-900/80 border-2 border-dashed border-slate-600 hover:border-blue-400 hover:bg-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-blue-400 transition-colors cursor-pointer group z-10 overflow-hidden shadow-sm">
                                            <Camera size={20} className="mb-0.5 group-hover:scale-110 transition-transform" />
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">Fotoğraf</span>
                                            <input type="file" className="hidden" accept="image/*" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                                            {/* Name */}
                                            <div className="space-y-1.5 md:col-span-2 md:mr-24">
                                                <label className="text-sm font-bold text-slate-300">Ad Soyad</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input required type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="Dr. Ahmet Yılmaz" />
                                                </div>
                                            </div>

                                            {/* TC No */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">TC Kimlik No</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input type="text" maxLength={11} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="11 Haneli TC Numaranız" />
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">Telefon</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input type="tel" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="05XX XXX XX XX" />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">E-posta Adresi</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input required type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="dr.ahmet@hastane.com" />
                                                </div>
                                            </div>

                                            {/* Password */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">Şifre Oluştur</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input required type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="Güçlü bir şifre girin" />
                                                </div>
                                            </div>

                                            {/* Medical School */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">Mezun Olunan Tıp Fak. / Yıl</label>
                                                <div className="relative">
                                                    <GraduationCap className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="Hacettepe Üniv. / 2010" />
                                                </div>
                                            </div>

                                            {/* Specialty */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">Branş / Uzmanlık</label>
                                                <div className="relative">
                                                    <Stethoscope className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="Ortopedi ve Travmatoloji vs." />
                                                </div>
                                            </div>

                                            {/* Diploma No */}
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-sm font-bold text-slate-300">Diploma Numarası</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                                    <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/50 text-white focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500" placeholder="Tescil ve Diploma No" />
                                                </div>
                                            </div>

                                            {/* File Uploads */}
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">Uzmanlık Belgesi</label>
                                                <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl border border-dashed border-slate-600 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-400 hover:text-blue-400 text-sm font-bold text-slate-400 transition-all cursor-pointer">
                                                    <Upload size={16} /> Belge Yükle (PDF/JPG)
                                                    <input type="file" className="hidden" accept=".pdf,image/*" />
                                                </label>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-slate-300">Özgeçmiş (CV)</label>
                                                <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl border border-dashed border-slate-600 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-400 hover:text-blue-400 text-sm font-bold text-slate-400 transition-all cursor-pointer">
                                                    <FileText size={16} /> CV Yükle (PDF/DOCX)
                                                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                                                </label>
                                            </div>

                                            <button type="submit" className="w-full md:col-span-2 py-4 mt-6 bg-blue-600 text-white rounded-xl text-base font-extrabold shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                                Klinik Hesabımı Oluştur <CheckCircle2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>

                    {/* Footer Toggle */}
                    <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                        {view === 'login' && (
                            <button
                                type="button"
                                onClick={() => setView('register')}
                                className="text-sm font-bold text-slate-400 hover:text-blue-400 hover:underline underline-offset-4 transition-all"
                            >
                                Hesabınız yok mu? Hemen kayıt olun
                            </button>
                        )}

                        {(view === 'register' || view === 'forgot') && (
                            <button
                                type="button"
                                onClick={() => setView('login')}
                                className="text-sm font-bold text-slate-400 hover:text-blue-400 hover:underline underline-offset-4 transition-all"
                            >
                                Zaten hesabınız var mı? Giriş yapın
                            </button>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
