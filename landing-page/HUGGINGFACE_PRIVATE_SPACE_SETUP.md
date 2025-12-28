# Private Hugging Face Space Setup Guide

## 🔒 For Private Spaces

If your Hugging Face Space is **private**, you need to authenticate API requests. We've set up a secure proxy solution.

## ✅ Solution: Next.js API Proxy Route

The proxy route (`/app/api/predict/[...disease]/route.ts`) keeps your Hugging Face token secure on the server side.

## 📋 Setup Steps

### Step 1: Enable Proxy Mode

In your `.env.local` file (or Vercel environment variables):

```env
# Enable proxy for private Spaces
NEXT_PUBLIC_USE_HF_PROXY=true

# Your Space URL
NEXT_PUBLIC_HF_SPACE_URL=https://melihkzmz-medianalytica.hf.space

# Your Hugging Face Token (SERVER-SIDE ONLY - never expose to client!)
HF_TOKEN=hf_your_token_here
```

### Step 2: Get Your Hugging Face Token

1. Go to: https://huggingface.co/settings/tokens
2. Create a new token with **read** permissions
3. Copy the token

### Step 3: Add Token to Vercel (Production)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `HF_TOKEN` = `hf_your_token_here`
   - `NEXT_PUBLIC_USE_HF_PROXY` = `true`
   - `NEXT_PUBLIC_HF_SPACE_URL` = `https://your-space.hf.space`

### Step 4: Test Locally

```bash
cd landing-page

# Create .env.local file
echo "HF_TOKEN=hf_your_token_here" > .env.local
echo "NEXT_PUBLIC_USE_HF_PROXY=true" >> .env.local
echo "NEXT_PUBLIC_HF_SPACE_URL=https://melihkzmz-medianalytica.hf.space" >> .env.local

# Restart dev server
npm run dev
```

## 🔄 How It Works

1. **Frontend** → Calls `/api/predict/skin` (or bone, lung, eye)
2. **Next.js API Route** → Adds `Authorization: Bearer <token>` header
3. **Hugging Face Space** → Receives authenticated request
4. **Response** → Returns to frontend

## ⚠️ Security Notes

- ✅ `HF_TOKEN` is **never** exposed to the client
- ✅ Token is only used server-side in the API route
- ✅ Frontend never sees the token

## 🔄 Alternative: Make Space Public

If you want to avoid token management:

1. Go to your Space settings on Hugging Face
2. Change visibility from **Private** to **Public**
3. Set `NEXT_PUBLIC_USE_HF_PROXY=false` (or remove it)
4. No token needed!

## 🧪 Testing

Test the proxy endpoint:

```bash
curl -X POST http://localhost:3000/api/predict/skin \
  -F "image=@test_image.jpg"
```

## 📝 Troubleshooting

### Error: "HF_TOKEN not configured"
- Make sure `HF_TOKEN` is set in `.env.local` (local) or Vercel environment variables (production)
- Restart your dev server after adding environment variables

### Error: "401 Unauthorized"
- Check that your token is valid
- Make sure token has read permissions
- Verify the Space URL is correct

### Error: "Connection refused"
- Check that your Space is running
- Verify the Space URL is correct
- Check Space logs on Hugging Face

