# Gemini AI için Gantt Şeması Promptu

Aşağıdaki promptu Gemini AI'ye göndererek projenin Gantt şemasını oluşturabilirsiniz:

---

## PROMPT (Gemini AI için):

**Türkçe olarak profesyonel bir Gantt şeması çiz. Aşağıdaki proje planını kullan:**

### Proje: MediAnalytica - Tıbbi Görüntü Analizi ve Tele-Tıp Platformu

**Proje Süresi:** 16 hafta (1 akademik dönem)

**Gantt Şeması Yapısı:**

**FAZ 1: Araştırma ve Planlama (Hafta 1-2)**
- Literatür incelemesi (Hafta 1-2)
- Teknoloji seçimi (Hafta 1)
- Veri seti araştırması (Hafta 1-2)
- Mimari tasarım (Hafta 2)

**FAZ 2: Model Geliştirme (Hafta 3-5)**
- Veri seti hazırlama ve preprocessing (Hafta 3)
- Model mimarisi tasarımı (Hafta 3)
- Model eğitimi (GPU ile) (Hafta 4-5)
- Model değerlendirme ve optimizasyon (Hafta 5)

**FAZ 3: Backend Geliştirme (Hafta 6-9)**
- Flask API geliştirme (Hafta 6-7)
- Hugging Face entegrasyonu (Hafta 7)
- Firebase entegrasyonu (Hafta 8)
- Authentication sistemi (Hafta 8)
- Veritabanı şema tasarımı (Hafta 6)
- API testleri (Hafta 9)

**FAZ 4: Frontend Geliştirme (Hafta 10-13)**
- UI/UX tasarımı (Hafta 10)
- Next.js/React geliştirme (Hafta 10-12)
- Firebase JS SDK entegrasyonu (Hafta 11)
- Responsive tasarım (Hafta 12)
- Kullanıcı testleri (Hafta 13)

**FAZ 5: Entegrasyon ve Test (Hafta 14-15)**
- Backend-Frontend entegrasyonu (Hafta 14)
- End-to-end testler (Hafta 14-15)
- Performans optimizasyonu (Hafta 15)
- Güvenlik testleri (Hafta 15)
- Hata düzeltmeleri (Hafta 14-15)

**FAZ 6: Dokümantasyon ve Sunum (Hafta 16)**
- Kod dokümantasyonu (Hafta 16)
- Kullanıcı kılavuzu (Hafta 16)
- Proje raporu (Hafta 16)
- Sunum hazırlığı (Hafta 16)

**Bağımlılıklar (Precedence Relationships):**
- Faz 1 → Faz 2 (Araştırma ve Planlama, Model Geliştirme'nin önkoşulu)
- Faz 2 → Faz 3 (Model Geliştirme, Backend Geliştirme'nin önkoşulu - model API'ler için gerekli)
- Faz 3 → Faz 4 (Backend Geliştirme, Frontend Geliştirme'nin önkoşulu - API'ler hazır olmalı)
- Faz 4 → Faz 5 (Frontend Geliştirme, Entegrasyon ve Test'in önkoşulu)
- Faz 5 → Faz 6 (Entegrasyon ve Test, Dokümantasyon'un önkoşulu)

**Milestone'lar (Önemli Noktalar):**
- **M1:** Faz 1 Tamamlandı (Hafta 2 sonu)
- **M2:** Model Eğitimi Tamamlandı (Hafta 5 sonu)
- **M3:** Backend API Hazır (Hafta 9 sonu)
- **M4:** Frontend Geliştirme Tamamlandı (Hafta 13 sonu)
- **M5:** Entegrasyon ve Test Tamamlandı (Hafta 15 sonu)
- **M6:** Proje Tamamlandı (Hafta 16 sonu)

**Gantt Şeması Gereksinimleri:**
- Yatay eksende haftalar (1-16)
- Dikey eksende fazlar ve görevler
- Her görev için başlangıç ve bitiş haftaları gösterilmeli
- Fazlar farklı renklerle vurgulanmalı
- Bağımlılıklar oklarla (dependency arrows) gösterilmeli
- Milestone'lar özel işaretlerle (diamond/star) gösterilmeli
- Paralel çalışabilen görevler gösterilmeli (ör: Faz 3 içinde bazı görevler paralel)
- Kritik yol (critical path) vurgulanmalı
- Şema Türkçe etiketlerle hazırlanmalı
- Profesyonel ve okunabilir görünüm

**Örnek Görev Detayları:**
- Faz 3'te: Veritabanı şema tasarımı (H6) → Flask API (H6-7) → Hugging Face entegrasyonu (H7) → Firebase entegrasyonu (H8) → Authentication (H8) → API testleri (H9)
- Faz 4'te: UI/UX tasarımı (H10) → Next.js geliştirme (H10-12) → Firebase entegrasyonu (H11, UI/UX sonrası) → Responsive tasarım (H12) → Kullanıcı testleri (H13)

---

**Yukarıdaki bilgilere göre detaylı bir Gantt şeması çiz. Şema Türkçe olmalı, tüm fazlar, görevler, bağımlılıklar ve milestone'lar net bir şekilde gösterilmelidir. 16 haftalık proje süresi ve 6 faz yapısı korunmalıdır.**
