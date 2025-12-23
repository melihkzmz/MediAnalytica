# 🔥 Firebase Gemini Prompt

Firebase Console'daki Gemini'ye aşağıdaki prompt'u kopyala-yapıştır yap:

---

## 📋 PROMPT 1: Firestore Database ve Rules

```
Benim Firebase projemde (medianalytica-71c1d) Firestore Database'i oluştur ve aşağıdaki güvenlik kurallarını ayarla:

1. Firestore Database'i oluştur (eğer yoksa):
   - Test mode'da başlat
   - Location: europe-west1 veya us-central1

2. Firestore Security Rules'u şu şekilde ayarla:

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

Bu kuralları Firestore Rules sayfasına uygula ve publish et.
```

---

## 📋 PROMPT 2: Firebase Storage ve Rules

```
Benim Firebase projemde (medianalytica-71c1d) Firebase Storage'ı oluştur ve aşağıdaki güvenlik kurallarını ayarla:

1. Firebase Storage'ı oluştur (eğer yoksa):
   - Test mode'da başlat

2. Storage Security Rules'u şu şekilde ayarla:

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

Bu kuralları Storage Rules sayfasına uygula ve publish et.
```

---

## 📋 PROMPT 3: Tüm Yapılandırmayı Tek Seferde (ÖNERİLEN)

```
Benim Firebase projemde (medianalytica-71c1d) aşağıdaki yapılandırmaları yap:

1. FIRESTORE DATABASE:
   - Firestore Database'i oluştur (eğer yoksa), test mode'da başlat, location: europe-west1
   - Firestore Security Rules'u şu şekilde ayarla ve publish et:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.data.userId == request.auth.uid;
    }
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.data.userId == request.auth.uid;
    }
    match /shared/{shareId} {
      allow read: if true;
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.data.userId == request.auth.uid;
    }
  }
}

2. FIREBASE STORAGE:
   - Firebase Storage'ı oluştur (eğer yoksa), test mode'da başlat
   - Storage Security Rules'u şu şekilde ayarla ve publish et:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_images/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /analysis_images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

3. KONTROL:
   - Her iki yapılandırmanın da başarıyla tamamlandığını doğrula
   - Rules'ların publish edildiğini kontrol et

Tüm adımları tamamladıktan sonra bana özet bir rapor ver.
```

---

## ⚠️ ÖNEMLİ NOTLAR

1. **Service Account Key**: Bu manuel olarak yapılmalı:
   - Project Settings → Service accounts → Generate new private key
   - İndirilen JSON'u `firebase_credentials.json` olarak kaydet

2. **Gemini'nin Yapamayacağı Şeyler**:
   - Service Account Key indirme (güvenlik nedeniyle manuel)
   - Dosya sistemine dosya kaydetme

3. **Kontrol Et**:
   - Gemini işlemleri tamamladıktan sonra Firebase Console'da kontrol et:
     - Firestore Database → Rules sekmesi
     - Storage → Rules sekmesi

---

## 🚀 Kullanım

1. Firebase Console'u aç: https://console.firebase.google.com/
2. Projeni seç: **medianalytica-71c1d**
3. Sağ alttaki Gemini ikonuna tıkla (💬)
4. **PROMPT 3**'ü kopyala-yapıştır yap
5. Gemini'nin işlemleri tamamlamasını bekle
6. Sonuçları kontrol et

---

## ✅ Sonraki Adımlar

Gemini yapılandırmayı tamamladıktan sonra:

1. ✅ Service Account Key'i manuel indir (Project Settings → Service accounts)
2. ✅ Backend'i test et: `python auth_api.py`
3. ✅ Frontend'i test et: Login → Analyze

