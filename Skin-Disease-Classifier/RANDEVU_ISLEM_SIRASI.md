# 📋 Randevu İşlem Sırası

## 🎯 Genel Akış

Bu doküman, hasta ve doktor arasındaki randevu sürecinin adım adım nasıl işlediğini açıklar.

---

## 📝 İşlem Adımları

### 1️⃣ Hasta Randevu Talep Eder

**Konum:** `analyze.html` → "Randevu Talep" bölümü

**Adımlar:**
1. Hasta, sol menüden **"Randevu Talep"** bölümüne gider
2. Randevu formunu doldurur:
   - **Tarih:** Bugünden itibaren (minimum 1 gün sonra)
   - **Saat:** 09:00 - 17:00 arası
   - **Doktor Türü:** Uzmanlık alanı seçer (Dermatolog, Ortopedist, vb.)
   - **Şikayet/Konu:** Randevu nedeni yazar
3. **"Randevu Talep Et"** butonuna tıklar
4. Backend'e `POST /api/appointments` isteği gönderilir
5. Randevu Firestore'a kaydedilir:
   - `status: 'pending'` (Beklemede)
   - `userId`: Hasta ID'si
   - `date`, `time`, `reason`, `doctorType` bilgileri
   - `jitsiRoom`: Otomatik oluşturulan Jitsi Meet room ID'si
6. Toast bildirimi gösterilir: **"Randevu talebiniz alındı! Onaylandığında size bildirim gönderilecektir."**
7. Form temizlenir ve 1.5 saniye sonra **"Randevularım"** bölümüne yönlendirilir

**Durum:** Randevu `pending` durumunda, doktor onayı bekliyor.

---

### 2️⃣ Doktor Randevuyu Görür ve Onaylar

**Konum:** `doctor-dashboard.html` → "Bekleyen Talepler" veya "Dashboard"

**Adımlar:**
1. Doktor, doktor paneline giriş yapar
2. **"Bekleyen Talepler"** bölümüne gider (veya Dashboard'da görür)
3. Bekleyen randevu taleplerini görür:
   - Tarih, saat, konu bilgileri
   - Hasta bilgileri
4. **"Onayla"** butonuna tıklar
5. Backend'e `POST /api/doctors/appointments/{id}/approve` isteği gönderilir
6. Backend randevuyu günceller:
   - `status: 'approved'` (Onaylandı)
   - `approvedAt: SERVER_TIMESTAMP` (Onaylanma zamanı kaydedilir)
   - `updatedAt: SERVER_TIMESTAMP`
7. Toast bildirimi gösterilir: **"Randevu onaylandı!"**

**Durum:** Randevu `approved` durumunda, görüntülü görüşmeye hazır.

---

### 3️⃣ Doktor Görüntülü Görüşmeye Katılır

**Konum:** `doctor-dashboard.html` → "Onaylanan Randevular"

**Adımlar:**
1. Doktor, **"Onaylanan Randevular"** bölümüne gider
2. **Sadece son 1 saat içinde onaylanan randevular** görüntülenir
   - Bu sayede doktor hemen onayladığı randevuya kolayca erişebilir
   - Eski randevular karışmaz
3. Onayladığı randevuyu bulur
4. **"Görüntülü Görüşmeye Katıl"** butonuna tıklar
5. `joinAppointment(appointmentId)` fonksiyonu çağrılır
6. Backend'e `GET /api/appointments/{id}/join` isteği gönderilir
7. Backend kontrol eder:
   - Randevu var mı?
   - Doktor onaylı mı?
   - Randevu onaylanmış mı?
8. Jitsi Meet URL'i döner: `https://meet.jit.si/{jitsiRoom}`
9. `appointment.html?id={appointmentId}` sayfasına yönlendirilir
10. Jitsi Meet iframe'i yüklenir
11. Doktor kamera ve mikrofon izinlerini verir
12. Görüntülü görüşme başlar

**Durum:** Doktor görüntülü görüşme odasında bekliyor.

---

### 4️⃣ Hasta Görüntülü Görüşmeye Katılır

**Konum:** `analyze.html` → "Randevularım" bölümü

**Adımlar:**
1. Hasta, **"Randevularım"** bölümüne gider
2. Randevu listesini görür
3. **Onaylanan randevular** için **"Görüntülü Görüşmeye Katıl"** butonu görünür
   - Sadece `status === 'approved'` olan randevular için buton gösterilir
4. **"Görüntülü Görüşmeye Katıl"** butonuna tıklar
5. `joinAppointment(appointmentId)` fonksiyonu çağrılır
6. Backend'e `GET /api/appointments/{id}/join` isteği gönderilir
7. Backend kontrol eder:
   - Randevu var mı?
   - Hasta randevu sahibi mi?
   - Randevu onaylanmış mı?
8. Jitsi Meet URL'i döner: `https://meet.jit.si/{jitsiRoom}`
   - **Aynı room ID'si** doktor ve hasta için aynıdır
9. `templates/appointment.html?id={appointmentId}` sayfasına yönlendirilir
10. Jitsi Meet iframe'i yüklenir
11. Hasta kamera ve mikrofon izinlerini verir
12. Görüntülü görüşme başlar

**Durum:** Hasta ve doktor aynı Jitsi Meet room'unda buluşur.

---

### 5️⃣ Görüntülü Görüşme

**Konum:** `templates/appointment.html`

**Özellikler:**
- Her iki taraf da birbirini görebilir
- Sesli iletişim kurabilir
- Ekran paylaşımı yapabilir (opsiyonel)
- Jitsi Meet'in tüm özelliklerini kullanabilir

**Durum:** Görüntülü görüşme devam ediyor.

---

### 6️⃣ Randevu Tamamlanır (Opsiyonel)

**Konum:** `doctor-dashboard.html` → "Onaylanan Randevular"

**Adımlar:**
1. Doktor, görüntülü görüşme bittikten sonra
2. **"Tamamlandı Olarak İşaretle"** butonuna tıklar
3. Backend'e `POST /api/doctors/appointments/{id}/complete` isteği gönderilir
4. Backend randevuyu günceller:
   - `status: 'completed'` (Tamamlandı)
   - `updatedAt: SERVER_TIMESTAMP`
5. Randevu artık "Randevu Geçmişi" bölümünde görünür

**Durum:** Randevu `completed` durumunda.

---

## 🔄 Özet Akış Şeması

```
1. Hasta → Randevu Talep Et → status: 'pending'
2. Doktor → Randevuyu Gör → Onayla → status: 'approved' + approvedAt timestamp
3. Doktor → Onaylanan Randevular (son 1 saat) → Görüntülü Görüşmeye Katıl → Jitsi Meet
4. Hasta → Randevularım → Onaylanan randevu → Görüntülü Görüşmeye Katıl → Aynı Jitsi Meet room
5. Her İkisi → Görüntülü Görüşme → Birbirlerini görür ve konuşur
6. Doktor → Tamamlandı Olarak İşaretle → status: 'completed'
```

---

## ✅ Önemli Notlar

### Doktor Paneli Filtreleme
- **"Onaylanan Randevular"** bölümünde sadece **son 1 saat içinde onaylanan randevular** gösterilir
- Bu sayede doktor hemen onayladığı randevuya kolayca erişebilir
- Eski randevular karışmaz ve doktorun işi kolaylaşır

### Hasta Paneli
- Hasta, **"Randevularım"** bölümünde tüm randevularını görür
- Sadece **onaylanan randevular** için **"Görüntülü Görüşmeye Katıl"** butonu görünür
- Bekleyen, reddedilen veya tamamlanan randevular için buton görünmez

### Jitsi Meet Room
- Her randevu için **benzersiz bir Jitsi Meet room ID'si** oluşturulur
- Format: `medianalytica-{appointmentId}`
- Doktor ve hasta **aynı room ID'sini** kullanır, bu sayede aynı görüntülü görüşme odasında buluşurlar

### Backend Kontrolleri
- **Doktor:** Onaylı doktor olmalı ve randevuya erişim yetkisi olmalı
- **Hasta:** Randevu sahibi olmalı ve randevu onaylanmış olmalı
- Her iki taraf da aynı Jitsi Meet room'una erişebilir

---

## 🐛 Sorun Giderme

### Problem: Hasta "Görüntülü Görüşmeye Katıl" butonunu görmüyor
**Çözüm:** Randevu onaylanmış mı kontrol edin. Sadece `status === 'approved'` olan randevular için buton görünür.

### Problem: Doktor randevuyu görmüyor
**Çözüm:** 
- Randevu onaylandıktan sonra **1 saat içinde** görünür
- "Onaylanan Randevular" bölümünde sadece son 1 saat içinde onaylanan randevular gösterilir
- Eski randevular için "Randevu Geçmişi" bölümüne bakın

### Problem: Görüntülü görüşmeye katılamıyor
**Çözüm:**
- Backend API'nin çalıştığından emin olun (`http://localhost:5001`)
- Kamera ve mikrofon izinlerini verin
- Jitsi Meet'in çalıştığından emin olun (`https://meet.jit.si`)

---

**İyi kullanımlar! 🚀**

