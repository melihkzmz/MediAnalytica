# Gemini'ye Proje Kısıtları Özet Tablosu Oluşturma Prompt'u

## PROMPT (Gemini'ye Kopyala-Yapıştır):

```
Bir akademik bitirme projesi raporu için proje kısıtları özet tablosu oluştur. 
Tablo, tıbbi görüntü analizi ve tele-tıp platformu projesinin kısıtlarını göstermelidir.

## KISIT KATEGORİLERİ:

### C1. Bütçe Kısıtı
- Firebase ücretsiz planı kullanılmıştır (Spark Plan)
- Firebase Storage: 5GB ücretsiz depolama
- Firestore: 1GB ücretsiz depolama, 50K okuma/yazma günlük limit
- Firebase Authentication: Sınırsız kullanıcı (ücretsiz plan)
- Jitsi Meet: Ücretsiz (self-hosted veya cloud)
- Sunucu: Ücretsiz (local development) veya düşük maliyetli hosting

### C2. Zaman Kısıtı
- Proje geliştirme süresi: 16 hafta (1 akademik dönem)
- Model eğitimi: 2-3 hafta (GPU gerektiren işlemler)
- Backend geliştirme: 4 hafta
- Frontend geliştirme: 4 hafta
- Test ve iyileştirme: 2 hafta
- Dokümantasyon: 1 hafta

### C3. Donanım Kısıtı
- Model eğitimi için GPU erişimi (Google Colab veya yerel GPU)
- Backend sunucusu: Minimum 4GB RAM, 2 CPU core
- Frontend: Modern web tarayıcıları (Chrome, Firefox, Safari, Edge)
- İnternet bağlantısı: Model indirme ve Firebase erişimi için gerekli

### C4. Veri Kısıtı
- Açık kaynak veri setleri kullanılmıştır (ISIC, Mendeley, Kaggle)
- Veri setleri eğitim amaçlıdır, gerçek hasta verileri kullanılmamıştır
- Veri seti boyutları: Sınırlı (ücretsiz erişilebilir veriler)
- Veri kalitesi: Heterojen (farklı kaynaklardan toplanmış)

### C5. Teknoloji Kısıtı
- Python 3.11+ gereklidir
- Node.js gerekli değildir (frontend static HTML)
- Modern web tarayıcıları gereklidir (ES6+ desteği)
- TensorFlow/Keras uyumluluğu: Python 3.8-3.11 arası
- Firebase ücretsiz plan limitleri

## TABLO FORMATI:

Tablo şu sütunları içermeli:
- Kısıt Kategorisi (Bütçe, Zaman, Donanım, Veri, Teknoloji)
- Kısıt Açıklaması (Detaylı açıklama)
- Etkisi (Yüksek/Orta/Düşük)
- Çözüm/Alternatif (Nasıl yönetildiği)

## TABLO GEREKSİNİMLERİ:

- Profesyonel ve akademik görünüm
- Renkli ama okunabilir
- Başlık: "Proje Kısıtları Özet Tablosu"
- Her kısıt kategorisi için detaylı açıklama
- Etki seviyeleri renk kodlu (Yüksek: Kırmızı, Orta: Sarı, Düşük: Yeşil)
- PDF/Word belgesine eklenebilir format (PNG, JPG veya tablo formatı)

## ÖRNEK TABLO YAPISI:

```
┌──────────────────┬──────────────────────────────────────┬──────────┬────────────────────────────┐
│ Kısıt Kategorisi │ Kısıt Açıklaması                     │ Etkisi   │ Çözüm/Alternatif           │
├──────────────────┼──────────────────────────────────────┼──────────┼────────────────────────────┤
│ Bütçe            │ Firebase ücretsiz plan limitleri     │ Orta     │ Ücretsiz plan kullanımı,   │
│                  │ (5GB Storage, 50K Firestore işlem)    │          │ Optimizasyon                │
├──────────────────┼──────────────────────────────────────┼──────────┼────────────────────────────┤
│ Zaman            │ 16 hafta (1 akademik dönem)           │ Yüksek   │ Agile metodoloji,          │
│                  │                                      │          │ Sprint planlaması           │
├──────────────────┼──────────────────────────────────────┼──────────┼────────────────────────────┤
│ Donanım          │ GPU erişimi (model eğitimi)          │ Yüksek   │ Google Colab kullanımı    │
│                  │                                      │          │                            │
├──────────────────┼──────────────────────────────────────┼──────────┼────────────────────────────┤
│ Veri             │ Açık kaynak veri setleri,           │ Orta     │ ISIC, Mendeley, Kaggle     │
│                  │ gerçek hasta verisi yok              │          │ veri setleri kullanımı    │
├──────────────────┼──────────────────────────────────────┼──────────┼────────────────────────────┤
│ Teknoloji        │ Python 3.11+, TensorFlow uyumluluğu │ Düşük    │ Uyumlu versiyonlar         │
│                  │                                      │          │                            │
└──────────────────┴──────────────────────────────────────┴──────────┴────────────────────────────┘
```

## DETAYLI BİLGİLER:

### C1. Bütçe Kısıtı:
**Açıklama:**
- Firebase Spark Plan (ücretsiz) kullanılmıştır
- Firebase Storage: 5GB ücretsiz depolama limiti
- Firestore: 1GB ücretsiz depolama, günlük 50K okuma/yazma işlemi limiti
- Firebase Authentication: Sınırsız kullanıcı (ücretsiz plan)
- Jitsi Meet: Ücretsiz kullanım (self-hosted veya cloud)
- Sunucu maliyeti: Local development için sıfır, production için düşük maliyetli hosting

**Etkisi:** Orta
- Depolama ve işlem limitleri proje ölçeğinde yeterli
- Büyük ölçekli kullanımda yükseltme gerekebilir

**Çözüm:**
- Görüntü sıkıştırma ile depolama optimizasyonu
- API response caching ile Firestore okuma azaltma
- Rate limiting ile gereksiz işlem önleme

### C2. Zaman Kısıtı:
**Açıklama:**
- Toplam süre: 16 hafta (1 akademik dönem)
- Model eğitimi: 2-3 hafta (GPU gerektiren işlemler)
- Backend geliştirme: 4 hafta
- Frontend geliştirme: 4 hafta
- Test ve iyileştirme: 2 hafta
- Dokümantasyon: 1 hafta
- Buffer: 2 hafta (beklenmeyen gecikmeler için)

**Etkisi:** Yüksek
- Sınırlı zaman nedeniyle bazı özellikler ertelenebilir
- Hızlı karar verme gereklidir

**Çözüm:**
- Agile metodoloji ve 2 haftalık sprint'ler
- Öncelikli özelliklere odaklanma
- Paralel geliştirme (backend ve frontend)

### C3. Donanım Kısıtı:
**Açıklama:**
- Model eğitimi: GPU erişimi gerekli (Google Colab veya yerel GPU)
- Backend sunucusu: Minimum 4GB RAM, 2 CPU core
- Frontend: Modern web tarayıcıları (Chrome, Firefox, Safari, Edge)
- İnternet bağlantısı: Model indirme ve Firebase erişimi için gerekli

**Etkisi:** Yüksek
- GPU olmadan model eğitimi çok yavaş veya imkansız
- Yetersiz donanım performans sorunlarına neden olabilir

**Çözüm:**
- Google Colab ücretsiz GPU kullanımı
- Model optimizasyonu (quantization, pruning)
- Cloud-based development ortamları

### C4. Veri Kısıtı:
**Açıklama:**
- Açık kaynak veri setleri kullanılmıştır:
  - ISIC (International Skin Imaging Collaboration) - Deri hastalıkları
  - Mendeley - Göz hastalıkları
  - Kaggle - Kemik ve akciğer hastalıkları
- Veri setleri eğitim amaçlıdır, gerçek hasta verileri kullanılmamıştır
- Veri seti boyutları: Sınırlı (ücretsiz erişilebilir veriler)
- Veri kalitesi: Heterojen (farklı kaynaklardan toplanmış)

**Etkisi:** Orta
- Gerçek hasta verileri olmadığı için model performansı sınırlı olabilir
- Veri seti boyutları model eğitimini etkileyebilir

**Çözüm:**
- Data augmentation teknikleri
- Transfer learning kullanımı
- Açık kaynak veri setlerinin birleştirilmesi

### C5. Teknoloji Kısıtı:
**Açıklama:**
- Python 3.11+ gereklidir
- Node.js gerekli değildir (frontend static HTML)
- Modern web tarayıcıları gereklidir (ES6+ desteği)
- TensorFlow/Keras uyumluluğu: Python 3.8-3.11 arası
- Firebase ücretsiz plan limitleri

**Etkisi:** Düşük
- Yaygın teknolojiler kullanıldığı için uyumluluk sorunu minimal
- Modern tarayıcılar neredeyse tüm kullanıcılarda mevcut

**Çözüm:**
- Uyumlu Python versiyonu kullanımı
- Modern tarayıcı desteği
- Polyfill'ler ile eski tarayıcı desteği (gerekirse)

## TABLO ÇIKTISI:

Tablo, PNG veya JPG formatında, yüksek çözünürlükte (300 DPI) oluşturulmalı.
Akademik rapor için uygun, profesyonel görünümde olmalı.
Renk kodlaması: Yüksek (Kırmızı), Orta (Sarı), Düşük (Yeşil).
```

## ALTERNATİF YÖNTEMLER:

### 1. Excel/Google Sheets ile Oluştur
- Excel veya Google Sheets'te tabloyu oluştur
- Renklendir (Etki seviyelerine göre)
- Screenshot al veya PDF olarak kaydet

### 2. Word/Google Docs ile Oluştur
- Word veya Google Docs'te tablo oluştur
- "Ekle" → "Tablo" → 4 sütun x 6 satır
- Verileri doldur
- Formatla ve screenshot al

### 3. Online Tablo Araçları
- https://www.tablesgenerator.com/markdown_tables
- Markdown tablo oluştur, sonra görselleştir

## ÖNERİLEN ADIMLAR:

1. **Gemini'ye prompt'u gönder** ve tabloyu oluştur
2. **Tabloyu PNG/JPG olarak indir**
3. **RAPOR.txt dosyasına ekle** (Word/Google Docs kullanıyorsan direkt ekle)
4. **Veya Excel/Google Sheets ile manuel oluştur** (daha fazla kontrol için)

## TABLO BOYUTU:

- Genişlik: En az 1000px (rapor için yeterli)
- Yükseklik: İçeriğe göre ayarlanabilir
- Font: Okunabilir (12-14pt)
- Renkler: Profesyonel (kırmızı: Yüksek, sarı: Orta, yeşil: Düşük)



