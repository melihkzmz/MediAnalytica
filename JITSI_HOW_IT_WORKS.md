# Jitsi Video Conference - Nasıl Çalışır?

## Genel Bakış

Jitsi Meet, tarayıcı tabanlı video konferans çözümüdür. Her görüşme bir "oda" (room) içinde gerçekleşir ve kullanıcılar oda adını kullanarak katılır.

## Sistem Akışı

### 1. Randevu Oluşturma
- Kullanıcı randevu oluşturduğunda, otomatik olarak benzersiz bir Jitsi oda adı oluşturulur
- Format: `medi-analytica-{appointmentId}`
- Bu oda adı Firestore'da `appointments.jitsiRoom` alanına kaydedilir

### 2. Randevu Onaylama
- Doktor randevuyu onayladığında, eğer `jitsiRoom` yoksa otomatik oluşturulur
- Her randevu için benzersiz bir oda adı garantilenir

### 3. Randevu Saati Kontrolü
- Sistem her dakika kontrol eder: Randevu saati geldi mi?
- Kontrol kriterleri:
  - Randevu tarihi ve saati şu anki zamandan 5 dakika önce veya sonra mı?
  - Randevu durumu "approved" (onaylanmış) mı?
  - Randevu 30 dakika geçmiş değil mi?

### 4. Bildirim Kartı Gösterimi
- Randevu saati geldiğinde, hem doktor hem hasta için bir bildirim kartı görünür
- Kart mesajı: "Randevu saatiniz gelmiştir. Görüntülü görüşmek için lobiye katılın:"
- Kart üzerinde "Görüntülü Görüşmeye Katıl" butonu bulunur
- Kullanıcı kartı kapatabilir (X butonu)

### 5. Video Görüşmesi
- Kullanıcı "Görüntülü Görüşmeye Katıl" butonuna tıkladığında:
  - `/video?room={roomName}&appointmentId={appointmentId}` sayfasına yönlendirilir
  - Jitsi Meet otomatik olarak yüklenir
  - Kullanıcı adı ve e-posta Jitsi'ye iletilir
  - Her iki kullanıcı aynı oda adına katıldığında görüşme başlar

## Teknik Detaylar

### Oda Adı Formatı
```
medi-analytica-{appointmentId}
```
Örnek: `medi-analytica-abc123xyz`

### Zaman Kontrolü
- **5 dakika önce**: Kullanıcılar görüşmeye katılabilir
- **Randevu saati**: Görüşme başlamalı
- **30 dakika sonra**: Görüşme penceresi kapanır

### Güvenlik
- Her randevu için benzersiz oda adı
- Sadece onaylanmış randevular için görüşme açılır
- Kullanıcı kimlik doğrulaması gerekli

## Kullanıcı Deneyimi

### Hasta İçin:
1. Randevu oluşturur
2. Doktor onaylar
3. Randevu saati geldiğinde bildirim kartı görünür
4. "Görüntülü Görüşmeye Katıl" butonuna tıklar
5. Jitsi Meet açılır, doktoru bekler veya görüşmeye başlar

### Doktor İçin:
1. Randevu talebini görür
2. Randevuyu onaylar
3. Randevu saati geldiğinde bildirim kartı görünür
4. Hasta bilgileri kartta gösterilir
5. "Görüntülü Görüşmeye Katıl" butonuna tıklar
6. Jitsi Meet açılır, hastayı bekler veya görüşmeye başlar

## Dosya Yapısı

```
landing-page/
├── lib/
│   └── appointmentUtils.ts          # Zaman kontrolü ve oda adı fonksiyonları
├── components/
│   └── AppointmentNotificationCard.tsx  # Bildirim kartı bileşeni
├── app/
│   ├── video/
│   │   └── page.tsx                 # Jitsi video konferans sayfası
│   ├── appointment/
│   │   └── page.tsx                 # Randevu oluşturma (jitsiRoom eklenmiş)
│   └── dashboard/
│       └── page.tsx                 # Dashboard (bildirim kartları eklendi)
```

## Özellikler

✅ **Otomatik Zaman Kontrolü**: Her dakika kontrol edilir
✅ **Bildirim Kartları**: Randevu saati geldiğinde otomatik gösterilir
✅ **Benzersiz Oda Adları**: Her randevu için garantili benzersiz oda
✅ **Doktor ve Hasta Desteği**: Her iki taraf için de çalışır
✅ **Kart Kapatma**: Kullanıcılar bildirim kartını kapatabilir
✅ **Jitsi Entegrasyonu**: Tam özellikli video konferans

## Test Etme

1. **Randevu Oluştur**: Bir randevu oluşturun (gelecek bir tarih/saat)
2. **Randevuyu Onayla**: Doktor olarak randevuyu onaylayın
3. **Zamanı Ayarla**: Sistem saatini randevu saatine yakın bir zamana ayarlayın (veya bekleyin)
4. **Bildirim Kontrolü**: Dashboard'da bildirim kartının göründüğünü kontrol edin
5. **Görüşme Testi**: İki farklı tarayıcı/cihazda aynı oda adına katılın

## Notlar

- Jitsi Meet ücretsiz cloud servisi kullanıyor (`meet.jit.si`)
- İleride self-hosted Jitsi'ye geçilebilir
- Oda adları Firestore'da saklanır
- Bildirim kartları sadece aktif randevular için gösterilir
