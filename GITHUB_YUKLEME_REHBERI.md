# 📤 GitHub'a Proje Yükleme Rehberi

Bu rehber, MediAnalytica projesini GitHub'a yüklemek ve arkadaşınla paylaşmak için adım adım talimatlar içerir.

---

## 🎯 Adım 1: GitHub Hesabı Oluştur (Eğer yoksa)

1. **GitHub.com**'a git: https://github.com
2. **Sign up** butonuna tıkla
3. Kullanıcı adı, e-posta ve şifre gir
4. Hesabını doğrula (e-posta ile)

---

## 🎯 Adım 2: Yeni Repository Oluştur

1. GitHub'a giriş yap
2. Sağ üstteki **"+"** butonuna tıkla
3. **"New repository"** seçeneğini seç
4. Repository ayarlarını yap:
   - **Repository name:** `MediAnalytica` (veya istediğin isim)
   - **Description:** Y"apay Zeka Destekli Çoklu Hastalık Tespit ve Tele-Tıbbi Danışmanlık Platformu"
   - **Public** veya **Private** seç (Public = herkes görebilir, Private = sadece sen ve arkadaşın)
   - **"Initialize this repository with a README"** işaretleme (boş bırak)
   - **"Add .gitignore"** seçme (zaten var)
   - **"Choose a license"** opsiyonel
5. **"Create repository"** butonuna tıkla

---

## 🎯 Adım 3: Projeyi Git ile Hazırla

### Terminal'de şu komutları çalıştır:

```bash
# 1. Proje klasörüne git
cd "/Users/efecengizkose/Desktop/disease_detection_no_dataset-main 2"

# 2. Git repository'sini başlat (eğer yoksa)
git init

# 3. Tüm dosyaları ekle
git add .

# 4. İlk commit'i yap
git commit -m "Initial commit: MediAnalytica - Yapay Zeka Destekli Hastalık Tespit Platformu"

# 5. GitHub repository'sini remote olarak ekle
# (BURAYA KENDİ GITHUB KULLANICI ADINI YAZ)
git remote add origin https://github.com/KULLANICI_ADIN/MediAnalytica.git

# 6. Ana branch'i main olarak ayarla
git branch -M main

# 7. GitHub'a yükle
git push -u origin main
```

---

## 🎯 Adım 4: GitHub Kullanıcı Adını Bul

1. GitHub.com'da sağ üstteki profil fotoğrafına tıkla
2. Kullanıcı adın URL'de görünecek: `https://github.com/KULLANICI_ADIN`
3. Bu kullanıcı adını yukarıdaki komutlarda kullan

---

## 🎯 Adım 5: Arkadaşına Paylaş

### Yöntem 1: Public Repository (Herkes görebilir)
- Repository linkini gönder: `https://github.com/KULLANICI_ADIN/MediAnalytica`
- Arkadaşın linke tıklayarak projeyi görebilir ve indirebilir

### Yöntem 2: Private Repository + Collaborator (Sadece sen ve arkadaşın)
1. Repository ayarlarına git: **Settings** → **Collaborators**
2. **"Add people"** butonuna tıkla
3. Arkadaşının GitHub kullanıcı adını veya e-postasını gir
4. **"Add [username] to this repository"** butonuna tıkla
5. Arkadaşın e-postasına davet gelecek, kabul etsin

---

## 🎯 Adım 6: Projeyi İndirme (Arkadaşın için)

Arkadaşın şu komutları çalıştırabilir:

```bash
# Projeyi klonla (indir)
git clone https://github.com/KULLANICI_ADIN/MediAnalytica.git

# Klasöre gir
cd MediAnalytica

# Skin-Disease-Classifier klasörüne gir
cd Skin-Disease-Classifier

# Virtual environment oluştur (eğer yoksa)
python3 -m venv venv

# Virtual environment'ı aktif et
source venv/bin/activate  # macOS/Linux
# veya
venv\Scripts\activate  # Windows

# Gerekli paketleri yükle
pip install -r requirements.txt  # (eğer varsa)
# veya manuel olarak:
pip install flask flask-cors firebase-admin tensorflow keras matplotlib
```

---

## ⚠️ Önemli Notlar

### 1. .gitignore Dosyası
Projede hassas bilgiler varsa (API key'ler, şifreler) `.gitignore` dosyasına ekle:
- `*.pyc`
- `__pycache__/`
- `venv/`
- `.env`
- `*.log`
- `firebase-key.json` (eğer varsa)

### 2. Firebase Credentials
Firebase credentials dosyasını GitHub'a yükleme! Eğer yüklersen:
- `.gitignore` dosyasına ekle
- Veya environment variables kullan

### 3. Büyük Dosyalar
- Model dosyaları (`.h5`, `.keras`) çok büyükse GitHub'a yüklemeyebilirsin
- Alternatif: Google Drive veya başka bir depolama kullan

---

## 🚀 Hızlı Başlangıç (Tek Komut)

Eğer Git zaten kuruluysa ve GitHub hesabın varsa:

```bash
cd "/Users/efecengizkose/Desktop/disease_detection_no_dataset-main 2"
git init
git add .
git commit -m "Initial commit: MediAnalytica"
git remote add origin https://github.com/KULLANICI_ADIN/MediAnalytica.git
git branch -M main
git push -u origin main
```

**Not:** `KULLANICI_ADIN` yerine kendi GitHub kullanıcı adını yaz!

---

## 📝 README.md Oluştur (Opsiyonel)

Projeye bir README.md dosyası ekleyebilirsin:

```markdown
# MediAnalytica

Yapay Zeka Destekli Çoklu Hastalık Tespit ve Tele-Tıbbi Danışmanlık Platformu

## Özellikler

- 🦴 Kemik Hastalıkları Tespiti
- ✨ Deri Hastalıkları Tespiti
- 🫁 Akciğer Hastalıkları Tespiti
- 👁️ Göz Hastalıkları Tespiti
- 📹 Görüntülü Doktor Danışmanlığı

## Kurulum

1. Repository'yi klonla
2. Virtual environment oluştur
3. Gerekli paketleri yükle
4. Backend API'yi başlat
5. Frontend'i aç

## Kullanım

Detaylı kullanım talimatları için dokümantasyona bakın.
```

---

## ✅ Kontrol Listesi

- [ ] GitHub hesabı var mı?
- [ ] Yeni repository oluşturuldu mu?
- [ ] Git repository başlatıldı mı?
- [ ] Dosyalar commit edildi mi?
- [ ] GitHub'a push edildi mi?
- [ ] Arkadaşına link gönderildi mi?

---

**İyi şanslar! 🚀**

