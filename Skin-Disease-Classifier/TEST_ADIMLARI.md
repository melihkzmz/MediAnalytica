# 🧪 Görüntülü Görüşme Test Adımları

## 🚀 Backend Başlatıldı

Backend API şu anda çalışıyor: `http://localhost:5001`

---

## 📱 İki Ayrı Tarayıcıda Test

### 🖥️ TARAYICI 1: Normal Kullanıcı (Hasta)

**Açılacak Sayfa:**
```
Skin-Disease-Classifier/analyze.html
```

**Adımlar:**
1. Normal kullanıcı hesabıyla giriş yap
2. Sol menüden **"Randevu Talep"** bölümüne git
3. Randevu formunu doldur:
   - **Tarih:** Bugünden itibaren (minimum 1 gün sonra)
   - **Saat:** Herhangi bir saat (09:00 - 17:00)
   - **Doktor Türü:** Herhangi bir uzmanlık seç
   - **Şikayet/Konu:** Test mesajı yaz
4. **"Randevu Talep Et"** butonuna tıkla
5. Toast bildirimi görünecek: "Randevu talebiniz alındı!"
6. **"Randevularım"** bölümüne git
7. Randevu **"Beklemede"** durumunda görünecek
8. **Doktor onaylayana kadar bekle...**

---

### 👨‍⚕️ TARAYICI 2: Doktor

**Açılacak Sayfa:**
```
Skin-Disease-Classifier/templates/doctor-dashboard.html
```

**Adımlar:**
1. Doktor hesabıyla giriş yap
2. **"Bekleyen Talepler"** bölümüne git (veya Dashboard'da gör)
3. Hasta tarafından oluşturulan randevuyu gör
4. **"Onayla"** butonuna tıkla
5. Alert: "Randevu onaylandı!"
6. **"Onaylanan Randevular"** bölümüne git
7. Son 1 saat içinde onaylanan randevu görünecek
8. **"Görüntülü Görüşmeye Katıl"** butonuna tıkla
9. Jitsi Meet sayfası açılacak
10. Kamera ve mikrofon izinlerini ver
11. Görüntülü görüşme odasında bekle

---

### 🔄 TARAYICI 1'e Dön: Normal Kullanıcı (Hasta)

**Şimdi:**
1. **"Randevularım"** bölümünde olmalısın
2. Sayfa otomatik yenileniyor (her 5 saniyede bir)
3. Randevu durumu **"Onaylandı"** olarak değişecek
4. **"Görüntülü Görüşmeye Katıl"** butonu görünecek
5. Butona tıkla
6. Jitsi Meet sayfası açılacak
7. Kamera ve mikrofon izinlerini ver
8. **Doktoru görebilir ve konuşabilirsin!** 🎉

---

## ✅ Başarı Kriterleri

- ✅ Hasta randevu oluşturabiliyor
- ✅ Doktor randevuyu görebiliyor ve onaylayabiliyor
- ✅ Doktor "Onaylanan Randevular" bölümünde randevuyu görüyor
- ✅ Hasta "Randevularım" bölümünde onaylanan randevuyu görüyor
- ✅ Her iki tarafta da "Görüntülü Görüşmeye Katıl" butonu görünüyor
- ✅ Her iki taraf da aynı Jitsi Meet room'una bağlanabiliyor
- ✅ Birbirlerini görebiliyor ve konuşabiliyorlar

---

## 🐛 Sorun Giderme

### Problem: Doktor "Son 1 saat içinde onaylanan randevu yok" diyor
**Çözüm:**
- Backend'i yeniden başlat
- Tarayıcı cache'ini temizle (Ctrl+Shift+R veya Cmd+Shift+R)
- Console'u kontrol et (F12)

### Problem: Hasta "Görüntülü Görüşmeye Katıl" butonunu görmüyor
**Çözüm:**
- Randevu onaylandı mı kontrol et
- "Randevularım" bölümünde sayfayı yenile (F5)
- Otomatik yenileme çalışıyor mu kontrol et (5 saniye bekle)

### Problem: Görüntülü görüşmeye katılamıyor
**Çözüm:**
- Backend API çalışıyor mu kontrol et: `http://localhost:5001`
- Kamera ve mikrofon izinlerini ver
- Jitsi Meet çalışıyor mu kontrol et: `https://meet.jit.si`

---

## 📝 Notlar

- Backend API: `http://localhost:5001` (çalışıyor)
- Jitsi Meet: `https://meet.jit.si` (ücretsiz, kayıt gerekmez)
- Otomatik yenileme: Hasta panelinde her 5 saniyede bir
- Timestamp: Backend'den gelen `approvedAt` timestamp'i doğru parse ediliyor

---

**İyi testler! 🚀**

