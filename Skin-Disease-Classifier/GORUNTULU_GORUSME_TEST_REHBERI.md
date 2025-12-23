# 📹 Görüntülü Görüşme Test Rehberi

## 🎯 Test Senaryosu: Normal Kullanıcı ve Doktor

Bu rehber, hem normal kullanıcı hem de doktor olarak görüntülü görüşmeyi test etmek için adımları içerir.

---

## 📋 Ön Hazırlık

### 1. Backend API'yi Başlat
```bash
cd Skin-Disease-Classifier
source venv/bin/activate
python3 auth_api.py
```

Backend'in çalıştığından emin olun: `http://localhost:5001`

---

## 🧪 Test Adımları

### Adım 1: Normal Kullanıcı Olarak Randevu Oluştur

1. **Tarayıcı Sekmesi 1** açın (Chrome, Firefox, Safari)
2. `analyze.html` sayfasını açın
3. Normal kullanıcı hesabıyla giriş yapın
4. Sol menüden **"Randevu Talep"** bölümüne gidin
5. Randevu formunu doldurun:
   - **Tarih:** Bugün veya yarın
   - **Saat:** Herhangi bir saat
   - **Doktor Türü:** Herhangi bir uzmanlık
   - **Şikayet/Konu:** Test mesajı
6. **"Randevu Talep Et"** butonuna tıklayın
7. Başarı mesajını görünce, **"Randevularıma Dön"** butonuna tıklayın
8. Oluşturduğunuz randevuyu bulun ve **"Görüntülü Görüşmeye Katıl"** butonuna tıklayın
9. Görüntülü görüşme sayfası açılacak (Jitsi Meet)

---

### Adım 2: Doktor Olarak Aynı Randevuya Katıl

1. **Tarayıcı Sekmesi 2** açın (Yeni bir sekme veya farklı tarayıcı)
2. `templates/doctor-dashboard.html` sayfasını açın
3. Doktor hesabıyla giriş yapın
4. Sol menüden **"Onaylanan Randevular"** bölümüne gidin
5. Adım 1'de oluşturduğunuz randevuyu bulun
6. **"Görüşmeye Katıl"** veya **"Görüntülü Görüşmeye Katıl"** butonuna tıklayın
7. Görüntülü görüşme sayfası açılacak (Aynı Jitsi Meet room)

---

### Adım 3: Görüntülü Görüşmeyi Test Et

1. **Sekme 1'de (Normal Kullanıcı):**
   - Kamera ve mikrofon izinlerini verin
   - Kendi görüntünüzü görmelisiniz

2. **Sekme 2'de (Doktor):**
   - Kamera ve mikrofon izinlerini verin
   - Kendi görüntünüzü görmelisiniz

3. **Her iki sekmede de:**
   - Birbirlerini görebilmeli
   - Sesli iletişim kurabilmeli
   - Ekran paylaşımı yapabilmeli (opsiyonel)

---

## 🔧 Alternatif Test Yöntemleri

### Yöntem 1: İki Farklı Tarayıcı Kullan
- **Sekme 1:** Chrome'da normal kullanıcı
- **Sekme 2:** Firefox'ta doktor

### Yöntem 2: Gizli/Özel Sekme Kullan
- **Sekme 1:** Normal sekme (normal kullanıcı)
- **Sekme 2:** Gizli sekme (doktor)

### Yöntem 3: İki Farklı Cihaz
- **Cihaz 1:** Bilgisayar (normal kullanıcı)
- **Cihaz 2:** Telefon/Tablet (doktor)

---

## 🐛 Sorun Giderme

### Problem: "Bu randevu size ait değil" hatası
**Çözüm:** Backend API'yi yeniden başlatın ve doktor hesabının onaylı olduğundan emin olun.

### Problem: Görüntülü görüşme açılmıyor
**Çözüm:** 
- Tarayıcı konsolunu kontrol edin (F12)
- Kamera ve mikrofon izinlerini kontrol edin
- Jitsi Meet'in çalıştığından emin olun: `https://meet.jit.si`

### Problem: İki sekme birbirini görmüyor
**Çözüm:**
- Her iki sekmede de kamera ve mikrofon izinlerini verin
- Aynı Jitsi Meet room'una bağlı olduklarından emin olun
- İnternet bağlantınızı kontrol edin

---

## ✅ Başarı Kriterleri

Test başarılı sayılır eğer:
- ✅ Normal kullanıcı randevu oluşturabiliyor
- ✅ Doktor randevuyu görebiliyor
- ✅ Her ikisi de görüntülü görüşmeye katılabiliyor
- ✅ Birbirlerini görebiliyor ve duyabiliyorlar
- ✅ Aynı Jitsi Meet room'unda buluşuyorlar

---

## 📝 Notlar

- Randevular otomatik olarak `approved` durumunda oluşturulur
- Doktorlar, onaylı randevulara her zaman katılabilir
- Normal kullanıcılar sadece kendi randevularına katılabilir
- Jitsi Meet ücretsiz ve herhangi bir kayıt gerektirmez

---

## 🎬 Hızlı Test (2 Dakika)

1. **Sekme 1:** Normal kullanıcı → Randevu oluştur → Katıl
2. **Sekme 2:** Doktor → Onaylanan randevular → Katıl
3. **Her ikisi:** Kamera/mikrofon izni ver → Test et!

---

**İyi testler! 🚀**

