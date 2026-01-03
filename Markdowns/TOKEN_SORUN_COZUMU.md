# 🔧 GitHub Token 403 Hatası Çözümü

403 hatası alıyorsun. Bu genellikle token'ın scope'larının yeterli olmadığını gösterir.

---

## ✅ Çözüm 1: Yeni Token Oluştur (ÖNERİLEN)

### Token Oluştururken Şunları İşaretle:

1. **GitHub.com** → Profil → **Settings** → **Developer settings**
2. **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. **ÖNEMLİ:** Şu scope'ları işaretle:
   - ✅ **repo** (Full control of private repositories) - **MUTLAKA İŞARETLE!**
   - ✅ **workflow** (Update GitHub Action workflows)
   - ✅ **write:packages** (Upload packages)
   - ✅ **delete:packages** (Delete packages)
5. **Generate token**
6. Token'ı kopyala

### Token'ı Kullan:

```bash
# Remote URL'i token ile güncelle
git remote set-url origin https://YENİ_TOKEN@github.com/efecengiz07/MediAnalytica.git

# Push yap
git push -u origin main
```

---

## ✅ Çözüm 2: SSH Kullan (EN GÜVENLİ)

SSH key kullanmak daha güvenli ve genellikle daha az sorun çıkarır.

### Adım 1: SSH Key Oluştur

```bash
ssh-keygen -t ed25519 -C "efecengiz07@github.com"
```

Enter'a bas (şifre istemezse boş bırak).

### Adım 2: Public Key'i Kopyala

```bash
cat ~/.ssh/id_ed25519.pub
```

Çıkan metni kopyala (ssh-ed25519 ile başlayan uzun metin).

### Adım 3: GitHub'a Ekle

1. **GitHub.com** → Profil → **Settings**
2. Sol menüden **SSH and GPG keys**
3. **New SSH key** butonuna tıkla
4. **Title:** "MacBook" (veya istediğin isim)
5. **Key:** Kopyaladığın key'i yapıştır
6. **Add SSH key**

### Adım 4: Remote URL'i Değiştir

```bash
git remote set-url origin git@github.com:efecengiz07/MediAnalytica.git
```

### Adım 5: Push Yap

```bash
git push -u origin main
```

---

## ✅ Çözüm 3: GitHub CLI Kullan

GitHub CLI daha kolay authentication sağlar:

```bash
# GitHub CLI yükle (eğer yoksa)
brew install gh

# GitHub'a giriş yap
gh auth login

# Push yap
git push -u origin main
```

---

## 🔍 Token Scope Kontrolü

Token'ın şu scope'lara sahip olması gerekiyor:
- ✅ **repo** (Full control) - **EN ÖNEMLİSİ!**
- ✅ **workflow** (Opsiyonel)

Token'ı oluştururken **mutlaka `repo` scope'unu işaretle!**

---

## ⚠️ Güvenlik Uyarısı

Token'ı URL'e gömmek güvenli değil! Push yaptıktan sonra:

```bash
# Token'ı URL'den kaldır
git remote set-url origin https://github.com/efecengiz07/MediAnalytica.git

# Credential helper kullan (token'ı güvenli saklar)
git config --global credential.helper osxkeychain
```

Sonra push yaparken username ve token soracak, bir kez gir bir daha sormaz.

---

**En kolay çözüm: SSH kullan! 🚀**

