# 8x8 API Setup Guide

## Overview
Using 8x8 API instead of iframe provides:
- ✅ Better control and customization
- ✅ Programmatic meeting creation
- ✅ Better error handling
- ✅ Avoid cross-origin issues
- ✅ More professional integration

## Step 1: Get 8x8 API Credentials

1. **Sign up for 8x8 Video API**:
   - Go to https://www.8x8.com/
   - Sign up for a Video API account (check if free tier is available)
   - Navigate to Developer Portal / API Settings

2. **Get API Credentials**:
   - **App ID** (Application ID)
   - **API Key** (Secret key for JWT signing)
   - Note: These are used to generate JWT tokens for authentication

## Step 2: Set Environment Variables

### For Local Development (.env.local):
```env
EIGHTEIGHT_APP_ID=your_app_id_here
EIGHTEIGHT_API_KEY=your_api_key_here
EIGHTEIGHT_DOMAIN=8x8.vc
```

### For Vercel (Production):
1. Go to Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `EIGHTEIGHT_APP_ID` = `your_app_id_here`
   - `EIGHTEIGHT_API_KEY` = `your_api_key_here` (used for JWT signing)
   - `EIGHTEIGHT_DOMAIN` = `8x8.vc` (or your 8x8 domain)

## Step 3: How JWT Authentication Works

The API route is already created at `landing-page/app/api/8x8/create-meeting/route.ts`.

**JWT Token Structure**:
- Uses `EIGHTEIGHT_APP_ID` as the issuer (iss)
- Uses `EIGHTEIGHT_API_KEY` to sign the JWT
- Includes room name, user info, and moderator status
- Token expires in 2 hours

**Benefits of JWT**:
- ✅ More secure than API keys in URLs
- ✅ Can set user permissions (moderator, etc.)
- ✅ Token expires automatically
- ✅ Better for production use

**Current Implementation**:
- Generates JWT token server-side
- Returns token in meeting URL
- Doctor users get moderator privileges automatically

## Step 4: Test

1. Set environment variables
2. Create a test appointment
3. When appointment time comes, click "Görüntülü Görüşmeye Katıl"
4. The system will:
   - First try to create meeting via 8x8 API
   - If API fails or not configured, fallback to direct 8x8.vc URL

## Current Implementation

The video page (`app/video/page.tsx`) now:
1. Tries to create meeting via `/api/8x8/create-meeting`
2. Falls back to direct `8x8.vc` URL if API is not available
3. This ensures it works even without API credentials

## 8x8 API Documentation

Check 8x8's official documentation for:
- API endpoint URLs
- Authentication methods
- Request/response formats
- Rate limits
- Available features

## Benefits Over Iframe

- ✅ No cross-origin autofocus warnings
- ✅ Programmatic meeting management
- ✅ Better error handling
- ✅ Custom meeting settings
- ✅ Analytics and recording options
- ✅ More professional integration

## Troubleshooting

### API not working?
- Check API credentials are correct
- Verify API endpoint URL
- Check 8x8 API documentation for correct format
- System will fallback to direct URL automatically

### Still seeing autofocus warnings?
- These are browser security warnings, not errors
- They don't prevent functionality
- Using API reduces but may not eliminate them completely

## Next Steps

1. ✅ Get 8x8 API credentials
2. ✅ Set environment variables
3. ✅ Update API route with correct endpoint (check 8x8 docs)
4. ✅ Test the integration
5. ✅ Deploy to production
