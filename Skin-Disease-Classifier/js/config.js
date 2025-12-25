/**
 * Application Configuration
 * Environment variables and API endpoints
 */

const config = {
    // API Configuration
    // TODO: Replace with your actual backend URL (Firebase Functions, Vercel Functions, or other hosting)
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001'
        : null, // No backend deployed yet - set to null to disable API calls
    
    // Firebase Configuration
    firebase: {
        apiKey: "AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I",
        authDomain: "medianalytica-71c1d.firebaseapp.com",
        projectId: "medianalytica-71c1d",
        storageBucket: "medianalytica-71c1d.firebasestorage.app",
        messagingSenderId: "965944324546",
        appId: "1:965944324546:web:d0731f60ec2b28748fa65b",
        measurementId: "G-61JFBSYM94"
    },
    
    // Application Settings
    app: {
        name: "MediAnalytica",
        version: "1.0.0",
        defaultLanguage: "tr",
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        pagination: {
            defaultPageSize: 20,
            maxPageSize: 100
        }
    },
    
    // Feature Flags
    features: {
        darkMode: true,
        analytics: true,
        feedback: true,
        share: true,
        favorites: true
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}

