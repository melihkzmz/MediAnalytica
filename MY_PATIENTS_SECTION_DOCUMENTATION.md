# Hastalarım (My Patients) Bölümü Dokümantasyonu

## 📋 Genel Bakış

"Hastalarım" bölümü, doktorların onayladıkları randevulara sahip hastalarını görüntülediği bir dashboard bölümüdür.

## ✅ Ne Zaman Hasta Görünür?

Bir hasta, **"Hastalarım"** bölümünde görünmesi için aşağıdaki koşulları sağlamalıdır:

1. **Randevu Onaylanmış Olmalı**: Hasta, doktorun onayladığı en az bir randevuya sahip olmalıdır
   - Randevu durumu: `approved` veya `completed` olmalı
   - Randevu durumu: `pending` veya `rejected` olan randevular görünmez

2. **doctorId Atanmış Olmalı**: Randevu onaylandığında, `doctorId` alanı doktorun UID'si ile doldurulmalıdır
   - Bu, randevunun hangi doktora ait olduğunu belirler
   - `doctorId` alanı yoksa hasta görünmez

## 🔄 Randevu Onaylama Süreci

### Backend API (`/api/doctors/appointments/<id>/approve`)

Randevu onaylandığında:
- `status`: `'approved'` olarak güncellenir
- `doctorId`: Doktorun UID'si eklenir ✅ (Düzeltildi)
- `approvedAt`: Onaylanma zamanı kaydedilir
- `updatedAt`: Güncelleme zamanı kaydedilir

### Frontend (Direct Firestore Update)

Alternatif olarak, frontend'den direkt Firestore güncellemesi yapıldığında:
- `status`: `'approved'` olarak güncellenir
- `doctorId`: Doktorun UID'si eklenir
- `approvedAt`: Onaylanma zamanı kaydedilir

## 📊 Hasta Bilgileri

Her hasta kartında gösterilen bilgiler:
- **İsim**: `displayName` veya email'den türetilen isim
- **E-posta**: Hasta email adresi
- **Toplam Randevu**: Bu doktorla olan onaylanmış/tamamlanmış randevu sayısı
- **Son Randevu**: En son randevu tarihi (varsa)

## 🔍 Teknik Detaylar

### Frontend Query (landing-page/app/dashboard/page.tsx)

```typescript
const q = query(
  appointmentsRef,
  where('doctorId', '==', user.uid),
  where('status', 'in', ['approved', 'completed'])
)
```

Bu sorgu:
- Sadece `doctorId` alanı doktorun UID'sine eşit olan randevuları getirir
- Sadece `approved` veya `completed` durumundaki randevuları getirir
- Her hastadan benzersiz hasta listesi oluşturur
- Her hasta için randevu istatistiklerini hesaplar

### Backend Endpoint (`/api/doctors/patients`)

Backend endpoint şu anda farklı bir mantık kullanıyor:
- `doctorType` (uzmanlık alanı) ile eşleşen tüm randevuları getirir
- Status filtresi yok (tüm durumlar dahil)
- Bu endpoint şu anda frontend'de kullanılmıyor

**Not**: Backend endpoint'in mantığı frontend ile uyumlu değil. Frontend direkt Firestore sorgusu kullanıyor.

## ⚠️ Önemli Notlar

1. **doctorId Zorunlu**: Randevu onaylandığında `doctorId` mutlaka set edilmelidir. Aksi halde hasta "Hastalarım" bölümünde görünmez.

2. **Status Filtresi**: Sadece `approved` ve `completed` durumundaki randevular hasta listesine dahil edilir.

3. **Benzersiz Hasta Listesi**: Aynı hastanın birden fazla randevusu olsa bile, hasta listesinde sadece bir kez görünür.

4. **Gerçek Zamanlı Güncelleme**: Randevu onaylandıktan sonra, "Hastalarım" bölümü yenilendiğinde hasta görünür.

## 🐛 Düzeltilen Sorunlar

1. ✅ **Backend approve endpoint**: Artık `doctorId` alanını set ediyor
2. ✅ **Hasta bilgileri**: Toplam randevu sayısı ve son randevu tarihi gösteriliyor
3. ✅ **UI iyileştirmeleri**: Hasta kartlarında daha fazla bilgi gösteriliyor

## 📝 Test Senaryoları

1. **Yeni Randevu Onaylama**:
   - Hasta randevu talebi oluşturur (`status: pending`)
   - Doktor randevuyu onaylar (`status: approved`, `doctorId: <doctor_uid>`)
   - "Hastalarım" bölümünde hasta görünür

2. **Randevu Tamamlama**:
   - Onaylanmış randevu tamamlanır (`status: completed`)
   - Hasta hala "Hastalarım" bölümünde görünür

3. **Reddedilen Randevu**:
   - Randevu reddedilir (`status: rejected`)
   - Hasta "Hastalarım" bölümünde görünmez

4. **Bekleyen Randevu**:
   - Randevu henüz onaylanmamış (`status: pending`)
   - Hasta "Hastalarım" bölümünde görünmez
