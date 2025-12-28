export const config = {
  // API Configuration
  apiUrl: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001'
    : null, // No backend deployed yet - set to null to disable API calls
  
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
}

