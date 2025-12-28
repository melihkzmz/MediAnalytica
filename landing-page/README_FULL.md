# MediAnalytica - Tam Entegre Next.js Uygulaması

## ✅ TAMAMLANAN ÖZELLİKLER

### 1. Landing Page ✅
- Modern, responsive tasarım
- Hero, How it Works, Technology, Video Consultation bölümleri
- Tüm linkler çalışıyor

### 2. Authentication ✅
- Login/Register sayfası
- Firebase Authentication
- **Email doğrulama kaldırıldı** - Direkt giriş yapılabiliyor
- Token yönetimi

### 3. Ana Analiz Sayfası ✅
- Kategori seçimi (Deri, Kemik, Akciğer, Göz)
- Görüntü yükleme ve önizleme
- Backend API entegrasyonu
- Analiz sonuçları gösterimi
- Grad-CAM görselleştirme
- Firebase'e analiz kaydetme
- Favorilere ekleme

### 4. Analiz Geçmişi ✅
- Tüm analizlerin listelenmesi
- Tarih ve kategori gösterimi
- Favorilere ekleme butonu

### 5. Favoriler ✅
- Favori analizleri görüntüleme
- Favorilerden kaldırma

### 6. İstatistikler ✅
- Toplam analiz sayısı
- Hastalık türüne göre dağılım
- En çok analiz edilen hastalık

### 7. Profil Sayfası ✅
- Profil fotoğrafı yükleme
- Ad soyad güncelleme
- Email görüntüleme

### 8. Randevu Sistemi ✅
- Randevu talep formu
- Firestore'a kayıt

### 9. Yardım, Hakkımızda, İletişim ✅
- Tüm sayfalar hazır ve çalışıyor

## 🚀 ÇALIŞTIRMA ADIMLARI

### 1. Backend API'leri Başlatın

**Terminal 1 - Ana API:**
```bash
cd Skin-Disease-Classifier
source venv/bin/activate
python3 auth_api.py
```
Port: 5001

**Terminal 2 - Kemik API:**
```bash
cd Skin-Disease-Classifier
source venv/bin/activate
python3 bone_disease_api.py
```
Port: 5002

**Terminal 3 - Deri API:**
```bash
cd Skin-Disease-Classifier
source venv/bin/activate
python3 skin_disease_api.py
```
Port: 5003

**Terminal 4 - Akciğer API:**
```bash
cd Skin-Disease-Classifier
source venv/bin/activate
python3 lung_disease_api.py
```
Port: 5004

**Terminal 5 - Göz API:**
```bash
cd Skin-Disease-Classifier
source venv/bin/activate
python3 eye_disease_api.py
```
Port: 5005

### 2. Next.js Uygulamasını Başlatın

```bash
cd landing-page
npm run dev
```

Server `http://localhost:3000` veya `http://localhost:3001` adresinde çalışacak.

## 📋 ÖNEMLİ NOTLAR

### CORS Ayarları
`auth_api.py` dosyasında CORS ayarlarını kontrol edin. `http://localhost:3001` origin'i eklenmiş olmalı:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:3001",  # ← Bu satır olmalı
            # ...
        ],
    }
})
```

### Firebase Konfigürasyonu
Firebase config `lib/firebase.ts` dosyasında. Mevcut config çalışıyor.

### API Endpoint'leri
- Ana API: `http://localhost:5001`
- Kemik: `http://localhost:5002/predict`
- Deri: `http://localhost:5003/predict`
- Akciğer: `http://localhost:5004/predict`
- Göz: `http://localhost:5005/predict`

## 🎯 KULLANIM

1. Ana sayfadan "Ücretsiz Analiz Başlat" butonuna tıklayın
2. Login/Register sayfasında hesap oluşturun veya giriş yapın
3. Ana analiz sayfasında:
   - Hastalık türü seçin
   - Görüntü yükleyin
   - "Analiz Et" butonuna tıklayın
   - Sonuçları görüntüleyin
   - Favorilere ekleyin veya geçmişe bakın

## ⚠️ BİLİNEN SINIRLAMALAR

1. **Jitsi Meet Entegrasyonu**: Henüz eklenmedi (appointment.html sayfası gerekli)
2. **PDF Rapor**: Henüz eklenmedi
3. **Paylaşım Linki**: Henüz eklenmedi
4. **Doktor Paneli**: Henüz eklenmedi

## 🔧 SORUN GİDERME

### API'ye bağlanamıyorum
- Backend API'lerin çalıştığından emin olun
- Port numaralarını kontrol edin
- CORS ayarlarını kontrol edin

### Analiz sonuçları gelmiyor
- Backend API loglarını kontrol edin
- Model dosyalarının mevcut olduğundan emin olun
- Görüntü formatını kontrol edin (JPEG/PNG, max 10MB)

### Firebase hatası
- Firebase credentials dosyasının mevcut olduğundan emin olun
- Firebase Console'da proje ayarlarını kontrol edin

