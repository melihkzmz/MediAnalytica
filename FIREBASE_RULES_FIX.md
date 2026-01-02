# 🔥 Firebase Security Rules - Düzeltme Rehberi

## ❌ Sorun
"Missing or insufficient permissions" hatası alınıyor. Bu, Firebase Security Rules'un analiz kaydetmeye izin vermediğini gösteriyor.

## ✅ Çözüm: Firestore Rules'u Güncelle

### Adım 1: Firebase Console'a Git
1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin (`medianalytica-71c1d`)
2. Sol menüden **"Firestore Database"** tıklayın
3. **"Rules"** sekmesine gidin

### Adım 2: Firestore Rules'u Aşağıdaki Gibi Güncelle

**ÖNEMLİ:** Mevcut kuralları tamamen silin ve aşağıdakileri yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcılar sadece kendi verilerine erişebilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analiz geçmişi - CREATE için özel kural
    match /analyses/{analysisId} {
      // CREATE: Yeni analiz oluşturma - request.data.userId kontrolü
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
      
      // READ: Sadece kendi analizlerini okuyabilir
      allow read: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
      
      // UPDATE/DELETE: Sadece kendi analizlerini güncelleyebilir/silebilir
      allow update, delete: if request.auth != null && 
                             resource.data.userId == request.auth.uid;
    }
    
    // Favoriler
    match /favorites/{favoriteId} {
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
      allow read, update, delete: if request.auth != null && 
                                   resource.data.userId == request.auth.uid;
    }
    
    // Paylaşım linkleri
    match /shared/{shareId} {
      allow read: if true; // Herkes okuyabilir
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
                             resource.data.userId == request.auth.uid;
    }
    
    // Randevular
    match /appointments/{appointmentId} {
      // CREATE: Yeni randevu oluşturma - request.resource.data.userId kontrolü
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
      
      // READ: 
      // - Kullanıcılar kendi randevularını okuyabilir
      // - Doktorlar bekleyen randevuları okuyabilir (pending status)
      // - Doktorlar kendilerine atanmış randevuları okuyabilir (doctorId matches)
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        resource.data.status == 'pending' ||
        resource.data.doctorId == request.auth.uid
      );
      
      // UPDATE: 
      // - Kullanıcılar kendi randevularını güncelleyebilir
      // - Doktorlar randevuları onaylayabilir/reddedebilir (status ve doctorId güncellemesi)
      allow update: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        (resource.data.status == 'pending' && 
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'doctorId', 'updatedAt', 'approvedAt', 'doctorNote']))
      );
      
      // DELETE: Sadece kendi randevularını silebilir
      allow delete: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
    }
    
    // Doktorlar
    match /doctors/{doctorId} {
      // CREATE: Doktor kaydı oluşturma
      allow create: if request.auth != null && 
                     request.auth.uid == request.resource.data.userId;
      
      // READ: Herkes okuyabilir (doktor listesi için)
      allow read: if true;
      
      // UPDATE: Sadece kendi doktor kaydını güncelleyebilir
      allow update: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // DELETE: Sadece kendi doktor kaydını silebilir
      allow delete: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
    }
  }
}
```

### Adım 3: Publish Et
1. **"Publish"** butonuna tıklayın
2. ✅ **"Published successfully"** mesajını bekleyin

---

## ✅ Çözüm: Storage Rules'u Kontrol Et

### Adım 1: Storage Rules'a Git
1. Firebase Console → **"Storage"** tıklayın
2. **"Rules"** sekmesine gidin

### Adım 2: Storage Rules'u Kontrol Et

Aşağıdaki kurallar olmalı:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profil fotoğrafları
    match /profile_images/{userId}/{allPaths=**} {
      allow read: if true; // Herkes okuyabilir
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Analiz görüntüleri
    match /analysis_images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Adım 3: Publish Et
1. **"Publish"** butonuna tıklayın

---

## 🔍 Test Etme

Kuralları güncelledikten sonra:

1. Tarayıcıyı yenileyin (hard refresh: Ctrl+Shift+R veya Cmd+Shift+R)
2. Giriş yapın
3. Bir analiz yapmayı deneyin
4. Console'da hata olmamalı

---

## ⚠️ Önemli Notlar

1. **`request.resource.data` vs `request.data`**: 
   - `request.resource.data` → Yeni oluşturulacak dokümanın verisi
   - `request.data` → Güncelleme için gönderilen veri
   - CREATE işleminde `request.resource.data` kullanılmalı

2. **Kuralların yayınlanması**: 
   - Rules'u değiştirdikten sonra mutlaka **"Publish"** butonuna tıklayın
   - Yayınlanmamış kurallar geçerli değildir

3. **Test modu**: 
   - Eğer hala çalışmıyorsa, geçici olarak test moduna alabilirsiniz (sadece geliştirme için):
   ```javascript
   match /analyses/{document=**} {
     allow read, write: if request.auth != null;
   }
   ```

---

## 🐛 Hala Çalışmıyorsa

1. **Browser Console'u kontrol edin**: Hata mesajlarını inceleyin
2. **Firebase Console → Rules → Simulator**: Rules'u test edin
3. **Kullanıcı giriş durumu**: `request.auth != null` olmalı
4. **Veri yapısı**: `userId` alanı doğru gönderiliyor mu kontrol edin
