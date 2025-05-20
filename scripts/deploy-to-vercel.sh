#!/bin/bash
# Deployment script for Vercel

# Ensure Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Build the app
echo "Building the application..."
npm run build

# Deploy to Vercel
# Note: This assumes you've already set up environment variables in the Vercel dashboard
echo "Deploying to Vercel..."
echo "Make sure you've added GOOGLE_AI_API_KEY as an environment variable in the Vercel dashboard."
echo "Your API key will be securely stored and won't be exposed to clients."

# Production deployment
if [ "$1" == "--prod" ]; then
    vercel --prod
else
    vercel
fi

echo "Deployment process complete!"
echo "Remember to verify that your environment variables are correctly set in the Vercel dashboard." 