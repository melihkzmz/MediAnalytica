# 🎨 Gemini'ye Tablo Oluşturma Prompt'u

Eğer Python script'i ile oluşturulan tablo beğenilmezse, Gemini'ye şu prompt'u vererek profesyonel bir tablo oluşturabilirsin:

---

## 📋 Prompt:

```
RAPOR.txt dosyam için profesyonel bir API yanıt süreleri tablosu oluştur. 

TABLO 3.3: API YANIT SÜRELERİ

Tablo şu bilgileri içermeli:

| Endpoint | Açıklama | Ortalama Min (ms) | Ortalama Max (ms) | Cache |
|----------|----------|-------------------|-------------------|-------|
| /api/user/stats | Kullanıcı İstatistikleri | 150 | 300 | Evet |
| /api/user/analyses | Kullanıcı Analizleri | 200 | 500 | Hayır |
| /api/user/favorites | Kullanıcı Favorileri | 150 | 250 | Hayır |
| /auth/verify | Token Doğrulama | 100 | 200 | Hayır |

Gereksinimler:
- Akademik rapor formatında, profesyonel görünüm
- Başlık: "TABLO 3.3: API YANIT SÜRELERİ" (kalın, ortalanmış)
- Tablo başlıkları: Mavi arka plan (#667eea), beyaz yazı
- Alternatif satır renkleri (açık gri ve beyaz)
- Cache sütunu: Evet = yeşil, Hayır = gri
- Ortalama Min/Max: Yeşil/kırmızı renklerle vurgulanmış
- Not: Tablo altında "Not: Tüm ölçümler ortalama değerlerdir..." şeklinde bir not ekle
- Yüksek çözünürlük (300 DPI)
- PNG formatında
- Tablo düzgün hizalı, kaymamış olmalı
- Akademik rapor standartlarına uygun

Lütfen bu tabloyu oluştur ve PNG olarak kaydet.
```

---

## 🎯 Alternatif Kısa Prompt:

```
Akademik rapor için API yanıt süreleri tablosu oluştur:

TABLO 3.3: API YANIT SÜRELERİ

Veriler:
- /api/user/stats: 150-300ms (Cache: Evet)
- /api/user/analyses: 200-500ms (Cache: Hayır)
- /api/user/favorites: 150-250ms (Cache: Hayır)
- /auth/verify: 100-200ms (Cache: Hayır)

Sütunlar: Endpoint | Açıklama | Ortalama Min (ms) | Ortalama Max (ms) | Cache

Profesyonel, akademik format, yüksek kalite PNG.
```

---

## 📝 Notlar:

- Gemini'ye bu prompt'u verdiğinde, tabloyu PNG olarak oluşturup indirebilirsin
- Tablo düzgün hizalı ve kaymamış olacak
- Akademik rapor standartlarına uygun olacak

