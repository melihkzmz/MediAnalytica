# Gemini'ye Benzer Platformlar Karşılaştırma Tablosu Oluşturma Prompt'u

## PROMPT (Gemini'ye Kopyala-Yapıştır):

```
Bir tıbbi görüntü analizi ve tele-tıp platformu için benzer platformlar karşılaştırma tablosu oluştur. 
Tablo, akademik bir bitirme projesi raporu için kullanılacak.

## KARŞILAŞTIRILACAK PLATFORMLAR:

1. **MediAnalytica (Bu Proje)** - Yapay zeka destekli çoklu hastalık tespit ve tele-tıbbi danışmanlık platformu
2. **Teladoc** - Ticari tele-tıp platformu
3. **Amwell** - Ticari tele-tıp platformu
4. **SkinVision** - Deri hastalıkları tespiti için mobil uygulama
5. **CheXNet (Akademik)** - Akciğer X-ray analizi için akademik çalışma
6. **ISIC Archive (Akademik)** - Deri kanseri tespiti için akademik platform

## KARŞILAŞTIRMA KRİTERLERİ:

1. **Çoklu Hastalık Desteği** (Deri, Kemik, Akciğer, Göz)
   - MediAnalytica: ✅ 4 hastalık kategorisi
   - Diğerleri: Tek hastalık veya yok

2. **Tele-Tıp Entegrasyonu** (Doktor görüntülü görüşme)
   - MediAnalytica: ✅ Jitsi Meet entegrasyonu
   - Teladoc: ✅ Var
   - Amwell: ✅ Var
   - Diğerleri: ❌ Yok

3. **Yapay Zeka Analizi**
   - MediAnalytica: ✅ EfficientNet, DenseNet modelleri
   - SkinVision: ✅ Var (sadece deri)
   - CheXNet: ✅ Var (sadece akciğer)
   - Teladoc/Amwell: ❌ Yok

4. **Açık Kaynak**
   - MediAnalytica: ✅ Açık kaynak teknolojiler
   - Diğerleri: ❌ Kapalı kaynak

5. **Maliyet**
   - MediAnalytica: Ücretsiz (Firebase ücretsiz planı)
   - Teladoc: Ücretli (abonelik)
   - Amwell: Ücretli (abonelik)
   - SkinVision: Ücretli (abonelik)
   - Akademik çalışmalar: Ücretsiz (araştırma amaçlı)

6. **Kullanıcı Yönetimi**
   - MediAnalytica: ✅ Firebase Auth, profil yönetimi, analiz geçmişi
   - Teladoc: ✅ Var
   - Amwell: ✅ Var
   - Diğerleri: Kısıtlı veya yok

7. **Grad-CAM Görselleştirmesi**
   - MediAnalytica: ✅ Var
   - Diğerleri: ❌ Yok veya kısıtlı

8. **Analiz Geçmişi ve İstatistikler**
   - MediAnalytica: ✅ Kapsamlı geçmiş, favoriler, paylaşım
   - Teladoc/Amwell: ✅ Var
   - Diğerleri: ❌ Yok

9. **Mobil Uyumluluk**
   - MediAnalytica: ✅ Responsive web tasarım
   - Teladoc: ✅ Mobil uygulama
   - Amwell: ✅ Mobil uygulama
   - SkinVision: ✅ Mobil uygulama
   - Akademik çalışmalar: ❌ Genellikle yok

10. **Doktor Paneli**
    - MediAnalytica: ✅ Doktor kayıt ve randevu yönetimi
    - Teladoc: ✅ Var
    - Amwell: ✅ Var
    - Diğerleri: ❌ Yok

## TABLO FORMATI:

Tablo şu sütunları içermeli:
- Platform Adı
- Çoklu Hastalık Desteği (✅/❌)
- Tele-Tıp Entegrasyonu (✅/❌)
- Yapay Zeka Analizi (✅/❌)
- Açık Kaynak (✅/❌)
- Maliyet (Ücretsiz/Ücretli)
- Kullanıcı Yönetimi (✅/❌)
- Grad-CAM Görselleştirmesi (✅/❌)
- Analiz Geçmişi (✅/❌)
- Mobil Uyumluluk (✅/❌)
- Doktor Paneli (✅/❌)

## TABLO GEREKSİNİMLERİ:

- Profesyonel ve akademik görünüm
- Renkli ama okunabilir (yeşil ✅, kırmızı ❌)
- Başlık: "Benzer Platformlar Karşılaştırma Tablosu"
- MediAnalytica sütunu vurgulanmalı (farklı renk veya kalın yazı)
- Tablo kenarlıklı ve düzenli
- Türkçe veya İngilizce olabilir
- PDF/Word belgesine eklenebilir format (PNG, JPG veya tablo formatı)

## ÖRNEK TABLO YAPISI:

```
┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Platform    │ Çoklu Hast. │ Tele-Tıp     │ Yapay Zeka   │ Açık Kaynak  │ Maliyet      │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ MediAnalytica   │ ✅ (4 tür)   │ ✅ Jitsi     │ ✅ Efficient │ ✅           │ Ücretsiz     │
│ (Bu Proje)  │              │ Meet         │ Net/DenseNet │              │              │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Teladoc     │ ❌           │ ✅          │ ❌           │ ❌           │ Ücretli      │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Amwell      │ ❌           │ ✅          │ ❌           │ ❌           │ Ücretli      │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ SkinVision  │ ❌ (Sadece   │ ❌           │ ✅ (Sadece   │ ❌           │ Ücretli      │
│             │    deri)     │              │    deri)     │              │              │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ CheXNet     │ ❌ (Sadece   │ ❌           │ ✅ (Sadece   │ ✅ (Akademik)│ Ücretsiz     │
│ (Akademik)  │    akciğer)  │              │    akciğer)  │              │              │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

## DETAYLI BİLGİLER:

**MediAnalytica (Bu Proje):**
- 4 hastalık kategorisi (Deri, Kemik, Akciğer, Göz)
- EfficientNetB3 (deri), DenseNet-121 (kemik) modelleri
- Jitsi Meet entegrasyonu
- Firebase Authentication, Firestore, Storage
- Grad-CAM görselleştirmesi
- Analiz geçmişi, favoriler, paylaşım
- Responsive web tasarım
- Doktor paneli

**Teladoc:**
- Ticari tele-tıp platformu
- Sadece doktor görüşmesi (AI analizi yok)
- Mobil uygulama
- Ücretli abonelik

**Amwell:**
- Ticari tele-tıp platformu
- Sadece doktor görüşmesi (AI analizi yok)
- Mobil uygulama
- Ücretli abonelik

**SkinVision:**
- Deri hastalıkları tespiti için mobil uygulama
- AI analizi var (sadece deri)
- Ücretli abonelik
- Tele-tıp yok

**CheXNet (Akademik):**
- Akciğer X-ray analizi için akademik çalışma
- DenseNet-121 modeli
- Açık kaynak (akademik)
- Tele-tıp yok
- Web platformu yok (sadece model)

**ISIC Archive (Akademik):**
- Deri kanseri tespiti için akademik platform
- Veri seti ve bazı modeller
- Açık kaynak (akademik)
- Tele-tıp yok
- Kullanıcı yönetimi yok

## TABLO ÇIKTISI:

Tablo, PNG veya JPG formatında, yüksek çözünürlükte (300 DPI) oluşturulmalı.
Akademik rapor için uygun, profesyonel görünümde olmalı.
```

## ALTERNATİF YÖNTEMLER:

### 1. Excel/Google Sheets ile Oluştur
- Excel veya Google Sheets'te tabloyu oluştur
- Renklendir (✅ yeşil, ❌ kırmızı)
- Screenshot al veya PDF olarak kaydet

### 2. Word/Google Docs ile Oluştur
- Word veya Google Docs'te tablo oluştur
- "Ekle" → "Tablo" → İstediğin boyutta tablo
- Renklendir ve formatla
- Screenshot al

### 3. Online Tablo Araçları
- https://www.tablesgenerator.com/markdown_tables
- Markdown tablo oluştur, sonra görselleştir

### 4. LaTeX Tablo (Akademik)
```latex
\begin{table}[h]
\centering
\begin{tabular}{|l|c|c|c|c|c|}
\hline
Platform & Çoklu Hast. & Tele-Tıp & Yapay Zeka & Açık Kaynak & Maliyet \\
\hline
MediAnalytica & \checkmark & \checkmark & \checkmark & \checkmark & Ücretsiz \\
Teladoc & $\times$ & \checkmark & $\times$ & $\times$ & Ücretli \\
\hline
\end{tabular}
\caption{Benzer Platformlar Karşılaştırma Tablosu}
\end{table}
```

## ÖNERİLEN ADIMLAR:

1. **Gemini'ye prompt'u gönder** ve tabloyu oluştur
2. **Tabloyu PNG/JPG olarak indir**
3. **RAPOR.txt dosyasına ekle** (Word/Google Docs kullanıyorsan direkt ekle)
4. **Veya Excel/Google Sheets ile manuel oluştur** (daha fazla kontrol için)

## TABLO BOYUTU:

- Genişlik: En az 1200px (rapor için yeterli)
- Yükseklik: İçeriğe göre ayarlanabilir
- Font: Okunabilir (12-14pt)
- Renkler: Profesyonel (yeşil ✅, kırmızı ❌, mavi vurgu)

