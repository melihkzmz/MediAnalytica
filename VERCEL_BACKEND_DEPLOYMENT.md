# 🚀 Vercel Backend Deployment Guide

## Can Vercel Deploy Flask Backend?

**Short Answer**: **Yes, but with significant limitations** ⚠️

Vercel **CAN** run Python/Flask applications, but it's **NOT ideal** for your use case (ML model inference).

---

## ✅ What Vercel CAN Do

### 1. **Serverless Functions**
- ✅ Run Python serverless functions
- ✅ Handle HTTP requests
- ✅ Support Flask (with adaptation)
- ✅ Auto-scaling
- ✅ Global edge network

### 2. **Python Runtime**
- ✅ Python 3.9, 3.10, 3.11
- ✅ Install packages via `requirements.txt`
- ✅ Environment variables support

---

## ❌ Critical Limitations for Your Project

### 1. **Function Timeout**
- ⚠️ **Hobby Plan**: 10 seconds max
- ⚠️ **Pro Plan**: 60 seconds max
- ⚠️ **Enterprise**: Up to 300 seconds

**Your ML models** (skin, bone, lung, eye disease prediction) may take longer than 10-60 seconds, especially:
- Model loading time (cold start)
- Image preprocessing
- Model inference
- Grad-CAM visualization

### 2. **Memory Limits**
- ⚠️ **Hobby**: 1GB RAM
- ⚠️ **Pro**: 3GB RAM
- ⚠️ **Enterprise**: Up to 10GB

**Your models are large**:
- `bone_4class_improved_finetuned.keras`: **93.99 MB**
- `skin_5class_efficientnetb3_macro_f1_finetuned.keras`: **74.22 MB**
- Multiple models loaded simultaneously = memory issues

### 3. **Cold Start Problem**
- ⚠️ First request after inactivity: **5-30 seconds** to load model
- ⚠️ Models need to be loaded into memory each time (if not cached)
- ⚠️ Poor user experience for image analysis

### 4. **File Size Limits**
- ⚠️ **Request body**: 4.5MB max (Hobby), 4.5MB (Pro)
- ⚠️ **Function package**: 50MB (Hobby), 250MB (Pro)
- ⚠️ Your models exceed these limits

### 5. **No Persistent Storage**
- ⚠️ Stateless functions (can't keep models in memory between requests)
- ⚠️ Need to reload models on each cold start

### 6. **No GPU Support**
- ⚠️ CPU-only inference (slower)
- ⚠️ No CUDA/GPU acceleration

---

## 🎯 Better Alternatives for Your Backend

### **Option 1: Railway** ⭐ (Recommended)
- ✅ **Unlimited** execution time
- ✅ **8GB RAM** (free tier)
- ✅ **Persistent** processes (models stay loaded)
- ✅ **Easy deployment** (GitHub integration)
- ✅ **Free tier** available
- ✅ **Custom domains**
- ✅ **Environment variables**
- ✅ **Logs & monitoring**

**Perfect for**: Flask apps with ML models

### **Option 2: Render**
- ✅ **Unlimited** execution time
- ✅ **512MB RAM** (free tier), 2GB+ (paid)
- ✅ **Persistent** processes
- ✅ **Free tier** available
- ✅ **Auto-deploy from GitHub**

**Good for**: Flask apps, slightly less generous than Railway

### **Option 3: Fly.io**
- ✅ **Unlimited** execution time
- ✅ **256MB RAM** (free tier), scalable
- ✅ **Global edge** deployment
- ✅ **Free tier** available

**Good for**: Flask apps with global distribution

### **Option 4: Google Cloud Run / AWS Lambda**
- ✅ **Scalable** serverless
- ✅ **Higher** timeout limits
- ✅ **GPU support** available (paid)
- ⚠️ More complex setup
- ⚠️ Pay-per-use pricing

---

## 🔧 How to Deploy Flask on Vercel (If You Still Want To)

### Step 1: Create `api/` Directory Structure

```
project-root/
├── api/
│   ├── predict.py          # Serverless function
│   ├── auth.py             # Auth endpoints
│   └── profile.py          # Profile endpoints
├── vercel.json
└── requirements.txt
```

### Step 2: Convert Flask Routes to Serverless Functions

**Example**: `api/predict.py`

```python
from vercel import Response
import tensorflow as tf
from PIL import Image
import io
import numpy as np

# Load model (cached between warm starts)
model = None

def load_model():
    global model
    if model is None:
        model = tf.keras.models.load_model('models/skin_model.keras')
    return model

def handler(request):
    if request.method != 'POST':
        return Response({'error': 'Method not allowed'}, status=405)
    
    # Get image from request
    image_file = request.files.get('image')
    if not image_file:
        return Response({'error': 'No image provided'}, status=400)
    
    # Load model (may take 5-10 seconds on cold start)
    model = load_model()
    
    # Preprocess image
    image = Image.open(io.BytesIO(image_file.read()))
    # ... preprocessing ...
    
    # Predict (may take 5-15 seconds)
    predictions = model.predict(preprocessed_image)
    
    return Response({
        'success': True,
        'predictions': predictions.tolist()
    })
```

### Step 3: Configure `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "functions": {
    "api/predict.py": {
      "maxDuration": 60
    }
  }
}
```

### Step 4: Limitations You'll Face

1. **Model Loading**: 5-30 seconds on cold start
2. **Inference Time**: May exceed 60 seconds
3. **Memory**: Large models may cause OOM errors
4. **Package Size**: Models may exceed 250MB limit

---

## 🎯 Recommended Architecture

### **Hybrid Approach** (Best Solution)

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │  ← Static files, fast CDN
└────────┬────────┘
         │
         │ API Calls
         │
┌────────▼────────┐
│   Backend       │
│   (Railway)     │  ← Flask API, ML models
└─────────────────┘
         │
         │
┌────────▼────────┐
│   Firebase      │
│   (Auth/DB)     │  ← Authentication, Database
└─────────────────┘
```

### Why This Works Best:

1. **Vercel**: 
   - ✅ Fast static file delivery
   - ✅ Global CDN
   - ✅ Free tier
   - ✅ Easy deployment

2. **Railway/Render**:
   - ✅ Handles long-running ML inference
   - ✅ Persistent model loading
   - ✅ No timeout issues
   - ✅ Better for CPU-intensive tasks

3. **Firebase**:
   - ✅ Already integrated
   - ✅ Handles auth & database
   - ✅ No changes needed

---

## 📊 Comparison Table

| Feature | Vercel | Railway | Render | Fly.io |
|---------|--------|---------|--------|--------|
| **Max Timeout** | 10-60s | Unlimited | Unlimited | Unlimited |
| **Memory** | 1-3GB | 8GB (free) | 512MB-2GB | 256MB+ |
| **ML Models** | ❌ Limited | ✅ Good | ✅ Good | ✅ Good |
| **Cold Start** | ⚠️ 5-30s | ✅ Minimal | ✅ Minimal | ✅ Minimal |
| **Free Tier** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Best For** | Frontend | Backend | Backend | Backend |

---

## 🚀 Quick Start: Deploy Backend to Railway

### Step 1: Create `Procfile`

```
web: python Skin-Disease-Classifier/auth_api.py
```

### Step 2: Update `auth_api.py` Port

```python
import os
port = int(os.getenv('PORT', 5001))
app.run(host="0.0.0.0", port=port, debug=False)
```

### Step 3: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repository
5. Railway auto-detects Python and installs dependencies
6. Add environment variables:
   - `FIREBASE_CREDENTIALS_PATH`
   - `PORT` (auto-set)
   - `FLASK_DEBUG=False`
   - `CORS_ORIGINS` (your Vercel URL)

### Step 4: Update Frontend Config

In `config.js`:
```javascript
apiUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:5001'
    : 'https://your-backend.railway.app'
```

---

## 💡 Final Recommendation

### ✅ **DO THIS**:
1. **Frontend** → Deploy to **Vercel** (perfect for static files)
2. **Backend** → Deploy to **Railway** or **Render** (perfect for Flask + ML)
3. **Database/Auth** → Keep on **Firebase** (already set up)

### ❌ **DON'T DO THIS**:
- ❌ Don't deploy Flask backend to Vercel (timeout/memory issues)
- ❌ Don't try to run ML models on Vercel serverless functions
- ❌ Don't use Vercel for long-running processes

---

## 📝 Summary

**Question**: Can Vercel deploy Flask backend for image analysis?

**Answer**: 
- **Technically**: Yes, with serverless functions
- **Practically**: **No, not recommended** for ML workloads
- **Best Practice**: Use Vercel for frontend, Railway/Render for backend

Your ML models need:
- ✅ Unlimited execution time
- ✅ Persistent memory (models stay loaded)
- ✅ More RAM (8GB+ recommended)
- ✅ No cold start delays

**Vercel doesn't provide these for ML workloads**, but **Railway/Render do**! 🎯

