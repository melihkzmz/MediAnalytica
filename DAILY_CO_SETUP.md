# Daily.co Setup Guide

## Step 1: Create Daily.co Account

1. Go to https://www.daily.co/
2. Sign up for a free account
3. Verify your email

## Step 2: Get Your Domain

1. After signing up, go to your Daily.co dashboard
2. Navigate to **Settings** → **Domains**
3. You'll see your domain (e.g., `your-company.daily.co`)
4. Copy this domain

## Step 3: Get API Key (Optional - for server-side room creation)

1. Go to **Developers** → **API Keys**
2. Create a new API key
3. Copy the API key (you'll need this if you want to create rooms server-side)

## Step 4: Set Environment Variables

### For Local Development (.env.local):

```env
NEXT_PUBLIC_DAILY_DOMAIN=your-domain.daily.co
DAILY_API_KEY=your-api-key-here
```

### For Vercel (Production):

1. Go to Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_DAILY_DOMAIN` = `your-domain.daily.co`
   - `DAILY_API_KEY` = `your-api-key-here` (optional, for server-side room creation)

## Step 5: Test

1. Create a test appointment
2. When appointment time comes, click "Görüntülü Görüşmeye Katıl"
3. Daily.co room should open

## How It Works

1. **Room Creation**: Rooms are created automatically when users join (Daily.co creates rooms on-demand)
2. **Room Name**: Uses format `medi-analytica-{appointmentId}`
3. **No Authentication Required**: Daily.co free tier allows open rooms
4. **No membersOnly Error**: Daily.co doesn't have this restriction

## Free Tier Limits

- **10,000 minutes/month** (~166 hours)
- Perfect for testing and small usage
- No credit card required

## Features

- ✅ No membersOnly errors
- ✅ Easy integration
- ✅ Good documentation
- ✅ Reliable service
- ✅ Mobile support
- ✅ Screen sharing
- ✅ Chat

## Troubleshooting

### Room not loading?
- Check `NEXT_PUBLIC_DAILY_DOMAIN` is set correctly
- Verify domain in Daily.co dashboard
- Check browser console for errors

### API errors?
- Verify API key is correct (if using server-side room creation)
- Check Daily.co dashboard for usage limits

## Next Steps

1. ✅ Sign up for Daily.co
2. ✅ Get your domain
3. ✅ Set environment variables
4. ✅ Test the integration
5. ✅ Deploy to production
