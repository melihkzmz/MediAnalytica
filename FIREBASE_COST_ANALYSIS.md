# 💰 Firebase Free Tier Cost Analysis

## 📊 Firebase Functions Free Tier Limits (2024)

### **Free Tier Allowances:**
- ✅ **Invocations**: 2 million/month (FREE)
- ✅ **Compute Time**: 400,000 GB-seconds/month (FREE)
- ✅ **CPU Time**: 200,000 CPU-seconds/month (FREE)
- ✅ **Outbound Networking**: 5 GB/month (FREE)

### **After Free Tier (Paid):**
- Invocations: $0.40 per million
- GB-seconds: $0.0000025 per GB-second
- CPU-seconds: $0.0000100 per CPU-second
- Networking: $0.12 per GB

---

## 🔬 Your Usage Analysis

### **API Calls Per User Analysis:**

**One complete analysis includes:**
1. `GET /api/user/profile` - Check backend (1 call)
2. `POST /bonePredict/predict` - ML prediction (1 call)
3. `POST /api/user/analyses` - Save results (1 call)
4. `GET /api/user/stats` - Update stats (1 call, cached)

**Total: ~4 function invocations per analysis**

### **Other API Calls:**
- Profile photo upload: 1-2 calls
- View history: 1 call (cached)
- Favorites: 1-2 calls
- Appointments: 1-2 calls

**Average: ~5-8 function calls per active user session**

---

## 📈 Cost Calculation Examples

### **Scenario 1: Small Scale (100 users/month, 2 analyses each)**

**Usage:**
- Total analyses: 200/month
- Function invocations: 200 × 4 = **800 invocations**
- Average execution: 5 seconds
- Memory: 1GB (for ML models)

**Cost Calculation:**
- **Invocations**: 800 / 2,000,000 = **0.04% of free tier** ✅
- **GB-seconds**: 800 × 5s × 1GB = **4,000 GB-seconds** (1% of free tier) ✅
- **CPU-seconds**: 800 × 5s = **4,000 CPU-seconds** (2% of free tier) ✅
- **Networking**: ~50MB = **0.05GB** (1% of free tier) ✅

**Result: $0/month** ✅

---

### **Scenario 2: Medium Scale (1,000 users/month, 5 analyses each)**

**Usage:**
- Total analyses: 5,000/month
- Function invocations: 5,000 × 4 = **20,000 invocations**
- Average execution: 5 seconds
- Memory: 1GB

**Cost Calculation:**
- **Invocations**: 20,000 / 2,000,000 = **1% of free tier** ✅
- **GB-seconds**: 20,000 × 5s × 1GB = **100,000 GB-seconds** (25% of free tier) ✅
- **CPU-seconds**: 20,000 × 5s = **100,000 CPU-seconds** (50% of free tier) ✅
- **Networking**: ~500MB = **0.5GB** (10% of free tier) ✅

**Result: $0/month** ✅

---

### **Scenario 3: Large Scale (10,000 users/month, 10 analyses each)**

**Usage:**
- Total analyses: 100,000/month
- Function invocations: 100,000 × 4 = **400,000 invocations**
- Average execution: 5 seconds
- Memory: 1GB

**Cost Calculation:**
- **Invocations**: 400,000 / 2,000,000 = **20% of free tier** ✅
- **GB-seconds**: 400,000 × 5s × 1GB = **2,000,000 GB-seconds** ❌ (500% - EXCEEDS!)
- **CPU-seconds**: 400,000 × 5s = **2,000,000 CPU-seconds** ❌ (1000% - EXCEEDS!)
- **Networking**: ~5GB = **5GB** (100% of free tier) ✅

**Cost for exceeding:**
- GB-seconds overage: (2,000,000 - 400,000) × $0.0000025 = **$4.00/month**
- CPU-seconds overage: (2,000,000 - 200,000) × $0.0000100 = **$18.00/month**

**Result: ~$22/month** ⚠️

---

### **Scenario 4: Very Large Scale (100,000 users/month, 10 analyses each)**

**Usage:**
- Total analyses: 1,000,000/month
- Function invocations: 1,000,000 × 4 = **4,000,000 invocations**
- Average execution: 5 seconds
- Memory: 1GB

**Cost Calculation:**
- **Invocations**: 4,000,000 / 2,000,000 = **200%** ❌
  - Overage: 2,000,000 × $0.40/1M = **$0.80/month**
- **GB-seconds**: 4,000,000 × 5s × 1GB = **20,000,000 GB-seconds** ❌
  - Overage: (20,000,000 - 400,000) × $0.0000025 = **$49.00/month**
- **CPU-seconds**: 4,000,000 × 5s = **20,000,000 CPU-seconds** ❌
  - Overage: (20,000,000 - 200,000) × $0.0000100 = **$198.00/month**

**Result: ~$248/month** ⚠️⚠️

---

## 🎯 Critical Factor: ML Model Memory Usage

### **Memory Requirements:**

**Your ML Models:**
- Bone disease model: ~100-200MB
- Skin disease model: ~150-300MB
- TensorFlow runtime: ~200-400MB
- Image processing: ~100-200MB
- **Total: ~1-2GB per function**

**Recommendation:**
- Use **1GB memory** for ML functions (minimum)
- Use **2GB memory** for better performance
- This affects GB-seconds calculation!

### **Optimization:**
If you use **2GB memory**:
- GB-seconds = invocations × seconds × 2GB
- **Doubles your GB-seconds usage!**

**Example (1,000 analyses with 2GB):**
- GB-seconds: 1,000 × 5s × 2GB = **10,000 GB-seconds** ✅ (still within free tier)

---

## 📊 Free Tier Capacity Summary

### **What You Can Do for FREE:**

| Users/Month | Analyses/User | Total Analyses | Status |
|-------------|---------------|----------------|--------|
| 100 | 2 | 200 | ✅ **FREE** |
| 500 | 5 | 2,500 | ✅ **FREE** |
| 1,000 | 5 | 5,000 | ✅ **FREE** |
| 2,000 | 10 | 20,000 | ✅ **FREE** (close to limit) |
| 5,000 | 10 | 50,000 | ⚠️ **~$5-10/month** |
| 10,000 | 10 | 100,000 | ⚠️ **~$22/month** |

### **Safe Zone (Well Within Free Tier):**
- **Up to 2,000 active users/month**
- **Up to 20,000 analyses/month**
- **100% FREE** ✅

---

## 🔍 Other Firebase Services (Also Free Tier)

### **Firestore:**
- ✅ **50,000 reads/day** (FREE)
- ✅ **20,000 writes/day** (FREE)
- ✅ **20,000 deletes/day** (FREE)
- ✅ **1GB storage** (FREE)

**Your usage:**
- Each analysis: 1 write (save analysis)
- Each history view: 1-20 reads
- **20,000 analyses = 20,000 writes** ✅ (within daily limit)

### **Firebase Storage:**
- ✅ **5GB storage** (FREE)
- ✅ **1GB downloads/day** (FREE)

**Your usage:**
- Profile photos: ~100KB each
- Analysis images: ~500KB each
- **5,000 images = ~2.5GB** ✅ (within free tier)

### **Firebase Authentication:**
- ✅ **Unlimited** (FREE)
- No limits on users or authentications

---

## 💡 Cost Optimization Strategies

### **1. Reduce Memory Usage**
- Use **1GB** instead of 2GB (if models fit)
- Saves 50% on GB-seconds

### **2. Optimize Execution Time**
- Cache models in memory (already doing this)
- Optimize image preprocessing
- Use lighter models if possible

### **3. Reduce Cold Starts**
- Keep functions warm with Cloud Scheduler
- Reduces unnecessary invocations

### **4. Cache Results**
- Cache API responses (already implemented)
- Reduces Firestore reads

### **5. Batch Operations**
- Batch multiple operations when possible
- Reduces function invocations

---

## 🎯 Realistic Estimate for Your Project

### **Assumptions:**
- Starting small: 100-500 users/month
- Average: 3-5 analyses per user
- Memory: 1GB per ML function
- Execution: 5 seconds average

### **Monthly Usage:**
- **500 users × 4 analyses = 2,000 analyses**
- **Invocations: 2,000 × 4 = 8,000** (0.4% of free tier) ✅
- **GB-seconds: 8,000 × 5s × 1GB = 40,000** (10% of free tier) ✅
- **CPU-seconds: 8,000 × 5s = 40,000** (20% of free tier) ✅

### **Result: $0/month** ✅✅✅

---

## ⚠️ When You'll Start Paying

### **Break-even Point:**
- **~20,000 analyses/month** = Still mostly free
- **~50,000 analyses/month** = ~$5-10/month
- **~100,000 analyses/month** = ~$20-25/month

### **Growth Path:**
1. **0-20K analyses/month**: **FREE** ✅
2. **20K-50K analyses/month**: **$0-10/month** ✅
3. **50K-100K analyses/month**: **$10-25/month** ✅
4. **100K+ analyses/month**: **$25+/month** ⚠️

---

## 📋 Monthly Cost Breakdown (Example: 50,000 analyses)

| Service | Free Tier | Your Usage | Overage | Cost |
|---------|-----------|------------|---------|------|
| Functions Invocations | 2M | 200K | 0 | $0 |
| Functions GB-seconds | 400K | 1M | 600K | $1.50 |
| Functions CPU-seconds | 200K | 1M | 800K | $8.00 |
| Functions Networking | 5GB | 2.5GB | 0 | $0 |
| Firestore | 50K reads/day | ~30K/day | 0 | $0 |
| Storage | 5GB | ~3GB | 0 | $0 |
| **TOTAL** | | | | **~$9.50/month** |

---

## ✅ Final Answer

### **Will it exceed free tier?**

**For most use cases: NO!** ✅

**You'll stay FREE if:**
- ✅ Less than 2,000 active users/month
- ✅ Less than 20,000 analyses/month
- ✅ Using 1GB memory per function
- ✅ Average execution < 6 seconds

**You'll pay a small amount if:**
- ⚠️ 5,000+ active users/month
- ⚠️ 50,000+ analyses/month
- ⚠️ Using 2GB+ memory
- ⚠️ Long execution times (>10 seconds)

### **Recommendation:**

1. **Start with Firebase Functions** - It's FREE for your initial scale
2. **Monitor usage** in Firebase Console
3. **Set budget alerts** at $10/month
4. **Optimize when you grow** (reduce memory, cache more)

**For a new project, Firebase Functions free tier is MORE than enough!** 🎉

---

## 🔔 Setting Up Budget Alerts

1. Go to Firebase Console → Project Settings → Usage and Billing
2. Set budget alert at $10/month
3. Get email notifications if approaching limit
4. Monitor daily usage

**You'll have plenty of warning before any charges!** ✅

