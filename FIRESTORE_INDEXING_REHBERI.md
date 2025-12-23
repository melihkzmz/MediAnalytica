# 🔍 Firestore Database Indexing Rehberi

Firestore'da sorgu performansını artırmak için index oluşturma rehberi.

## 📋 İçindekiler

- [Neden Index Gerekli?](#neden-index-gerekli)
- [Index Oluşturma](#index-oluşturma)
- [Gerekli Index'ler](#gerekli-indexler)
- [Otomatik Index Oluşturma](#otomatik-index-oluşturma)

## ❓ Neden Index Gerekli?

Firestore, karmaşık sorgularda (birden fazla `where` veya `orderBy` kullanıldığında) index gerektirir. Index olmadan sorgular çalışmaz veya çok yavaş olur.

## 🛠 Index Oluşturma

### Yöntem 1: Firebase Console (Manuel)

1. **Firebase Console'a git:**
   - https://console.firebase.google.com
   - Projeni seç

2. **Firestore Database'e git:**
   - Sol menüden "Firestore Database" seç
   - "Indexes" sekmesine tıkla

3. **Yeni Index oluştur:**
   - "Create Index" butonuna tıkla
   - Collection adını gir
   - Fields ekle
   - Query mode seç (Ascending/Descending)
   - "Create" butonuna tıkla

### Yöntem 2: Otomatik (Hata Mesajından)

1. **Index gerektiren sorgu çalıştır:**
   - Uygulamada analiz geçmişi sayfasını aç
   - Filtreleme yap

2. **Hata mesajını kopyala:**
   - Console'da index link'i görünecek
   - Link'e tıkla

3. **Index'i oluştur:**
   - Otomatik olarak doğru ayarlarla açılacak
   - "Create Index" butonuna tıkla

## 📊 Gerekli Index'ler

### 1. Analyses Collection - Kullanıcı Analiz Geçmişi

**Collection:** `analyses`

**Fields:**
- `userId` (Ascending)
- `createdAt` (Descending)

**Kullanım:** Kullanıcının analiz geçmişini tarihe göre sıralı getirme

**Query:**
```python
db.collection('analyses')
  .where('userId', '==', uid)
  .order_by('createdAt', direction=firestore.Query.DESCENDING)
```

---

### 2. Analyses Collection - Hastalık Türü Filtreleme

**Collection:** `analyses`

**Fields:**
- `userId` (Ascending)
- `diseaseType` (Ascending)
- `createdAt` (Descending)

**Kullanım:** Belirli hastalık türüne göre filtrelenmiş analiz geçmişi

**Query:**
```python
db.collection('analyses')
  .where('userId', '==', uid)
  .where('diseaseType', '==', 'skin')
  .order_by('createdAt', direction=firestore.Query.DESCENDING)
```

---

### 3. Favorites Collection - Kullanıcı Favorileri

**Collection:** `favorites`

**Fields:**
- `userId` (Ascending)
- `createdAt` (Descending)

**Kullanım:** Kullanıcının favorilerini tarihe göre sıralı getirme

**Query:**
```python
db.collection('favorites')
  .where('userId', '==', uid)
  .order_by('createdAt', direction=firestore.Query.DESCENDING)
```

---

### 4. Shared Collection - Paylaşım Linkleri

**Collection:** `shared`

**Fields:**
- `shareToken` (Ascending)

**Kullanım:** Paylaşım token'ına göre analiz bulma

**Query:**
```python
db.collection('shared')
  .where('shareToken', '==', token)
  .limit(1)
```

---

### 5. Analyses Collection - İstatistikler (Count Queries)

**Collection:** `analyses`

**Fields:**
- `userId` (Ascending)
- `diseaseType` (Ascending)

**Kullanım:** Hastalık türüne göre analiz sayısı

**Query:**
```python
db.collection('analyses')
  .where('userId', '==', uid)
  .where('diseaseType', '==', 'skin')
  .count()
```

---

## 🚀 Otomatik Index Oluşturma

### firestore.indexes.json Dosyası

Firebase CLI ile otomatik index oluşturabilirsin:

1. **firestore.indexes.json oluştur:**
```json
{
  "indexes": [
    {
      "collectionGroup": "analyses",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "analyses",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "diseaseType",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "favorites",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "shared",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "shareToken",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

2. **Firebase CLI ile deploy et:**
```bash
firebase deploy --only firestore:indexes
```

---

## ⚠️ Önemli Notlar

1. **Index oluşturma süresi:** Büyük koleksiyonlarda index oluşturma birkaç dakika sürebilir.

2. **Index limiti:** Firestore ücretsiz planında 200 index limiti vardır.

3. **Composite index:** Birden fazla field kullanılan sorgularda composite index gerekir.

4. **Array-contains:** Array field'lar için özel index gerekir.

5. **Index maliyeti:** Index'ler depolama alanı kullanır, ancak sorgu performansını önemli ölçüde artırır.

---

## 🔍 Index Durumunu Kontrol Etme

1. **Firebase Console:**
   - Firestore Database → Indexes
   - Index durumunu görüntüle (Building, Enabled, Error)

2. **CLI ile:**
```bash
firebase firestore:indexes
```

---

## 📚 Daha Fazla Bilgi

- [Firestore Indexing Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firestore Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries)

---

**Not:** Index'ler oluşturulana kadar ilgili sorgular çalışmayabilir. Production'a geçmeden önce tüm index'lerin oluşturulduğundan emin olun.

