# Gemini AI için Başarı Ölçütleri Özet Tablosu Promptu

Aşağıdaki promptu Gemini AI'ye göndererek projenin başarı ölçütleri tablosunu oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak profesyonel bir "Başarı Ölçütleri Özet Tablosu" çiz. Aşağıdaki tablo yapısını kullan:**

### Tablo: MediAnalytica Proje Başarı Ölçütleri Özet Tablosu

**Sütunlar (2 sütun):**
1. Başarı Ölçütü Kategorisi
2. Metrikler/Hedefler

**Satırlar (5 kategori):**

| Başarı Ölçütü Kategorisi | Metrikler/Hedefler |
|---------------------------|-------------------|
| **1. Model Doğruluğu** | **Deri Hastalıkları:** Minimum %80 doğruluk (test seti)<br>**Kemik Hastalıkları:** Minimum %85 doğruluk (test seti)<br>**Akciğer Hastalıkları:** Minimum %90 doğruluk (test seti)<br><br>**Formül:** Accuracy = (True Positives + True Negatives) / Total Samples |
| **2. Sistem Performansı** | **Görüntü Analizi Süresi:** Ortalama < 10 saniye<br>**API Yanıt Süresi:** Ortalama < 5 saniye<br>**Sayfa Yükleme Süresi:** Ortalama < 2 saniye<br><br>**Metrikler:** Latency, Throughput, P95 Latency, Average Response Time, Error Rate |
| **3. Kullanıcı Deneyimi** | **Kullanıcı Memnuniyet Skoru:** Minimum 4/5 (5 üzerinden)<br>**Hata Oranı:** < %1 (başarısız istekler / toplam istekler)<br>**Kullanıcı Tutma Oranı:** > %60 (1 hafta içinde tekrar giriş yapan kullanıcılar)<br><br>**Metrikler:** CSAT, Error Rate, User Retention Rate, Task Success Rate, Average Session Duration |
| **4. Güvenlik** | **Rate Limiting:** Başarılı DDoS saldırıları engellendi<br>**Input Validation:** %100 endpoint coverage<br>**Authentication:** %100 başarılı token doğrulama |
| **5. Kod Kalitesi** | **Test Coverage:** Minimum %60<br>**Code Complexity:** Cyclomatic complexity < 10 (ortalama)<br>**Code Documentation:** %80 fonksiyon dokümantasyonu |

**Tasarım Gereksinimleri:**
- Tablo net sınırlarla, profesyonel görünümlü
- Başlık satırı belirgin olmalı
- Başarı ölçütü kategorileri vurgulanmalı (kalın veya farklı renk)
- Her kategori altında metrikler ve hedefler net bir şekilde gösterilmeli
- Formüller ve önemli metrikler ayrı satırlarda veya açıkça belirtilmeli
- Her satır dengeli ve okunabilir olmalı
- Sayısal değerler ve yüzdeler net bir şekilde gösterilmeli

**Alternatif Format (Daha Kompakt):**

Eğer tablo çok uzun olursa, daha kompakt bir format kullanılabilir:

| Başarı Ölçütü Kategorisi | Metrikler/Hedefler |
|---------------------------|-------------------|
| **1. Model Doğruluğu** | Deri: Min. %80 | Kemik: Min. %85 | Akciğer: Min. %90 (test seti) |
| **2. Sistem Performansı** | Görüntü analizi: < 10 sn | API yanıt: < 5 sn | Sayfa yükleme: < 2 sn |
| **3. Kullanıcı Deneyimi** | Memnuniyet: Min. 4/5 | Hata oranı: < %1 | Tutma oranı: > %60 |
| **4. Güvenlik** | Rate limiting: DDoS engellendi | Input validation: %100 coverage | Authentication: %100 başarı |
| **5. Kod Kalitesi** | Test coverage: Min. %60 | Complexity: < 10 (ortalama) | Documentation: %80 |

---

**Yukarıdaki bilgilere göre detaylı bir "Başarı Ölçütleri Özet Tablosu" çiz. Tablo Türkçe olmalı, tüm başarı ölçütü kategorileri ve metrikler net bir şekilde gösterilmelidir. Model doğruluğu bölümünde deri, kemik ve akciğer hastalıkları ayrı ayrı belirtilmelidir.**
