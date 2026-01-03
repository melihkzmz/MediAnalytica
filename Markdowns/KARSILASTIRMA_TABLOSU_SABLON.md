# Benzer Platformlar Karşılaştırma Tablosu - Hızlı Şablon

## Excel/Google Sheets için Tablo Yapısı:

| Platform | Çoklu Hastalık Desteği | Tele-Tıp Entegrasyonu | Yapay Zeka Analizi | Açık Kaynak | Maliyet | Kullanıcı Yönetimi | Grad-CAM Görselleştirme | Analiz Geçmişi | Mobil Uyumluluk | Doktor Paneli |
|----------|------------------------|----------------------|-------------------|-------------|---------|-------------------|------------------------|----------------|-----------------|---------------|
| **MediAnalytica (Bu Proje)** | ✅ 4 hastalık (Deri, Kemik, Akciğer, Göz) | ✅ Jitsi Meet | ✅ EfficientNet/DenseNet | ✅ | Ücretsiz | ✅ Firebase Auth | ✅ | ✅ Kapsamlı | ✅ Responsive Web | ✅ |
| Teladoc | ❌ | ✅ | ❌ | ❌ | Ücretli | ✅ | ❌ | ✅ | ✅ Mobil App | ✅ |
| Amwell | ❌ | ✅ | ❌ | ❌ | Ücretli | ✅ | ❌ | ✅ | ✅ Mobil App | ✅ |
| SkinVision | ❌ (Sadece Deri) | ❌ | ✅ (Sadece Deri) | ❌ | Ücretli | Kısıtlı | ❌ | ❌ | ✅ Mobil App | ❌ |
| CheXNet (Akademik) | ❌ (Sadece Akciğer) | ❌ | ✅ (Sadece Akciğer) | ✅ | Ücretsiz | ❌ | ❌ | ❌ | ❌ | ❌ |
| ISIC Archive (Akademik) | ❌ (Sadece Deri) | ❌ | ✅ (Sadece Deri) | ✅ | Ücretsiz | ❌ | ❌ | ❌ | ❌ | ❌ |

## Google Sheets/Excel'de Nasıl Yapılır:

1. **Google Sheets'i aç:** https://sheets.google.com
2. **Yukarıdaki tabloyu kopyala-yapıştır**
3. **Formatla:**
   - Başlık satırını kalın yap (Ctrl+B)
   - MediAnalytica satırını farklı renkle vurgula (sarı veya açık mavi)
   - ✅ işaretlerini yeşil renkle
   - ❌ işaretlerini kırmızı renkle
4. **Kenarlıkları ekle:** Tüm hücrelere kenarlık
5. **Screenshot al veya PDF olarak kaydet**

## Word/Google Docs'ta Nasıl Yapılır:

1. **Word/Google Docs'u aç**
2. **Ekle → Tablo → 11 sütun x 7 satır**
3. **Başlıkları yaz:**
   - Platform
   - Çoklu Hastalık Desteği
   - Tele-Tıp Entegrasyonu
   - Yapay Zeka Analizi
   - Açık Kaynak
   - Maliyet
   - Kullanıcı Yönetimi
   - Grad-CAM Görselleştirme
   - Analiz Geçmişi
   - Mobil Uyumluluk
   - Doktor Paneli
4. **Verileri doldur**
5. **Formatla:**
   - Başlık satırını kalın yap
   - MediAnalytica satırını vurgula
   - ✅/❌ işaretlerini renklendir
6. **Screenshot al**

## Hızlı Markdown Tablo (GitHub için):

```markdown
| Platform | Çoklu Hast. | Tele-Tıp | Yapay Zeka | Açık Kaynak | Maliyet |
|----------|------------|----------|------------|-------------|---------|
| **MediAnalytica** | ✅ 4 tür | ✅ Jitsi | ✅ EfficientNet | ✅ | Ücretsiz |
| Teladoc | ❌ | ✅ | ❌ | ❌ | Ücretli |
| Amwell | ❌ | ✅ | ❌ | ❌ | Ücretli |
| SkinVision | ❌ (Deri) | ❌ | ✅ (Deri) | ❌ | Ücretli |
| CheXNet | ❌ (Akciğer) | ❌ | ✅ (Akciğer) | ✅ | Ücretsiz |
```

## Gemini'ye Verilecek Kısa Prompt:

```
Bir akademik rapor için benzer platformlar karşılaştırma tablosu oluştur.

Platformlar:
1. MediAnalytica (Bu Proje) - 4 hastalık, Jitsi Meet, EfficientNet/DenseNet, açık kaynak, ücretsiz
2. Teladoc - Tele-tıp, ücretli, AI yok
3. Amwell - Tele-tıp, ücretli, AI yok
4. SkinVision - Sadece deri, AI var, ücretli
5. CheXNet - Sadece akciğer, AI var, akademik, ücretsiz

Kriterler: Çoklu hastalık, Tele-tıp, Yapay zeka, Açık kaynak, Maliyet, Kullanıcı yönetimi, Grad-CAM, Analiz geçmişi, Mobil uyumluluk, Doktor paneli

Tablo formatı: Profesyonel, renkli (✅ yeşil, ❌ kırmızı), MediAnalytica vurgulu, akademik rapor için uygun.
```

