# 🔐 GitHub Personal Access Token Oluşturma Rehberi

GitHub'a push yapmak için Personal Access Token (PAT) oluşturman gerekiyor.

---

## 🎯 Adım 1: Token Oluştur

1. **GitHub.com**'a git ve giriş yap
2. Sağ üstteki **profil fotoğrafına** tıkla
3. **Settings** seçeneğine tıkla
4. Sol menüden **Developer settings** seçeneğine tıkla
5. **Personal access tokens** → **Tokens (classic)** seçeneğine tıkla
6. **Generate new token** → **Generate new token (classic)** butonuna tıkla
7. Token ayarlarını yap:
   - **Note:** "MediAnalytica Project" (açıklama)
   - **Expiration:** 90 days veya istediğin süre
   - **Scopes:** Şunları işaretle:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
8. En altta **Generate token** butonuna tıkla
9. ⚠️ **ÖNEMLİ:** Token'ı kopyala! Bir daha göremeyeceksin!

---

## 🎯 Adım 2: Token'ı Kullan

Terminal'de push yaparken:

```bash
git push -u origin main
```

Username sorduğunda: `efecengiz07` yaz
Password sorduğunda: **Token'ı yapıştır** (şifren değil!)

---

## 🎯 Alternatif: Token'ı Git'e Kaydet (Önerilen)

Token'ı her seferinde girmemek için:

```bash
# Token'ı Git credential helper'a kaydet
git config --global credential.helper osxkeychain  # macOS için
# veya
git config --global credential.helper store  # Tüm platformlar için
```

Sonra bir kez push yap, token'ı gir, bir daha sormaz.

---

## 🎯 Hızlı Yol: SSH Kullan (En Güvenli)

SSH key kullanmak daha güvenli:

1. **SSH key oluştur:**
```bash
ssh-keygen -t ed25519 -C "efecengiz07@github.com"
```

2. **Public key'i kopyala:**
```bash
cat ~/.ssh/id_ed25519.pub
```

3. **GitHub'a ekle:**
   - GitHub.com → Settings → SSH and GPG keys
   - New SSH key → Key'i yapıştır → Add SSH key

4. **Remote URL'i değiştir:**
```bash
git remote set-url origin git@github.com:efecengiz07/MediAnalytica.git
```

5. **Push yap:**
```bash
git push -u origin main
```

---

## ⚠️ Sorun Giderme

### "Authentication failed" hatası:
- Token'ı doğru kopyaladığından emin ol
- Token'ın `repo` scope'una sahip olduğundan emin ol
- Token'ın süresi dolmamış olmalı

### "Permission denied" hatası:
- Repository'nin sahibi olduğundan emin ol
- Token'ın doğru scope'lara sahip olduğundan emin ol

---

**İyi şanslar! 🚀**

