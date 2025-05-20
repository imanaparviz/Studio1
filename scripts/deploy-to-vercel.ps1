# PowerShell Deployment Script for Vercel

# Ensure Vercel CLI is installed
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "Vercel CLI is not installed. Installing..."
    npm install -g vercel
}

# Build the app
Write-Host "Building the application..."
npm run build

# Deploy to Vercel
# Note: This assumes you've already set up environment variables in the Vercel dashboard
Write-Host "Deploying to Vercel..."
Write-Host "Make sure you've added GOOGLE_AI_API_KEY as an environment variable in the Vercel dashboard."
Write-Host "Your API key will be securely stored and won't be exposed to clients."

# Production deployment
if ($args[0] -eq "--prod") {
    vercel --prod
} else {
    vercel
}

Write-Host "Deployment process complete!"
Write-Host "Remember to verify that your environment variables are correctly set in the Vercel dashboard." 