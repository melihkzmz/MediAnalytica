# MediAnalytica ER Diagram - Mermaid Code

Aşağıdaki Mermaid kodu ile MediAnalytica projesinin ER diyagramını oluşturabilirsiniz. Bu kod Mermaid Chart veya Mermaid destekleyen herhangi bir araçta kullanılabilir.

## Mermaid ER Diagram Code

```mermaid
erDiagram
    USERS {
        string userId PK
        string email
        string displayName
        string userType
        timestamp createdAt
        timestamp lastLogin
        object settings
    }
    
    DOCTORS {
        string doctorId PK
        string userId FK
        string firstName
        string lastName
        string specialty
        string phone
        string tcNo
        number experienceYears
        string institution
        string bio
        string certificates
        string diplomaUrl
        string status
        timestamp createdAt
        timestamp updatedAt
    }
    
    ANALYSES {
        string analysisId PK
        string userId FK
        string userEmail
        string diseaseType
        array results
        string topPrediction
        number topConfidence
        string imageUrl
        string gradcamUrl
        timestamp createdAt
        timestamp updatedAt
    }
    
    FAVORITES {
        string favoriteId PK
        string userId FK
        string analysisId FK
        timestamp createdAt
    }
    
    APPOINTMENTS {
        string appointmentId PK
        string userId FK
        string userEmail
        string doctorId FK
        string date
        string time
        string reason
        string doctorType
        string status
        string jitsiRoom
        timestamp createdAt
        timestamp updatedAt
        timestamp approvedAt
        string completionNote
        string doctorNote
    }
    
    SHARED_ANALYSES {
        string shareId PK
        string token
        string analysisId FK
        timestamp expiresAt
        timestamp createdAt
    }
    
    USERS ||--o| DOCTORS : "has"
    USERS ||--o{ ANALYSES : "creates"
    USERS ||--o{ FAVORITES : "has"
    USERS ||--o{ APPOINTMENTS : "requests"
    DOCTORS ||--o{ APPOINTMENTS : "handles"
    ANALYSES ||--o{ FAVORITES : "referenced_by"
    ANALYSES ||--o{ SHARED_ANALYSES : "shared_as"
```

## İlişkiler Açıklaması

- **USERS → DOCTORS (1:1)**: Bir kullanıcı en fazla bir doktor kaydına sahip olabilir (opsiyonel)
- **USERS → ANALYSES (1:N)**: Bir kullanıcı birden fazla analiz oluşturabilir
- **USERS → FAVORITES (1:N)**: Bir kullanıcı birden fazla favoriye sahip olabilir
- **USERS → APPOINTMENTS (1:N)**: Bir kullanıcı birden fazla randevu talep edebilir
- **DOCTORS → APPOINTMENTS (1:N)**: Bir doktor birden fazla randevuyu yönetebilir
- **ANALYSES → FAVORITES (1:N)**: Bir analiz birden fazla kullanıcının favorilerinde olabilir
- **ANALYSES → SHARED_ANALYSES (1:N)**: Bir analiz birden fazla paylaşım linkine sahip olabilir

## Notlar

- **PK**: Primary Key (Birincil Anahtar)
- **FK**: Foreign Key (Yabancı Anahtar - Firestore'da string referans olarak saklanır)
- Tüm koleksiyonlar Firebase Firestore (NoSQL) veritabanında bulunmaktadır
- Document ID'ler otomatik oluşturulan veya Firebase Authentication UID'leridir
