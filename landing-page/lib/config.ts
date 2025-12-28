export const config = {
  // API Configuration
  apiUrl: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001'
    : null, // No backend deployed yet - set to null to disable API calls
  
  // Hugging Face Space API URL for disease detection
  // Update this with your actual Space URL: https://YOUR_USERNAME-SPACE_NAME.hf.space
  hfSpaceUrl: (() => {
    const url = process.env.NEXT_PUBLIC_HF_SPACE_URL || 'https://melihkzmz-disease-api.hf.space'
    // Only use HF Space if URL is valid (not empty, not null)
    return url && url !== 'null' && url !== 'undefined' ? url : null
  })(),
  
  // Use Hugging Face Space for disease detection
  // Default: true (use HF Space) unless explicitly set to 'false'
  // Set NEXT_PUBLIC_USE_HF_SPACE=false to use localhost APIs
  useHuggingFaceSpace: (() => {
    const envValue = process.env.NEXT_PUBLIC_USE_HF_SPACE
    // If not in localhost, default to true (use HF Space)
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    
    if (envValue === 'false') return false
    if (envValue === 'true') return true
    // Default: use HF Space in production, localhost in dev
    return !isLocalhost
  })(),
  
  // Use Next.js API proxy for private Spaces (keeps token secure)
  // Set NEXT_PUBLIC_USE_HF_PROXY=true if your Space is private
  useProxyForHF: process.env.NEXT_PUBLIC_USE_HF_PROXY === 'true', // Default: false
  
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

