# Başarı Ölçütleri Özet Tablosu - Hızlı Şablon

## Excel/Google Sheets için Tablo Yapısı:

| Başarı Ölçütü | Metrik/Ölçüt | Hedef Değer | Ölçüm Yöntemi |
|---------------|--------------|-------------|---------------|
| **SC1. Model Doğruluğu** | Deri hastalıkları doğruluğu | ≥ %85 | Test seti accuracy |
| | Kemik hastalıkları doğruluğu | ≥ %80 | Test seti accuracy |
| | Akciğer hastalıkları doğruluğu | ≥ %90 | Test seti accuracy |
| | Göz hastalıkları doğruluğu | ≥ %75 | Test seti accuracy |
| **SC2. Sistem Performansı** | Görüntü analizi süresi | < 10 saniye | Ortalama süre ölçümü |
| | API yanıt süresi (P95) | < 2 saniye | 95. persentil hesaplama |
| | Sayfa yükleme süresi (FCP) | < 2 saniye | Web Vitals metrikleri |
| | Error Rate | < %1 | (Failed/Total) × 100 |
| **SC3. Kullanıcı Deneyimi** | Kullanıcı memnuniyet skoru (CSAT) | ≥ 4/5 | Anket ve geri bildirim |
| | Hata oranı | < %1 | API log analizi |
| | Kullanıcı tutma oranı | > %60 | 1 hafta içinde tekrar giriş |
| | Task Success Rate | > %90 | Tamamlanan/Denenen işlem |
| **SC4. Güvenlik** | Rate limiting başarı oranı | %100 | DDoS testleri |
| | Input validation coverage | %100 | Endpoint testleri |
| | Authentication başarı oranı | %100 | Token doğrulama testleri |
| | CORS yapılandırması | %100 | Origin kontrol testleri |
| **SC5. Kod Kalitesi** | Test coverage | ≥ %60 | pytest coverage raporu |
| | Code complexity (Cyclomatic) | < 10 | Static code analysis |
| | Code documentation | ≥ %80 | Fonksiyon dokümantasyonu |

## Google Sheets/Excel'de Nasıl Yapılır:

1. **Google Sheets'i aç:** https://sheets.google.com
2. **Yukarıdaki tabloyu kopyala-yapıştır**
3. **Formatla:**
   - Başlık satırını kalın yap (Ctrl+B)
   - Kategori satırlarını (SC1, SC2, vb.) vurgula (farklı renk)
   - Hedef değerleri kalın yap ve vurgula
   - Kenarlıkları ekle
4. **Screenshot al veya PDF olarak kaydet**

## Word/Google Docs'ta Nasıl Yapılır:

1. **Word/Google Docs'u aç**
2. **Ekle → Tablo → 4 sütun x 20+ satır**
3. **Başlıkları yaz:**
   - Başarı Ölçütü
   - Metrik/Ölçüt
   - Hedef Değer
   - Ölçüm Yöntemi
4. **Verileri doldur**
5. **Formatla:**
   - Başlık satırını kalın yap
   - Kategori satırlarını vurgula
   - Hedef değerleri kalın yap
   - Kenarlıkları ekle
6. **Screenshot al**

## Hızlı Markdown Tablo (GitHub için):

```markdown
| Başarı Ölçütü | Metrik | Hedef | Ölçüm |
|---------------|--------|-------|-------|
| **Model Doğruluğu** | Deri doğruluğu | ≥ %85 | Test seti |
| | Kemik doğruluğu | ≥ %80 | Test seti |
| | Akciğer doğruluğu | ≥ %90 | Test seti |
| | Göz doğruluğu | ≥ %75 | Test seti |
| **Performans** | Analiz süresi | < 10 sn | Ortalama |
| | API yanıt (P95) | < 2 sn | Persentil |
| | Sayfa yükleme | < 2 sn | Web Vitals |
| **Kullanıcı Deneyimi** | CSAT | ≥ 4/5 | Anket |
| | Hata oranı | < %1 | Log analizi |
| | Tutma oranı | > %60 | Analytics |
| **Güvenlik** | Rate limiting | %100 | DDoS testi |
| | Input validation | %100 | Endpoint testi |
| | Authentication | %100 | Token testi |
| **Kod Kalitesi** | Test coverage | ≥ %60 | pytest |
| | Complexity | < 10 | Static analysis |
| | Documentation | ≥ %80 | Code review |
```

## Gemini'ye Verilecek Kısa Prompt:

```
Akademik rapor için başarı ölçütleri özet tablosu oluştur.

5 kategori:
1. Model Doğruluğu: Deri ≥%85, Kemik ≥%80, Akciğer ≥%90, Göz ≥%75
2. Sistem Performansı: Analiz <10sn, API P95 <2sn, Sayfa <2sn, Error <%1
3. Kullanıcı Deneyimi: CSAT ≥4/5, Hata <%1, Tutma >%60, Task Success >%90
4. Güvenlik: Rate limiting %100, Validation %100, Auth %100, CORS %100
5. Kod Kalitesi: Test coverage ≥%60, Complexity <10, Documentation ≥%80

Sütunlar: Başarı Ölçütü, Metrik/Ölçüt, Hedef Değer, Ölçüm Yöntemi

Format: Profesyonel tablo, hedef değerler vurgulu, akademik rapor için uygun, PNG formatında.
```



