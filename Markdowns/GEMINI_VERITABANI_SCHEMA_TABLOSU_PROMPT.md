# Gemini'ye Veritabanı Şema Yapısı Tablosu Oluşturma Prompt'u

## PROMPT (Gemini'ye Kopyala-Yapıştır):

```
Bir akademik bitirme projesi raporu için veritabanı şema yapısı tablosu oluştur. 
Tablo, MediAnalytica (tıbbi görüntü analizi ve tele-tıp platformu) projesinin Firebase Firestore NoSQL veritabanı koleksiyonlarını, alanlarını, veri tiplerini ve açıklamalarını göstermelidir.

## VERİTABANI KOLEKSİYONLARI:

### 1. `users` Koleksiyonu
Kullanıcı profillerini saklar.

**Alanlar:**
- `email` (string): Kullanıcı email adresi (zorunlu, unique)
- `displayName` (string): Kullanıcı adı (opsiyonel)
- `photoURL` (string): Profil fotoğrafı URL'si (opsiyonel)
- `emailVerified` (boolean): Email doğrulama durumu (default: false)
- `createdAt` (timestamp): Hesap oluşturulma tarihi (otomatik, SERVER_TIMESTAMP)
- `lastLogin` (timestamp): Son giriş tarihi (opsiyonel)

**Açıklama:** Her kullanıcı için bir doküman. Document ID = Firebase Auth UID.

### 2. `analyses` Koleksiyonu
Kullanıcıların yaptığı analiz geçmişini saklar.

**Alanlar:**
- `userId` (string): Kullanıcı ID'si (zorunlu, users koleksiyonuna referans)
- `diseaseType` (string): Hastalık türü (zorunlu, enum: "skin", "bone", "lung", "eye")
- `imageUrl` (string): Analiz edilen görüntü URL'si (Firebase Storage'dan)
- `results` (array): Analiz sonuçları listesi (zorunlu)
  - Her eleman: `{class: string, probability: number}`
- `topPrediction` (string): En yüksek olasılığa sahip tahmin (zorunlu)
- `gradCamUrl` (string): Grad-CAM görselleştirme URL'si (opsiyonel)
- `createdAt` (timestamp): Analiz tarihi (otomatik, SERVER_TIMESTAMP)

**Açıklama:** Her analiz için bir doküman. Document ID = Auto-generated.

**Index:** `userId` + `createdAt` (composite index, descending order için)

### 3. `favorites` Koleksiyonu
Kullanıcıların favori analizlerini saklar.

**Alanlar:**
- `userId` (string): Kullanıcı ID'si (zorunlu, users koleksiyonuna referans)
- `analysisId` (string): Analiz ID'si (zorunlu, analyses koleksiyonuna referans)
- `createdAt` (timestamp): Favoriye ekleme tarihi (otomatik, SERVER_TIMESTAMP)

**Açıklama:** Her favori için bir doküman. Document ID = Auto-generated.

**Index:** `userId` + `createdAt` (composite index)

### 4. `shared_analyses` Koleksiyonu
Paylaşılan analiz linklerini saklar.

**Alanlar:**
- `token` (string): Paylaşım token'ı (zorunlu, unique, UUID formatında)
- `analysisId` (string): Analiz ID'si (zorunlu, analyses koleksiyonuna referans)
- `expiresAt` (timestamp): Token sona erme tarihi (opsiyonel, default: 30 gün)
- `createdAt` (timestamp): Paylaşım tarihi (otomatik, SERVER_TIMESTAMP)

**Açıklama:** Her paylaşım için bir doküman. Document ID = Auto-generated.

**Index:** `token` (unique index)

### 5. `appointments` Koleksiyonu
Kullanıcı randevularını saklar.

**Alanlar:**
- `userId` (string): Kullanıcı ID'si (zorunlu, users koleksiyonuna referans)
- `doctorId` (string): Doktor ID'si (opsiyonel, doctors koleksiyonuna referans)
- `date` (string): Randevu tarihi (zorunlu, format: "YYYY-MM-DD")
- `time` (string): Randevu saati (zorunlu, format: "HH:MM")
- `reason` (string): Randevu nedeni (zorunlu)
- `status` (string): Randevu durumu (zorunlu, enum: "pending", "approved", "rejected", "completed", default: "approved")
- `jitsiRoom` (string): Jitsi Meet oda ID'si (zorunlu, unique, UUID formatında)
- `createdAt` (timestamp): Randevu oluşturulma tarihi (otomatik, SERVER_TIMESTAMP)
- `updatedAt` (timestamp): Randevu güncelleme tarihi (opsiyonel)

**Açıklama:** Her randevu için bir doküman. Document ID = Auto-generated.

**Index:** `userId` + `status` (composite index, filtreleme için)

### 6. `doctors` Koleksiyonu
Doktor kayıtlarını saklar.

**Alanlar:**
- `userId` (string): Kullanıcı ID'si (zorunlu, users koleksiyonuna referans, unique)
- `specialization` (string): Uzmanlık alanı (zorunlu, örn: "Dermatoloji", "Ortopedi")
- `experience` (number): Deneyim yılı (zorunlu, integer)
- `institution` (string): Kurum adı (opsiyonel)
- `diplomaUrl` (string): Diploma/sertifika URL'si (Firebase Storage'dan, opsiyonel)
- `status` (string): Onay durumu (zorunlu, enum: "pending", "approved", "rejected", default: "pending")
- `createdAt` (timestamp): Kayıt tarihi (otomatik, SERVER_TIMESTAMP)
- `updatedAt` (timestamp): Güncelleme tarihi (opsiyonel)

**Açıklama:** Her doktor için bir doküman. Document ID = Auto-generated.

**Index:** `status` (filtreleme için)

### 7. `feedback` Koleksiyonu
Kullanıcı geri bildirimlerini saklar.

**Alanlar:**
- `userId` (string): Kullanıcı ID'si (zorunlu, users koleksiyonuna referans)
- `rating` (number): Değerlendirme puanı (zorunlu, 1-5 arası integer)
- `comment` (string): Yorum metni (opsiyonel)
- `createdAt` (timestamp): Geri bildirim tarihi (otomatik, SERVER_TIMESTAMP)

**Açıklama:** Her geri bildirim için bir doküman. Document ID = Auto-generated.

### 8. `contact_messages` Koleksiyonu
İletişim form mesajlarını saklar.

**Alanlar:**
- `name` (string): Gönderen adı (zorunlu)
- `email` (string): Gönderen email adresi (zorunlu)
- `subject` (string): Mesaj konusu (zorunlu)
- `message` (string): Mesaj içeriği (zorunlu)
- `createdAt` (timestamp): Mesaj tarihi (otomatik, SERVER_TIMESTAMP)

**Açıklama:** Her mesaj için bir doküman. Document ID = Auto-generated.

## TABLO FORMATI:

Tablo şu sütunları içermeli:
- Koleksiyon Adı (users, analyses, favorites, vb.)
- Alan Adı (email, userId, diseaseType, vb.)
- Veri Tipi (string, number, boolean, timestamp, array, object)
- Zorunluluk (Zorunlu / Opsiyonel)
- Açıklama (Alanın ne için kullanıldığı)
- Varsayılan Değer (Eğer varsa)
- Index (Eğer index varsa)

## TABLO GEREKSİNİMLERİ:

- Profesyonel ve akademik görünüm
- Renkli ama okunabilir
- Başlık: "MediAnalytica - Veritabanı Şema Yapısı Tablosu"
- Her koleksiyon için ayrı bölüm veya renk
- Veri tipleri vurgulu (kalın veya renkli)
- Zorunlu alanlar vurgulu
- PDF/Word belgesine eklenebilir format (PNG, JPG veya tablo formatı)

## ÖRNEK TABLO YAPISI:

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Koleksiyon   │ Alan Adı     │ Veri Tipi    │ Zorunluluk   │ Açıklama     │ Index       │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ users        │ email        │ string       │ Zorunlu      │ Email adresi │ Unique      │
│              │ displayName  │ string       │ Opsiyonel    │ Kullanıcı adı│ -           │
│              │ createdAt    │ timestamp    │ Otomatik     │ Oluşturma    │ -           │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ analyses     │ userId       │ string       │ Zorunlu      │ Kullanıcı ID │ Composite   │
│              │ diseaseType  │ string       │ Zorunlu      │ Hastalık türü│ -           │
│              │ results      │ array        │ Zorunlu      │ Analiz sonuçları│ -        │
│              │ createdAt    │ timestamp    │ Otomatik     │ Analiz tarihi│ Composite   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

## DETAYLI BİLGİLER:

### Veri Tipleri:
- **string:** Metin verisi
- **number:** Sayısal veri (integer veya float)
- **boolean:** Mantıksal değer (true/false)
- **timestamp:** Tarih/saat verisi (Firestore Timestamp)
- **array:** Dizi verisi
- **object:** Nesne verisi (iç içe yapı)

### Zorunluluk:
- **Zorunlu:** Alan mutlaka doldurulmalı
- **Opsiyonel:** Alan boş bırakılabilir
- **Otomatik:** Sistem tarafından otomatik oluşturulur (örn: SERVER_TIMESTAMP)

### Index Türleri:
- **Unique:** Benzersiz değer (tekrar edemez)
- **Composite:** Birden fazla alan üzerinde index
- **Single:** Tek alan üzerinde index

## ÇIKTI FORMATI:

Tablo, PNG veya JPG formatında, yüksek çözünürlükte (300 DPI) oluşturulmalı.
Akademik rapor için uygun, profesyonel görünümde olmalı.
Her koleksiyon için farklı renk veya ayrı bölüm.
```

## ALTERNATİF YÖNTEMLER:

### 1. Excel/Google Sheets ile Oluştur
- Excel veya Google Sheets'te tabloyu oluştur
- Her koleksiyon için ayrı bölüm
- Veri tiplerini vurgula (kalın veya renkli)
- Screenshot al veya PDF olarak kaydet

### 2. Word/Google Docs ile Oluştur
- Word veya Google Docs'te tablo oluştur
- "Ekle" → "Tablo" → 6 sütun x 30+ satır
- Verileri doldur
- Formatla ve screenshot al

## ÖNERİLEN ADIMLAR:

1. **Gemini'ye prompt'u gönder** ve tabloyu oluştur
2. **Tabloyu PNG/JPG olarak indir**
3. **RAPOR.txt dosyasına ekle** (Word/Google Docs kullanıyorsan direkt ekle)
4. **Veya Excel/Google Sheets ile manuel oluştur** (daha fazla kontrol için)

## TABLO BOYUTU:

- Genişlik: En az 1400px (6 sütun için yeterli)
- Yükseklik: İçeriğe göre ayarlanabilir (yaklaşık 30+ satır)
- Font: Okunabilir (12-14pt)
- Renkler: Profesyonel (her koleksiyon için farklı renk)



