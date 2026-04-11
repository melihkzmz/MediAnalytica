"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Microscope, ArrowRight, Brain, Video, ShieldCheck, Activity, ChevronRight, Mail, Phone, Upload, Stethoscope, SearchCode, Lock, Calendar, X } from 'lucide-react';

export default function LandingPage() {
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("Kullanıcı");
    const [userImage, setUserImage] = useState("");

    React.useEffect(() => {
        const checkUser = () => {
            const isAuth = localStorage.getItem('isAuthenticated') === 'true';
            setIsLoggedIn(isAuth);

            if (isAuth) {
                const userJson = localStorage.getItem('currentUser');
                if (userJson) {
                    const user = JSON.parse(userJson);
                    setUserName(user.name || "Kullanıcı");
                    setUserImage(user.profileImage || "");
                }
            }
        };

        checkUser();
        window.addEventListener('userUpdated', checkUser);
        return () => window.removeEventListener('userUpdated', checkUser);
    }, []);

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">

            {/* ABOUT US MODAL */}
            {isAboutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-slate-200 relative">

                        <button
                            onClick={() => setIsAboutModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20"></div>

                            <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <Microscope className="text-blue-600" size={32} />
                                Hakkımızda
                            </h2>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Activity size={18} className="text-indigo-500" /> Biz Kimiz?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        MediAnalytica, 3 son sınıf Bilgisayar Mühendisliği öğrencisi tarafından hayata geçirilmiş vizyoner bir bitirme ve sağlık teknolojisi projesidir. Amacımız, en gelişmiş derin öğrenme algoritmalarını medikal ortama taşıyarak erken teşhis oranlarını maksimize etmek ve hastalara şeffaf, hızlı analiz sonuçları sunmaktır.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <SearchCode size={18} className="text-blue-500" /> Vizyonumuz
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            Geliştirdiğimiz yapay zeka destekli tele-tıp altyapısı ile sağlığa erişimde sınırları ortadan kaldırmak ve tüm medikal taramaların anlık olarak yüksek kesinlikle değerlendirilmesini sağlamak.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <ShieldCheck size={18} className="text-emerald-500" /> Güvenlik ve Şeffaflık
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            Hasta verilerinin mahremiyeti ana önceliğimizdir. Uzman hekimlerle KVKK standartlarına uygun olarak %100 uçtan uca şifreli görüşme imkanı sunuyoruz.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SSS MODAL */}
            {isFaqModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-slate-200 relative">

                        <button
                            onClick={() => setIsFaqModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20"></div>

                            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <Activity className="text-emerald-500" size={32} />
                                Sıkça Sorulan Sorular
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        Yüklediğim röntgen veya MR sonuçları güvende mi?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                        Kesinlikle. Platformumuz KVKK standartlarına tamamen uygundur ve yüklediğiniz tüm medikal görüntüler analiz edildikten sonra uçtan uca şifrelenerek korunur. Sizin haricinizde hiçbir kişi veya kurum analiz görsellerinize erişemez.
                                    </p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        Yapay zeka analiz sonucu %100 kesin midir?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                        Tıp modelimiz en güncel algoritmalarla eğitilmiş olup oldukça yüksek bir doğruluk payına sahiptir (%95+). Ancak unutmamalısınız ki yapay zeka sonuçları asıl tıbbi teşhis (tanı) yerine geçmez; en kesin sonuç için tahlilinizi platformumuz üzerinden bir doktorumuzla değerlendirmelisiniz.
                                    </p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        Uzman doktorlarla online randevu nasıl gerçekleşiyor?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                        Kullanıcı panelinizden <strong>Randevular</strong> sekmesine giderek analiz sonucunuza uygun uzman hekimi (Örn. Kemik &gt; Ortopedi) seçip dilediğiniz saati randevu olarak kaydedebilirsiniz. Vakti geldiğinde sistem içinden hiçbir harici uygulama kurmadan tek tıkla videolu görüşmeye katılabilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 w-full z-50 bg-white/75 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_4px_40px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/60 transition-all duration-500">
                <nav className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* Interactive Logo Area */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-[0.70rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-[1.03] transition-transform duration-300">
                            <Microscope size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:opacity-80 transition-opacity">
                            Medi<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Analytica</span>
                        </span>
                    </Link>

                    {/* Highly Premium Pill Login Button / User Profile */}
                    <div className="flex items-center">
                        {isLoggedIn ? (
                            <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer transition-all hover:opacity-80">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-blue-600 transition-colors">{userName}</p>
                                    <p className="text-[11px] font-medium text-slate-500 mt-1">Üye</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all overflow-hidden relative">
                                    {userImage ? (
                                        <Image src={userImage} alt="User Avatar" fill className="object-cover" />
                                    ) : (
                                        userName[0]
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <Link href="/login" className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold tracking-wide text-white rounded-full bg-slate-900 shadow-lg shadow-slate-900/10 group hover:shadow-xl hover:shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-[0.15] bg-gradient-to-b from-transparent via-transparent to-black" />
                                <span className="relative flex items-center gap-1.5 text-sm">
                                    Giriş Yap <ArrowRight size={15} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </span>
                            </Link>
                        )}
                    </div>
                </nav>
            </div>

            {/* 1. HERO SECTION (Welcome) */}
            <section className="relative pt-24 pb-20 lg:pt-32 px-4 sm:px-6 bg-gradient-to-b from-[#fafafa] via-blue-50/40 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide shadow-sm">
                                <Activity size={14} className="animate-pulse" />
                                <span>Yapay Zeka Destekli Asistanınız</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                                Medi {"Analytica'ya"} <br /><span className="text-blue-600">Hoş Geldiniz.</span>
                            </h1>
                            <p className="text-base text-slate-500 font-medium leading-relaxed max-w-xl">
                                Güvenilir, hızlı ve akıllı tıbbi görüntü analizi ile klinik teşhis süreçlerinizi saniyelere indirin. Yeni nesil sağlık teknolojisini bugün keşfedin.
                            </p>
                            <Link href={isLoggedIn ? "/dashboard/analiz-et" : "/login"} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full text-base font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                                Platformu Şimdi İncele <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-0 bg-blue-400/20 blur-[60px] rounded-full transform scale-90 translate-y-4" />
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/50">
                                <Image src="/foto1.jpg" alt="Medi Analytica'ya Hoş Geldiniz" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ADVANCED TECHNOLOGIES */}
            <section className="py-24 bg-gradient-to-b from-white to-indigo-50/30 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-0 bg-indigo-400/20 blur-[60px] rounded-full transform scale-90 translate-y-4" />
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/50">
                                <Image src="/foto2.avif" alt="Gelişmiş Teknolojiler" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Brain size={28} />
                            </div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Gelişmiş Teknolojiler</h2>

                            <div className="space-y-4 pt-2">
                                {/* Box 1 */}
                                <div className="bg-white/80 backdrop-blur-sm border border-indigo-100/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                            <Microscope size={14} />
                                        </div>
                                        Çoklu Hastalık Tespiti
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed ml-9">
                                        Deri, kemik ve akciğer hastalıklarını tek platformda analiz edin.
                                    </p>
                                </div>

                                {/* Box 2 */}
                                <div className="bg-white/80 backdrop-blur-sm border border-indigo-100/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow delay-75">
                                    <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <SearchCode size={14} />
                                        </div>
                                        Erken Teşhis
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed ml-9">
                                        Hastalıkları erken aşamada tespit ederek tedavi şansınızı büyük oranda artırın.
                                    </p>
                                </div>

                                {/* Box 3 */}
                                <div className="bg-white/80 backdrop-blur-sm border border-indigo-100/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow delay-150">
                                    <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Brain size={14} />
                                        </div>
                                        Sürekli İyileştirme
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed ml-9">
                                        Modellerimiz her yeni veriyle sürekli öğreniyor ve yapay zeka doğruluk oranı her gün artıyor.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. VIDEO CONSULTATION */}
            <section className="py-24 bg-gradient-to-b from-indigo-50/30 to-slate-900 relative z-10 transition-colors duration-1000">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Video size={28} />
                            </div>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Uzman Doktorlarla Videolu Görüşme</h2>
                            <p className="text-base text-slate-600 font-medium leading-relaxed">
                                Yapay zeka destekli analiz sonuçlarınızı saniyeler içinde aldıktan sonra dilediğiniz zaman evinizden veya ofisinizden ayrılmadan, alanında uzman doktorlarımızla canlı videolu görüşmeler yapabilirsiniz. Kararlarınızı klinik uzmanlarla tartışabilir ve ihtiyacınız olan ikinci tıbbi görüşe anında erişerek içinizi rahatlatabilirsiniz.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                {/* Box 1: Esnek Randevu */}
                                <div className="bg-white/80 backdrop-blur-sm border border-emerald-100/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Calendar size={14} />
                                        </div>
                                        Esnek Randevular
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed ml-9">
                                        Size en uygun zaman diliminde randevu alın ve programınızı esnetmeden uzmanlarla görüşün.
                                    </p>
                                </div>

                                {/* Box 2: Gizlilik */}
                                <div className="bg-white/80 backdrop-blur-sm border border-emerald-100/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow delay-75">
                                    <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <ShieldCheck size={14} />
                                        </div>
                                        Gizlilik Garantisi
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed ml-9">
                                        Tüm verileriniz tamamen güvenli, KVKK uyumlu ve uçtan uca şifrelenmiş bir şekilde korunur.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full relative group">
                            <div className="absolute inset-0 bg-emerald-400/20 blur-[60px] rounded-[3rem] transform scale-90 translate-y-4" />
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-900/20 border border-slate-200/50">
                                <Image src="/foto3.avif" alt="Uzman Videolu Görüşme" fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. HOW IT WORKS (4 STEPS) & CTA */}
            <section className="py-24 bg-gradient-to-b from-slate-900 to-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a0f1c] to-blue-900/20" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
                        Nasıl Çalışır?
                    </h2>
                    <p className="text-base text-slate-400 font-medium max-w-2xl mx-auto mb-10">
                        Sistemimizi kullanmak sadece 4 basit adımdan ibarettir. <span className="block mt-2 text-sm text-slate-500 font-bold">Kredi kartı veya herhangi bir ön ödeme bilgisi gerekmez.</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Step 1 */}
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                            <div className="relative">
                                <div className="absolute -top-4 -right-2 text-6xl font-black text-slate-800/50 select-none">1</div>
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 mx-auto relative z-10">
                                    <Lock size={24} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Giriş yap veya kaydol</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Güvenli altyapımızla saniyeler içinde hesabınızı oluşturun ve platforma katılın.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 transition-delay-100">
                            <div className="relative">
                                <div className="absolute -top-4 -right-2 text-6xl font-black text-slate-800/50 select-none">2</div>
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 mx-auto relative z-10">
                                    <Upload size={24} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Görüntü yükle</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Laboratuvar taramalarınızı veya klinik analiz görsellerinizi sisteme kolayca aktarın.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 transition-delay-200">
                            <div className="relative">
                                <div className="absolute -top-4 -right-2 text-6xl font-black text-slate-800/50 select-none">3</div>
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 mx-auto relative z-10">
                                    <SearchCode size={24} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Sonucu görün</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Yapay zeka analizini saniyeler içinde ekranda inceleyin ve detaylı raporunuzu oluşturun.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 transition-delay-300">
                            <div className="relative">
                                <div className="absolute -top-4 -right-2 text-6xl font-black text-slate-800/50 select-none">4</div>
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 mx-auto relative z-10">
                                    <Stethoscope size={24} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold mb-2">İsteğe bağlı olarak uzman doktorlarımızla görüşün</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Kafanıza takılan tüm soruları anında videolu bir hekimle canlı olarak paylaşın.</p>
                        </div>
                    </div>

                    {/* Integrated Small CTA underneath the steps */}
                    <div className="mt-16 pt-8 border-t border-slate-800 text-center">
                        <p className="text-sm font-medium text-slate-300 mb-5">
                            Sağlığınız için hemen harekete geçin, ücretsiz analiz yapın ve uzman doktorlarımızla görüşün.
                        </p>
                        <Link href={isLoggedIn ? "/dashboard/analiz-et" : "/login"} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95">
                            <Activity size={18} /> Ücretsiz Analize Başla
                        </Link>
                    </div>

                </div>
            </section>



            {/* 6. EXTENDED FOOTER AS REQUESTED */}
            <footer className="bg-[#0f172a] text-slate-300 py-8 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">

                        {/* Sol Kısım */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Microscope size={24} className="text-blue-500" />
                                <span className="text-xl font-black tracking-tight text-white">
                                    Medi<span className="text-blue-500">Analytica</span>
                                </span>
                            </div>
                            <p className="text-slate-400 font-medium leading-snug text-sm max-w-xs">
                                Yapay zeka destekli tıbbi görüntü analizi ve tele-tıp platformu.
                            </p>
                        </div>

                        {/* Orta Kısım - Kurumsal */}
                        <div>
                            <h3 className="text-white font-bold mb-3 uppercase tracking-widest text-xs">Kurumsal</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <button onClick={() => setIsAboutModalOpen(true)} className="text-slate-400 hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer">
                                        <ChevronRight size={14} /> Hakkımızda
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => setIsFaqModalOpen(true)} className="text-slate-400 hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer">
                                        <ChevronRight size={14} /> SSS
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Sağ Kısım - İletişim */}
                        <div>
                            <h3 className="text-white font-bold mb-3 uppercase tracking-widest text-xs">İletişim</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="mailto:info@medianalytica.com" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors font-medium">
                                        <Mail size={14} className="text-blue-400" />info@medianalytica.com
                                    </a>
                                </li>
                                <li>
                                    <a href="tel:+901234567890" className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-medium">
                                        <Phone size={14} className="text-emerald-400" /> +90 555 55 55
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* En Alt Copyright */}
                    <div className="pt-6 border-t border-slate-800">
                        <p className="text-center text-slate-500 font-medium text-xs">
                            © 2025 MediAnalytica. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
