# MediAnalytica - Entegrasyon Durumu

## ✅ TAMAMLANAN SAYFALAR VE ÖZELLİKLER

### 1. Landing Page (Ana Sayfa) ✅
- Hero section
- How it Works
- Technology section
- Video Consultation section
- CTA section
- Footer

### 2. Login/Register Sayfası ✅
- Email/Password authentication
- Email verification
- Password reset
- Firebase Authentication entegrasyonu

### 3. Ana Analiz Sayfası (Analyze) ✅
- Firebase authentication kontrolü
- Kategori seçimi (Deri, Kemik, Akciğer, Göz)
- Görüntü yükleme
- Görüntü önizleme
- Analiz butonu
- Sidebar navigasyon
- Dashboard, History, Favorites, Stats, Appointment bölümleri

### 4. Profil Sayfası ✅
- Profil fotoğrafı yükleme
- Ad soyad güncelleme
- Email görüntüleme (read-only)
- Üyelik tarihi görüntüleme

### 5. Yardım/FAQ Sayfası ✅
- Nasıl kullanılır rehberi
- Sık sorulan sorular
- Destek bilgileri

### 6. Hakkımızda Sayfası ✅
- Şirket bilgileri
- Kurucu ekip
- İletişim bilgileri
- Misyon

### 7. İletişim Sayfası ✅
- İletişim formu
- Adres, telefon, email bilgileri

### 8. Randevu Sayfası ✅
- Randevu talep formu
- Tarih/saat seçimi
- Doktor türü seçimi
- Firestore'a kayıt

## ⚠️ KISMI TAMAMLANAN / GELİŞTİRİLECEK ÖZELLİKLER

### Ana Analiz Sayfası
- ✅ Temel yapı hazır
- ⚠️ Backend API entegrasyonu (port mapping gerekli)
- ⚠️ Analiz sonuçlarının detaylı gösterimi
- ⚠️ Grad-CAM görselleştirme
- ⚠️ Firebase'e analiz kaydetme (saveAnalysisToFirebase fonksiyonu)
- ⚠️ Analiz geçmişi listesi
- ⚠️ Favoriler sistemi
- ⚠️ İstatistikler hesaplama
- ⚠️ PDF rapor oluşturma

### Randevu Sistemi
- ✅ Randevu talep formu
- ⚠️ Randevu listesi görüntüleme
- ⚠️ Jitsi Meet entegrasyonu
- ⚠️ Randevu onay/red sistemi

### Doktor Paneli
- ❌ Henüz oluşturulmadı
- Gerekli: doctor-dashboard sayfası

## 📝 YAPILMASI GEREKENLER

### 1. Backend API Entegrasyonu
Ana analiz sayfasında backend API'lerine bağlanmak için:
- Port mapping: bone (5002), skin (5003), lung (5004), eye (5005)
- API endpoint'lerinin doğru çalıştığından emin olun
- CORS ayarlarının Next.js origin'ini kabul ettiğinden emin olun

### 2. Firebase Firestore İşlemleri
- Analiz geçmişi sorgulama
- Favoriler ekleme/çıkarma
- İstatistikler hesaplama
- Randevu listesi sorgulama

### 3. Jitsi Meet Entegrasyonu
- appointment.html sayfası oluşturulmalı
- Jitsi Meet iframe entegrasyonu
- Room ID yönetimi

### 4. Doktor Paneli
- doctor-dashboard sayfası
- Randevu onaylama/reddetme
- Hasta dosyaları görüntüleme

### 5. Email Doğrulama Sayfası
- verify-email sayfası

## 🚀 ÇALIŞTIRMA

```bash
cd landing-page
npm install
npm run dev
```

Server `http://localhost:3000` (veya 3001) adresinde çalışacak.

## 📁 SAYFA YAPISI

```
/                    → Landing page (Ana sayfa)
/login              → Giriş/Kayıt
/analyze             → Ana analiz sayfası
/profile             → Profil ayarları
/appointment         → Randevu talep
/help                → Yardım/FAQ
/about               → Hakkımızda
/contact             → İletişim
```

## 🔧 GEREKLİ BACKEND SERVİSLERİ

Backend API'lerin çalıştığından emin olun:
- `http://localhost:5001` - Ana API (auth_api.py)
- `http://localhost:5002` - Kemik hastalıkları API
- `http://localhost:5003` - Deri hastalıkları API
- `http://localhost:5004` - Akciğer hastalıkları API
- `http://localhost:5005` - Göz hastalıkları API

## 📝 NOTLAR

- Tüm Firebase işlemleri client-side'da yapılıyor
- Backend API'ler Flask ile çalışıyor
- Görüntü analizi için backend API'lerine POST isteği gönderiliyor
- Firestore'da `appointments` koleksiyonu kullanılıyor
- Analiz geçmişi için `analyses` koleksiyonu kullanılmalı

