# Gemini AI için Veri Akışı Diyagramı (Sequence Diagram) Promptu

Aşağıdaki promptu Gemini AI'ye göndererek mevcut projenin veri akışı sequence diyagramlarını oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak dört adet sequence (sıralı) diyagram çiz. Tüm diyagramlar aynı görselde, alt alta dört ayrı bölüm halinde gösterilsin. Aşağıdaki detaylı açıklamayı takip et:**

### Proje: MediAnalytica - Tıbbi Görüntü Analizi ve Tele-Tıp Platformu

**DİYAGRAM YAPISI:**
- 4 adet sequence diagram aynı görselde
- Her biri ayrı bölüm olarak, alt alta sıralı
- Her diyagram için başlık ve açıklama
- Türkçe etiketler ve açıklamalar

---

## 1. GİRİŞ/ÇIKIŞ AKIŞI (Login/Logout Flow)

**Katılımcılar (Soldan Sağa):**
- Kullanıcı (Frontend)
- Firebase Authentication
- Firebase Firestore (opsiyonel - kayıt için)

**Giriş Akışı:**
1. Kullanıcı → Frontend: Email ve şifre girer
2. Frontend → Firebase Authentication: `signInWithEmailAndPassword(email, password)` çağrısı
3. Firebase Authentication → Frontend: ID Token döndürür
4. Frontend: Token'ı localStorage'a kaydeder
5. Frontend: Kullanıcıyı dashboard sayfasına yönlendirir

**Çıkış Akışı:**
1. Kullanıcı → Frontend: Çıkış butonuna tıklar
2. Frontend → Firebase Authentication: `signOut()` çağrısı
3. Firebase Authentication → Frontend: Çıkış onayı
4. Frontend: Token'ı localStorage'dan siler
5. Frontend: Kullanıcıyı ana sayfaya yönlendirir

**Kayıt Akışı (Opsiyonel - diyagrama dahil edilebilir):**
1. Kullanıcı → Frontend: Kayıt formunu doldurur (email, şifre, ad, kullanıcı tipi)
2. Frontend → Firebase Authentication: `createUserWithEmailAndPassword(email, password)` çağrısı
3. Firebase Authentication → Frontend: Yeni kullanıcı ve ID Token döndürür
4. Frontend → Firebase Firestore: Kullanıcı bilgilerini `users` koleksiyonuna kaydeder (eğer doktor ise `doctors` koleksiyonuna da)
5. Frontend: Token'ı localStorage'a kaydeder
6. Frontend: Kullanıcıyı dashboard sayfasına yönlendirir

**Protokol:** HTTPS, Firebase Authentication SDK

---

## 2. GÖRÜNTÜ ANALİZİ AKIŞI (Image Analysis Flow)

**Katılımcılar (Soldan Sağa):**
- Kullanıcı (Frontend)
- Backend API (Flask RESTful API veya Hugging Face Spaces)
- AI Model (TensorFlow/Keras)
- Firebase Storage
- Firebase Firestore

**Akış Adımları:**
1. Kullanıcı → Frontend: Görüntü yükler ve hastalık türü seçer (deri, kemik, akciğer)
2. Frontend: Görüntüyü compress eder ve FormData oluşturur
3. Frontend → Backend API: POST isteği gönderir (`/predict/{diseaseType}` veya Hugging Face Space URL)
   - Request: FormData (image file)
   - Headers: Content-Type: multipart/form-data
4. Backend API: Görüntüyü alır ve preprocess eder
5. Backend API → AI Model: Preprocessed görüntüyü modele gönderir
6. AI Model → Backend API: Analiz sonuçlarını döndürür (tahmin sınıfı, confidence skorları)
7. Backend API → Frontend: JSON formatında analiz sonuçlarını döndürür
   - Response: { prediction, confidence, top_3, all_predictions }
8. Frontend: Sonuçları kullanıcı arayüzünde gösterir
9. Frontend → Firebase Storage: Görüntüyü yükler (`analyses/{analysisId}/image`)
10. Firebase Storage → Frontend: Görüntü URL'ini döndürür
11. Frontend → Firebase Firestore: Analiz sonuçlarını `analyses` koleksiyonuna kaydeder
    - Data: { userId, diseaseType, results, topPrediction, imageUrl, createdAt }
12. Firebase Firestore → Frontend: Kayıt onayı

**Notlar:**
- Backend API yerel Flask API olabilir veya Hugging Face Spaces üzerinde deploy edilmiş olabilir
- Next.js API proxy route kullanılıyorsa: Frontend → Next.js API Route → Hugging Face Space → Backend API
- Protokol: HTTP/HTTPS, JSON (response), multipart/form-data (request)

---

## 3. ANALİZ GEÇMİŞİ AKIŞI (Analysis History Flow)

**Katılımcılar (Soldan Sağa):**
- Kullanıcı (Frontend)
- Firebase Firestore
- Backend API (Opsiyonel - alternatif yol)

**Ana Akış (Doğrudan Firestore Erişimi):**
1. Kullanıcı → Frontend: Analiz geçmişi sayfasına gider
2. Frontend → Firebase Firestore: Kullanıcının analizlerini sorgular
   - Query: `analyses` koleksiyonu, `userId == currentUser.uid`, `orderBy('createdAt', 'desc')`
   - Firebase Client SDK kullanır
3. Firebase Firestore → Frontend: Analiz listesini döndürür
   - Data: Array of { analysisId, diseaseType, topPrediction, confidence, imageUrl, createdAt, ... }
4. Frontend: Analizleri kullanıcı arayüzünde listeler
5. Kullanıcı → Frontend: Belirli bir analizi detaylı görüntülemek için tıklar
6. Frontend: Analiz detaylarını gösterir (tüm tahminler, confidence skorları, görüntü)

**Alternatif Akış (Backend API Üzerinden - Opsiyonel):**
1. Kullanıcı → Frontend: Analiz geçmişi sayfasına gider
2. Frontend → Backend API: GET isteği gönderir (`/api/user/analyses`)
   - Headers: Authorization: Bearer {token}
3. Backend API: Token'ı doğrular
4. Backend API → Firebase Firestore: Kullanıcının analizlerini sorgular
5. Firebase Firestore → Backend API: Analiz listesini döndürür
6. Backend API → Frontend: JSON formatında analiz listesini döndürür
7. Frontend: Analizleri kullanıcı arayüzünde listeler

**Notlar:**
- Ana akış doğrudan Firebase Client SDK kullanımıdır
- Protokol: Firebase SDK (WebSocket-like real-time connection) veya HTTP/HTTPS, JSON

---

## 4. RANDEVU VE GÖRÜNTÜLÜ GÖRÜŞME AKIŞI (Appointment and Video Consultation Flow)

**Katılımcılar (Soldan Sağa):**
- Hasta (Frontend)
- Doktor (Frontend)
- Firebase Firestore
- Backend API (Opsiyonel - randevu onaylama için)
- Jitsi Meet / Daily.co / 8x8 (Video Konferans Servisi)

**Randevu Oluşturma Akışı (Hasta):**
1. Hasta → Frontend: Randevu formunu doldurur (tarih, saat, doktor türü, şikayet)
2. Frontend → Firebase Firestore: Randevu talebini `appointments` koleksiyonuna kaydeder
   - Data: { userId, date, time, doctorType, reason, status: 'pending', jitsiRoom: generatedRoomName, createdAt }
3. Firebase Firestore → Frontend: Randevu ID'sini döndürür
4. Frontend: Hasta'ya "Randevu talebiniz alındı" bildirimi gösterir

**Randevu Onaylama Akışı (Doktor):**
1. Doktor → Frontend: Bekleyen randevular listesini görüntüler
2. Frontend → Firebase Firestore: `appointments` koleksiyonundan `status == 'pending'` olanları sorgular
3. Firebase Firestore → Frontend: Bekleyen randevular listesini döndürür
4. Doktor → Frontend: Bir randevuyu onaylamak için "Onayla" butonuna tıklar
5. Frontend → Firebase Firestore: Randevu dokümanını günceller
   - Update: { status: 'approved', doctorId: currentDoctor.uid, approvedAt: serverTimestamp(), updatedAt: serverTimestamp() }
6. Firebase Firestore → Frontend: Güncelleme onayı
7. Frontend: Doktor'a "Randevu onaylandı" bildirimi gösterir

**Görüntülü Görüşmeye Katılma Akışı (Doktor):**
1. Doktor → Frontend: Onaylanan randevular listesine gider
2. Frontend → Firebase Firestore: `status == 'approved'` ve `approvedAt` son 1 saat içinde olan randevuları sorgular
3. Firebase Firestore → Frontend: Randevu bilgilerini döndürür (jitsiRoom dahil)
4. Doktor → Frontend: "Görüntülü Görüşmeye Katıl" butonuna tıklar
5. Frontend → Jitsi Meet / Daily.co / 8x8: WebRTC bağlantısı başlatır
   - Room ID: Randevu'dan alınan `jitsiRoom` değeri
6. Jitsi Meet / Daily.co / 8x8 → Doktor: Kamera ve mikrofon izni ister
7. Doktor → Jitsi Meet / Daily.co / 8x8: İzinleri verir
8. Jitsi Meet / Daily.co / 8x8: Görüntülü görüşme odasını açar

**Görüntülü Görüşmeye Katılma Akışı (Hasta):**
1. Hasta → Frontend: "Randevularım" bölümüne gider
2. Frontend → Firebase Firestore: Hasta'nın randevularını sorgular (`userId == currentUser.uid`)
3. Firebase Firestore → Frontend: Randevu listesini döndürür
4. Hasta → Frontend: Onaylanmış bir randevu için "Görüntülü Görüşmeye Katıl" butonuna tıklar
   - Sadece `status == 'approved'` olan randevular için buton görünür
5. Frontend → Firebase Firestore: Randevu detaylarını alır (jitsiRoom dahil)
6. Firebase Firestore → Frontend: Randevu bilgilerini döndürür
7. Frontend → Jitsi Meet / Daily.co / 8x8: WebRTC bağlantısı başlatır
   - Room ID: Randevu'dan alınan `jitsiRoom` değeri (Doktor ile aynı room)
8. Jitsi Meet / Daily.co / 8x8 → Hasta: Kamera ve mikrofon izni ister
9. Hasta → Jitsi Meet / Daily.co / 8x8: İzinleri verir
10. Jitsi Meet / Daily.co / 8x8: Görüntülü görüşme odasını açar
11. Hasta ve Doktor: Aynı görüntülü görüşme odasında birleşir

**Randevu Tamamlama Akışı (Doktor - Opsiyonel):**
1. Doktor → Frontend: Görüntülü görüşme bittikten sonra "Tamamlandı Olarak İşaretle" butonuna tıklar
2. Frontend → Firebase Firestore: Randevu dokümanını günceller
   - Update: { status: 'completed', updatedAt: serverTimestamp() }
3. Firebase Firestore → Frontend: Güncelleme onayı
4. Frontend: Doktor'a "Randevu tamamlandı" bildirimi gösterir

**Notlar:**
- Randevu oluşturma doğrudan Firebase Firestore üzerinden yapılır (backend API kullanılmaz)
- Randevu onaylama da doğrudan Firebase Firestore üzerinden yapılır (backend API kullanılmaz - güvenlik kuralları ile korunur)
- Video konferans servisleri: Jitsi Meet (meet.jit.si), Daily.co, veya 8x8 kullanılabilir
- Protokol: HTTP/HTTPS (Firestore), WebRTC (Video konferans)

---

## DİYAGRAM GEREKSİNİMLERİ:

**Genel Format:**
- 4 adet sequence diagram, aynı görselde alt alta
- Her diyagram için başlık (1. Giriş/Çıkış Akışı, 2. Görüntü Analizi Akışı, vb.)
- Sequence diagram formatı (katılımcılar solda, mesajlar yatay oklarla)

**Stil:**
- Türkçe etiketler ve açıklamalar
- Aktörler/katılımcılar dikey çizgilerle gösterilmeli
- Mesajlar yatay oklarla (→)
- Zaman akışı yukarıdan aşağıya
- Aktivasyon kutuları (lifeline boxes) kullanılmalı
- Response mesajları kesikli oklarla gösterilebilir

**Renkler:**
- Her diyagram farklı renklerle ayrılabilir (opsiyonel)
- Profesyonel ve akademik görünüm
- Görselde HİÇBİR watermark, logo veya amblem OLMAMALI

**Detaylar:**
- HTTP metodları gösterilmeli (GET, POST, vb.)
- API endpoint'leri veya Firebase koleksiyon isimleri etiketlerde yer almalı
- Önemli veri yapıları veya response formatları kısaca belirtilebilir
- Hata durumları gösterilmeyebilir (başarılı akış üzerine odaklan)

---

**Yukarıdaki açıklamaya göre, aynı görselde dört adet sequence diagram oluştur. Her diyagram Türkçe etiketler ve açıklamalarla hazırlanmalı, katılımcılar ve mesajlar net bir şekilde gösterilmelidir.**
