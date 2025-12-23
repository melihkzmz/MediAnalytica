# Jitsi Meet Görüntülü Görüşme Test Rehberi

Bu rehber, iki cihaz arasında görüntülü görüşmeyi test etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

### 1. Backend API'yi Başlat
```bash
cd Skin-Disease-Classifier
source venv/bin/activate
python auth_api.py
```

Backend'in `http://localhost:5001` adresinde çalıştığından emin olun.

### 2. Frontend'i Aç
- `analyze.html` dosyasını tarayıcıda açın
- Giriş yapın (email doğrulanmış olmalı)

---

## 🧪 Test Senaryosu: İki Cihaz Arası Görüntülü Görüşme

### ✅ Otomatik Onaylama Aktif

**Not:** Randevular artık otomatik olarak onaylanıyor! Manuel onaylama gerekmiyor.

#### Adım 1: Randevu Oluştur (Cihaz 1)

1. `analyze.html` sayfasında **"Randevu Talep"** butonuna tıklayın
2. Formu doldurun:
   - **Tarih:** Bugünden sonraki bir tarih seçin
   - **Saat:** Uygun bir saat seçin
   - **Konu:** "Test görüşmesi"
   - **Doktor:** İstediğiniz doktor türünü seçin (opsiyonel)
3. **"Randevu Talep Et"** butonuna tıklayın
4. Başarı mesajını bekleyin: **"Randevunuz onaylandı! Görüntülü görüşmeye katılabilirsiniz."** (6 saniye görünecek)
5. Randevu otomatik olarak **"Onaylandı"** durumunda oluşturulur

#### Adım 2: Görüntülü Görüşmeye Katıl (Cihaz 1)

1. `analyze.html` sayfasında **"Randevularım"** butonuna tıklayın
2. Onaylanmış randevunuzu görün (yeşil "Onaylandı" rozeti)
3. **"Görüntülü Görüşmeye Katıl"** butonuna tıklayın
4. Jitsi Meet sayfası açılacak
5. **Kamera ve mikrofon izinlerini verin**
6. Görüntülü görüşme başlayacak

#### Adım 4: İkinci Cihazdan Katıl (Cihaz 2)

**Yöntem 1: Aynı Hesap ile (Kolay Test)**

1. İkinci cihazda (telefon, tablet veya başka bir tarayıcı) aynı hesap ile giriş yapın
2. **"Randevularım"** → Aynı randevuyu görün
3. **"Görüntülü Görüşmeye Katıl"** butonuna tıklayın
4. İki cihaz aynı Jitsi Meet room'una bağlanacak
5. Birbirini görebilir ve konuşabilirsiniz

**Yöntem 2: Jitsi Meet Linki ile (Gerçekçi Test)**

1. Cihaz 1'de Jitsi Meet sayfası açıkken
2. Tarayıcı adres çubuğundaki URL'i kopyalayın
   - Örnek: `http://localhost:63342/.../templates/appointment.html?id=abc123`
3. URL'den `id` parametresini alın (örnek: `abc123`)
4. Backend API'den Jitsi room bilgisini alın:
   ```bash
   curl -X GET "http://localhost:5001/api/appointments/abc123/join" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
5. Response'dan `jitsiUrl` değerini alın
6. Bu URL'i ikinci cihazda açın (örnek: `https://meet.jit.si/dermascan-xyz789`)
7. İkinci cihaz da aynı room'a katılacak

**Yöntem 3: Direkt Jitsi Meet Linki (En Kolay)**

1. Cihaz 1'de görüntülü görüşmeye katıldıktan sonra
2. Tarayıcı konsolunu açın (F12)
3. Şu komutu çalıştırın:
   ```javascript
   // Randevu ID'sini al
   const urlParams = new URLSearchParams(window.location.search);
   const appointmentId = urlParams.get('id');
   
   // API'den Jitsi URL'ini al
   fetch(`http://localhost:5001/api/appointments/${appointmentId}/join`, {
     headers: { 'Authorization': `Bearer ${await window.auth.currentUser.getIdToken()}` }
   })
   .then(r => r.json())
   .then(data => {
     console.log('Jitsi URL:', data.jitsiUrl);
     // Bu URL'i ikinci cihazda açın
   });
   ```
4. Konsolda görünen `jitsiUrl` değerini kopyalayın
5. İkinci cihazda bu URL'i açın
6. İki cihaz aynı room'da olacak

---

## ✅ Otomatik Onaylama

Randevular artık otomatik olarak onaylanıyor! Her randevu oluşturulduğunda `status: 'approved'` olarak kaydedilir ve kullanıcı hemen görüntülü görüşmeye katılabilir.

**Not:** Eğer gelecekte manuel onaylama sistemi eklemek isterseniz, `auth_api.py` dosyasındaki `create_appointment` fonksiyonunda `status = data.get("status", "approved")` satırını `status = data.get("status", "pending")` olarak değiştirebilirsiniz.

---

## 📱 Mobil Cihaz Testi

### Android/iOS'ta Test

1. Mobil cihazda tarayıcıyı açın
2. `analyze.html` sayfasına gidin
3. Giriş yapın
4. Randevu oluşturun veya mevcut randevuya katılın
5. Jitsi Meet mobil uyumlu olduğu için sorunsuz çalışacaktır

### Desktop + Mobil Test

1. **Desktop:** Bir tarayıcıda görüntülü görüşmeye katılın
2. **Mobil:** Aynı randevuya başka bir cihazdan katılın
3. İki cihaz birbirini görebilir ve konuşabilir

---

## ✅ Test Kontrol Listesi

- [ ] Backend API çalışıyor (`http://localhost:5001`)
- [ ] Randevu oluşturuldu (otomatik onaylandı)
- [ ] Başarı mesajı göründü: "Randevunuz onaylandı!"
- [ ] Cihaz 1'de görüntülü görüşmeye katıldım
- [ ] Kamera ve mikrofon izinleri verildi
- [ ] Cihaz 2'de aynı room'a katıldım
- [ ] İki cihaz birbirini görüyor
- [ ] Ses çalışıyor
- [ ] Ekran paylaşımı çalışıyor (opsiyonel)

---

## 🐛 Sorun Giderme

### Sorun: "Randevuya katılamadınız" hatası
- **Çözüm:** Randevular otomatik onaylanıyor, ancak hata alıyorsanız:
  - Backend API'nin çalıştığından emin olun
  - Randevu ID'sinin doğru olduğundan emin olun
  - Firebase Authentication token'ının geçerli olduğundan emin olun

### Sorun: Jitsi Meet sayfası açılmıyor
- **Çözüm:** 
  - Backend API'nin çalıştığından emin olun
  - Tarayıcı konsolunda hata var mı kontrol edin
  - CORS ayarlarını kontrol edin

### Sorun: İki cihaz birbirini göremiyor
- **Çözüm:**
  - Her iki cihazda da kamera izinlerinin verildiğinden emin olun
  - Aynı Jitsi Meet room ID'sine bağlandığınızdan emin olun
  - İnternet bağlantısını kontrol edin

### Sorun: Ses çalışmıyor
- **Çözüm:**
  - Mikrofon izinlerinin verildiğinden emin olun
  - Tarayıcı ayarlarından mikrofon erişimini kontrol edin
  - Ses seviyesini kontrol edin

---

## 🎯 Hızlı Test Komutu

Terminal'de şu komutu çalıştırarak randevu ID'sini ve Jitsi URL'ini hızlıca alabilirsiniz:

```bash
# Randevu ID'sini Firestore'dan alın, sonra:
curl -X GET "http://localhost:5001/api/appointments/RANDEVU_ID/join" \
  -H "Authorization: Bearer TOKEN"
```

Response'dan `jitsiUrl` değerini alıp ikinci cihazda açın.

---

## 📝 Notlar

- Jitsi Meet ücretsiz ve açık kaynaklıdır
- `meet.jit.si` servisi kullanılıyor (kendi Jitsi sunucunuzu da kurabilirsiniz)
- Room ID'ler benzersizdir ve her randevu için otomatik oluşturulur
- Görüntülü görüşme şifre korumalı değildir (production'da eklenebilir)

---

**İyi testler! 🎉**

