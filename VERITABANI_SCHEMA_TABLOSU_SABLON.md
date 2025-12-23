# Veritabanı Şema Yapısı Tablosu - Hızlı Şablon

## Excel/Google Sheets için Tablo Yapısı:

| Koleksiyon | Alan Adı | Veri Tipi | Zorunluluk | Açıklama | Index |
|------------|----------|-----------|------------|----------|-------|
| **users** | email | string | Zorunlu | Email adresi (unique) | Unique |
| | displayName | string | Opsiyonel | Kullanıcı adı | - |
| | photoURL | string | Opsiyonel | Profil fotoğrafı URL'si | - |
| | emailVerified | boolean | Opsiyonel | Email doğrulama durumu | - |
| | createdAt | timestamp | Otomatik | Hesap oluşturulma tarihi | - |
| | lastLogin | timestamp | Opsiyonel | Son giriş tarihi | - |
| **analyses** | userId | string | Zorunlu | Kullanıcı ID'si (users referansı) | Composite |
| | diseaseType | string | Zorunlu | Hastalık türü (skin/bone/lung/eye) | - |
| | imageUrl | string | Opsiyonel | Görüntü URL'si (Firebase Storage) | - |
| | results | array | Zorunlu | Analiz sonuçları [{class, probability}] | - |
| | topPrediction | string | Zorunlu | En yüksek tahmin | - |
| | gradCamUrl | string | Opsiyonel | Grad-CAM görselleştirme URL'si | - |
| | createdAt | timestamp | Otomatik | Analiz tarihi | Composite |
| **favorites** | userId | string | Zorunlu | Kullanıcı ID'si (users referansı) | Composite |
| | analysisId | string | Zorunlu | Analiz ID'si (analyses referansı) | - |
| | createdAt | timestamp | Otomatik | Favoriye ekleme tarihi | Composite |
| **shared_analyses** | token | string | Zorunlu | Paylaşım token'ı (unique, UUID) | Unique |
| | analysisId | string | Zorunlu | Analiz ID'si (analyses referansı) | - |
| | expiresAt | timestamp | Opsiyonel | Token sona erme tarihi (30 gün) | - |
| | createdAt | timestamp | Otomatik | Paylaşım tarihi | - |
| **appointments** | userId | string | Zorunlu | Kullanıcı ID'si (users referansı) | Composite |
| | doctorId | string | Opsiyonel | Doktor ID'si (doctors referansı) | - |
| | date | string | Zorunlu | Randevu tarihi (YYYY-MM-DD) | - |
| | time | string | Zorunlu | Randevu saati (HH:MM) | - |
| | reason | string | Zorunlu | Randevu nedeni | - |
| | status | string | Zorunlu | Durum (pending/approved/rejected/completed) | Composite |
| | jitsiRoom | string | Zorunlu | Jitsi Meet oda ID'si (unique, UUID) | Unique |
| | createdAt | timestamp | Otomatik | Randevu oluşturulma tarihi | - |
| | updatedAt | timestamp | Opsiyonel | Randevu güncelleme tarihi | - |
| **doctors** | userId | string | Zorunlu | Kullanıcı ID'si (users referansı, unique) | Unique |
| | specialization | string | Zorunlu | Uzmanlık alanı | - |
| | experience | number | Zorunlu | Deneyim yılı (integer) | - |
| | institution | string | Opsiyonel | Kurum adı | - |
| | diplomaUrl | string | Opsiyonel | Diploma/sertifika URL'si | - |
| | status | string | Zorunlu | Onay durumu (pending/approved/rejected) | Single |
| | createdAt | timestamp | Otomatik | Kayıt tarihi | - |
| | updatedAt | timestamp | Opsiyonel | Güncelleme tarihi | - |
| **feedback** | userId | string | Zorunlu | Kullanıcı ID'si (users referansı) | - |
| | rating | number | Zorunlu | Değerlendirme puanı (1-5) | - |
| | comment | string | Opsiyonel | Yorum metni | - |
| | createdAt | timestamp | Otomatik | Geri bildirim tarihi | - |
| **contact_messages** | name | string | Zorunlu | Gönderen adı | - |
| | email | string | Zorunlu | Gönderen email adresi | - |
| | subject | string | Zorunlu | Mesaj konusu | - |
| | message | string | Zorunlu | Mesaj içeriği | - |
| | createdAt | timestamp | Otomatik | Mesaj tarihi | - |

## Google Sheets/Excel'de Nasıl Yapılır:

1. **Google Sheets'i aç:** https://sheets.google.com
2. **Yukarıdaki tabloyu kopyala-yapıştır**
3. **Formatla:**
   - Başlık satırını kalın yap (Ctrl+B)
   - Koleksiyon satırlarını (users, analyses, vb.) vurgula (farklı renk)
   - Veri tiplerini vurgula (kalın veya renkli)
   - Zorunlu alanları vurgula (kırmızı veya yeşil)
   - Kenarlıkları ekle
4. **Screenshot al veya PDF olarak kaydet**

## Word/Google Docs'ta Nasıl Yapılır:

1. **Word/Google Docs'u aç**
2. **Ekle → Tablo → 6 sütun x 30+ satır**
3. **Başlıkları yaz:**
   - Koleksiyon
   - Alan Adı
   - Veri Tipi
   - Zorunluluk
   - Açıklama
   - Index
4. **Verileri doldur**
5. **Formatla:**
   - Başlık satırını kalın yap
   - Koleksiyon satırlarını vurgula
   - Veri tiplerini vurgula
   - Zorunlu alanları vurgula
   - Kenarlıkları ekle
6. **Screenshot al**

## Hızlı Markdown Tablo (GitHub için):

```markdown
| Koleksiyon | Alan | Tip | Zorunlu | Açıklama | Index |
|------------|------|-----|---------|----------|-------|
| **users** | email | string | ✅ | Email adresi | Unique |
| | displayName | string | ❌ | Kullanıcı adı | - |
| | createdAt | timestamp | Auto | Oluşturma tarihi | - |
| **analyses** | userId | string | ✅ | Kullanıcı ID | Composite |
| | diseaseType | string | ✅ | Hastalık türü | - |
| | results | array | ✅ | Analiz sonuçları | - |
| | createdAt | timestamp | Auto | Analiz tarihi | Composite |
```

## Gemini'ye Verilecek Kısa Prompt:

```
Akademik rapor için veritabanı şema yapısı tablosu oluştur.

8 koleksiyon:
1. users: email, displayName, photoURL, emailVerified, createdAt, lastLogin
2. analyses: userId, diseaseType, imageUrl, results, topPrediction, gradCamUrl, createdAt
3. favorites: userId, analysisId, createdAt
4. shared_analyses: token, analysisId, expiresAt, createdAt
5. appointments: userId, doctorId, date, time, reason, status, jitsiRoom, createdAt, updatedAt
6. doctors: userId, specialization, experience, institution, diplomaUrl, status, createdAt, updatedAt
7. feedback: userId, rating, comment, createdAt
8. contact_messages: name, email, subject, message, createdAt

Sütunlar: Koleksiyon, Alan Adı, Veri Tipi, Zorunluluk, Açıklama, Index

Format: Profesyonel tablo, her koleksiyon için farklı renk, veri tipleri vurgulu, akademik rapor için uygun, PNG formatında.
```

## Koleksiyon Özeti:

- **users:** 6 alan (email, displayName, photoURL, emailVerified, createdAt, lastLogin)
- **analyses:** 7 alan (userId, diseaseType, imageUrl, results, topPrediction, gradCamUrl, createdAt)
- **favorites:** 3 alan (userId, analysisId, createdAt)
- **shared_analyses:** 4 alan (token, analysisId, expiresAt, createdAt)
- **appointments:** 9 alan (userId, doctorId, date, time, reason, status, jitsiRoom, createdAt, updatedAt)
- **doctors:** 8 alan (userId, specialization, experience, institution, diplomaUrl, status, createdAt, updatedAt)
- **feedback:** 4 alan (userId, rating, comment, createdAt)
- **contact_messages:** 5 alan (name, email, subject, message, createdAt)

**Toplam:** 8 koleksiyon, 46 alan

## Veri Tipi Özeti:

- **string:** Metin verisi (email, name, subject, vb.)
- **number:** Sayısal veri (rating, experience)
- **boolean:** Mantıksal değer (emailVerified)
- **timestamp:** Tarih/saat (createdAt, lastLogin, expiresAt, updatedAt)
- **array:** Dizi (results)
- **object:** Nesne (iç içe yapılar)

## Index Özeti:

- **Unique Index:**
  - users.email
  - shared_analyses.token
  - appointments.jitsiRoom
  - doctors.userId

- **Composite Index:**
  - analyses: userId + createdAt
  - favorites: userId + createdAt
  - appointments: userId + status

- **Single Index:**
  - doctors.status



