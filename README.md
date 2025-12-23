# 🏥 DermaScan - Hastalık Tespit Sistemi

Modern web teknolojileri kullanılarak geliştirilmiş, yapay zeka destekli hastalık tespit platformu.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Geliştirme](#geliştirme)
- [Lisans](#lisans)

## ✨ Özellikler

### 🔐 Güvenlik
- Firebase Email/Password Authentication
- Email doğrulama sistemi
- Şifre sıfırlama
- Rate limiting (DDoS koruması)
- Input validation
- CORS yapılandırması

### 🎨 Kullanıcı Arayüzü
- Modern ve responsive tasarım
- Dark mode desteği
- Mobile-first yaklaşım
- Touch-friendly butonlar
- Swipe gesture desteği

### 📊 Analiz Özellikleri
- Multi-disease support (Deri, Kemik, Akciğer, Göz)
- Grad-CAM görselleştirme
- Analiz geçmişi
- Favoriler sistemi
- Paylaşım özelliği
- PDF rapor oluşturma

### 📈 Kullanıcı Özellikleri
- Profil yönetimi
- İstatistikler
- Bildirim tercihleri
- Profil fotoğrafı yükleme

## 🛠 Teknolojiler

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 4
- Font Awesome Icons
- TensorFlow.js
- Firebase JS SDK

### Backend
- Python 3.11+
- Flask
- Firebase Admin SDK
- Flask-Limiter (Rate limiting)
- Flask-Caching
- Flask-Swagger-UI (API docs)

### AI/ML
- TensorFlow/Keras
- EfficientNet models
- Grad-CAM visualization

## 📦 Kurulum

### Gereksinimler
- Python 3.11 veya üzeri
- Node.js (opsiyonel, frontend için)
- Firebase projesi
- Firebase Admin SDK credentials

### Adımlar

1. **Repository'yi klonla:**
```bash
git clone <repository-url>
cd disease_detection_no_dataset-main\ 2
```

2. **Virtual environment oluştur:**
```bash
cd Skin-Disease-Classifier
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. **Bağımlılıkları yükle:**
```bash
pip install -r ../requirements.txt
```

4. **Firebase credentials ekle:**
- Ana dizine `firebase_credentials.json` dosyasını ekle
- Firebase Console'dan Service Account key indir

5. **Backend'i başlat:**
```bash
python auth_api.py
```

Backend `http://localhost:5001` adresinde çalışacak.

6. **Frontend'i aç:**
- `analyze.html` dosyasını tarayıcıda aç
- Veya bir web sunucusu kullan (VS Code Live Server, Python http.server, vb.)

## 🚀 Kullanım

### İlk Kullanım

1. **Hesap Oluştur:**
   - `templates/login.html` sayfasına git
   - "Kayıt Ol" butonuna tıkla
   - Email ve şifre gir
   - Email doğrulama e-postasını kontrol et

2. **Giriş Yap:**
   - Email ve şifre ile giriş yap
   - Email doğrulanmışsa `analyze.html` sayfasına yönlendirilirsin

3. **Analiz Yap:**
   - Hastalık türü seç (Deri, Kemik, Akciğer, Göz)
   - Görüntü yükle
   - "Analiz Et" butonuna tıkla
   - Sonuçları görüntüle

### Özellikler

- **Analiz Geçmişi:** Tüm analizlerinizi görüntüleyin
- **Favoriler:** Önemli analizleri favorilere ekleyin
- **Paylaşım:** Analiz sonuçlarını paylaşılabilir link ile paylaşın
- **PDF Rapor:** Analiz sonuçlarını PDF olarak indirin
- **Profil Ayarları:** İsim, profil fotoğrafı, bildirim tercihleri

## 📚 API Dokümantasyonu

API dokümantasyonu Swagger UI ile sağlanmaktadır:

**URL:** `http://localhost:5001/api/docs`

### Endpoints

#### Authentication
- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/verify` - Token doğrulama

#### Analyses
- `POST /api/user/analyses` - Yeni analiz kaydet
- `GET /api/user/analyses` - Analiz geçmişini getir (Pagination destekli)
  - Query params: `page`, `per_page`, `diseaseType`, `last_doc_id`

#### Statistics
- `GET /api/user/stats` - Kullanıcı istatistikleri

#### Profile
- `GET /api/user/profile` - Profil bilgilerini getir
- `PUT /api/user/profile` - Profil güncelle
- `POST /api/user/profile/photo` - Profil fotoğrafı yükle

#### Favorites
- `POST /api/user/favorites` - Favorilere ekle
- `GET /api/user/favorites` - Favorileri getir
- `DELETE /api/user/favorites/<id>` - Favoriden kaldır

#### Share
- `POST /api/share/analysis` - Paylaşım linki oluştur
- `GET /api/share/<token>` - Paylaşılan analizi getir

### Authentication

Tüm API endpoint'leri (auth hariç) Bearer token gerektirir:

```http
Authorization: Bearer <firebase_id_token>
```

## 🔧 Geliştirme

### Proje Yapısı

```
.
├── Skin-Disease-Classifier/
│   ├── analyze.html          # Ana uygulama sayfası
│   ├── auth_api.py           # Backend API (Flask)
│   ├── utils/                 # Utility modules
│   │   ├── errors.py         # Custom error classes
│   │   ├── validators.py     # Input validation
│   │   └── helpers.py        # Helper functions
│   ├── tests/                # Test suite
│   │   ├── test_validators.py
│   │   ├── test_helpers.py
│   │   └── test_integration.py
│   ├── templates/
│   │   ├── login.html        # Giriş/Kayıt sayfası
│   │   └── verify-email.html # Email doğrulama sayfası
│   └── models/               # AI modelleri
├── requirements.txt          # Python bağımlılıkları
├── CODEBASE_ANALYSIS.md      # Detailed codebase analysis
├── IMPROVEMENTS_APPLIED.md   # List of improvements
└── README.md                # Bu dosya
```

### Code Style

- Python: PEP 8
- JavaScript: ES6+ standards
- CSS: BEM methodology (kısmen)

### Test

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=utils --cov-report=html

# Run specific test file
pytest tests/test_validators.py -v

# API test (manual)
python test_api.py
```

**Test Coverage:**
- Unit tests for validation and utility functions
- Integration tests for API endpoints (requires Firebase emulator)
- See `tests/README.md` for details

## 🔒 Güvenlik

- Rate limiting aktif (DDoS koruması)
- Input validation (frontend + backend)
- CORS yapılandırması
- Firebase Authentication
- Email doğrulama zorunlu

## 📝 Lisans

Bu proje eğitim ve araştırma amaçlıdır. Ticari kullanım için lisans kontrolü yapın.

## 🤝 Katkıda Bulunma

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Commit yap (`git commit -m 'Add amazing feature'`)
4. Push yap (`git push origin feature/amazing-feature`)
5. Pull Request aç

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

## 🙏 Teşekkürler

- Firebase ekibine
- TensorFlow.js ekibine
- Tüm açık kaynak kütüphane geliştiricilerine

---

**Not:** Bu proje sadece eğitim ve araştırma amaçlıdır. Tıbbi tanı için kullanılmamalıdır. Her zaman profesyonel tıbbi yardım alın.

