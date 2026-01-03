# Use Case Diyagramı - PlantUML Kodu

Bu kodu https://www.plantuml.com/plantuml/uml/ adresinde render edebilirsin.

## Basit Versiyon:

```plantuml
@startuml MediAnalytica_UseCase
!theme plain
skinparam usecase {
    BackgroundColor lightblue
    BorderColor black
}
skinparam actor {
    BackgroundColor white
    BorderColor black
}

left to right direction

actor "Kullanıcı" as User
actor "Doktor" as Doctor
actor "Sistem" as System

rectangle "MediAnalytica Platform" {
  
  package "Kimlik Doğrulama" {
    User --> (Kayıt Ol)
    User --> (Giriş Yap)
    User --> (Email Doğrula)
    User --> (Şifre Sıfırla)
    User --> (Profil Güncelle)
    User --> (Çıkış Yap)
  }
  
  package "Görüntü Analizi" {
    User --> (Görüntü Yükle)
    User --> (Hastalık Türü Seç)
    User --> (Analiz Yap)
    User --> (Analiz Sonuçlarını Görüntüle)
    User --> (Grad-CAM Görüntüle)
    
    (Analiz Yap) ..> (Görüntü Analiz Et) : <<include>>
    (Görüntü Analiz Et) ..> (Model Yükle) : <<include>>
    (Görüntü Analiz Et) ..> (Grad-CAM Hesapla) : <<include>>
    
    System --> (Model Yükle)
    System --> (Görüntü Analiz Et)
    System --> (Grad-CAM Hesapla)
    System --> (Analiz Sonuçlarını Kaydet)
  }
  
  package "Analiz Geçmişi" {
    User --> (Analiz Geçmişini Görüntüle)
    User --> (Filtrele)
    User --> (Favorilere Ekle)
    User --> (Favorileri Görüntüle)
    User --> (Favorilerden Kaldır)
    User --> (Paylaş)
    User --> (İstatistikleri Görüntüle)
    User --> (PDF Rapor İndir)
  }
  
  package "Randevu ve Görüntülü Görüşme" {
    User --> (Randevu Talep Et)
    User --> (Randevuları Görüntüle)
    User --> (Görüntülü Görüşmeye Katıl)
    
    Doctor --> (Doktor Kayıt Ol)
    Doctor --> (Randevuları Görüntüle)
    Doctor --> (Randevu Onayla)
    Doctor --> (Randevu Reddet)
    Doctor --> (Hasta Dosyalarını Görüntüle)
    Doctor --> (Görüntülü Görüşmeye Katıl)
    
    (Görüntülü Görüşmeye Katıl) ..> (Jitsi Room Oluştur) : <<include>>
    System --> (Randevu Onayla)
    System --> (Jitsi Room Oluştur)
  }
  
  package "Email İşlemleri" {
    (Kayıt Ol) ..> (Email Gönder) : <<extend>>
    (Şifre Sıfırla) ..> (Email Gönder) : <<extend>>
    System --> (Email Gönder)
  }
}

@enduml
```

## Detaylı Versiyon (Tüm Use Case'ler):

```plantuml
@startuml MediAnalytica_UseCase_Detailed
!theme plain
skinparam usecase {
    BackgroundColor lightblue
    BorderColor black
}
skinparam actor {
    BackgroundColor white
    BorderColor black
}

left to right direction

actor "Kullanıcı" as User
actor "Doktor" as Doctor
actor "Sistem" as System

rectangle "MediAnalytica Platform" {
  
  ' Kullanıcı Use Case'leri
  User --> (Kayıt Ol)
  User --> (Giriş Yap)
  User --> (Email Doğrula)
  User --> (Şifre Sıfırla)
  User --> (Profil Güncelle)
  User --> (Çıkış Yap)
  
  User --> (Görüntü Yükle)
  User --> (Hastalık Türü Seç)
  User --> (Analiz Yap)
  User --> (Analiz Sonuçlarını Görüntüle)
  User --> (Grad-CAM Görüntüle)
  
  User --> (Analiz Geçmişini Görüntüle)
  User --> (Filtrele)
  User --> (Favorilere Ekle)
  User --> (Favorileri Görüntüle)
  User --> (Favorilerden Kaldır)
  User --> (Paylaş)
  User --> (İstatistikleri Görüntüle)
  User --> (PDF Rapor İndir)
  
  User --> (Randevu Talep Et)
  User --> (Randevuları Görüntüle)
  User --> (Görüntülü Görüşmeye Katıl)
  
  ' Doktor Use Case'leri
  Doctor --> (Doktor Kayıt Ol)
  Doctor --> (Randevuları Görüntüle)
  Doctor --> (Randevu Onayla)
  Doctor --> (Randevu Reddet)
  Doctor --> (Hasta Dosyalarını Görüntüle)
  Doctor --> (Görüntülü Görüşmeye Katıl)
  
  ' Sistem Use Case'leri
  System --> (Model Yükle)
  System --> (Görüntü Analiz Et)
  System --> (Grad-CAM Hesapla)
  System --> (Analiz Sonuçlarını Kaydet)
  System --> (Randevu Onayla)
  System --> (Jitsi Room Oluştur)
  System --> (Email Gönder)
  
  ' Include İlişkileri
  (Analiz Yap) ..> (Görüntü Analiz Et) : <<include>>
  (Görüntü Analiz Et) ..> (Model Yükle) : <<include>>
  (Görüntü Analiz Et) ..> (Grad-CAM Hesapla) : <<include>>
  (Görüntülü Görüşmeye Katıl) ..> (Jitsi Room Oluştur) : <<include>>
  
  ' Extend İlişkileri
  (Email Gönder) ..> (Kayıt Ol) : <<extend>>
  (Email Gönder) ..> (Şifre Sıfırla) : <<extend>>
}

@enduml
```

## Kullanım:

1. **PlantUML Online Editor:** https://www.plantuml.com/plantuml/uml/
2. Kodu yapıştır
3. "Submit" butonuna tıkla
4. Diyagram görünecek
5. Sağ tık → "Save image as" ile PNG olarak kaydet

## Veya Draw.io ile:

1. https://app.diagrams.net/ adresine git
2. "Create New Diagram" → "Blank Diagram"
3. Sol panelden "UML" → "Use Case" şekillerini seç
4. Aktörleri ekle (stick figure)
5. Use case'leri ekle (oval)
6. İlişkileri çiz
7. Export → PNG

