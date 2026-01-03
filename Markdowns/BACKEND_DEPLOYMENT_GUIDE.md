# 🚀 Backend API Deployment Guide

## Overview
Your Flask backend (`auth_api.py`) needs to be deployed. You have two options:
1. **Firebase Functions** (Recommended - integrates with your Firebase project)
2. **Vercel Serverless Functions** (Uses your existing Vercel account)

---

## Option 1: Firebase Cloud Functions (Recommended)

### Why Firebase Functions?
- ✅ Same Firebase project (no extra setup)
- ✅ No CORS issues (same domain)
- ✅ Free tier: 2M invocations/month
- ✅ Automatic scaling
- ✅ Integrated with Firebase Admin SDK

### Prerequisites
- Node.js installed (for Firebase CLI)
- Firebase project already set up
- `firebase_credentials.json` file in project root

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Functions
```bash
cd C:\Users\melih\dev\MediAnalytica
firebase init functions
```

**When prompted:**
- Select **Python** as the language
- Use existing project: `medianalytica-71c1d`
- Install dependencies? **Yes**

### Step 4: Project Structure
After initialization, you'll have:
```
MediAnalytica/
├── functions/
│   ├── main.py          # Your Flask app will go here
│   ├── requirements.txt  # Python dependencies
│   └── .gitignore
├── firebase.json
└── .firebaserc
```

### Step 5: Convert Flask App to Firebase Function

Create `functions/main.py`:

```python
import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
from flask import Flask, Request, jsonify
import os
import json

# Initialize Firebase Admin
cred = credentials.Certificate('../firebase_credentials.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
bucket = storage.bucket()

app = Flask(__name__)

# Import your routes from auth_api.py
# You'll need to adapt them for Cloud Functions

def verify_token(request):
    """Verify Firebase ID token from request"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, jsonify({"success": False, "error": "No token provided"}), 401
    
    token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid'], None, None
    except Exception as e:
        return None, jsonify({"success": False, "error": str(e)}), 401

@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    uid, error_response, status_code = verify_token(request)
    if uid is None:
        return error_response, status_code
    
    try:
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        return jsonify({
            "success": True,
            "profile": {
                "displayName": user_data.get('displayName'),
                "photoURL": user_data.get('photoURL'),
                "email": user_data.get('email'),
                "settings": user_data.get('settings', {})
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Add all other routes from auth_api.py here...

# Cloud Function wrapper
def api(request):
    """Cloud Function entry point"""
    with app.request_context(request.environ):
        return app.full_dispatch_request()
```

### Step 6: Create `functions/requirements.txt`
```txt
firebase-admin==6.2.0
flask==2.3.3
flask-cors==4.0.0
```

### Step 7: Deploy
```bash
firebase deploy --only functions
```

### Step 8: Update Frontend Config
After deployment, you'll get a URL like:
```
https://us-central1-medianalytica-71c1d.cloudfunctions.net/api
```

Update `Skin-Disease-Classifier/js/config.js`:
```javascript
apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : 'https://us-central1-medianalytica-71c1d.cloudfunctions.net/api',
```

---

## Option 2: Vercel Serverless Functions

### Why Vercel Functions?
- ✅ Same platform as your frontend
- ✅ Automatic deployments from GitHub
- ✅ Free tier: 100GB-hours/month
- ✅ Easy to set up

### Step 1: Create API Directory
```bash
mkdir api
```

### Step 2: Create `api/user/profile.js` (or `.py` with Python runtime)

For Node.js (easier with Vercel):
```javascript
// api/user/profile.js
const admin = require('firebase-admin');
const serviceAccount = require('../../firebase_credentials.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://medi-analytica.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verify token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  let uid;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    uid = decodedToken.uid;
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  
  if (req.method === 'GET') {
    try {
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      const userData = userDoc.data();
      return res.status(200).json({
        success: true,
        profile: {
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          email: userData.email,
          settings: userData.settings || {}
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
```

### Step 3: Create `vercel.json` (update existing)
```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": "Skin-Disease-Classifier",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/",
      "destination": "/analyze.html"
    }
  ]
}
```

### Step 4: Deploy to Vercel
```bash
vercel --prod
```

Or push to GitHub (auto-deploys if connected)

### Step 5: Update Frontend Config
```javascript
apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : 'https://medi-analytica.vercel.app',  // Same domain, no CORS!
```

---

## 🎯 Recommendation

**Use Firebase Functions** because:
1. Your backend already uses Firebase Admin SDK
2. Easier to convert Flask → Firebase Functions
3. Better integration with your Firebase project
4. No CORS configuration needed

---

## 📝 Next Steps After Deployment

1. **Test the API**
   - Try: `GET /api/user/profile` with auth token
   - Check browser console for errors

2. **Update CORS** (if using separate domain)
   - Add your Vercel domain to allowed origins

3. **Environment Variables**
   - Set `CORS_ORIGINS` if needed
   - Add any other config

4. **Monitor**
   - Firebase Console → Functions (for Firebase)
   - Vercel Dashboard → Functions (for Vercel)

---

## ⚠️ Important Notes

1. **Firebase Credentials**: Keep `firebase_credentials.json` secure
   - Don't commit to GitHub
   - Add to `.gitignore`
   - Use environment variables in production

2. **Cold Starts**: First request may be slow (1-2 seconds)
   - Normal for serverless functions
   - Subsequent requests are fast

3. **Function Timeout**: 
   - Firebase: 60 seconds (free), 540 seconds (paid)
   - Vercel: 10 seconds (free), 60 seconds (paid)

4. **File Uploads**: 
   - Profile photos: Use Firebase Storage directly from frontend
   - Or use multipart/form-data in functions

---

## 🆘 Troubleshooting

### CORS Errors
- Check `Access-Control-Allow-Origin` header
- Verify frontend URL is in allowed origins

### Authentication Errors
- Verify Firebase credentials are correct
- Check token is being sent in Authorization header

### Function Not Found
- Check function name matches route
- Verify deployment was successful

---

## 📚 Resources

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Vercel Functions Docs](https://vercel.com/docs/functions)
- [Flask to Cloud Functions Migration](https://cloud.google.com/functions/docs/migrating/flask)

