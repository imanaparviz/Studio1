# Roadmap Weaver Deployment Guide

This document provides instructions for deploying the Roadmap Weaver application to various environments.

## Environment Variables

Before deploying, you need to set up the following environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_API_KEY=your_api_key_here

# Application Configuration
NEXT_PUBLIC_DEFAULT_LANGUAGE=de

# AI Service Configuration (for Pflichtenheft generation)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
AI_SERVICE_API_KEY=your_ai_service_key_here
AI_SERVICE_ENDPOINT=https://ai-service.example.com/api
```

### Required Variables

- `GOOGLE_AI_API_KEY`: Your Google AI API key for Gemini 2.0 Flash access
- `NEXT_PUBLIC_DEFAULT_LANGUAGE`: Default language for the application (de or en)

### Optional Variables

- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_KEY`: Only needed if connecting to an external API
- `AI_SERVICE_API_KEY` and `AI_SERVICE_ENDPOINT`: Alternative AI service instead of Google AI

## Deployment to Vercel

1. Create a new project in Vercel
2. Connect your GitHub repository
3. Configure environment variables in the Vercel dashboard
4. Deploy

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## Deployment to Netlify

1. Create a new site in Netlify
2. Connect your GitHub repository
3. Configure environment variables in the Netlify dashboard
4. Deploy

```bash
# Install Netlify CLI (if not already installed)
npm i -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy
```

## Docker Deployment

A Dockerfile is included in the repository. To build and run the Docker image:

```bash
# Build the Docker image
docker build -t roadmap-weaver .

# Run the Docker container
docker run -p 3000:3000 --env-file .env roadmap-weaver
```

## Local Development Setup

For local development:

1. Create a `.env.local` file in the root directory with the variables from above
2. Run the development server

```bash
npm install
npm run dev
```
