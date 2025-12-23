# Gemini'ye Gantt Şeması Oluşturma Prompt'u

## ÖNEMLİ NOT - WATERMARK SORUNU:

Gemini görsellerinde sağ alt köşede watermark ekleniyor. Bu sorunu çözmek için:
1. Prompt'ta watermark olmamasını açıkça belirt
2. Alttan ekstra boşluk bırak (watermark alanı için)
3. VEYA alternatif araçlar kullan (Draw.io, Microsoft Project, Excel)

## PROMPT (Gemini'ye Kopyala-Yapıştır):

```
Bir akademik bitirme projesi için Gantt şeması oluştur. 
Gantt şeması, tıbbi görüntü analizi ve tele-tıp platformu projesinin zaman çizelgesini göstermelidir.

## ÖNEMLİ GEREKSİNİMLER:
- Görselde HİÇBİR watermark, logo veya amblem OLMAMALI
- Sağ alt köşede boşluk bırakma (watermark için alan bırakma)
- Alttan en az 100px boşluk bırak (watermark alanı için)
- Sadece Gantt şeması görünmeli, başka hiçbir marka/logo olmamalı
- Akademik rapor için kullanılacak, profesyonel görünüm

## PROJE FAZLARI VE SÜRELERİ:

### Faz 1: Araştırma ve Planlama
- Süre: Hafta 1-2 (2 hafta)
- Görevler:
  - Literatür incelemesi
  - Teknoloji seçimi
  - Veri seti araştırması
  - Mimari tasarım

### Faz 2: Model Geliştirme
- Süre: Hafta 3-5 (3 hafta)
- Görevler:
  - Veri seti hazırlama ve preprocessing
  - Model mimarisi tasarımı
  - Model eğitimi (GPU ile)
  - Model değerlendirme ve optimizasyon
- Bağımlılık: Faz 1'den sonra başlar

### Faz 3: Backend Geliştirme
- Süre: Hafta 6-9 (4 hafta)
- Görevler:
  - Flask API geliştirme
  - Firebase entegrasyonu
  - Authentication sistemi
  - Veritabanı şema tasarımı
  - API testleri
- Bağımlılık: Faz 2'den sonra başlar (model hazır olmalı)

### Faz 4: Frontend Geliştirme
- Süre: Hafta 10-13 (4 hafta)
- Görevler:
  - UI/UX tasarımı
  - HTML/CSS/JavaScript geliştirme
  - Firebase JS SDK entegrasyonu
  - Responsive tasarım
  - Kullanıcı testleri
- Bağımlılık: Faz 2'den sonra başlayabilir (Faz 3 ile paralel)

### Faz 5: Entegrasyon ve Test
- Süre: Hafta 14-15 (2 hafta)
- Görevler:
  - Backend-Frontend entegrasyonu
  - End-to-end testler
  - Performans optimizasyonu
  - Güvenlik testleri
  - Hata düzeltmeleri
- Bağımlılık: Faz 3 ve Faz 4'ün tamamlanması gerekir

### Faz 6: Dokümantasyon ve Sunum
- Süre: Hafta 16 (1 hafta)
- Görevler:
  - Kod dokümantasyonu
  - Kullanıcı kılavuzu
  - Proje raporu
  - Sunum hazırlığı
- Bağımlılık: Faz 5'ten sonra başlar

## GANTT ŞEMASI GEREKSİNİMLERİ:

- Yatay eksen: Haftalar (1-16)
- Dikey eksen: Fazlar ve görevler
- Her faz için renkli çubuklar
- Bağımlılıklar oklarla gösterilmeli
- Milestone'lar (önemli noktalar) işaretlenmeli
- Başlık: "MediAnalytica Projesi - Gantt Şeması"
- Profesyonel ve akademik görünüm
- Türkçe veya İngilizce etiketler

## GANTT ŞEMASI YAPISI:

```
Hafta:    1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16
         ─────────────────────────────────────────────────
Faz 1:    ████
Faz 2:          ████████
Faz 3:                  ████████████
Faz 4:                  ████████████
Faz 5:                                      ████████
Faz 6:                                              ████
```

## BAĞIMLILIKLAR:

- Faz 2, Faz 1'den sonra başlar
- Faz 3, Faz 2'den sonra başlar (model hazır olmalı)
- Faz 4, Faz 2'den sonra başlayabilir (Faz 3 ile paralel)
- Faz 5, Faz 3 ve Faz 4'ün tamamlanmasını gerektirir
- Faz 6, Faz 5'ten sonra başlar

## MİLESTONE'LAR (Önemli Noktalar):

- Hafta 2: Mimari tasarım tamamlandı
- Hafta 5: Model eğitimi tamamlandı
- Hafta 9: Backend geliştirme tamamlandı
- Hafta 13: Frontend geliştirme tamamlandı
- Hafta 15: Entegrasyon ve test tamamlandı
- Hafta 16: Proje tamamlandı

## ÇIKTI FORMATI:

- PNG veya JPG formatında
- Yüksek çözünürlük (300 DPI)
- Akademik rapor için uygun
- WATERMARK OLMAMALI - Alttan 100px boşluk bırak
- Sadece Gantt şeması görünmeli
- Profesyonel görünüm
```

## ALTERNATİF YÖNTEMLER (WATERMARK SORUNU İÇİN):

### 1. Draw.io (diagrams.net) - ÖNERİLEN ⭐
**Watermark YOK, tamamen ücretsiz**

1. https://app.diagrams.net/ adresine git
2. "Create New Diagram" → "Blank Diagram"
3. Sol panelden "Gantt" şablonunu ara veya manuel oluştur
4. Timeline ekle (yatay eksen: haftalar)
5. Görev çubukları ekle
6. Bağımlılıkları oklarla göster
7. Export → PNG (watermark YOK)

### 2. Microsoft Excel/Google Sheets
**Watermark YOK**

1. Excel veya Google Sheets'te Gantt şeması oluştur
2. Bar chart kullanarak zaman çizelgesi göster
3. Renklendir ve formatla
4. Screenshot al (watermark YOK)

### 3. Microsoft Project (varsa)
**Watermark YOK, profesyonel Gantt şemaları**

1. Microsoft Project'i aç
2. Görevleri ekle
3. Süreleri ve bağımlılıkları ayarla
4. Gantt Chart görünümünde göster
5. Export → PNG veya PDF

### 4. Online Gantt Araçları
- https://www.gantt.com/ (ücretsiz plan)
- https://www.smartsheet.com/ (ücretsiz deneme)
- Watermark kontrolü yap

### 5. Python ile Oluştur (Matplotlib)
**Tamamen watermark YOK**

```python
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta

# Gantt şeması oluştur
fig, ax = plt.subplots(figsize=(14, 8))

# Fazlar ve süreleri
fazlar = [
    ('Faz 1: Araştırma ve Planlama', 1, 2),
    ('Faz 2: Model Geliştirme', 3, 5),
    ('Faz 3: Backend Geliştirme', 6, 9),
    ('Faz 4: Frontend Geliştirme', 10, 13),
    ('Faz 5: Entegrasyon ve Test', 14, 15),
    ('Faz 6: Dokümantasyon', 16, 16)
]

colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']

for i, (faz, baslangic, bitis) in enumerate(fazlar):
    ax.barh(i, bitis - baslangic + 1, left=baslangic, height=0.6, 
            color=colors[i], label=faz)

ax.set_yticks(range(len(fazlar)))
ax.set_yticklabels([f[0] for f in fazlar])
ax.set_xlabel('Hafta')
ax.set_title('MediAnalytica Projesi - Gantt Şeması', fontsize=16, fontweight='bold')
ax.set_xlim(0, 17)
ax.grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.savefig('gantt_chart.png', dpi=300, bbox_inches='tight')
plt.show()
```

Bu kodu çalıştır, watermark YOK!

## ÖNERİLEN ADIMLAR:

### Seçenek 1: Gemini ile (Watermark sorunu var)
1. Prompt'u Gemini'ye gönder
2. Watermark'ı kırp veya alttan boşluk bırak
3. Veya görsel düzenleme programı ile watermark'ı kaldır

### Seçenek 2: Draw.io ile (ÖNERİLEN - Watermark YOK) ⭐
1. https://app.diagrams.net/ adresine git
2. Gantt şeması oluştur
3. Export → PNG (watermark YOK)
4. Raporuna ekle

### Seçenek 3: Excel ile (Watermark YOK)
1. Excel'de bar chart oluştur
2. Gantt şeması formatına çevir
3. Screenshot al (watermark YOK)

### Seçenek 4: Python ile (Watermark YOK)
1. Yukarıdaki Python kodunu çalıştır
2. PNG olarak kaydet (watermark YOK)

## WATERMARK KALDIRMA YÖNTEMLERİ:

Eğer Gemini'den görsel aldıysan ve watermark varsa:

1. **Görsel Düzenleme Programı ile:**
   - Photoshop, GIMP, Canva gibi programlarla watermark'ı kırp
   - Veya alttan 100px kes

2. **Online Araçlar:**
   - https://www.remove.bg/ (watermark kaldırma)
   - https://www.iloveimg.com/crop-image (kırpma)

3. **En İyi Çözüm:**
   - Draw.io kullan (watermark YOK, tamamen ücretsiz)

