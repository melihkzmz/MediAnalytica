# Gemini AI için Model Doğruluk/Macro F1 Karşılaştırma Tablosu Promptu

Aşağıdaki promptu Gemini AI'ye göndererek projenin model doğruluk karşılaştırma tablosunu oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak profesyonel bir "Model Doğruluk ve Macro F1 Skoru Karşılaştırma Tablosu" çiz. Aşağıdaki tablo yapısını kullan:**

### Tablo: Derin Öğrenme Modelleri Test Doğruluk Karşılaştırması

**Sütunlar (5 sütun):**
1. Hastalık Kategorisi
2. Model Mimarisi
3. Sınıf Sayısı
4. Test Accuracy (Test Doğruluğu)
5. Macro F1 Score (Makro F1 Skoru)

**Satırlar (3 model):**

| Hastalık Kategorisi | Model Mimarisi | Sınıf Sayısı | Test Accuracy (%) | Macro F1 Score (%) |
|---------------------|----------------|--------------|-------------------|-------------------|
| **Deri Hastalıkları** | EfficientNetB3 | 5 sınıf | %80-85 | %70-75 |
| **Kemik Hastalıkları** | DenseNet-121 | 4 sınıf | %85-90 | %85-90 |
| **Akciğer Hastalıkları** | DenseNet-121 | 3 sınıf | %90-95 | %90-95 |

**Sınıf Detayları (Ek Bilgi - Tablo altında veya ayrı bölümde gösterilebilir):**

1. **Deri Hastalıkları (5 sınıf):**
   - akiec (Aktinik Keratoz)
   - bcc (Bazal Hücreli Karsinom)
   - bkl (İyi Huylu Keratoz)
   - mel (Melanom)
   - nv (Melanositik Nevüs)

2. **Kemik Hastalıkları (4 sınıf):**
   - Normal
   - Fracture (Kırık)
   - Benign_Tumor (İyi Huylu Tümör)
   - Malignant_Tumor (Kötü Huylu Tümör)

3. **Akciğer Hastalıkları (3 sınıf):**
   - Normal
   - COVID-19
   - Non-COVID (Pnömoni)

**Tasarım Gereksinimleri:**
- Tablo net sınırlarla, profesyonel görünümlü
- Başlık satırı belirgin olmalı (kalın, farklı arka plan rengi)
- Hastalık kategorileri vurgulanmalı (kalın veya farklı renk)
- Test Accuracy ve Macro F1 Score yüzdeleri net bir şekilde gösterilmeli
- Aralık değerleri (örn: %80-85) net bir şekilde belirtilmeli
- Her satır dengeli ve okunabilir olmalı
- Sayısal değerler ve yüzdeler tutarlı formatta gösterilmeli

**Renk Şeması (Opsiyonel):**
- Başlık satırı: Koyu mavi veya gri arka plan, beyaz metin
- Deri Hastalıkları satırı: Açık turuncu/sarı tonları
- Kemik Hastalıkları satırı: Açık yeşil tonları
- Akciğer Hastalıkları satırı: Açık mavi tonları
- Veya tüm satırlar için tutarlı açık renk (profesyonel görünüm için)

**Ek Notlar (Tablo altında gösterilebilir):**
- Tüm modeller test veri setleri üzerinde değerlendirilmiştir
- Test Accuracy: Genel doğruluk oranı
- Macro F1 Score: Tüm sınıflar için ortalama F1 skoru (sınıf dengesizliğini dikkate alır)
- Macro F1 skoru, azınlık sınıfların performansını daha iyi yansıtır

**Alternatif Format (Daha Kompakt):**

Eğer daha kompakt bir format tercih edilirse:

| Hastalık Kategorisi | Model | Sınıf | Test Accuracy | Macro F1 |
|---------------------|-------|-------|---------------|----------|
| Deri | EfficientNetB3 | 5 | %80-85 | %70-75 |
| Kemik | DenseNet-121 | 4 | %85-90 | %85-90 |
| Akciğer | DenseNet-121 | 3 | %90-95 | %90-95 |

---

**Yukarıdaki bilgilere göre detaylı bir "Model Doğruluk ve Macro F1 Skoru Karşılaştırma Tablosu" çiz. Tablo Türkçe olmalı, tüm modeller, test accuracy ve macro F1 score değerleri net bir şekilde gösterilmelidir. Görsel profesyonel ve akademik görünümde olmalı, hiçbir watermark veya logo içermemelidir.**
