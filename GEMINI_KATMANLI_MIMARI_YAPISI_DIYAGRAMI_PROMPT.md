# Gemini AI için Katmanlı Mimari Yapısı Diyagramı Promptu

Aşağıdaki promptu Gemini AI'ye göndererek mevcut projenin katmanlı mimari yapısı diyagramını oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak bir katmanlı mimari yapısı diyagramı çiz. Aşağıdaki detaylı açıklamayı takip et:**

### Proje: MediAnalytica - Tıbbi Görüntü Analizi ve Tele-Tıp Platformu

**MİMARİ PRENSİPLER:**
- Separation of Concerns (Endişelerin Ayrılması)
- Statelessness (Durumsuzluk)
- Loose Coupling (Gevşek Bağlantı)

**İLETİŞİM PROTOKOLLERİ:**
- HTTP/HTTPS protokolü
- JSON formatı

### KATMAN 1: SUNUM KATMANI (Presentation Layer)

**Teknoloji Stack:**
- Next.js 14 framework
- React 18.3+
- TypeScript 5.3+
- Tailwind CSS 3.4+

**Next.js App Router Yapısı:**
- `/` - Landing Page (Ana sayfa)
- `/login` - Giriş/Kayıt sayfası
- `/dashboard` - Ana kontrol paneli (Hasta/Doktor panelleri)
- `/analyze` - Hastalık analizi yapma sayfası
- `/appointment` - Randevu talep sayfası
- `/profile` - Kullanıcı profili yönetimi
- `/help` - Yardım/FAQ sayfası
- `/about` - Hakkımızda sayfası
- `/contact` - İletişim sayfası
- `/video` - Görüntülü görüşme sayfası
- `/api/predict/[...disease]` - Next.js API Proxy Route (Hugging Face Space için)

**React Bileşenleri (Components):**
- Navbar.tsx - Navigasyon çubuğu
- Hero.tsx - Ana sayfa hero bölümü
- Footer.tsx - Sayfa alt bilgisi
- Diğer reusable bileşenler

**Frontend Özellikleri:**
- Responsive web arayüzü (mobile-first yaklaşım)
- Client-side routing (Next.js App Router)
- State management (React hooks, Context API)
- Form handling ve validation
- Image upload ve compression
- Real-time Firebase bağlantıları
- Toast notifications
- Loading states ve error handling

**Firebase Client SDK Kullanımı:**
- Firebase Authentication (doğrudan frontend'den)
- Firebase Firestore (doğrudan frontend'den - read/write işlemleri)
- Firebase Storage (dosya yükleme işlemleri)

**Harici Servisler (Frontend'den Erişim):**
- Hugging Face Space API (hastalık tespiti için)
- Jitsi Meet / Daily.co / 8x8 (görüntülü görüşme)

### KATMAN 2: UYGULAMA KATMANI (Application Layer)

**Backend API Teknolojileri:**
- Flask web framework (Python 3.11+)
- Flask-CORS (Cross-Origin Resource Sharing)
- Flask-Limiter (Rate limiting)
- Flask-Caching (Response caching)

**RESTful API Endpoint'leri:**
- Hastalık tespiti API'leri:
  - Deri hastalıkları API (skin)
  - Kemik hastalıkları API (bone)
  - Akciğer hastalıkları API (lung)
- Kullanıcı yönetimi API'leri
- Analiz geçmişi API'leri
- İstatistik API'leri

**API Özellikleri:**
- JSON formatında request/response
- Stateless yapı (her istek bağımsız)
- Authentication token kontrolü
- Error handling ve validation
- Rate limiting ve güvenlik önlemleri

**Deployment Seçenekleri:**
- Yerel ortamda çalıştırma (development)
- Hugging Face Spaces platformunda bulut tabanlı deployment (production)

**Hugging Face Spaces Entegrasyonu:**
- Backend API'ler Hugging Face Spaces'de deploy edilebilir
- Unified Flask uygulaması (tüm hastalık tespiti API'leri birleşik)
- Model yönetimi (Hugging Face Hub'dan model indirme)
- Next.js API proxy route üzerinden güvenli erişim

**İş Mantığı:**
- Kullanıcı kimlik doğrulama işlemleri
- Analiz geçmişi yönetimi
- Favoriler yönetimi
- İstatistik hesaplamaları
- Derin öğrenme modeli inference işlemleri
- Görüntü preprocessing ve işleme

### KATMAN 3: VERİ KATMANI (Data Layer)

**Firebase Ekosistemi:**

1. **Firebase Firestore (NoSQL Veritabanı):**
   - `users` koleksiyonu - Kullanıcı bilgileri
   - `doctors` koleksiyonu - Doktor bilgileri ve onay durumu
   - `appointments` koleksiyonu - Randevular (pending, approved, rejected, completed)
   - `analyses` koleksiyonu - Analiz geçmişi ve sonuçları
   - `favorites` koleksiyonu - Favori analizler

2. **Firebase Storage:**
   - Profil fotoğrafları (`users/{userId}/photo`)
   - Doktor belgeleri (`doctors/{doctorId}/diploma`, `certificates`)
   - Analiz görüntüleri (`analyses/{analysisId}/image`)

3. **Firebase Authentication:**
   - Email/Password authentication
   - Token yönetimi (JWT)
   - Kullanıcı session yönetimi
   - Role-based access control (Hasta/Doktor ayrımı)

**Güvenlik:**
- Firestore Security Rules (`firestore.rules`)
- Storage Security Rules
- Authentication token doğrulama
- Role-based permissions

**AI/ML Modelleri:**
- TensorFlow/Keras modelleri
- EfficientNet mimarisi (deri hastalıkları için)
- DenseNet mimarisi (kemik ve akciğer hastalıkları için)
- Modeller Hugging Face Spaces'de barındırılabilir veya yerel olarak deploy edilebilir

**Harici Servisler:**
- Hugging Face Hub (model depolama ve indirme)
- Jitsi Meet / Daily.co / 8x8 (görüntülü görüşme servisleri)

### KATMANLAR ARASI İLETİŞİM:

**Sunum Katmanı ↔ Uygulama Katmanı:**
- HTTP/HTTPS protokolü
- JSON formatında request/response
- RESTful API endpoint'leri
- Authentication token (Bearer token) ile güvenli iletişim
- Next.js API proxy route üzerinden (Hugging Face Spaces için)

**Sunum Katmanı ↔ Veri Katmanı:**
- Firebase Client SDK (doğrudan bağlantı)
- Real-time subscriptions (Firestore)
- Authentication token ile güvenli erişim
- Security Rules ile yetkilendirme kontrolü

**Uygulama Katmanı ↔ Veri Katmanı:**
- Firebase Admin SDK (backend'den)
- Firestore database operations
- Storage operations
- Authentication token doğrulama

### DİYAGRAM GEREKSİNİMLERİ:

Diyagram şunları göstermelidir:

1. **Üç Ana Katman:**
   - Sunum Katmanı (en üstte)
   - Uygulama Katmanı (ortada)
   - Veri Katmanı (en altta)

2. **Sunum Katmanı Detayları:**
   - Next.js framework
   - React ve TypeScript teknolojileri
   - Ana sayfalar (routes)
   - React bileşenleri
   - Firebase Client SDK
   - Next.js API proxy route

3. **Uygulama Katmanı Detayları:**
   - Flask web framework
   - RESTful API endpoint'leri
   - İş mantığı modülleri
   - Hugging Face Spaces deployment seçeneği
   - Authentication ve güvenlik katmanları

4. **Veri Katmanı Detayları:**
   - Firebase Firestore (koleksiyonlar)
   - Firebase Storage (dosya depolama)
   - Firebase Authentication
   - AI/ML modelleri
   - Security Rules

5. **İletişim Yolları:**
   - Katmanlar arası ok işaretleri
   - HTTP/HTTPS ve JSON etiketleri
   - Firebase SDK bağlantıları
   - API endpoint çağrıları

6. **Prensipler:**
   - Separation of Concerns (katmanlar arası ayrım)
   - Statelessness (durumsuz yapı)
   - Loose Coupling (gevşek bağlantı)

**Diyagram Formatı:** 
- Katmanlı mimari diyagram formatı (yatay katmanlar)
- Her katman farklı renklerle veya bölümlerle ayrılmalı
- Oklar ile iletişim yolları gösterilmeli
- Türkçe etiketler ve açıklamalar
- Profesyonel ve akademik görünüm
- Görselde HİÇBİR watermark, logo veya amblem OLMAMALI

---

**Yukarıdaki açıklamaya göre detaylı bir katmanlı mimari yapısı diyagramı oluştur. Diyagram, Türkçe etiketler ve açıklamalarla hazırlanmalı, her katmanın iç bileşenlerini ve katmanlar arası iletişim yollarını net bir şekilde göstermelidir.**
