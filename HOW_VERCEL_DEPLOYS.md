# 🔍 How Vercel Knows What to Deploy

## Quick Answer

Vercel deploys **everything** in your repository, but only **serves/executes** static files (HTML, CSS, JS, images). Python files are included but **not executed** - they're just static files.

---

## How Vercel Determines What to Deploy

### 1. **File Detection**

Vercel looks at your project and detects file types:

```
Your Project Structure:
├── Skin-Disease-Classifier/
│   ├── analyze.html          ← Frontend (will be served)
│   ├── css/                  ← Frontend (will be served)
│   ├── js/                   ← Frontend (will be served)
│   ├── images/               ← Frontend (will be served)
│   ├── auth_api.py           ← Backend (included but NOT executed)
│   ├── requirements.txt      ← Backend (included but NOT executed)
│   └── models/               ← Backend (included but NOT executed)
└── vercel.json               ← Configuration file
```

### 2. **Framework Preset Detection**

When you select **"Other"** framework preset:
- ✅ Vercel treats it as a **static site**
- ✅ It looks for HTML, CSS, JS files
- ✅ It serves them as static files
- ❌ It does **NOT** execute Python files
- ❌ It does **NOT** run Flask

### 3. **vercel.json Configuration**

Your `vercel.json` tells Vercel:

```json
{
  "outputDirectory": "Skin-Disease-Classifier",  // ← Deploy files from here
  "rewrites": [
    {
      "source": "/",
      "destination": "/Skin-Disease-Classifier/analyze.html"  // ← Serve this as homepage
    }
  ]
}
```

This means:
- ✅ Deploy all files from `Skin-Disease-Classifier/`
- ✅ Serve `analyze.html` when someone visits `/`
- ✅ Serve other static files (CSS, JS, images) as requested

---

## What Gets Deployed vs What Gets Executed

### ✅ **Deployed AND Served** (Frontend):
- `analyze.html` → Served as HTML
- `css/*.css` → Served as stylesheets
- `js/*.js` → Served as JavaScript
- `images/*.png` → Served as images
- `fonts/*.woff` → Served as fonts

### 📦 **Deployed but NOT Executed** (Backend):
- `auth_api.py` → Included in deployment, but **not executed**
- `requirements.txt` → Included, but **not used**
- `*.py` files → Included, but **not run**
- `models/*.keras` → Included, but **not loaded**

**Why this is OK:**
- These files don't need to run on Vercel
- They're just static files taking up space
- Your backend runs on Railway/Render, not Vercel

---

## Step-by-Step: What Vercel Does

### 1. **Clone Your Repository**
```bash
git clone https://github.com/melihkzmz/MediAnalytica.git
```

### 2. **Read vercel.json**
```json
{
  "outputDirectory": "Skin-Disease-Classifier"
}
```
→ "I should deploy files from `Skin-Disease-Classifier/`"

### 3. **Detect Framework**
- Framework preset: "Other"
- No `package.json` with build scripts
- Has HTML files
→ "This is a static site"

### 4. **Deploy Files**
- Copies all files from `Skin-Disease-Classifier/` to Vercel's CDN
- HTML, CSS, JS, images, Python files, models - **everything**

### 5. **Serve Static Files**
- When user visits `https://your-app.vercel.app/`:
  - Vercel serves `analyze.html`
- When browser requests `css/bootstrap.min.css`:
  - Vercel serves that file
- When browser requests `js/config.js`:
  - Vercel serves that file
- If someone tries to access `auth_api.py`:
  - Vercel serves it as a text file (not executed)

---

## Visual Flow

```
┌─────────────────────────────────────────┐
│  Your GitHub Repository                 │
│  ┌───────────────────────────────────┐  │
│  │ Skin-Disease-Classifier/          │  │
│  │ ├── analyze.html  ← Frontend      │  │
│  │ ├── css/         ← Frontend      │  │
│  │ ├── js/          ← Frontend      │  │
│  │ ├── auth_api.py  ← Backend        │  │
│  │ └── models/      ← Backend        │  │
│  └───────────────────────────────────┘  │
│  └── vercel.json                        │
└─────────────────────────────────────────┘
              │
              │ Vercel clones repo
              ▼
┌─────────────────────────────────────────┐
│  Vercel Deployment                      │
│  ┌───────────────────────────────────┐  │
│  │ Reads vercel.json                   │  │
│  │ "outputDirectory: Skin-Disease..." │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Detects Framework: "Other"        │  │
│  │ "This is a static site"          │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Deploys ALL files to CDN           │  │
│  │ ✅ HTML, CSS, JS (served)          │  │
│  │ 📦 Python files (included, not run)│  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
              │ User visits site
              ▼
┌─────────────────────────────────────────┐
│  Vercel CDN                             │
│  ┌───────────────────────────────────┐  │
│  │ Serves static files:               │  │
│  │ ✅ analyze.html                    │  │
│  │ ✅ css/bootstrap.min.css           │  │
│  │ ✅ js/config.js                    │  │
│  │ ✅ images/logo.png                 │  │
│  │                                     │  │
│  │ Does NOT execute:                  │  │
│  │ ❌ auth_api.py (just a file)       │  │
│  │ ❌ requirements.txt (just a file) │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Key Points

### ✅ **Vercel Deploys:**
- Everything in `Skin-Disease-Classifier/` directory
- All files (frontend + backend)

### ✅ **Vercel Serves:**
- Only static files (HTML, CSS, JS, images, fonts)
- These are what the browser needs

### ❌ **Vercel Does NOT:**
- Execute Python files
- Run Flask
- Install Python packages
- Load ML models
- Process API requests

### 🎯 **Why This Works:**
- Your frontend (HTML/CSS/JS) runs in the **browser**
- Your backend (Flask) runs on **Railway/Render**
- Vercel just **serves** the frontend files
- Python files are harmless - they're just static files

---

## How to Verify

After deployment, you can check:

1. **Frontend works**: Visit `https://your-app.vercel.app/`
   - Should see your `analyze.html` page

2. **Static files work**: Check browser DevTools → Network
   - CSS, JS, images should load from Vercel

3. **Python files exist but don't run**: 
   - Try: `https://your-app.vercel.app/auth_api.py`
   - You'll see the file content (text), but it won't execute

---

## Summary

**Question**: How does Vercel know to deploy the frontend?

**Answer**:
1. ✅ `vercel.json` tells it which directory to deploy (`Skin-Disease-Classifier/`)
2. ✅ Framework preset "Other" tells it this is a static site
3. ✅ Vercel deploys **all files** but only **serves static files** (HTML, CSS, JS)
4. ✅ Python files are included but **not executed** (they're just files)
5. ✅ Your backend runs separately on Railway/Render

**Bottom line**: Vercel serves your frontend files. Python files are just along for the ride - they don't hurt anything, but they also don't do anything on Vercel! 🎯

