# Proje Kısıtları Özet Tablosu - Hızlı Şablon

## Excel/Google Sheets için Tablo Yapısı:

| Kısıt Kategorisi | Kısıt Açıklaması | Etkisi | Çözüm/Alternatif |
|------------------|------------------|--------|------------------|
| **C1. Bütçe** | Firebase ücretsiz planı (Spark Plan)<br/>- Storage: 5GB<br/>- Firestore: 1GB, 50K işlem/gün<br/>- Auth: Sınırsız kullanıcı | Orta | Ücretsiz plan kullanımı, görüntü sıkıştırma, API caching |
| **C2. Zaman** | 16 hafta (1 akademik dönem)<br/>- Model eğitimi: 2-3 hafta<br/>- Backend: 4 hafta<br/>- Frontend: 4 hafta<br/>- Test: 2 hafta | Yüksek | Agile metodoloji, 2 haftalık sprint'ler, paralel geliştirme |
| **C3. Donanım** | GPU erişimi (model eğitimi)<br/>- Backend: Min 4GB RAM, 2 CPU<br/>- Frontend: Modern tarayıcılar | Yüksek | Google Colab ücretsiz GPU, model optimizasyonu |
| **C4. Veri** | Açık kaynak veri setleri<br/>- ISIC, Mendeley, Kaggle<br/>- Gerçek hasta verisi yok<br/>- Sınırlı veri seti boyutları | Orta | Data augmentation, transfer learning, veri seti birleştirme |
| **C5. Teknoloji** | Python 3.11+<br/>- TensorFlow uyumluluğu<br/>- Modern tarayıcılar (ES6+)<br/>- Firebase limitleri | Düşük | Uyumlu versiyonlar, modern tarayıcı desteği |

## Google Sheets/Excel'de Nasıl Yapılır:

1. **Google Sheets'i aç:** https://sheets.google.com
2. **Yukarıdaki tabloyu kopyala-yapıştır**
3. **Formatla:**
   - Başlık satırını kalın yap (Ctrl+B)
   - Etki sütununu renklendir:
     - Yüksek: Kırmızı arka plan
     - Orta: Sarı arka plan
     - Düşük: Yeşil arka plan
   - Kenarlıkları ekle
4. **Screenshot al veya PDF olarak kaydet**

## Word/Google Docs'ta Nasıl Yapılır:

1. **Word/Google Docs'u aç**
2. **Ekle → Tablo → 4 sütun x 6 satır**
3. **Başlıkları yaz:**
   - Kısıt Kategorisi
   - Kısıt Açıklaması
   - Etkisi
   - Çözüm/Alternatif
4. **Verileri doldur**
5. **Formatla:**
   - Başlık satırını kalın yap
   - Etki sütununu renklendir
   - Kenarlıkları ekle
6. **Screenshot al**

## Hızlı Markdown Tablo (GitHub için):

```markdown
| Kısıt | Açıklama | Etkisi | Çözüm |
|-------|----------|--------|-------|
| **Bütçe** | Firebase ücretsiz plan | Orta | Optimizasyon |
| **Zaman** | 16 hafta | Yüksek | Agile, Sprint'ler |
| **Donanım** | GPU erişimi | Yüksek | Google Colab |
| **Veri** | Açık kaynak veri setleri | Orta | Data augmentation |
| **Teknoloji** | Python 3.11+ | Düşük | Uyumlu versiyonlar |
```

## Gemini'ye Verilecek Kısa Prompt:

```
Akademik rapor için proje kısıtları özet tablosu oluştur.

Kısıtlar:
1. Bütçe: Firebase ücretsiz plan (5GB Storage, 50K Firestore/gün) - Etki: Orta
2. Zaman: 16 hafta (model eğitimi 2-3 hafta, backend 4 hafta, frontend 4 hafta) - Etki: Yüksek
3. Donanım: GPU erişimi, min 4GB RAM - Etki: Yüksek
4. Veri: Açık kaynak veri setleri (ISIC, Mendeley, Kaggle), gerçek hasta verisi yok - Etki: Orta
5. Teknoloji: Python 3.11+, modern tarayıcılar - Etki: Düşük

Sütunlar: Kısıt Kategorisi, Kısıt Açıklaması, Etkisi, Çözüm/Alternatif

Format: Profesyonel tablo, renk kodlu (Yüksek: Kırmızı, Orta: Sarı, Düşük: Yeşil), akademik rapor için uygun, PNG formatında.
```



