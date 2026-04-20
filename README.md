# Formix AI 🚀

**AI-powered Google Form generator.** Describe the form you need in plain English — our AI builds a fully functional, live Google Form in seconds.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb)

---

## Features

- **AI Form Generation** — Describe a form in natural language, get a structured schema
- **Google Forms Integration** — Automatically creates and publishes live Google Forms
- **Credit System** — Word-based daily limits with automatic reset
- **Subscription Plans** — Free (800 words/day), Starter ₹69 (5K words/day), Pro ₹299 (20K words/day)
- **Razorpay Payments** — Seamless plan upgrades with INR pricing
- **Google OAuth** — Secure authentication with Google account

---

## Tech Stack

| Layer       | Technology        |
|-------------|-------------------|
| Framework   | Next.js 16 (App Router) |
| Language    | TypeScript        |
| Styling     | Tailwind CSS 4    |
| Auth        | NextAuth.js (Google OAuth) |
| Database    | MongoDB + Mongoose |
| AI          | OpenAI API (GPT-4o-mini) |
| Forms       | Google Forms API  |
| Payments    | Razorpay          |
| Deployment  | Vercel            |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud project with APIs enabled
- Razorpay account (test mode works for development)
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/iamtheujwal-coder/formix-ai.git
cd formix-ai
npm install
```

### 2. Setup MongoDB

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database called `formix-ai`
3. Get the connection string and add it to `.env.local` as `MONGODB_URI`

### 3. Setup Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. **Enable APIs:**
   - Google Forms API
   - Google Drive API
4. **Create OAuth 2.0 Credentials:**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret
5. **Configure consent screen:**
   - Add scopes: `forms.body`, `drive`
   - Add test users if in testing mode

### 4. Setup Razorpay

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get API keys from Settings → API Keys
3. Set up Webhook:
   - URL: `https://your-domain.com/api/razorpay/webhook`
   - Events: `payment.captured`
   - Copy the webhook secret

### 5. Configure Environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`.

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Production ready"
git push origin main
```

### 2. Deploy on Vercel

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Add all environment variables from `.env.local`
3. Update `NEXTAUTH_URL` to your production URL
4. Deploy

### 3. Post-Deploy

1. Add your production URL to Google OAuth redirect URIs:
   `https://your-domain.vercel.app/api/auth/callback/google`
2. Update Razorpay webhook URL to production
3. Switch Razorpay to live mode and update keys

---

## Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Dashboard with prompt input
│   ├── pricing/page.tsx            # Pricing plans
│   ├── layout.tsx                  # Root layout with Navbar
│   ├── globals.css                 # Global styles
│   └── api/
│       ├── auth/[...nextauth]/     # Google OAuth
│       ├── generate/               # AI generation + credit check
│       ├── create-form/            # Google Forms creation
│       ├── user/                   # User data + credits
│       └── razorpay/
│           ├── create-order/       # Create payment order
│           ├── verify/             # Verify payment signature
│           └── webhook/            # Razorpay webhook handler
├── components/
│   ├── Navbar.tsx                  # Navigation bar
│   ├── PromptBox.tsx               # Prompt input with examples
│   ├── CreditCounter.tsx           # Credit usage display
│   ├── PricingCard.tsx             # Pricing card component
│   ├── Loader.tsx                  # Loading animation
│   └── AuthProvider.tsx            # NextAuth session provider
├── lib/
│   ├── authOptions.ts              # NextAuth configuration
│   ├── openai.ts                   # AI form generation
│   ├── google.ts                   # Google Forms API
│   ├── credits.ts                  # Credit system logic
│   ├── razorpay.ts                 # Razorpay utilities
│   ├── parser.ts                   # Schema validation
│   └── db.ts                       # MongoDB connection
├── models/
│   └── User.ts                     # Mongoose User model
└── types/
    ├── form.ts                     # Form schema types
    └── next-auth.d.ts              # NextAuth type extensions
```

---

## Credit System

| Plan     | Price       | Daily Words |
|----------|-------------|-------------|
| Free     | ₹0          | 800         |
| Starter  | ₹69/month   | 5,000       |
| Pro      | ₹299/month  | 20,000      |

Credits reset daily at midnight UTC.

---

## License

MIT © Formix AI
