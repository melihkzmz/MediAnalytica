# 📡 API Kullanım Rehberi

Backend API'lerinin nasıl kullanılacağını gösteren rehber.

## 🔐 Authentication

Tüm API isteklerinde (auth endpoint'leri hariç) **Authorization header** gerekli:

```
Authorization: Bearer <firebase_id_token>
```

Frontend'de token'ı şöyle alabilirsin:
```javascript
const token = await firebase.auth().currentUser.getIdToken();
```

---

## 📋 ENDPOINT'LER

### 1. Analiz Geçmişi

#### Analiz Kaydet
```javascript
POST /api/user/analyses
Headers: { "Authorization": "Bearer <token>", "Content-Type": "application/json" }
Body: {
  "diseaseType": "skin",
  "results": [
    {"class": "melanoma", "confidence": 0.95}
  ],
  "topPrediction": "melanoma",
  "imageUrl": "https://..." // Opsiyonel
}
```

#### Analiz Geçmişini Getir
```javascript
GET /api/user/analyses?limit=20&diseaseType=skin
Headers: { "Authorization": "Bearer <token>" }
```

---

### 2. Kullanıcı İstatistikleri

```javascript
GET /api/user/stats
Headers: { "Authorization": "Bearer <token>" }

Response: {
  "success": true,
  "stats": {
    "totalAnalyses": 15,
    "diseaseTypeCounts": {
      "bone": 5,
      "skin": 8,
      "lung": 2,
      "eye": 0
    },
    "mostAnalyzedDisease": "skin",
    "lastAnalysisDate": 1705312800,
    "joinDate": 1704000000
  }
}
```

---

### 3. Profil Ayarları

#### Profil Getir
```javascript
GET /api/user/profile
Headers: { "Authorization": "Bearer <token>" }
```

#### Profil Güncelle
```javascript
PUT /api/user/profile
Headers: { "Authorization": "Bearer <token>", "Content-Type": "application/json" }
Body: {
  "displayName": "Yeni İsim",
  "settings": {
    "notifications": true,
    "language": "tr"
  }
}
```

#### Profil Fotoğrafı Yükle
```javascript
POST /api/user/profile/photo
Headers: { "Authorization": "Bearer <token>" }
Body: FormData { "photo": <file> }
```

---

### 4. Favoriler

#### Favori Ekle
```javascript
POST /api/user/favorites
Headers: { "Authorization": "Bearer <token>", "Content-Type": "application/json" }
Body: {
  "analysisId": "analysis123"
}
```

#### Favorileri Getir
```javascript
GET /api/user/favorites
Headers: { "Authorization": "Bearer <token>" }
```

#### Favoriden Kaldır
```javascript
DELETE /api/user/favorites/<favorite_id>
Headers: { "Authorization": "Bearer <token>" }
```

---

### 5. Paylaşım

#### Paylaşım Linki Oluştur
```javascript
POST /api/share/analysis
Headers: { "Authorization": "Bearer <token>", "Content-Type": "application/json" }
Body: {
  "analysisId": "analysis123",
  "expiresInDays": 30  // Opsiyonel, varsayılan 30
}

Response: {
  "success": true,
  "shareToken": "abc123xyz",
  "shareUrl": "/shared/abc123xyz",
  "expiresAt": "2024-02-15T10:30:00"
}
```

#### Paylaşım Linkinden Analiz Getir (Public)
```javascript
GET /api/share/<share_token>
// Authorization header GEREKMEZ (public endpoint)
```

---

## 🚀 Frontend Örnek Kullanım

### Analiz Sonrası Kaydetme
```javascript
async function saveAnalysis(diseaseType, results, topPrediction) {
  const token = await firebase.auth().currentUser.getIdToken();
  
  const response = await fetch('http://localhost:5001/api/user/analyses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      diseaseType: diseaseType,
      results: results,
      topPrediction: topPrediction
    })
  });
  
  const data = await response.json();
  return data;
}
```

### İstatistikleri Getirme
```javascript
async function getUserStats() {
  const token = await firebase.auth().currentUser.getIdToken();
  
  const response = await fetch('http://localhost:5001/api/user/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.stats;
}
```

---

## ⚠️ Önemli Notlar

1. **Backend URL**: Tüm istekler `http://localhost:5001` adresine yapılmalı
2. **CORS**: Backend'de CORS aktif, frontend'den istek yapabilirsin
3. **Token Süresi**: Firebase token'ları 1 saat geçerli, süresi dolunca yenile
4. **Hata Yönetimi**: Tüm endpoint'ler `{"success": false, "error": "..."}` formatında hata döner

---

## 🔧 Test Etme

Postman veya curl ile test edebilirsin:

```bash
# Token al (frontend'den)
TOKEN="your_firebase_token_here"

# İstatistikleri getir
curl -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/user/stats

# Analiz geçmişini getir
curl -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/user/analyses
```

