# Formix AI

A SaaS MVP that automatically generates live Google Forms from natural language prompts.

## Features
- AI-powered form generation from simple text prompts
- Direct integration with Google Forms
- Clean, modern UI using Tailwind CSS
- Secure authentication via NextAuth and Google OAuth

## Tech Stack
- Frontend: Next.js (App Router), Tailwind CSS
- Backend: Next.js API Routes
- AI: OpenAI API
- Cloud: Google Forms API, Google Identity

## Setup Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Google Cloud Setup
To configure Google integration:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project.
3. In **APIs & Services > Library**, search for and ENABLE:
   - **Google Forms API**
   - **Google Drive API**
4. Set up the **OAuth Consent Screen** (User type: External, add scopes `.../auth/forms.body` and `.../auth/drive`).
5. Go to **Credentials**, create an **OAuth client ID** (Web application).
   - Set Authorized JavaScript origins to `http://localhost:3000`
   - Set Authorized redirect URIs to `http://localhost:3000/api/auth/callback/google`
6. Copy your Client ID and Client Secret.

### 3. Environment Variables
Copy the `.env.example` file to `.env.local` and add your keys:
```bash
cp .env.example .env.local
```
- `OPENAI_API_KEY`: Your OpenAI API key
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `NEXTAUTH_SECRET`: A random string (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: `http://localhost:3000`

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
Visit http://localhost:3000 to use Formix AI.

### 5. Deploy on Vercel
1. Push your repository to GitHub.
2. Go to Vercel, import your repository.
3. Add all the Environment Variables from your `.env.local`.
   - Update `NEXTAUTH_URL` to your Vercel production URL.
   - Update the Google OAuth Authorized redirect URIs to include your Vercel production URL.
4. Click Deploy!
