"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    User,
    Lock,
    Bell,
    Camera,
    Mail,
    Phone,
    ChevronRight,
    Shield,
    Save,
    CheckCircle2,
    LogOut,
    Calendar,
    X
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaved, setIsSaved] = useState(false);
    // Form State'leri
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [role, setRole] = useState('');
    const [profileImage, setProfileImage] = useState('');

    // Güvenlik State'leri
    const [originalEmail, setOriginalEmail] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [actualPassword, setActualPassword] = useState('');
    const showPasswordConfirm = email !== originalEmail && email !== '';

    // Şifre Değiştirme State'leri
    const [currentPassChange, setCurrentPassChange] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newPassConfirm, setNewPassConfirm] = useState('');

    const loadUserData = () => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const userData = JSON.parse(userJson);
            setName(userData.name || '');
            setEmail(userData.email || '');
            setOriginalEmail(userData.email || '');
            setPhone(userData.phone || '');
            setGender(userData.gender || '');
            setBirthDate(userData.birthDate || '');
            setRole(userData.role === 'doktor' ? 'Doktor' : 'Standart Üye');
            setProfileImage(userData.profileImage || '');
            setActualPassword(userData.password || '');
            setPasswordConfirm('');
            setCurrentPassChange('');
            setNewPass('');
            setNewPassConfirm('');
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadUserData();
        }, 0);
        return () => clearTimeout(timeout);
    }, []);

    const handleCancel = () => {
        loadUserData();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // useEffect email takibi kalktı, showPasswordConfirm artık türetilmiş bir state.

    const handleSave = () => {
        // Email değişikliği güvenliği
        if (showPasswordConfirm && passwordConfirm !== actualPassword) {
            alert("E-posta adresini değiştirmek için mevcut parolanızı doğru girmelisiniz.");
            return;
        }

        const userJson = localStorage.getItem('currentUser');
        if (!userJson) return;

        const userData = JSON.parse(userJson);
        const updatedUser = {
            ...userData,
            name,
            email,
            phone,
            gender,
            birthDate,
            profileImage,
            password: actualPassword
        };

        // 4. Şifre Değiştirme Kontrolü
        if (currentPassChange || newPass || newPassConfirm) {
            if (currentPassChange !== actualPassword) {
                alert("Mevcut parolanızı yanlış girdiniz.");
                return;
            }
            if (newPass !== newPassConfirm) {
                alert("Yeni parolalar birbiriyle uyuşmuyor.");
                return;
            }
            if (newPass.length < 6) {
                alert("Yeni parola en az 6 karakter olmalıdır.");
                return;
            }
            updatedUser.password = newPass;
            setActualPassword(newPass);
        }

        // 1. currentUser Güncelle
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // 2. Kayıtlı kullanıcı listesini güncelle
        const storeKey = userData.role === 'doktor' ? 'registeredDoctors' : 'registeredPatients';
        const users = JSON.parse(localStorage.getItem(storeKey) || '[]');
        const updatedUsers = users.map((u: { email: string;[key: string]: unknown }) => u.email === originalEmail ? updatedUser : u);
        localStorage.setItem(storeKey, JSON.stringify(updatedUsers));

        // 3. Başarı state'i ve Event tetikleme
        setOriginalEmail(email);
        setPasswordConfirm('');
        setIsSaved(true);
        window.dispatchEvent(new Event('userUpdated'));

        setTimeout(() => setIsSaved(false), 3000);
    };

    const tabs = [
        { id: 'profile', name: 'Profil', icon: <User size={20} /> },
        { id: 'security', name: 'Güvenlik', icon: <Lock size={20} /> },
        { id: 'notifications', name: 'Bildirimler', icon: <Bell size={20} /> },
    ];

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Ayarlar</h1>
                <p className="text-slate-500 font-medium">Hesap tercihlerinizi ve kişisel bilgilerinizi buradan yönetebilirsiniz.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-200/60 sticky top-24">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.name}
                                    {activeTab === tab.id && <ChevronRight size={16} className="ml-auto opacity-70" />}
                                </button>
                            ))}
                        </nav>

                        {/* Çıkış Yap Butonu */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('isAuthenticated');
                                    localStorage.removeItem('currentUser');
                                    window.location.href = '/';
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm text-red-500 hover:bg-red-50"
                            >
                                <LogOut size={20} />
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="p-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-10 pb-10 border-b border-slate-100">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-white group-hover:ring-indigo-50 transition-all overflow-hidden">
                                            {profileImage ? (
                                                <Image src={profileImage} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
                                            ) : (
                                                name ? name[0] : 'K'
                                            )}
                                        </div>
                                        {profileImage && (
                                            <button
                                                onClick={() => setProfileImage('')}
                                                className="absolute -top-1 -right-1 p-1.5 bg-red-100 text-red-600 rounded-full shadow-md hover:bg-red-200 transition-all border-2 border-white z-10"
                                                title="Fotoğrafı Kaldır"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => document.getElementById('profile-image-input')?.click()}
                                            className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors border-2 border-white"
                                        >
                                            <Camera size={14} />
                                        </button>
                                        <input
                                            id="profile-image-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 mb-1">{name}</h2>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{role}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full border border-emerald-100 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Aktif Hesap
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Ad Soyad</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">E-posta Adresi</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Değişikliği Şifre Onayı */}
                                    {showPasswordConfirm && (
                                        <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[12px] font-black text-red-500 uppercase tracking-widest px-1">E-posta Değişikliği İçin Mevcut Parolanız</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-4 flex items-center text-red-400">
                                                    <Lock size={18} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={passwordConfirm}
                                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                                    placeholder="Değişiklikleri kaydetmek için şifrenizi girin"
                                                    className="w-full pl-12 pr-4 py-3.5 bg-red-50 border border-red-200 rounded-2xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-semibold text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Telefon Numarası (İsteğe Bağlı)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                                                <Phone size={18} />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+90 5XX XXX XX XX"
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Doğum Tarihi (İsteğe Bağlı)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                                                <Calendar size={18} />
                                            </div>
                                            <input
                                                type="date"
                                                value={birthDate}
                                                onChange={(e) => setBirthDate(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold text-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1">Cinsiyet (İsteğe Bağlı)</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['Erkek', 'Kadın', 'Belirtmek İstemiyorum'].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setGender(g)}
                                                    className={`py-3 rounded-2xl font-bold text-sm border transition-all ${gender === g
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="p-8 animate-in slide-in-from-right-4 duration-300 space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Güvenlik Ayarları</h3>
                                        <p className="text-sm text-slate-500">Hesap parolanızı buradan güvenli bir şekilde güncelleyebilirsiniz.</p>
                                    </div>
                                </div>

                                <div className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Mevcut Parola</label>
                                        <input
                                            type="password"
                                            value={currentPassChange}
                                            onChange={(e) => setCurrentPassChange(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Yeni Parola</label>
                                        <input
                                            type="password"
                                            value={newPass}
                                            onChange={(e) => setNewPass(e.target.value)}
                                            placeholder="Yeni parola"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest">Yeni Parola (Tekrar)</label>
                                        <input
                                            type="password"
                                            value={newPassConfirm}
                                            onChange={(e) => setNewPassConfirm(e.target.value)}
                                            placeholder="Parolayı onayla"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab Placeholder */}
                        {activeTab === 'notifications' && (
                            <div className="p-8 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900">E-posta Bildirimleri</h4>
                                                <p className="text-xs text-slate-500 font-medium">Randevu ve analiz güncellemelerini mail ile al.</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900">SMS Bildirimleri</h4>
                                                <p className="text-xs text-slate-500 font-medium">Acil analiz sonuçlarını SMS ile al.</p>
                                            </div>
                                        </div>
                                        <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer - Actions */}
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-10 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-slate-200 hover:-translate-y-0.5 transition-all flex items-center justify-center group active:scale-95"
                            >
                                {isSaved ? "Kaydedildi" : "Değişiklikleri Kaydet"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
