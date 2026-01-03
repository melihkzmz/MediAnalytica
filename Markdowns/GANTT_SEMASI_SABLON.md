# Gantt Şeması - Hızlı Şablon ve Alternatif Yöntemler

## ⚠️ WATERMARK SORUNU ÇÖZÜMÜ:

Gemini görsellerinde watermark çıkıyor. **EN İYİ ÇÖZÜM: Draw.io kullan** (watermark YOK, tamamen ücretsiz)

## YÖNTEM 1: Draw.io (ÖNERİLEN - Watermark YOK) ⭐⭐⭐

### Adımlar:
1. **https://app.diagrams.net/** adresine git
2. "Create New Diagram" → "Blank Diagram"
3. Sol panelden şekilleri kullan:
   - **Timeline oluştur:** Yatay çizgi çiz (haftalar için)
   - **Görev çubukları:** Dikdörtgen çiz (her faz için)
   - **Bağımlılıklar:** Oklar çiz (bağımlılıklar için)
4. **Formatla:**
   - Her faz için farklı renk
   - Hafta numaralarını ekle (1-16)
   - Faz isimlerini yaz
5. **Export → PNG** (watermark YOK!)

### Draw.io Gantt Şeması Yapısı:

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

## YÖNTEM 2: Excel/Google Sheets (Watermark YOK)

### Adımlar:
1. Excel veya Google Sheets'i aç
2. **Veri hazırla:**
   - A sütunu: Faz isimleri
   - B sütunu: Başlangıç haftası
   - C sütunu: Bitiş haftası
   - D sütunu: Süre (C - B + 1)

3. **Bar Chart oluştur:**
   - Verileri seç
   - Insert → Bar Chart → Stacked Bar Chart
   - X ekseni: Haftalar (1-16)
   - Y ekseni: Fazlar

4. **Formatla:**
   - Her faz için farklı renk
   - Gridlines ekle
   - Başlık ekle: "MediAnalytica Projesi - Gantt Şeması"

5. **Screenshot al** (watermark YOK!)

### Excel Veri Örneği:

| Faz | Başlangıç | Bitiş | Süre |
|-----|-----------|-------|------|
| Faz 1: Araştırma ve Planlama | 1 | 2 | 2 |
| Faz 2: Model Geliştirme | 3 | 5 | 3 |
| Faz 3: Backend Geliştirme | 6 | 9 | 4 |
| Faz 4: Frontend Geliştirme | 10 | 13 | 4 |
| Faz 5: Entegrasyon ve Test | 14 | 15 | 2 |
| Faz 6: Dokümantasyon | 16 | 16 | 1 |

## YÖNTEM 3: Python ile (Watermark YOK)

### Kod:

```python
import matplotlib.pyplot as plt
import numpy as np

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

fig, ax = plt.subplots(figsize=(14, 8))

for i, (faz, baslangic, bitis) in enumerate(fazlar):
    ax.barh(i, bitis - baslangic + 1, left=baslangic, height=0.6, 
            color=colors[i], label=faz, edgecolor='black', linewidth=1)

ax.set_yticks(range(len(fazlar)))
ax.set_yticklabels([f[0] for f in fazlar])
ax.set_xlabel('Hafta', fontsize=12, fontweight='bold')
ax.set_title('MediAnalytica Projesi - Gantt Şeması', fontsize=16, fontweight='bold')
ax.set_xlim(0, 17)
ax.set_xticks(range(1, 17))
ax.grid(axis='x', alpha=0.3, linestyle='--')
ax.set_axisbelow(True)

# Milestone'ları işaretle
milestones = [2, 5, 9, 13, 15, 16]
for ms in milestones:
    ax.axvline(x=ms, color='red', linestyle=':', alpha=0.5, linewidth=2)

plt.tight_layout()
plt.savefig('gantt_chart.png', dpi=300, bbox_inches='tight', facecolor='white')
print("Gantt şeması 'gantt_chart.png' olarak kaydedildi!")
plt.show()
```

### Çalıştırma:
```bash
pip install matplotlib numpy
python gantt_chart.py
```

**Watermark YOK!**

## YÖNTEM 4: Gemini ile (Watermark sorunu var)

### Kısa Prompt:

```
Akademik rapor için Gantt şeması oluştur.

6 faz:
- Faz 1: Hafta 1-2 (Araştırma)
- Faz 2: Hafta 3-5 (Model)
- Faz 3: Hafta 6-9 (Backend)
- Faz 4: Hafta 10-13 (Frontend)
- Faz 5: Hafta 14-15 (Entegrasyon)
- Faz 6: Hafta 16 (Dokümantasyon)

ÖNEMLİ: 
- WATERMARK OLMAMALI
- Alttan 150px boşluk bırak
- Sağ alt köşede boşluk bırak
- Sadece Gantt şeması görünmeli

Format: Profesyonel, akademik, PNG, yüksek çözünürlük.
```

### Watermark Kaldırma:
1. Görsel düzenleme programı ile alttan 150px kes
2. Veya Draw.io kullan (daha iyi)

## YÖNTEM 5: Microsoft Project (varsa)

1. Microsoft Project'i aç
2. Görevleri ekle:
   - Faz 1: 2 hafta
   - Faz 2: 3 hafta
   - Faz 3: 4 hafta
   - Faz 4: 4 hafta
   - Faz 5: 2 hafta
   - Faz 6: 1 hafta
3. Bağımlılıkları ayarla
4. Gantt Chart görünümünde göster
5. Export → PNG veya PDF

**Watermark YOK!**

## HIZLI KARŞILAŞTIRMA:

| Yöntem | Watermark | Zorluk | Kalite | Önerilen |
|--------|-----------|--------|--------|----------|
| Draw.io | ❌ YOK | ⭐ Kolay | ⭐⭐⭐ Yüksek | ✅ EVET |
| Excel | ❌ YOK | ⭐⭐ Orta | ⭐⭐ Orta | ✅ EVET |
| Python | ❌ YOK | ⭐⭐⭐ Zor | ⭐⭐⭐ Yüksek | ✅ EVET |
| Gemini | ⚠️ VAR | ⭐ Çok Kolay | ⭐⭐ Orta | ❌ HAYIR |
| MS Project | ❌ YOK | ⭐⭐ Orta | ⭐⭐⭐ Yüksek | ✅ EVET |

## ÖNERİLEN ADIMLAR:

1. **Draw.io kullan** (en kolay, watermark YOK) ⭐
2. Veya Excel kullan (watermark YOK)
3. Veya Python kodu çalıştır (watermark YOK)
4. Gemini'den görsel alırsan watermark'ı kırp

## GANTT ŞEMASI RENKLERİ (Önerilen):

- Faz 1: Kırmızı (#FF6B6B)
- Faz 2: Turkuaz (#4ECDC4)
- Faz 3: Mavi (#45B7D1)
- Faz 4: Turuncu (#FFA07A)
- Faz 5: Yeşil (#98D8C8)
- Faz 6: Sarı (#F7DC6F)

## BAĞIMLILIKLAR (Oklarla Göster):

- Faz 2 → Faz 1'den sonra başlar
- Faz 3 → Faz 2'den sonra başlar
- Faz 4 → Faz 2'den sonra başlar (Faz 3 ile paralel)
- Faz 5 → Faz 3 ve Faz 4'ün tamamlanması gerekir
- Faz 6 → Faz 5'ten sonra başlar

## MİLESTONE'LAR (Önemli Noktalar):

- Hafta 2: Mimari tasarım tamamlandı
- Hafta 5: Model eğitimi tamamlandı
- Hafta 9: Backend geliştirme tamamlandı
- Hafta 13: Frontend geliştirme tamamlandı
- Hafta 15: Entegrasyon ve test tamamlandı
- Hafta 16: Proje tamamlandı

