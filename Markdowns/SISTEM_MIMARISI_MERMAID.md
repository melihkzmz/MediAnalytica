# Sistem Mimarisi Diyagramı - Mermaid Kodu

Bu kodu Mermaid editöründe (https://mermaid.live/) veya GitHub'da kullanabilirsin.

## Basit Versiyon:

```mermaid
graph TB
    subgraph PL["PRESENTATION LAYER"]
        A[Frontend Web App<br/>HTML5, CSS3, JavaScript ES6+<br/>Bootstrap 4, Font Awesome]
        B[Firebase JS SDK]
    end
    
    subgraph AL["APPLICATION LAYER"]
        C[Flask REST API<br/>Python 3.11+<br/>Flask-CORS, Limiter, Caching]
        D[AI Model Services<br/>TensorFlow/Keras<br/>EfficientNet, DenseNet]
    end
    
    subgraph DL["DATA LAYER"]
        E[Firebase Authentication<br/>Email/Password<br/>JWT Tokens]
        F[Firebase Firestore<br/>NoSQL Database]
        G[Firebase Storage<br/>Image Files]
        H[Jitsi Meet API<br/>Video Conferencing]
    end
    
    A -->|HTTP/HTTPS| C
    A -->|SDK Calls| B
    B -->|Auth| E
    B -->|Read/Write| F
    B -->|Upload| G
    C -->|Query| F
    C -->|Store| G
    C -->|Predict| D
    C -->|Video Call| H
    D -->|Results| C
```

## Detaylı Versiyon (Daha Fazla Bileşen):

```mermaid
graph TB
    subgraph PL["PRESENTATION LAYER - Sunum Katmanı"]
        A1[analyze.html<br/>Ana Analiz Sayfası]
        A2[login.html<br/>Giriş/Kayıt]
        A3[appointment.html<br/>Görüntülü Görüşme]
        A4[doctor-dashboard.html<br/>Doktor Paneli]
        B[Firebase JS SDK<br/>Authentication, Firestore, Storage]
    end
    
    subgraph AL["APPLICATION LAYER - Uygulama Katmanı"]
        C1[auth_api.py<br/>Flask REST API<br/>User Management, Analytics]
        C2[skin_disease_api.py<br/>EfficientNetB3]
        C3[bone_disease_api.py<br/>DenseNet-121]
        C4[lung_disease_api.py]
        C5[eye_disease_api.py]
        C6[Flask Extensions<br/>CORS, Limiter, Caching, Swagger]
    end
    
    subgraph DL["DATA LAYER - Veri Katmanı"]
        E[Firebase Authentication<br/>Email/Password<br/>JWT Token Verification]
        F[Firebase Firestore<br/>Collections: users, analyses,<br/>favorites, appointments]
        G[Firebase Storage<br/>Analysis Images<br/>Profile Photos]
        H[Jitsi Meet API<br/>WebRTC Video Calls<br/>Room Management]
    end
    
    A1 -->|HTTP Requests| C1
    A2 -->|HTTP Requests| C1
    A3 -->|HTTP Requests| C1
    A4 -->|HTTP Requests| C1
    
    A1 -->|SDK| B
    A2 -->|SDK| B
    A3 -->|SDK| B
    A4 -->|SDK| B
    
    B -->|Auth| E
    B -->|Read/Write| F
    B -->|Upload| G
    
    C1 -->|Query| F
    C1 -->|Store| F
    C1 -->|Store| G
    C1 -->|Verify Token| E
    C1 -->|Predict Request| C2
    C1 -->|Predict Request| C3
    C1 -->|Predict Request| C4
    C1 -->|Predict Request| C5
    C1 -->|Video Call| H
    
    C2 -->|Results| C1
    C3 -->|Results| C1
    C4 -->|Results| C1
    C5 -->|Results| C1
    
    C6 -.->|Middleware| C1
    
    style PL fill:#e1f5ff
    style AL fill:#fff4e1
    style DL fill:#e8f5e9
```

## Kullanım:

1. **Mermaid Live Editor:** https://mermaid.live/ adresine git
2. Kodu yapıştır
3. "Actions" → "Download PNG" ile indir
4. Raporuna ekle

## Veya GitHub'da:

Markdown dosyasında bu kodu kullan, GitHub otomatik render eder.



