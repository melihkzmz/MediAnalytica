# Gemini AI için Use Case Diyagramı Promptu

Aşağıdaki promptu Gemini AI'ye göndererek projenin Use Case (Kullanım Durumu) diyagramını oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak bir Use Case (Kullanım Durumu) diyagramı çiz. Aşağıdaki bilgileri kullan:**

### Proje: MediAnalytica - Tıbbi Görüntü Analizi ve Tele-Tıp Platformu

### Aktörler (Actors):

1. **Hasta (Patient)**
2. **Doktor (Doctor)**
3. **Sistem (System)** - Otomatik işlemler için

### Use Case'ler (Kullanım Durumları):

**1. Kullanıcı Yönetimi (Hasta ve Doktor için ortak):**
- Kayıt Ol (Register)
- Giriş Yap (Login)
- Profil Güncelle (Update Profile)
- Çıkış Yap (Logout)

**2. Hasta Use Case'leri:**

**2.1. Görüntü Analizi:**
- Görüntü Yükle (Upload Image) - JPEG/PNG, max 10MB
- Hastalık Türü Seç (Select Disease Type) - Deri, Kemik, Akciğer
- Analiz Sonuçlarını Görüntüle (View Analysis Results)

**2.2. Analiz Geçmişi:**
- Analiz Geçmişini Görüntüle (View Analysis History)
- Hastalık Türüne Göre Filtrele (Filter by Disease Type)
- Tarihe Göre Filtrele (Filter by Date)
- Sayfalama ile Görüntüle (View with Pagination)

**2.3. Favoriler:**
- Favorilere Ekle (Add to Favorites)
- Favorileri Görüntüle (View Favorites)
- Favorilerden Kaldır (Remove from Favorites)

**2.4. İstatistikler:**
- Toplam Analiz Sayısını Gör (View Total Analysis Count)
- Hastalık Türüne Göre Analiz Sayılarını Gör (View Analysis Count by Type)
- En Çok Analiz Edilen Hastalık Türünü Gör (View Most Analyzed Type)
- Son Analiz Tarihini Gör (View Last Analysis Date)

**2.5. PDF Rapor:**
- PDF Rapor İndir (Download PDF Report) - Analiz sonuçları ve görüntüyü içerir

**2.6. Doktor Randevusu:**
- Randevu Talep Et (Request Appointment)
- Randevu Tarihi ve Saati Seç (Select Date and Time)
- Randevu Nedenini Belirt (Specify Appointment Reason)
- Doktor Uzmanlık Alanı Seç (Select Doctor Specialty)

**2.7. Görüntülü Görüşme:**
- Görüntülü Görüşmeye Katıl (Join Video Call) - Onaylanmış randevular için
- Görüntülü Görüşme Linkini Paylaş (Share Video Call Link)

**3. Doktor Use Case'leri:**

**3.1. Doktor Kayıt:**
- Doktor Kayıt Ol (Doctor Register) - Uzmanlık, diploma, deneyim bilgileri ile

**3.2. Randevu Yönetimi:**
- Randevuları Görüntüle (View Appointments)
- Randevu Onayla (Approve Appointment)
- Randevu Reddet (Reject Appointment)

**3.3. Görüntülü Görüşme:**
- Görüntülü Görüşmeye Katıl (Join Video Call) - Onaylanmış randevular için

**4. Sistem Use Case'leri:**
- Uygun Modeli Yükle (Load Appropriate Model) - Seçilen hastalık türüne göre
- Görüntüyü Analiz Et (Analyze Image)
- Analiz Sonuçlarını Kaydet (Save Analysis Results)
- Benzersiz Jitsi Oda ID'si Oluştur (Generate Unique Jitsi Room ID)

### İlişkiler (Relationships):

**Include (Dahil Etme) İlişkileri:**
- "Analiz Sonuçlarını Görüntüle" includes "Uygun Modeli Yükle"
- "Analiz Sonuçlarını Görüntüle" includes "Görüntüyü Analiz Et"
- "Analiz Sonuçlarını Görüntüle" includes "Analiz Sonuçlarını Kaydet"
- "Randevu Talep Et" includes "Benzersiz Jitsi Oda ID'si Oluştur"

**Genelleme (Generalization) İlişkileri:**
- Hasta ve Doktor, "Kullanıcı" genel aktöründen türetilebilir (isteğe bağlı)

**Diyagram Yapısı:**
- Aktörler diyagramın dışında (sol, sağ, alt)
- Use Case'ler oval (elips) şeklinde sistem sınırı içinde
- Aktör-Use Case ilişkileri düz çizgi
- Include ilişkileri noktalı ok ile "<include>" etiketi
- Sistem sınırı kutusu içinde tüm Use Case'ler

**Önemli Notlar:**
- Hastalık türleri: Deri, Kemik, Akciğer (Göz hastalığı yok)
- Görüntülü görüşme Jitsi Meet kullanıyor
- Hasta ve Doktor, görüntülü görüşmeye katılma use case'ini paylaşıyor

---

**Yukarıdaki bilgilere göre UML standartlarına uygun, Türkçe etiketli bir Use Case diyagramı çiz. Tüm aktörler, use case'ler ve ilişkiler net bir şekilde gösterilmelidir.**
