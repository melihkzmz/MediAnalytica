# Gemini AI için Sistem Mimarisi Diyagramı Promptu

Aşağıdaki promptu Gemini AI'ye göndererek mevcut projenin sistem mimarisi diyagramını oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak bir sistem mimarisi diyagramı çiz. Aşağıdaki detaylı açıklamayı takip et:**

### Proje: MediAnalytica - Tıbbi Görüntü Analizi ve Tele-Tıp Platformu

**GENEL MİMARİ:**

Platform üç ana katmandan oluşmaktadır:
1. **Sunum Katmanı (Presentation Layer)** - Next.js Frontend
2. **Uygulama Katmanı (Application Layer)** - Hugging Face Space (Backend APIs) + Firebase Services
3. **Veri Katmanı (Data Layer)** - Firebase Firestore, Storage + Hugging Face Space (AI/ML Modelleri)

### KATMAN 1: SUNUM KATMANI (Frontend - Next.js)

**Teknoloji:** Next.js 14+, React, TypeScript, Tailwind CSS

**Ana Bileşenler:**
- **Landing Page** (`/`) - Ana sayfa, özellikler, tanıtım
- **Login/Register Sayfası** (`/login`) - Kullanıcı giriş/kayıt (Firebase Auth)
- **Dashboard Sayfası** (`/dashboard`) - Ana kontrol paneli
  - Hasta Paneli: Analiz yapma, geçmiş, favoriler, istatistikler, randevu talep
  - Doktor Paneli: Bekleyen randevular, randevularım, randevu geçmişi, hastalarım
- **Analiz Sayfası** (`/analyze`) - Hastalık analizi yapma
- **Randevu Sayfası** (`/appointment`) - Randevu talep formu
- **Profil Sayfası** (`/profile`) - Kullanıcı profili yönetimi

**Firebase Client SDK Kullanımı:**
- Firebase Authentication (doğrudan frontend'den)
- Firestore (doğrudan frontend'den - randevu işlemleri, analiz kayıtları)
- Firebase Storage (profil fotoğrafları, görüntü yükleme)

**Harici Servisler:**
- Jitsi Meet (görüntülü görüşme - iframe entegrasyonu)
- Hugging Face Space API (Backend API'ler ve AI/ML modelleri burada barındırılıyor)

### KATMAN 2: UYGULAMA KATMANI (Backend + Firebase Services)

**A. Backend API Servisleri:**

**Hugging Face Space Üzerinde Barındırılan API'ler:**
- Backend API'ler Hugging Face Space üzerinde barındırılıyor ve orada çalışıyor
- Hastalık tespiti API'leri Hugging Face Space'de deploy edilmiş durumda:
  - Deri hastalıkları API'si
  - Kemik hastalıkları API'si
  - Akciğer hastalıkları API'si
- Next.js frontend, Hugging Face Space API'sine doğrudan veya Next.js API proxy üzerinden bağlanıyor
- AI/ML modelleri ve backend kodları Hugging Face Space'de barındırılıyor

**B. Firebase Services (Cloud):**

1. **Firebase Authentication:**
   - Email/Password authentication
   - Token yönetimi
   - Kullanıcı session yönetimi

2. **Firebase Firestore (NoSQL Database):**
   - `users` koleksiyonu - Kullanıcı bilgileri
   - `doctors` koleksiyonu - Doktor bilgileri ve onay durumu
   - `appointments` koleksiyonu - Randevular (pending, approved, rejected, completed)
   - `analyses` koleksiyonu - Analiz geçmişi
   - `favorites` koleksiyonu - Favori analizler
   - `shared_analyses` koleksiyonu - Paylaşılan analizler

3. **Firebase Storage:**
   - Profil fotoğrafları (`users/{userId}/photo`)
   - Doktor belgeleri (`doctors/{doctorId}/diploma`, `certificates`)
   - Analiz görüntüleri (`analyses/{analysisId}/image`)

### KATMAN 3: VERİ KATMANI (Data Layer)

**A. AI/ML Modelleri (Hugging Face Space'de Barındırılıyor):**
- TensorFlow/Keras modelleri
- EfficientNet, DenseNet mimarileri
- 4 farklı hastalık kategorisi için modeller (Deri, Kemik, Akciğer, Göz)
- Modeller Hugging Face Space'de barındırılıyor ve orada çalışıyor
- Backend API kodları ile birlikte Hugging Face Space'de deploy edilmiş durumda

**B. Harici Servisler:**
- **Jitsi Meet** - Açık kaynak video konferans servisi
  - Randevu bazlı oda oluşturma
  - Frontend'den doğrudan iframe ile entegrasyon

- **Hugging Face Space** (Ana Backend API ve AI/ML Platformu):
  - Backend API'ler Hugging Face Space üzerinde barındırılıyor ve çalışıyor
  - Hastalık tespiti API'leri burada deploy edilmiş durumda
  - AI/ML modelleri Hugging Face Space'de saklanıyor ve çalışıyor
  - Backend kodları ve modeller Hugging Face Space'de depolanıyor
  - Next.js API proxy üzerinden veya doğrudan erişim

### VERİ AKIŞI SENARYOLARI:

1. **Kullanıcı Girişi:**
   Frontend (Next.js) → Firebase Authentication → Token döndür → Frontend localStorage'a kaydet

2. **Randevu Oluşturma (Hasta):**
   Frontend → Firestore (doğrudan) → `appointments` koleksiyonuna `status: 'pending'` ile kayıt

3. **Randevu Onaylama (Doktor):**
   Frontend (Doktor) → Firestore (doğrudan) → `appointments` dokümanını güncelle (`status: 'approved'`, `doctorId` ekle)

4. **Randevu Tamamlama (Doktor):**
   Frontend (Doktor) → Firestore (doğrudan) → `appointments` dokümanını güncelle (`status: 'completed'`)

5. **Hastalık Analizi:**
   Frontend → Hugging Face Space API (Backend API'ler burada çalışıyor) → AI Model (Hugging Face Space'de) → Sonuç döndür → Frontend → Firestore'a kaydet

6. **Görüntülü Görüşme:**
   Frontend → Firestore'dan `jitsiRoom` bilgisini al → Jitsi Meet iframe'i yükle → Görüntülü görüşme başlat

### ÖNEMLİ NOTLAR:

- **Hibrit Yapı:** Bazı işlemler (randevu yönetimi) doğrudan Firestore üzerinden yapılıyor, bazı işlemler (analiz geçmişi, profil) backend API üzerinden yapılıyor
- **Backend API'ler Hugging Face Space'de:** Hastalık tespiti API'leri Hugging Face Space platformunda barındırılıyor ve çalışıyor. AI/ML modelleri de burada deploy edilmiş durumda
- **Firebase Security Rules:** Firestore ve Storage için güvenlik kuralları tanımlı (`firestore.rules`)
- **Authentication:** Tüm işlemler Firebase Authentication token'ı ile korunuyor

### DİYAGRAM GEREKSİNİMLERİ:

Diyagram şunları göstermelidir:
1. Üç ana katman (Sunum, Uygulama, Veri)
2. Frontend (Next.js) bileşenleri ve sayfaları
3. Hugging Face Space (Backend API'ler burada barındırılıyor ve çalışıyor)
4. Firebase servisleri (Authentication, Firestore, Storage)
5. Harici servisler (Jitsi Meet)
6. AI/ML modelleri (Hugging Face Space'de barındırılıyor)
7. Ana veri akışları (oklarla göster)
8. Doğrudan Firestore erişimi (frontend'den)
9. Hugging Face Space API üzerinden erişim (frontend'den Hugging Face Space'e)
10. Kullanıcı rolleri (Hasta, Doktor)

**Diyagram Formatı:** Mimari diyagram, kutu-ok diyagramı veya katmanlı mimari diyagram formatında olabilir. Her katman farklı renklerle veya bölümlerle ayrılmalıdır.

---

**Yukarıdaki açıklamaya göre detaylı bir sistem mimarisi diyagramı oluştur. Diyagram, Türkçe etiketler ve açıklamalarla hazırlanmalıdır.**