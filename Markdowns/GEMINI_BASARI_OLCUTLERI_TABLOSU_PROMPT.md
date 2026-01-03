# Gemini'ye Başarı Ölçütleri Özet Tablosu Oluşturma Prompt'u

## PROMPT (Gemini'ye Kopyala-Yapıştır):

```
Bir akademik bitirme projesi raporu için başarı ölçütleri özet tablosu oluştur. 
Tablo, tıbbi görüntü analizi ve tele-tıp platformu projesinin başarı kriterlerini göstermelidir.

## BAŞARI ÖLÇÜTLERİ KATEGORİLERİ:

### SC1. Model Doğruluğu
- Deri hastalıkları modeli: Minimum %85 doğruluk (test seti)
- Kemik hastalıkları modeli: Minimum %80 doğruluk (test seti)
- Akciğer hastalıkları modeli: Minimum %90 doğruluk (test seti)
- Göz hastalıkları modeli: Minimum %75 doğruluk (test seti)
- Formül: Accuracy = (True Positives + True Negatives) / Total Samples

### SC2. Sistem Performansı
- Görüntü analizi süresi: Ortalama < 10 saniye
- API yanıt süresi: P95 < 2 saniye (95. persentil)
- Sayfa yükleme süresi: First Contentful Paint < 2 saniye
- Metrikler:
  - Latency = (Response Time - Request Time)
  - Throughput = (Total Requests) / (Total Time)
  - P95 Latency: Tüm isteklerin %95'inin tamamlandığı süre
  - Average Response Time: Σ(Response Time_i) / n
  - Error Rate: (Failed Requests / Total Requests) × 100

### SC3. Kullanıcı Deneyimi
- Kullanıcı memnuniyet skoru: Minimum 4/5 (5 üzerinden)
- Hata oranı: < %1 (başarısız istekler / toplam istekler)
- Kullanıcı tutma oranı: > %60 (1 hafta içinde tekrar giriş yapan kullanıcılar)
- Metrikler:
  - CSAT = (Pozitif Yanıtlar / Toplam Yanıtlar) × 100
  - Error Rate = (Failed Requests / Total Requests) × 100
  - User Retention Rate = (Returning Users / Total Users) × 100
  - Task Success Rate = (Completed Tasks / Attempted Tasks) × 100
  - Average Session Duration = Σ(Session Duration_i) / n

### SC4. Güvenlik
- Rate limiting: Başarılı (DDoS saldırıları engellendi)
- Input validation: %100 endpoint coverage
- Authentication: %100 başarılı token doğrulama
- CORS: Sadece izin verilen origin'lerden istekler
- Email doğrulama: Zorunlu

### SC5. Kod Kalitesi
- Test coverage: Minimum %60
- Code complexity: Cyclomatic complexity < 10 (ortalama)
- Code documentation: %80 fonksiyon dokümantasyonu

## TABLO FORMATI:

Tablo şu sütunları içermeli:
- Başarı Ölçütü Kategorisi (Model Doğruluğu, Sistem Performansı, Kullanıcı Deneyimi, Güvenlik, Kod Kalitesi)
- Metrik/Ölçüt (Detaylı metrik açıklaması)
- Hedef Değer (Minimum/maksimum değerler)
- Ölçüm Yöntemi (Nasıl ölçüldüğü)

## TABLO GEREKSİNİMLERİ:

- Profesyonel ve akademik görünüm
- Renkli ama okunabilir
- Başlık: "Başarı Ölçütleri Özet Tablosu"
- Her kategori için detaylı metrikler
- Hedef değerler vurgulu (kalın veya renkli)
- PDF/Word belgesine eklenebilir format (PNG, JPG veya tablo formatı)

## ÖRNEK TABLO YAPISI:

```
┌──────────────────────┬──────────────────────────────────────┬──────────────────┬────────────────────────────┐
│ Başarı Ölçütü        │ Metrik/Ölçüt                        │ Hedef Değer      │ Ölçüm Yöntemi              │
├──────────────────────┼──────────────────────────────────────┼──────────────────┼────────────────────────────┤
│ Model Doğruluğu      │ Deri hastalıkları doğruluğu          │ ≥ %85            │ Test seti üzerinde         │
│                      │ Kemik hastalıkları doğruluğu         │ ≥ %80            │ accuracy hesaplama         │
│                      │ Akciğer hastalıkları doğruluğu       │ ≥ %90            │                            │
│                      │ Göz hastalıkları doğruluğu           │ ≥ %75            │                            │
├──────────────────────┼──────────────────────────────────────┼──────────────────┼────────────────────────────┤
│ Sistem Performansı   │ Görüntü analizi süresi               │ < 10 saniye      │ Ortalama süre ölçümü       │
│                      │ API yanıt süresi (P95)               │ < 2 saniye       │ 95. persentil hesaplama   │
│                      │ Sayfa yükleme süresi (FCP)           │ < 2 saniye       │ Web Vitals metrikleri      │
│                      │ Error Rate                           │ < %1             │ (Failed/Total) × 100       │
├──────────────────────┼──────────────────────────────────────┼──────────────────┼────────────────────────────┤
│ Kullanıcı Deneyimi   │ Kullanıcı memnuniyet skoru (CSAT)    │ ≥ 4/5            │ Anket ve geri bildirim     │
│                      │ Hata oranı                           │ < %1             │ API log analizi            │
│                      │ Kullanıcı tutma oranı                │ > %60            │ 1 hafta içinde tekrar giriş│
│                      │ Task Success Rate                    │ > %90            │ Tamamlanan/Denenen işlem  │
├──────────────────────┼──────────────────────────────────────┼──────────────────┼────────────────────────────┤
│ Güvenlik             │ Rate limiting başarı oranı          │ %100             │ DDoS testleri              │
│                      │ Input validation coverage            │ %100             │ Endpoint testleri          │
│                      │ Authentication başarı oranı         │ %100             │ Token doğrulama testleri   │
│                      │ CORS yapılandırması                  │ %100             │ Origin kontrol testleri   │
├──────────────────────┼──────────────────────────────────────┼──────────────────┼────────────────────────────┤
│ Kod Kalitesi         │ Test coverage                        │ ≥ %60            │ pytest coverage raporu     │
│                      │ Code complexity (Cyclomatic)         │ < 10             │ Static code analysis       │
│                      │ Code documentation                   │ ≥ %80            │ Fonksiyon dokümantasyonu   │
└──────────────────────┴──────────────────────────────────────┴──────────────────┴────────────────────────────┘
```

## DETAYLI BİLGİLER:

### SC1. Model Doğruluğu:
**Metrikler:**
- Deri hastalıkları: EfficientNetB3 modeli, 5 sınıf, minimum %85 accuracy
- Kemik hastalıkları: DenseNet-121 modeli, 4 sınıf, minimum %80 accuracy
- Akciğer hastalıkları: 2 sınıf, minimum %90 accuracy
- Göz hastalıkları: 5 sınıf, minimum %75 accuracy

**Ölçüm Yöntemi:**
- Test veri seti üzerinde model.evaluate() ile accuracy hesaplama
- Confusion matrix ve classification report ile detaylı analiz

### SC2. Sistem Performansı:
**Metrikler:**
- Görüntü analizi: Ortalama 2-8 saniye (hastalık türüne göre değişken)
- API yanıt süresi: P95 < 2 saniye (95. persentil)
- Sayfa yükleme: First Contentful Paint < 2 saniye
- Error Rate: < %1

**Ölçüm Yöntemi:**
- API response time logging
- Web Vitals metrikleri (Chrome DevTools)
- Load testing (Apache Bench veya benzeri)

### SC3. Kullanıcı Deneyimi:
**Metrikler:**
- CSAT: Minimum 4/5 (5 üzerinden)
- Error Rate: < %1
- User Retention Rate: > %60
- Task Success Rate: > %90

**Ölçüm Yöntemi:**
- Kullanıcı anketleri ve geri bildirim formları
- Firebase Analytics ile kullanıcı davranışı takibi
- API log analizi

### SC4. Güvenlik:
**Metrikler:**
- Rate limiting: Başarılı (DDoS testleri)
- Input validation: %100 endpoint coverage
- Authentication: %100 başarılı token doğrulama
- CORS: Sadece izin verilen origin'ler

**Ölçüm Yöntemi:**
- Penetration testing
- Automated security scanning
- Code review

### SC5. Kod Kalitesi:
**Metrikler:**
- Test coverage: Minimum %60
- Cyclomatic complexity: < 10 (ortalama)
- Code documentation: %80 fonksiyon dokümantasyonu

**Ölçüm Yöntemi:**
- pytest --cov ile test coverage
- Static code analysis tools (pylint, flake8)
- Code review ve dokümantasyon kontrolü

## TABLO ÇIKTISI:

Tablo, PNG veya JPG formatında, yüksek çözünürlükte (300 DPI) oluşturulmalı.
Akademik rapor için uygun, profesyonel görünümde olmalı.
Hedef değerler vurgulu (kalın veya farklı renk).
```

## ALTERNATİF YÖNTEMLER:

### 1. Excel/Google Sheets ile Oluştur
- Excel veya Google Sheets'te tabloyu oluştur
- Hedef değerleri vurgula (kalın veya renkli)
- Screenshot al veya PDF olarak kaydet

### 2. Word/Google Docs ile Oluştur
- Word veya Google Docs'te tablo oluştur
- "Ekle" → "Tablo" → 4 sütun x 20+ satır
- Verileri doldur
- Formatla ve screenshot al

## ÖNERİLEN ADIMLAR:

1. **Gemini'ye prompt'u gönder** ve tabloyu oluştur
2. **Tabloyu PNG/JPG olarak indir**
3. **RAPOR.txt dosyasına ekle** (Word/Google Docs kullanıyorsan direkt ekle)
4. **Veya Excel/Google Sheets ile manuel oluştur** (daha fazla kontrol için)

## TABLO BOYUTU:

- Genişlik: En az 1200px (rapor için yeterli)
- Yükseklik: İçeriğe göre ayarlanabilir (yaklaşık 20+ satır)
- Font: Okunabilir (12-14pt)
- Renkler: Profesyonel (hedef değerler vurgulu)



