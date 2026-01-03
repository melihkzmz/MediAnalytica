#!/bin/bash
# GitHub'a yükleme komutları
# Bu dosyayı çalıştırmadan önce GitHub kullanıcı adını değiştir!

# 1. Proje klasörüne git
cd "/Users/efecengizkose/Desktop/disease_detection_no_dataset-main 2"

# 2. Git repository'sini başlat
git init

# 3. Tüm dosyaları ekle
git add .

# 4. İlk commit'i yap
git commit -m "Initial commit: MediAnalytica - Yapay Zeka Destekli Hastalık Tespit Platformu"

# 5. GitHub repository'sini remote olarak ekle
# ⚠️ BURAYA KENDİ GITHUB KULLANICI ADINI YAZ! (örnek: efecengizkose)
echo "⚠️  ÖNEMLİ: Aşağıdaki komutta KULLANICI_ADIN yerine kendi GitHub kullanıcı adını yaz!"
echo "Örnek: git remote add origin https://github.com/efecengizkose/MediAnalytica.git"
echo ""
echo "Komutu manuel olarak çalıştır:"
echo "git remote add origin https://github.com/KULLANICI_ADIN/MediAnalytica.git"
echo ""
echo "Sonra şu komutu çalıştır:"
echo "git branch -M main"
echo "git push -u origin main"

