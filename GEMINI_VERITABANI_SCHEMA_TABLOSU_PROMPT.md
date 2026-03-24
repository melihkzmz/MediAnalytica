# Gemini AI için Veritabanı Şema Yapısı Tablosu Promptu

Aşağıdaki promptu Gemini AI'ye göndererek mevcut projenin renkli veritabanı şema yapısı tablosunu oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak renkli bir veritabanı şema yapısı tablosu oluştur. Aşağıdaki detaylı açıklamayı takip et:**

### Proje: MediAnalytica - Tıbbi Görüntü Analizi ve Tele-Tıp Platformu

**Veritabanı:** Firebase Firestore (NoSQL)

**Tablo Gereksinimleri:**
- Her koleksiyon için ayrı bir bölüm/başlık
- Renkli tablo formatı (her koleksiyon farklı renk tonunda)
- Sütunlar: Alan Adı | Veri Tipi | Zorunlu/Opsiyonel | Açıklama
- Türkçe etiketler ve açıklamalar
- Profesyonel ve akademik görünüm
- Görselde HİÇBİR watermark, logo veya amblem OLMAMALI

---

## KOLEKSİYONLAR VE ALANLAR:

### 1. `users` Koleksiyonu (Kullanıcı Bilgileri)
**Renk:** Mavi tonları (#E3F2FD, #BBDEFB)

| Alan Adı | Veri Tipi | Zorunlu/Opsiyonel | Açıklama |
|----------|-----------|-------------------|----------|
| email | string | Zorunlu | Kullanıcı e-posta adresi |
| displayName | string | Opsiyonel | Kullanıcı adı ve soyadı |
| userType | string | Zorunlu | Kullanıcı tipi ("patient" veya "doctor") |
| createdAt | timestamp | Zorunlu | Hesap oluşturulma tarihi (SERVER_TIMESTAMP) |
| lastLogin | timestamp | Opsiyonel | Son giriş tarihi (SERVER_TIMESTAMP) |
| settings | object | Opsiyonel | Kullanıcı ayarları (notifications: boolean, language: string) |

**Notlar:**
- Document ID = Firebase Authentication UID
- Her kullanıcı için bir doküman
- Kullanıcılar kendi dokümanlarını okuyup güncelleyebilir

---

### 2. `doctors` Koleksiyonu (Doktor Bilgileri)
**Renk:** Yeşil tonları (#E8F5E9, #C8E6C9)

| Alan Adı | Veri Tipi | Zorunlu/Opsiyonel | Açıklama |
|----------|-----------|-------------------|----------|
| userId | string | Zorunlu | Kullanıcı ID'si (users koleksiyonuna referans, unique) |
| firstName | string | Zorunlu | Doktor adı |
| lastName | string | Zorunlu | Doktor soyadı |
| specialty | string | Zorunlu | Uzmanlık alanı (örn: "Dermatoloji", "Ortopedi", "Göğüs Hastalıkları") |
| phone | string | Zorunlu | Telefon numarası |
| tcNo | string | Opsiyonel | Türkiye Cumhuriyeti kimlik numarası |
| experienceYears | number | Zorunlu | Deneyim yılı (integer) |
| institution | string | Opsiyonel | Kurum/hastane adı |
| bio | string | Opsiyonel | Doktor biyografisi |
| certificates | string | Opsiyonel | Sertifika ve belgeler (metin) |
| diplomaUrl | string | Opsiyonel | Diploma fotoğrafı URL'si (Firebase Storage'dan) |
| status | string | Zorunlu | Onay durumu ("pending", "approved", "rejected", default: "pending") |
| createdAt | timestamp | Zorunlu | Kayıt tarihi (SERVER_TIMESTAMP) |
| updatedAt | timestamp | Opsiyonel | Güncelleme tarihi (SERVER_TIMESTAMP) |

**Notlar:**
- Document ID = Firebase Authentication UID (userId ile aynı)
- Doktorlar kendi dokümanlarını okuyup güncelleyebilir
- Status alanı onay sürecini yönetir

---

### 3. `analyses` Koleksiyonu (Analiz Geçmişi)
**Renk:** Turuncu tonları (#FFF3E0, #FFE0B2)

| Alan Adı | Veri Tipi | Zorunlu/Opsiyonel | Açıklama |
|----------|-----------|-------------------|----------|
| userId | string | Zorunlu | Kullanıcı ID'si (users koleksiyonuna referans) |
| userEmail | string | Zorunlu | Kullanıcı e-posta adresi |
| diseaseType | string | Zorunlu | Hastalık türü ("skin", "bone", "lung") |
| results | array | Zorunlu | Analiz sonuçları listesi (her eleman: {class: string, confidence: number}) |
| topPrediction | string | Zorunlu | En yüksek olasılığa sahip tahmin (hastalık sınıfı) |
| topConfidence | number | Zorunlu | En yüksek güven skoru (0-1 arası) |
| imageUrl | string | Zorunlu | Analiz edilen görüntü URL'si (Firebase Storage'dan) |
| gradcamUrl | string | Opsiyonel | Grad-CAM görselleştirme URL'si (Firebase Storage'dan) |
| createdAt | timestamp | Zorunlu | Analiz tarihi (SERVER_TIMESTAMP) |
| updatedAt | timestamp | Opsiyonel | Güncelleme tarihi (SERVER_TIMESTAMP) |

**Notlar:**
- Document ID = Auto-generated (otomatik oluşturulan)
- Kullanıcılar sadece kendi analizlerini görebilir
- results array'i en iyi 3 tahmini içerir

---

### 4. `favorites` Koleksiyonu (Favori Analizler)
**Renk:** Pembe tonları (#FCE4EC, #F8BBD0)

| Alan Adı | Veri Tipi | Zorunlu/Opsiyonel | Açıklama |
|----------|-----------|-------------------|----------|
| userId | string | Zorunlu | Kullanıcı ID'si (users koleksiyonuna referans) |
| analysisId | string | Zorunlu | Analiz ID'si (analyses koleksiyonuna referans) |
| createdAt | timestamp | Opsiyonel | Favoriye ekleme tarihi (SERVER_TIMESTAMP) |

**Notlar:**
- Document ID = Auto-generated (otomatik oluşturulan)
- Kullanıcılar kendi favorilerini yönetebilir (okuma, ekleme, silme)
- analysisId ile analyses koleksiyonuna referans verir

---

### 5. `appointments` Koleksiyonu (Randevular)
**Renk:** Mor tonları (#F3E5F5, #E1BEE7)

| Alan Adı | Veri Tipi | Zorunlu/Opsiyonel | Açıklama |
|----------|-----------|-------------------|----------|
| userId | string | Zorunlu | Hasta kullanıcı ID'si (users koleksiyonuna referans) |
| userEmail | string | Zorunlu | Hasta e-posta adresi |
| doctorId | string | Opsiyonel | Doktor ID'si (doctors koleksiyonuna referans, onaylandığında eklenir) |
| date | string | Zorunlu | Randevu tarihi (format: "YYYY-MM-DD") |
| time | string | Zorunlu | Randevu saati (format: "HH:MM") |
| reason | string | Zorunlu | Randevu nedeni/şikayet |
| doctorType | string | Zorunlu | Doktor türü/uzmanlık alanı (örn: "Dermatolog", "Ortopedist") |
| status | string | Zorunlu | Randevu durumu ("pending", "approved", "rejected", "completed", default: "pending") |
| jitsiRoom | string | Zorunlu | Jitsi Meet görüntülü görüşme oda ID'si (unique) |
| createdAt | timestamp | Zorunlu | Randevu oluşturulma tarihi (SERVER_TIMESTAMP) |
| updatedAt | timestamp | Opsiyonel | Randevu güncelleme tarihi (SERVER_TIMESTAMP) |
| approvedAt | timestamp | Opsiyonel | Randevu onaylanma tarihi (SERVER_TIMESTAMP, doktor onayladığında) |

**Notlar:**
- Document ID = Auto-generated (otomatik oluşturulan)
- Hastalar kendi randevularını görebilir, doktorlar tüm randevuları görebilir
- Status değerine göre randevu akışı yönetilir
- jitsiRoom, görüntülü görüşme için kullanılır

---

## TABLO FORMATI:

**Genel Yapı:**
- Her koleksiyon için ayrı bir tablo
- Tablolar alt alta yerleştirilmiş
- Her tablo için başlık (koleksiyon adı ve açıklaması)
- Tablo başlığı koleksiyon renginde vurgulanmalı

**Sütun Genişlikleri:**
- Alan Adı: %25
- Veri Tipi: %20
- Zorunlu/Opsiyonel: %15
- Açıklama: %40

**Renk Şeması:**
- `users`: Mavi tonları (#E3F2FD arka plan, #1976D2 başlık)
- `doctors`: Yeşil tonları (#E8F5E9 arka plan, #388E3C başlık)
- `analyses`: Turuncu tonları (#FFF3E0 arka plan, #F57C00 başlık)
- `favorites`: Pembe tonları (#FCE4EC arka plan, #C2185B başlık)
- `appointments`: Mor tonları (#F3E5F5 arka plan, #7B1FA2 başlık)

**Stil:**
- Başlık satırı: Koyu renk, beyaz metin, kalın font
- Zorunlu alanlar: Koyu renkli metin veya arka plan vurgusu
- Opsiyonel alanlar: Açık renkli metin
- Profesyonel tablo kenarlıkları
- Okunabilir font boyutu (12-14pt)
- Yeterli satır aralığı

**Ek Bilgiler:**
- Tablo altında veya yanında "Notlar" bölümü eklenebilir
- Önemli referanslar ve ilişkiler vurgulanmalı
- Timestamp alanları için SERVER_TIMESTAMP açıklaması

---

**Yukarıdaki açıklamaya göre renkli bir veritabanı şema yapısı tablosu oluştur. Tablolar, her koleksiyon için ayrı ve renkli olmalı, Türkçe etiketler ve açıklamalarla hazırlanmalıdır. Görsel profesyonel ve akademik görünümde olmalı, hiçbir watermark veya logo içermemelidir.**
