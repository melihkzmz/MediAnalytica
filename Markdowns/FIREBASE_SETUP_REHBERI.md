# 🔥 Firebase Yapılandırma Rehberi

Bu rehber, projeye eklenen tüm Firebase özelliklerini yapılandırmak için adım adım talimatlar içerir.

---

## 📋 ADIM 1: Firestore Database Oluşturma

### 1.1 Firestore'u Etkinleştir
1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin (`medianalytica-71c1d`)
2. Sol menüden **"Firestore Database"** tıklayın
3. **"Create database"** butonuna tıklayın
4. **"Start in test mode"** seçin (geliştirme için)
5. **Location** seçin (örn: `europe-west1` veya size yakın bir bölge)
6. **"Enable"** tıklayın

### 1.2 Güvenlik Kuralları (Firestore Rules)
1. Firestore Database sayfasında **"Rules"** sekmesine gidin
2. Aşağıdaki kuralları yapıştırın:

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

3. **"Publish"** butonuna tıklayın

---

## 📋 ADIM 2: Firebase Storage Oluşturma (Profil Fotoğrafları İçin)

### 2.1 Storage'ı Etkinleştir
1. Sol menüden **"Storage"** tıklayın
2. **"Get started"** butonuna tıklayın
3. **"Start in test mode"** seçin
4. **"Next"** → **"Done"** tıklayın

### 2.2 Storage Kuralları
1. Storage sayfasında **"Rules"** sekmesine gidin
2. Aşağıdaki kuralları yapıştırın:

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

3. **"Publish"** butonuna tıklayın

---

## 📋 ADIM 3: Firestore Koleksiyon Yapısı

Firestore otomatik olarak koleksiyonları oluşturacak, ancak yapıyı anlamak için:

### 3.1 Koleksiyonlar:

#### `users/{userId}`
```json
{
  "email": "user@example.com",
  "displayName": "Kullanıcı Adı",
  "photoURL": "https://...",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-15T00:00:00Z",
  "settings": {
    "notifications": true,
    "language": "tr"
  }
}
```

#### `analyses/{analysisId}`
```json
{
  "userId": "user123",
  "diseaseType": "skin",
  "imageUrl": "https://...",
  "results": [
    {"class": "melanoma", "confidence": 0.95}
  ],
  "topPrediction": "melanoma",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### `favorites/{favoriteId}`
```json
{
  "userId": "user123",
  "analysisId": "analysis123",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### `shared/{shareId}`
```json
{
  "userId": "user123",
  "analysisId": "analysis123",
  "shareToken": "abc123xyz",
  "expiresAt": "2024-02-15T10:30:00Z",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## 📋 ADIM 4: Firebase Admin SDK İzinleri

### 4.1 Service Account Key Güncelleme
1. Firebase Console → **Project Settings** (⚙️ ikonu)
2. **"Service accounts"** sekmesine gidin
3. **"Generate new private key"** tıklayın
4. JSON dosyasını indirin
5. Ana dizindeki `firebase_credentials.json` dosyasını bu yeni dosya ile değiştirin

**ÖNEMLİ:** `.gitignore` dosyasında `firebase_credentials.json` olduğundan emin olun!

---

## 📋 ADIM 5: Frontend Firebase Config Kontrolü

Frontend'de Firebase config'in doğru olduğundan emin olun:
- `templates/login.html`
- `analyze.html`

Her ikisinde de aynı config kullanılıyor:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I",
  authDomain: "medianalytica-71c1d.firebaseapp.com",
  projectId: "medianalytica-71c1d",
  storageBucket: "medianalytica-71c1d.firebasestorage.app",
  messagingSenderId: "965944324546",
  appId: "1:965944324546:web:d0731f60ec2b28748fa65b",
  measurementId: "G-61JFBSYM94"
};
```

---

## ✅ Kontrol Listesi

- [ ] Firestore Database oluşturuldu
- [ ] Firestore Rules yapılandırıldı
- [ ] Storage oluşturuldu
- [ ] Storage Rules yapılandırıldı
- [ ] Service Account Key güncellendi
- [ ] Backend API çalışıyor (`python auth_api.py`)
- [ ] Frontend'de Firebase config doğru

---

## 🚀 Sonraki Adımlar

Firebase yapılandırması tamamlandıktan sonra:
1. Backend API'yi çalıştırın: `python auth_api.py`
2. Frontend'i test edin
3. İlk analizi yapın ve Firestore'da veri oluştuğunu kontrol edin

---

## 📞 Sorun Giderme

**Firestore bağlantı hatası:**
- Service Account Key'in güncel olduğundan emin olun
- Firestore'un etkin olduğunu kontrol edin

**Storage yükleme hatası:**
- Storage Rules'un doğru olduğunu kontrol edin
- Bucket adının doğru olduğunu kontrol edin

**CORS hatası:**
- Backend'de `CORS(app)` olduğundan emin olun
- Frontend URL'ini backend'e ekleyin (gerekirse)

