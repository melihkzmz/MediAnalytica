# Whereby Setup Guide

## Overview
Whereby is a simple, free video conferencing solution that works great with custom domains.

**Benefits:**
- ✅ Simple integration (no JWT needed)
- ✅ Free tier available
- ✅ Custom domain support
- ✅ No authentication issues
- ✅ Clean iframe embedding

## Step 1: Get Whereby API Key (Optional)

1. **Sign up for Whereby**:
   - Go to https://whereby.com/
   - Sign up for a free account
   - Navigate to Dashboard → Configure → API Keys

2. **Generate API Key** (optional):
   - Click "Generate key"
   - Copy the API key
   - Note: API key is optional - direct URLs work without it

## Step 2: Configure Custom Domain

1. **Set up your domain**:
   - Your domain: `medianalytica.whereby.com`
   - This should already be configured in your Whereby account
   - Verify it's active in Whereby dashboard

## Step 3: Set Environment Variables

### For Local Development (.env.local):
```env
WHEREBY_DOMAIN=medianalytica.whereby.com
WHEREBY_API_KEY=your_api_key_here (optional)
NEXT_PUBLIC_WHEREBY_DOMAIN=medianalytica.whereby.com
```

### For Vercel (Production):
1. Go to Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `WHEREBY_DOMAIN` = `medianalytica.whereby.com`
   - `WHEREBY_API_KEY` = `your_api_key_here` (optional)
   - `NEXT_PUBLIC_WHEREBY_DOMAIN` = `medianalytica.whereby.com`

## Step 4: How It Works

The system will:
1. Try to create room via Whereby API (if API key is set)
2. Fallback to direct URL if API is not available
3. Rooms are created on-demand when accessed

## Current Implementation

- **API Route**: `app/api/whereby/create-room/route.ts`
- **Video Page**: `app/video/page.tsx` - Uses Whereby iframe
- **Room Format**: `https://medianalytica.whereby.com/{roomName}?embed=true`

## Features

- ✅ No authentication required
- ✅ No JWT tokens needed
- ✅ Simple iframe embedding
- ✅ Works with or without API key
- ✅ Custom domain support

## Free Tier Limits

- **100 minutes/month** (free tier)
- Perfect for testing and small usage
- Upgrade for more minutes if needed

## Troubleshooting

### Room not loading?
- Check `WHEREBY_DOMAIN` is set correctly
- Verify domain is active in Whereby dashboard
- Check browser console for errors

### API errors?
- API key is optional - system will use direct URLs
- Verify API key is correct (if using API)
- Check Whereby dashboard for usage limits

## Next Steps

1. ✅ Set environment variables
2. ✅ Test the integration
3. ✅ Deploy to production
4. ✅ Enjoy simple video conferencing!
