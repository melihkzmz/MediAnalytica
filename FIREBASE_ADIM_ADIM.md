# 🔥 Firebase Yapılandırma - Adım Adım

Bu dosya, Firebase Console'da yapman gereken işlemleri **adım adım** gösterir.

---

## ✅ ADIM 1: Firestore Database Oluştur

### 1.1 Firestore'u Aç
1. [Firebase Console](https://console.firebase.google.com/) → Projeni seç: **`medianalytica-71c1d`**
2. Sol menüden **"Firestore Database"** tıkla
3. Eğer "Create database" butonu görünüyorsa → Tıkla
4. Eğer zaten oluşturulmuşsa → **"Rules"** sekmesine git (Adım 1.2'ye geç)

### 1.2 Firestore Oluşturma
1. **"Start in test mode"** seç (geliştirme için)
2. **"Next"** tıkla
3. **Location** seç (örn: `europe-west1` veya `us-central1`)
4. **"Enable"** tıkla
5. ⏳ Birkaç saniye bekle (Firestore oluşturuluyor...)

### 1.3 Firestore Rules Ayarla
1. Firestore Database sayfasında **"Rules"** sekmesine git
2. Mevcut kuralları sil
3. Aşağıdaki kuralları **tamamen kopyala ve yapıştır**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi verilerine erişebilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analiz geçmişi - kullanıcılar sadece kendi analizlerini görebilir
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.data.userId == request.auth.uid;
    }
    
    // Favoriler - kullanıcılar sadece kendi favorilerini görebilir
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.data.userId == request.auth.uid;
    }
    
    // Paylaşım linkleri - herkes okuyabilir (public), sadece sahibi yazabilir
    match /shared/{shareId} {
      allow read: if true; // Herkes okuyabilir
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.data.userId == request.auth.uid;
    }
  }
}
```

4. **"Publish"** butonuna tıkla
5. ✅ **"Published successfully"** mesajını gör

---

## ✅ ADIM 2: Firebase Storage Oluştur

### 2.1 Storage'ı Aç
1. Sol menüden **"Storage"** tıkla
2. Eğer "Get started" butonu görünüyorsa → Tıkla
3. Eğer zaten oluşturulmuşsa → **"Rules"** sekmesine git (Adım 2.2'ye geç)

### 2.2 Storage Oluşturma
1. **"Start in test mode"** seç
2. **"Next"** tıkla
3. **"Done"** tıkla
4. ⏳ Birkaç saniye bekle

### 2.3 Storage Rules Ayarla
1. Storage sayfasında **"Rules"** sekmesine git
2. Mevcut kuralları sil
3. Aşağıdaki kuralları **tamamen kopyala ve yapıştır**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profil fotoğrafları - kullanıcılar sadece kendi fotoğraflarını yükleyebilir
    match /profile_images/{userId}/{allPaths=**} {
      allow read: if true; // Herkes okuyabilir (profil fotoğrafları public)
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analiz görüntüleri - sadece sahibi erişebilir
    match /analysis_images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. **"Publish"** butonuna tıkla
5. ✅ **"Published successfully"** mesajını gör

---

## ✅ ADIM 3: Service Account Key Güncelle (ÖNEMLİ!)

### 3.1 Yeni Private Key İndir
1. Firebase Console → Sağ üstteki **⚙️ (Settings)** ikonuna tıkla
2. **"Project settings"** seç
3. Üstteki **"Service accounts"** sekmesine git
4. **"Generate new private key"** butonuna tıkla
5. ⚠️ **"Generate key"** uyarısını onayla
6. JSON dosyası otomatik indirilecek (örn: `medianalytica-71c1d-firebase-adminsdk-xxxxx.json`)

### 3.2 Dosyayı Projeye Kopyala
1. İndirilen JSON dosyasını bul (Downloads klasöründe olabilir)
2. Dosyayı **projenin ana dizinine** kopyala
3. Dosya adını **`firebase_credentials.json`** olarak değiştir
4. ✅ Eski `firebase_credentials.json` varsa üzerine yaz (yedek almak istersen önce kopyala)

**ÖNEMLİ:** `.gitignore` dosyasında `firebase_credentials.json` olduğundan emin ol! (Zaten ekledik)

---

## ✅ ADIM 4: Backend'i Test Et

### 4.1 Backend'i Başlat
Terminal'de:
```bash
cd Skin-Disease-Classifier
python auth_api.py
```

### 4.2 API Durumunu Kontrol Et
Tarayıcıda aç: `http://localhost:5001/`

Şunu görmelisin:
```json
{
  "status": "Auth API is running",
  "endpoints": { ... }
}
```

✅ Eğer bu mesajı görüyorsan → **Backend çalışıyor!**

---

## ✅ ADIM 5: Frontend'i Test Et

### 5.1 Login Sayfasını Aç
1. `Skin-Disease-Classifier/templates/login.html` dosyasını tarayıcıda aç
2. Yeni bir hesap oluştur (Kayıt Ol)
3. Giriş yap

### 5.2 Analyze Sayfasını Aç
1. Giriş yaptıktan sonra `analyze.html` sayfasına yönlendirileceksin
2. Profil menüsüne tıkla (sağ üstte)
3. Kullanıcı bilgilerini gör

---

## ✅ ADIM 6: İlk Analizi Yap ve Firestore'da Kontrol Et

### 6.1 Analiz Yap
1. `analyze.html` sayfasında:
   - Hastalık türü seç (örn: "Deri Hastalıkları")
   - Görüntü yükle
   - "Analiz Et" butonuna tıkla

### 6.2 Firestore'da Kontrol Et
1. Firebase Console → **Firestore Database**
2. **"Data"** sekmesine git
3. Şu koleksiyonları görmelisin:
   - ✅ `users` → Kullanıcı bilgilerin
   - ✅ `analyses` → Yaptığın analizler

---

## 🎉 TAMAMLANDI!

Artık tüm özellikler hazır:
- ✅ Analiz geçmişi kaydediliyor
- ✅ Kullanıcı istatistikleri hesaplanıyor
- ✅ Profil ayarları çalışıyor
- ✅ Favoriler eklenebiliyor
- ✅ Paylaşım linkleri oluşturulabiliyor

---

## 🔧 Sorun Giderme

### "Firestore bağlantı hatası"
- ✅ Service Account Key'in güncel olduğundan emin ol
- ✅ `firebase_credentials.json` dosyasının ana dizinde olduğunu kontrol et
- ✅ Backend'i yeniden başlat

### "Storage yükleme hatası"
- ✅ Storage Rules'un doğru olduğunu kontrol et
- ✅ Storage'ın etkin olduğunu kontrol et

### "CORS hatası"
- ✅ Backend'de `CORS(app)` olduğundan emin ol
- ✅ Backend'in çalıştığını kontrol et (`http://localhost:5001/`)

---

## 📞 Yardım

Herhangi bir sorun olursa:
1. Backend loglarını kontrol et (terminal çıktısı)
2. Browser Console'u kontrol et (F12)
3. Firebase Console'da hataları kontrol et

