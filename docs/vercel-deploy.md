# Vercel Deployment Guide

## Setting up Environment Variables in Vercel

To securely deploy your Google Gemini API key to Vercel without exposing it:

1. Create a Vercel account if you don't have one (https://vercel.com/signup)
2. Connect your GitHub repository to Vercel
3. In your Vercel project settings, navigate to "Environment Variables"
4. Add the following environment variables:
   - Name: `GOOGLE_AI_API_KEY`
   - Value: (paste your actual Google Gemini API key here)
   - Environment: Production, Preview, Development (select all environments)
5. Click "Save" to securely store your API key

## Deploy from Local Environment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (this will use environment variables set in Vercel dashboard)
vercel

# For production deployment
vercel --prod
```

## Important Security Notes

- NEVER commit your actual API key to the repository
- The key stored in Vercel is encrypted and secure
- Environment variables are injected at build time and are not exposed in client-side code
- Server-side code can access the environment variable using `process.env.GOOGLE_AI_API_KEY`
