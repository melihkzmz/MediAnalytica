# Gemini AI için Veri İlişkileri Diyagramı Promptu

Aşağıdaki promptu Gemini AI'ye göndererek mevcut projenin veri ilişkileri diyagramını oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak bir veri ilişkileri diyagramı (Entity Relationship Diagram - ERD) çiz. Aşağıdaki detaylı açıklamayı takip et:**

### Proje: MediAnalytica - Tıbbi Görüntü Analizi ve Tele-Tıp Platformu

**Veritabanı:** Firebase Firestore (NoSQL)

**Diyagram Gereksinimleri:**
- Entity Relationship Diagram (ERD) formatı
- Koleksiyonlar kutu/entity olarak gösterilmeli
- Referanslar oklarla gösterilmeli
- İlişki tipleri (1:1, 1:N, N:1) etiketlenmeli
- Türkçe etiketler ve açıklamalar
- Profesyonel ve akademik görünüm
- Görselde HİÇBİR watermark, logo veya amblem OLMAMALI

---

## KOLEKSİYONLAR VE İLİŞKİLER:

### 1. `users` Koleksiyonu (Merkez Koleksiyon)
**Renk:** Mavi (#E3F2FD arka plan, #1976D2 kenarlık)

**Açıklama:** Kullanıcı profilleri. Tüm diğer koleksiyonlar bu koleksiyona referans verir.

**Document ID:** Firebase Authentication UID

**Ana Alanlar:**
- email, displayName, userType, createdAt, lastLogin, settings

**İlişkiler:**
- `analyses.userId` → `users` (N:1 - Bir kullanıcının birden fazla analizi olabilir)
- `favorites.userId` → `users` (N:1 - Bir kullanıcının birden fazla favorisi olabilir)
- `appointments.userId` → `users` (N:1 - Bir kullanıcının birden fazla randevusu olabilir)
- `doctors.userId` → `users` (1:1 - Bir kullanıcı bir doktor olabilir, unique)

---

### 2. `doctors` Koleksiyonu
**Renk:** Yeşil (#E8F5E9 arka plan, #388E3C kenarlık)

**Açıklama:** Doktor bilgileri ve onay durumu.

**Document ID:** Firebase Authentication UID (userId ile aynı)

**Ana Alanlar:**
- userId, firstName, lastName, specialty, phone, status, diplomaUrl, createdAt, updatedAt

**İlişkiler:**
- `doctors.userId` → `users` (1:1 - Bir doktor bir kullanıcıdır, unique, zorunlu)
- `appointments.doctorId` → `doctors` (N:1 - Bir doktorun birden fazla randevusu olabilir, opsiyonel)

---

### 3. `analyses` Koleksiyonu
**Renk:** Turuncu (#FFF3E0 arka plan, #F57C00 kenarlık)

**Açıklama:** Kullanıcı analiz geçmişi ve sonuçları.

**Document ID:** Auto-generated (otomatik oluşturulan)

**Ana Alanlar:**
- userId, userEmail, diseaseType, results, topPrediction, topConfidence, imageUrl, gradcamUrl, createdAt, updatedAt

**İlişkiler:**
- `analyses.userId` → `users` (N:1 - Bir analiz bir kullanıcıya aittir, zorunlu)
- `favorites.analysisId` → `analyses` (N:1 - Bir favori bir analize aittir, zorunlu)

---

### 4. `favorites` Koleksiyonu
**Renk:** Pembe (#FCE4EC arka plan, #C2185B kenarlık)

**Açıklama:** Kullanıcıların favori analizleri.

**Document ID:** Auto-generated (otomatik oluşturulan)

**Ana Alanlar:**
- userId, analysisId, createdAt

**İlişkiler:**
- `favorites.userId` → `users` (N:1 - Bir favori bir kullanıcıya aittir, zorunlu)
- `favorites.analysisId` → `analyses` (N:1 - Bir favori bir analize aittir, zorunlu)

**Not:** `userId` + `analysisId` kombinasyonu unique olmalı (bir kullanıcı aynı analizi birden fazla kez favoriye ekleyemez).

---

### 5. `appointments` Koleksiyonu
**Renk:** Mor (#F3E5F5 arka plan, #7B1FA2 kenarlık)

**Açıklama:** Randevu kayıtları (hasta-doktor randevuları).

**Document ID:** Auto-generated (otomatik oluşturulan)

**Ana Alanlar:**
- userId, userEmail, doctorId, date, time, reason, doctorType, status, jitsiRoom, createdAt, updatedAt, approvedAt

**İlişkiler:**
- `appointments.userId` → `users` (N:1 - Bir randevu bir kullanıcıya (hastaya) aittir, zorunlu)
- `appointments.doctorId` → `doctors` (N:1 - Bir randevu bir doktora atanabilir, opsiyonel - onaylandığında eklenir)

---


---

## İLİŞKİ TİPLERİ AÇIKLAMALARI:

### One-to-One (1:1)
- `doctors.userId` → `users`: Her doktor bir kullanıcıdır, her kullanıcı en fazla bir doktor olabilir

### One-to-Many / Many-to-One (1:N / N:1)
- `users` ← `analyses.userId`: Bir kullanıcının birden fazla analizi olabilir
- `users` ← `favorites.userId`: Bir kullanıcının birden fazla favorisi olabilir
- `users` ← `appointments.userId`: Bir kullanıcının birden fazla randevusu olabilir
- `doctors` ← `appointments.doctorId`: Bir doktorun birden fazla randevusu olabilir
- `analyses` ← `favorites.analysisId`: Bir analiz birden fazla kullanıcının favorisi olabilir
---

## DİYAGRAM FORMATI:

**Entity (Koleksiyon) Gösterimi:**
- Her koleksiyon dikdörtgen kutu olarak gösterilmeli
- Kutu içinde koleksiyon adı (kalın, büyük font)
- Ana referans alanları küçük font ile gösterilebilir (opsiyonel)
- Her koleksiyon için farklı renk kullanılmalı

**İlişki Okları:**
- Referans alanları oklarla gösterilmeli
- Ok yönü: Referans veren koleksiyondan → Referans edilen koleksiyona
- Ok üzerinde referans alan adı yazılmalı (örn: "userId", "analysisId")
- İlişki tipi (1:1, 1:N, N:1) ok üzerinde veya yakınında etiketlenmeli

**Özel İşaretler:**
- Unique ilişkiler için (1:1) çift çizgi veya özel işaret
- Opsiyonel ilişkiler için (opsiyonel) etiketi
- Zorunlu ilişkiler için (zorunlu) etiketi veya normal çizgi

**Yerleşim:**
- `users` koleksiyonu merkezde veya en üstte yerleştirilmeli
- Diğer koleksiyonlar `users` koleksiyonunun etrafında yerleştirilmeli
- İlişkiler net bir şekilde görülebilmeli, oklar birbirine karışmamalı
- Crow's foot notation veya benzer standart ERD notasyonu kullanılabilir

**Renk Şeması:**
- `users`: Mavi tonları (#E3F2FD, #1976D2)
- `doctors`: Yeşil tonları (#E8F5E9, #388E3C)
- `analyses`: Turuncu tonları (#FFF3E0, #F57C00)
- `favorites`: Pembe tonları (#FCE4EC, #C2185B)
- `appointments`: Mor tonları (#F3E5F5, #7B1FA2)

**Stil:**
- Profesyonel ve temiz görünüm
- Yeterli boşluklar
- Okunabilir font boyutları
- Net ve anlaşılır ilişki çizgileri

---

## ÖNEMLİ NOTLAR:

1. **NoSQL Referans Modeli:** Firestore'da foreign key yoktur, referanslar string ID'ler ile yapılır
2. **Document ID'ler:** `users` ve `doctors` koleksiyonlarında Document ID = Firebase Auth UID, diğer koleksiyonlarda auto-generated
3. **Opsiyonel İlişkiler:** `appointments.doctorId` opsiyoneldir (randevu onaylandığında eklenir)
4. **Composite Index Gereksinimleri:** Bazı sorgular için composite index gerekir (userId + createdAt, userId + status gibi)

---

**Yukarıdaki açıklamaya göre detaylı bir veri ilişkileri diyagramı oluştur. Diyagram, koleksiyonları ve aralarındaki referans ilişkilerini net bir şekilde göstermeli, Türkçe etiketler ve açıklamalarla hazırlanmalıdır. Görsel profesyonel ve akademik görünümde olmalı, hiçbir watermark veya logo içermemelidir.**
