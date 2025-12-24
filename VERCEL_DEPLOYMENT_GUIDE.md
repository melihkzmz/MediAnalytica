# 🚀 Vercel Deployment Guide - MediAnalytica Frontend

This guide will walk you through deploying your MediAnalytica frontend to Vercel.

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free at [vercel.com](https://vercel.com))
- ✅ Your Flask backend deployed and accessible (Railway, Render, Heroku, etc.)
- ✅ Firebase project configured

---

## Step 1: Prepare Your Repository

### 1.1 Ensure Your Code is on GitHub

```bash
# If not already on GitHub, initialize and push
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MediAnalytica.git
git push -u origin main
```

### 1.2 Update API Configuration

Update `Skin-Disease-Classifier/js/config.js` with your production API URL:

```javascript
apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : 'https://your-backend-api.railway.app', // Replace with your backend URL
```

---

## Step 2: Create Vercel Configuration

### 2.1 Create `vercel.json` in Root Directory

Create a `vercel.json` file in the root of your project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "Skin-Disease-Classifier/analyze.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/Skin-Disease-Classifier/$1"
    },
    {
      "src": "/",
      "dest": "/Skin-Disease-Classifier/analyze.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 2.2 Alternative: Simple Configuration (Recommended)

If the above doesn't work, use this simpler approach:

```json
{
  "version": 2,
  "public": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/Skin-Disease-Classifier/$1"
    }
  ]
}
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Click "Add New Project"**

3. **Import Your Repository**
   - Select your `MediAnalytica` repository
   - Click "Import"

4. **Configure Project Settings** ⚠️ IMPORTANT
   - **Framework Preset**: **Other** (or leave blank) 
     - ❌ **DO NOT** select Flask - Flask is for backend only!
     - ✅ Your frontend is static HTML/CSS/JS, so use "Other"
   - **Root Directory**: `Skin-Disease-Classifier` (if you want to deploy from that folder)
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty or set to `.`
   - **Install Command**: Leave empty
   
   **Note**: Flask is your **backend framework** (Python). You're deploying the **frontend** (HTML/CSS/JS) to Vercel, so use "Other" preset.

5. **Environment Variables** (Optional - if using env vars)
   - Click "Environment Variables"
   - Add if needed:
     - `VITE_API_URL` (if you're using Vite)
     - Or configure in `config.js` directly

6. **Click "Deploy"**

7. **Wait for Deployment** (usually 1-2 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Project Root**
   ```bash
   cd C:\Users\melih\dev\MediAnalytica
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   
   - Follow the prompts:
     - Set up and deploy? **Yes**
     - Which scope? Select your account
     - Link to existing project? **No** (first time)
     - Project name? `medianalytica` (or your choice)
     - Directory? `Skin-Disease-Classifier`
     - Override settings? **No**

5. **Production Deploy**
   ```bash
   vercel --prod
   ```

---

## Step 4: Configure Your Domain (Optional)

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Step 5: Update Backend CORS Settings

Make sure your Flask backend allows requests from your Vercel domain:

```python
# In auth_api.py
from flask_cors import CORS

# Allow your Vercel domain
CORS(app, origins=[
    "http://localhost:3000",
    "https://your-app.vercel.app",  # Add your Vercel URL
    "https://*.vercel.app"  # Or allow all Vercel subdomains
])
```

---

## Step 6: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Test Features**:
   - ✅ User registration/login
   - ✅ Image upload
   - ✅ API calls to backend
   - ✅ Firebase authentication
   - ✅ Profile photo upload

---

## Troubleshooting

### Issue: 404 Errors
**Solution**: Check your `vercel.json` routing configuration

### Issue: API Calls Failing
**Solution**: 
- Verify backend URL in `config.js`
- Check CORS settings on backend
- Verify backend is deployed and accessible

### Issue: Static Assets Not Loading
**Solution**: 
- Ensure `css/`, `js/`, `images/` folders are in the deployed directory
- Check file paths are relative, not absolute

### Issue: Firebase Errors
**Solution**: 
- Verify Firebase config in `config.js`
- Check Firebase project settings allow your Vercel domain

---

## Environment Variables (If Needed)

If you want to use environment variables instead of hardcoding:

1. **In Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`

2. **Update `config.js`**:
   ```javascript
   apiUrl: process.env.NEXT_PUBLIC_API_URL || 
           (window.location.hostname === 'localhost' 
             ? 'http://localhost:5001' 
             : 'https://your-backend-url.com')
   ```

---

## Continuous Deployment

Once connected to GitHub:
- ✅ Every push to `main` branch = automatic production deployment
- ✅ Every pull request = preview deployment
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## Next Steps

1. ✅ Deploy backend separately (Railway, Render, etc.)
2. ✅ Update `config.js` with production API URL
3. ✅ Test all features
4. ✅ Set up custom domain (optional)
5. ✅ Configure monitoring/analytics

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions

---

**Note**: Remember to update your backend API URL in production and ensure CORS is properly configured!

