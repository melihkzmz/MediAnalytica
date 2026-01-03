# 🔐 Environment Variables Guide

This document outlines the environment variables needed for the MediAnalytica project.

## Current Status

**⚠️ Currently, the project uses mostly hardcoded values.** For production deployment, you should set up environment variables.

---

## Required Environment Variables

### Backend (Flask) - `auth_api.py`

#### 1. **Firebase Credentials Path**
- **Current**: Hardcoded path to `firebase_credentials.json`
- **Should be**: Environment variable
- **Variable**: `FIREBASE_CREDENTIALS_PATH`
- **Example**: 
  ```bash
  export FIREBASE_CREDENTIALS_PATH="/path/to/firebase_credentials.json"
  ```
- **Or**: Use Firebase Admin SDK with environment variables (recommended)

#### 2. **Flask Port**
- **Current**: Hardcoded `port=5001`
- **Should be**: Environment variable
- **Variable**: `PORT` or `FLASK_PORT`
- **Example**:
  ```bash
  export PORT=5001
  ```

#### 3. **Flask Debug Mode**
- **Current**: Hardcoded `debug=True`
- **Should be**: Environment variable (MUST be `False` in production!)
- **Variable**: `FLASK_DEBUG` or `FLASK_ENV`
- **Example**:
  ```bash
  export FLASK_DEBUG=False  # Production
  export FLASK_DEBUG=True   # Development
  ```

#### 4. **CORS Origins**
- **Current**: Hardcoded localhost origins
- **Should be**: Environment variable (comma-separated)
- **Variable**: `CORS_ORIGINS`
- **Example**:
  ```bash
  export CORS_ORIGINS="http://localhost:3000,https://your-app.vercel.app,https://yourdomain.com"
  ```

---

## Recommended Environment Variables

### Backend

#### 5. **Redis URL (for Rate Limiting)**
- **Current**: Using `memory://` (not suitable for production)
- **Variable**: `REDIS_URL`
- **Example**:
  ```bash
  export REDIS_URL="redis://localhost:6379/0"
  # Or for cloud Redis:
  export REDIS_URL="redis://user:password@host:port"
  ```

#### 6. **Cache Type**
- **Variable**: `CACHE_TYPE`
- **Example**:
  ```bash
  export CACHE_TYPE="redis"  # or "simple" for development
  ```

#### 7. **Secret Key (for Flask sessions)**
- **Variable**: `SECRET_KEY`
- **Example**:
  ```bash
  export SECRET_KEY="your-secret-key-here"
  ```

---

## Frontend - `config.js`

### Currently Hardcoded (Should Use Environment Variables)

#### 8. **API Base URL**
- **Current**: Hardcoded in `config.js`
- **Variable**: `VITE_API_URL` or `REACT_APP_API_URL` (depending on build tool)
- **For Vercel**: Use Vercel environment variables
- **Example**:
  ```javascript
  apiUrl: process.env.VITE_API_URL || 
          (window.location.hostname === 'localhost' 
            ? 'http://localhost:5001' 
            : 'https://your-backend-api.railway.app')
  ```

#### 9. **Firebase Configuration**
- **Current**: Hardcoded in `config.js`
- **Should be**: Environment variables (for security)
- **Variables**:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

---

## Setup Instructions

### Option 1: Using `.env` File (Development)

Create a `.env` file in the project root:

```bash
# Backend
FIREBASE_CREDENTIALS_PATH=./firebase_credentials.json
PORT=5001
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500
REDIS_URL=memory://
CACHE_TYPE=simple
SECRET_KEY=your-secret-key-change-this

# Frontend (if using build tool)
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=AIzaSyBPcwGb9N_fHXA6TPaztHbn9Dg-8lvoq2I
VITE_FIREBASE_AUTH_DOMAIN=medianalytica-71c1d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medianalytica-71c1d
VITE_FIREBASE_STORAGE_BUCKET=medianalytica-71c1d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=965944324546
VITE_FIREBASE_APP_ID=1:965944324546:web:d0731f60ec2b28748fa65b
```

**Install python-dotenv**:
```bash
pip install python-dotenv
```

**Update `auth_api.py`**:
```python
from dotenv import load_dotenv
load_dotenv()

# Then use:
CRED_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', './firebase_credentials.json')
PORT = int(os.getenv('PORT', 5001))
DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
```

### Option 2: Platform-Specific Environment Variables

#### For Vercel (Frontend)
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add variables with prefix `VITE_` or `NEXT_PUBLIC_`

#### For Railway/Render (Backend)
1. Go to your service settings
2. Navigate to "Environment" or "Variables"
3. Add all backend environment variables

---

## Security Best Practices

### ✅ DO:
- ✅ Use environment variables for sensitive data
- ✅ Never commit `.env` files to Git (already in `.gitignore`)
- ✅ Never commit `firebase_credentials.json` (already in `.gitignore`)
- ✅ Use different values for development and production
- ✅ Rotate secrets regularly
- ✅ Use strong, random secret keys

### ❌ DON'T:
- ❌ Hardcode API keys or secrets
- ❌ Commit credentials to Git
- ❌ Use `debug=True` in production
- ❌ Share `.env` files publicly

---

## Current Configuration Status

| Item | Status | Action Needed |
|------|--------|---------------|
| Firebase Credentials | ⚠️ Hardcoded path | Set `FIREBASE_CREDENTIALS_PATH` |
| Flask Port | ⚠️ Hardcoded | Set `PORT` |
| Flask Debug | ⚠️ Hardcoded `True` | Set `FLASK_DEBUG=False` (production) |
| CORS Origins | ⚠️ Hardcoded | Set `CORS_ORIGINS` |
| API URL (Frontend) | ⚠️ Hardcoded | Update `config.js` with env var |
| Firebase Config | ⚠️ Hardcoded | Move to environment variables |
| Redis URL | ⚠️ Using memory | Set `REDIS_URL` for production |
| Secret Key | ❌ Not set | Generate and set `SECRET_KEY` |

---

## Quick Setup for Production

### Backend (Railway/Render/Heroku)

```bash
# Set these in your hosting platform's environment variables:
FIREBASE_CREDENTIALS_PATH=/app/firebase_credentials.json
PORT=5001
FLASK_DEBUG=False
CORS_ORIGINS=https://your-app.vercel.app,https://yourdomain.com
REDIS_URL=redis://your-redis-url
CACHE_TYPE=redis
SECRET_KEY=generate-a-strong-random-key
```

### Frontend (Vercel)

```bash
# Set these in Vercel dashboard:
VITE_API_URL=https://your-backend-api.railway.app
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Testing Environment Variables

### Check if variables are loaded:
```python
# In Python
import os
print(os.getenv('PORT'))
print(os.getenv('FLASK_DEBUG'))
```

### Check in browser console:
```javascript
// In browser console
console.log(process.env.VITE_API_URL);
```

---

## Next Steps

1. ✅ Create `.env` file for local development
2. ✅ Update `auth_api.py` to use environment variables
3. ✅ Update `config.js` to use environment variables (if using build tool)
4. ✅ Set environment variables in your hosting platforms
5. ✅ Test locally with `.env` file
6. ✅ Deploy and verify production environment variables

---

**Note**: The current code works with hardcoded values, but for production deployment, you should migrate to environment variables for better security and flexibility.

