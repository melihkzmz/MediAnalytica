# 🌐 Frontend Environment Variables Guide

## Current Status

**Your frontend is vanilla JavaScript** (no build tool like Vite/Webpack/React), so environment variables work differently than in frameworks.

### Current Setup:
- ✅ Single HTML file (`analyze.html`)
- ✅ Vanilla JavaScript
- ✅ `config.js` with hardcoded values
- ❌ No build process
- ❌ No environment variable support currently

---

## Option 1: Manual Configuration (Simplest) ⭐ Recommended for Now

### How It Works:
Just update `config.js` manually with your production values.

### Steps:

1. **Update `config.js`** before deploying:

```javascript
const config = {
    // API Configuration
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001'
        : 'https://your-backend.railway.app', // ← Update this with your backend URL
    
    // Firebase Configuration (already set, no changes needed)
    firebase: {
        apiKey: "AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I",
        // ... rest stays the same
    },
    // ... rest of config
};
```

2. **Commit and push** - Vercel will deploy with updated values

**Pros:**
- ✅ Simple, no setup needed
- ✅ Works immediately
- ✅ No build process required

**Cons:**
- ⚠️ Need to update manually for each environment
- ⚠️ Values are in code (but Firebase keys are already public anyway)

---

## Option 2: Vercel Environment Variables with Build Script

### How It Works:
Create a simple build script that injects environment variables into `config.js` at build time.

### Steps:

#### 1. Create `build-config.js`:

```javascript
// build-config.js
const fs = require('fs');
const path = require('path');

// Read environment variables
const API_URL = process.env.VITE_API_URL || 'http://localhost:5001';
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I';
const FIREBASE_AUTH_DOMAIN = process.env.VITE_FIREBASE_AUTH_DOMAIN || 'medianalytica-71c1d.firebaseapp.com';
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'medianalytica-71c1d';
const FIREBASE_STORAGE_BUCKET = process.env.VITE_FIREBASE_STORAGE_BUCKET || 'medianalytica-71c1d.firebasestorage.app';
const FIREBASE_MESSAGING_SENDER_ID = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '965944324546';
const FIREBASE_APP_ID = process.env.VITE_FIREBASE_APP_ID || '1:965944324546:web:d0731f60ec2b28748fa65b';
const FIREBASE_MEASUREMENT_ID = process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-61JFBSYM94';

// Generate config.js content
const configContent = `/**
 * Application Configuration
 * Auto-generated from environment variables
 */

const config = {
    // API Configuration
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001'
        : '${API_URL}',
    
    // Firebase Configuration
    firebase: {
        apiKey: "${FIREBASE_API_KEY}",
        authDomain: "${FIREBASE_AUTH_DOMAIN}",
        projectId: "${FIREBASE_PROJECT_ID}",
        storageBucket: "${FIREBASE_STORAGE_BUCKET}",
        messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
        appId: "${FIREBASE_APP_ID}",
        measurementId: "${FIREBASE_MEASUREMENT_ID}"
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
`;

// Write to config.js
const configPath = path.join(__dirname, 'Skin-Disease-Classifier', 'js', 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');
console.log('✅ config.js generated from environment variables');
```

#### 2. Create `package.json`:

```json
{
  "name": "medianalytica-frontend",
  "version": "1.0.0",
  "scripts": {
    "build": "node build-config.js"
  },
  "devDependencies": {}
}
```

#### 3. Update `vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "Skin-Disease-Classifier",
  "rewrites": [
    {
      "source": "/",
      "destination": "/Skin-Disease-Classifier/analyze.html"
    },
    {
      "source": "/(.*)",
      "destination": "/Skin-Disease-Classifier/$1"
    }
  ]
}
```

#### 4. Set Environment Variables in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_API_URL` = `https://your-backend.railway.app`
   - `VITE_FIREBASE_API_KEY` = `AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I`
   - `VITE_FIREBASE_AUTH_DOMAIN` = `medianalytica-71c1d.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID` = `medianalytica-71c1d`
   - `VITE_FIREBASE_STORAGE_BUCKET` = `medianalytica-71c1d.firebasestorage.app`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = `965944324546`
   - `VITE_FIREBASE_APP_ID` = `1:965944324546:web:d0731f60ec2b28748fa65b`
   - `VITE_FIREBASE_MEASUREMENT_ID` = `G-61JFBSYM94`

**Pros:**
- ✅ Environment-specific values
- ✅ No hardcoded production URLs
- ✅ Easy to change in Vercel dashboard

**Cons:**
- ⚠️ Requires build step
- ⚠️ More setup

---

## Option 3: Runtime Environment Detection (No Build Needed)

### How It Works:
Use Vercel's automatic environment variable injection via a serverless function that serves config.

### Steps:

#### 1. Create `api/config.js`:

```javascript
// api/config.js
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  
  const config = {
    apiUrl: process.env.VITE_API_URL || 'http://localhost:5001',
    firebase: {
      apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'medianalytica-71c1d.firebaseapp.com',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'medianalytica-71c1d',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'medianalytica-71c1d.firebasestorage.app',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '965944324546',
      appId: process.env.VITE_FIREBASE_APP_ID || '1:965944324546:web:d0731f60ec2b28748fa65b',
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-61JFBSYM94'
    }
  };
  
  res.send(`window.__CONFIG__ = ${JSON.stringify(config, null, 2)};`);
}
```

#### 2. Update `analyze.html` to load config from API:

```html
<!-- Before other scripts -->
<script src="/api/config.js"></script>
<script>
  // Use window.__CONFIG__ instead of config from config.js
  const config = window.__CONFIG__ || {
    apiUrl: 'http://localhost:5001',
    // ... fallback config
  };
</script>
```

**Pros:**
- ✅ No build step
- ✅ Runtime configuration
- ✅ Environment-specific

**Cons:**
- ⚠️ Extra API call
- ⚠️ More complex setup

---

## Option 4: Use Vercel's Edge Config (Advanced)

For dynamic configuration that changes without redeployment.

**Not recommended** for your use case (overkill).

---

## 🎯 Recommendation

### For Your Project:

**Use Option 1 (Manual Configuration)** for now because:

1. ✅ **Simplest** - No build process needed
2. ✅ **Works immediately** - Just update `config.js`
3. ✅ **Firebase keys are public anyway** - They're meant to be in client-side code
4. ✅ **Only one value to change** - The API URL

### When to Use Option 2:

- If you have **multiple environments** (dev, staging, prod)
- If you want to **change values without code changes**
- If you're adding a **build process anyway**

---

## Quick Setup: Option 1 (Recommended)

### Step 1: Update `config.js`

```javascript
const config = {
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001'
        : 'https://your-backend.railway.app', // ← Your production backend URL
    // ... rest stays the same
};
```

### Step 2: Commit and Deploy

```bash
git add Skin-Disease-Classifier/js/config.js
git commit -m "Update API URL for production"
git push
```

Vercel will automatically redeploy with the new URL.

---

## Environment Variables Summary

| Option | Build Step | Complexity | Best For |
|--------|-----------|------------|----------|
| **Option 1: Manual** | ❌ No | ⭐ Simple | Your current setup |
| **Option 2: Build Script** | ✅ Yes | ⭐⭐ Medium | Multiple environments |
| **Option 3: Runtime API** | ❌ No | ⭐⭐⭐ Complex | Dynamic config |
| **Option 4: Edge Config** | ❌ No | ⭐⭐⭐⭐ Advanced | Enterprise needs |

---

## What You Actually Need

For your project, you only need to set:

1. **API URL** - Your backend URL (Railway/Render)
   - Currently: Hardcoded in `config.js`
   - Update to: Your production backend URL

2. **Firebase Config** - Already set, no changes needed
   - These are **public keys** (safe to expose)
   - They're meant to be in client-side code

---

## Vercel Environment Variables (If Using Option 2)

If you choose Option 2, set these in Vercel:

```
VITE_API_URL=https://your-backend.railway.app
VITE_FIREBASE_API_KEY=AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I
VITE_FIREBASE_AUTH_DOMAIN=medianalytica-71c1d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medianalytica-71c1d
VITE_FIREBASE_STORAGE_BUCKET=medianalytica-71c1d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=965944324546
VITE_FIREBASE_APP_ID=1:965944324546:web:d0731f60ec2b28748fa65b
VITE_FIREBASE_MEASUREMENT_ID=G-61JFBSYM94
```

---

## Summary

**Question**: Are there environment variables for the frontend?

**Answer**: 
- **Currently**: ❌ No, values are hardcoded in `config.js`
- **Recommended**: ✅ Just update `config.js` manually (Option 1)
- **Advanced**: ✅ Can use Vercel env vars with build script (Option 2)

**For your setup**: Just update the API URL in `config.js` - that's all you need! 🎯

