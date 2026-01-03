# Jitsi Video Conference Testing Guide

## Test Senaryoları

### Senaryo 1: Randevu Oluşturma ve Oda Adı Oluşturma

**Adımlar:**
1. Hasta olarak giriş yapın
2. "Randevu Talep" sekmesine gidin
3. Bir randevu oluşturun:
   - Tarih: Bugünden 1-2 gün sonra
   - Saat: Örneğin 14:00
   - Doktor türü seçin
   - Randevu nedeni yazın
4. "Randevu Oluştur" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Başarı mesajı görünür
- ✅ Firestore'da `appointments` koleksiyonunda yeni doküman oluşur
- ✅ `jitsiRoom` alanı otomatik oluşturulur (format: `medi-analytica-{appointmentId}`)

**Kontrol:**
```javascript
// Firebase Console → Firestore → appointments koleksiyonu
// Yeni randevu dokümanında jitsiRoom alanını kontrol edin
```

---

### Senaryo 2: Doktor Randevu Onaylama

**Adımlar:**
1. Doktor olarak giriş yapın
2. "Bekleyen Randevularım" sekmesine gidin
3. Yeni oluşturulan randevuyu görün
4. "Onayla" butonuna tıklayın

**Beklenen Sonuç:**
- ✅ Randevu durumu "approved" olur
- ✅ `doctorId` alanı doktorun UID'si ile doldurulur
- ✅ `jitsiRoom` alanı varsa korunur, yoksa oluşturulur
- ✅ Randevu "Randevularım" sekmesine taşınır

**Kontrol:**
```javascript
// Firebase Console → Firestore → appointments
// Randevu dokümanında:
// - status: "approved"
// - doctorId: {doctor_uid}
// - jitsiRoom: "medi-analytica-{appointmentId}"
```

---

### Senaryo 3: Randevu Saati Geldiğinde Bildirim Kartı

**Hazırlık:**
1. Bir randevu oluşturun ve onaylayın
2. Randevu tarihini bugüne, saatini şu anki saatten 5-10 dakika sonrasına ayarlayın
   - Örnek: Şu an 14:00 ise, randevuyu 14:05'e ayarlayın

**Test Adımları:**

#### Hasta Tarafı:
1. Hasta olarak dashboard'a gidin
2. Randevu saatine kadar bekleyin (veya sistem saatini değiştirin)
3. Dashboard'u yenileyin

**Beklenen Sonuç:**
- ✅ Ekranın üst kısmında mavi-mor gradient bir bildirim kartı görünür
- ✅ Mesaj: "Randevu saatiniz gelmiştir. Görüntülü görüşmek için lobiye katılın:"
- ✅ Randevu tarihi ve saati gösterilir
- ✅ "Görüntülü Görüşmeye Katıl" butonu görünür
- ✅ X butonu ile kart kapatılabilir

#### Doktor Tarafı:
1. Doktor olarak dashboard'a gidin
2. Randevu saatine kadar bekleyin
3. Dashboard'u yenileyin

**Beklenen Sonuç:**
- ✅ Aynı bildirim kartı görünür
- ✅ Ek olarak hasta bilgileri gösterilir (ad, e-posta)
- ✅ Randevu nedeni gösterilir

**Not:** Sistem her dakika kontrol eder, bu yüzden 1 dakika içinde kart görünmelidir.

---

### Senaryo 4: Video Görüşmesine Katılma

**Hazırlık:**
1. İki farklı tarayıcı/cihaz hazırlayın:
   - Tarayıcı 1: Hasta hesabı
   - Tarayıcı 2: Doktor hesabı
2. Randevu saati geldiğinde her iki tarafta da bildirim kartı görünmeli

**Test Adımları:**

#### Adım 1: Hasta Katılımı
1. Hasta tarayıcısında "Görüntülü Görüşmeye Katıl" butonuna tıklayın
2. `/video?room={roomName}&appointmentId={id}` sayfasına yönlendirilir
3. Jitsi Meet yüklenir

**Beklenen Sonuç:**
- ✅ Video konferans sayfası açılır
- ✅ Jitsi Meet arayüzü görünür
- ✅ Kullanıcı adı doğru gösterilir
- ✅ Kamera ve mikrofon izinleri istenir
- ✅ "Odaya katılıyorsunuz" mesajı görünür

#### Adım 2: Doktor Katılımı
1. Doktor tarayıcısında "Görüntülü Görüşmeye Katıl" butonuna tıklayın
2. Aynı oda adına yönlendirilir

**Beklenen Sonuç:**
- ✅ Her iki kullanıcı da aynı odada görünür
- ✅ Video ve ses çalışır
- ✅ Birbirlerini görebilir ve duyabilirler

---

### Senaryo 5: Video Görüşmesi Özellikleri

**Test Edilecek Özellikler:**

1. **Kamera Kontrolü:**
   - ✅ Kamera açma/kapama butonu çalışır
   - ✅ Video görüntüsü görünür

2. **Mikrofon Kontrolü:**
   - ✅ Mikrofon açma/kapama butonu çalışır
   - ✅ Ses iletimi çalışır

3. **Ekran Paylaşımı:**
   - ✅ "Ekran Paylaş" butonu çalışır
   - ✅ Ekran paylaşımı başlatılabilir

4. **Sohbet:**
   - ✅ Sohbet özelliği çalışır
   - ✅ Mesajlar gönderilebilir

5. **Görüşmeyi Sonlandırma:**
   - ✅ "Görüşmeyi Sonlandır" butonu çalışır
   - ✅ Dashboard'a geri yönlendirilir

---

## Hızlı Test Yöntemi (Sistem Saatini Değiştirme)

### Yöntem 1: Randevu Tarihini Yakın Geleceğe Ayarlama

1. **Randevu Oluştur:**
   - Tarih: Bugün
   - Saat: Şu anki saatten 2-3 dakika sonra
   - Örnek: Şu an 14:00 ise → 14:02

2. **Randevuyu Onayla**

3. **2-3 Dakika Bekle** veya sistem saatini ileri al

4. **Dashboard'u Yenile** → Bildirim kartı görünmeli

### Yöntem 2: Zaman Kontrol Fonksiyonunu Geçici Olarak Değiştirme

**Geliştirme için:** `landing-page/lib/appointmentUtils.ts` dosyasında:

```typescript
// Geçici test için - her zaman true döndür
export function isAppointmentTime(appointment: {
  date: string
  time: string
}): boolean {
  // TEST MODE: Her zaman true döndür
  return true
  
  // Normal kod:
  // const now = new Date()
  // ...
}
```

**Dikkat:** Test sonrası normal koda geri dönün!

---

## Test Checklist

### Randevu Oluşturma
- [ ] Randevu başarıyla oluşturuldu
- [ ] `jitsiRoom` alanı otomatik oluşturuldu
- [ ] Firestore'da doğru kaydedildi

### Randevu Onaylama
- [ ] Doktor randevuyu görebiliyor
- [ ] "Onayla" butonu çalışıyor
- [ ] `jitsiRoom` alanı korunuyor/oluşturuluyor
- [ ] Randevu "Randevularım" sekmesine taşınıyor

### Bildirim Kartı
- [ ] Randevu saati geldiğinde kart görünüyor
- [ ] Hem hasta hem doktor için çalışıyor
- [ ] Doğru mesaj gösteriliyor
- [ ] Randevu bilgileri doğru
- [ ] X butonu ile kapatılabiliyor

### Video Görüşmesi
- [ ] "Katıl" butonu çalışıyor
- [ ] Video sayfası açılıyor
- [ ] Jitsi Meet yükleniyor
- [ ] Her iki kullanıcı da aynı odaya katılabiliyor
- [ ] Video çalışıyor
- [ ] Ses çalışıyor
- [ ] Ekran paylaşımı çalışıyor
- [ ] Görüşme sonlandırılabiliyor

---

## Yaygın Sorunlar ve Çözümleri

### Sorun 1: Bildirim Kartı Görünmüyor

**Olası Nedenler:**
- Randevu saati henüz gelmedi
- Randevu durumu "approved" değil
- Sistem kontrolü henüz çalışmadı (1 dakika bekle)

**Çözüm:**
- Dashboard'u yenileyin
- Randevu saatini kontrol edin
- Firestore'da randevu durumunu kontrol edin

### Sorun 2: Video Sayfası Açılmıyor

**Olası Nedenler:**
- `jitsiRoom` alanı eksik
- URL parametreleri yanlış

**Çözüm:**
- Firestore'da `jitsiRoom` alanını kontrol edin
- Browser console'da hata mesajlarını kontrol edin

### Sorun 3: Jitsi Meet Yüklenmiyor

**Olası Nedenler:**
- İnternet bağlantısı sorunu
- Jitsi servisi geçici olarak kapalı
- Tarayıcı izinleri (kamera/mikrofon)

**Çözüm:**
- İnternet bağlantısını kontrol edin
- Tarayıcı izinlerini kontrol edin
- Farklı bir tarayıcı deneyin
- Jitsi Meet'i doğrudan test edin: https://meet.jit.si

### Sorun 4: Kullanıcılar Birbirini Göremiyor

**Olası Nedenler:**
- Farklı oda adlarına katılmışlar
- Kamera izinleri verilmemiş
- Ağ sorunu

**Çözüm:**
- Her iki tarafta da oda adını kontrol edin (URL'de `room=` parametresi)
- Kamera izinlerini kontrol edin
- Tarayıcı console'da hata mesajlarını kontrol edin

---

## Test Ortamları

### Yerel Test (localhost)
```bash
cd landing-page
npm run dev
```
- Hasta: http://localhost:3000
- Doktor: http://localhost:3000 (farklı tarayıcı/incognito)

### Production Test (Vercel)
- Hasta: https://medi-analytica.vercel.app
- Doktor: https://medi-analytica.vercel.app (farklı tarayıcı/cihaz)

### Mobil Test
- iOS Safari
- Android Chrome
- Her iki cihazda da test edin

---

## Debug İpuçları

### Browser Console Kontrolü
```javascript
// Console'da kontrol edin:
console.log('Active appointments:', activeAppointments)
console.log('Room name:', roomName)
console.log('Appointment:', appointment)
```

### Firestore Kontrolü
1. Firebase Console → Firestore Database
2. `appointments` koleksiyonunu açın
3. Randevu dokümanını kontrol edin:
   - `jitsiRoom` alanı var mı?
   - `status` "approved" mi?
   - `date` ve `time` doğru mu?

### Network Tab Kontrolü
1. Browser DevTools → Network tab
2. Video sayfasını açın
3. Jitsi isteklerini kontrol edin
4. Hata varsa (4xx, 5xx) detaylarına bakın

---

## Test Senaryosu Özeti

### Minimum Test (5 dakika):
1. ✅ Randevu oluştur (bugün, 2 dakika sonra)
2. ✅ Doktor olarak onayla
3. ✅ 2 dakika bekle
4. ✅ Dashboard'u yenile → Bildirim kartı görünmeli
5. ✅ "Katıl" butonuna tıkla → Video açılmalı

### Tam Test (15 dakika):
1. ✅ Randevu oluştur
2. ✅ Doktor onayla
3. ✅ Bildirim kartı kontrolü
4. ✅ Video görüşmesi (her iki taraf)
5. ✅ Video özellikleri (kamera, mikrofon, ekran paylaşımı)
6. ✅ Görüşme sonlandırma
7. ✅ Mobil cihazlarda test

---

## Sonuç

Test tamamlandığında:
- ✅ Randevu oluşturma çalışıyor
- ✅ Bildirim kartları görünüyor
- ✅ Video görüşmesi başlatılabiliyor
- ✅ Her iki kullanıcı da bağlanabiliyor
- ✅ Video ve ses çalışıyor

Herhangi bir sorun varsa, yukarıdaki "Yaygın Sorunlar" bölümüne bakın veya console hatalarını kontrol edin.
