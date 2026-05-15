# Trade Diary

Trade Diary is a modern trading journal and performance platform built with the Next.js App Router. It helps traders log trades, track strategies, review performance, manage psychology, and upgrade to a paid plan with Razorpay billing.

## Key Features

- Authentication
  - Google sign-in
  - Email/password login
  - Email verification, OTP-style registration, and password reset
- Trade journaling
  - Create, edit, and delete trade records
  - Capture entry/exit prices, quantity, fees, and strategy association
  - Automatic P&L, ROI, and risk/reward analytics
- Strategy management
  - Add and manage trading strategies
  - Link trades to strategies for better review
- Analytics
  - Dashboard analytics and charts
  - Trade performance metrics and insights
- Trading psychology
  - Add trade-level journal notes and emotional context
  - Psychology review page for self-reflection
- Billing & subscription
  - Free and Pro plans with monthly trade limits
  - Razorpay checkout and payment verification
  - Billing history in account settings
- Settings
  - Profile, theme, and account preferences
  - Plan status, usage, and upgrade flow

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- NextAuth.js for authentication
- MongoDB + Mongoose for persistence
- Razorpay for payments
- Nodemailer for email notifications
- React Hook Form + Zod for form handling and validation
- Recharts for analytics charts
- Framer Motion for UI motion
- next-themes for dark mode and theme switching
- lucide-react icons
- react-hot-toast for notifications

## Project Structure

- `app/` - Next.js pages, routes, auth, dashboard, and client views
- `components/` - shared UI components, modals, landing sections, and dashboard widgets
- `lib/` - auth, database connection, email templates, validations, and action handlers
- `models/` - Mongoose schema definitions for users, trades, strategies, journals, billing, and settings
- `types/` - shared TypeScript interfaces
- `public/` - static assets and landing page resources

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Add environment variables in `.env`:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_SECURE=false
EMAIL_SERVER_USER=your_email_user
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM="Trade Diary" <noreply@example.com>
```

3. Start the development server

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - build production-ready app
- `npm run start` - run built app
- `npm run lint` - run ESLint

## Notes

- Protected pages include dashboard, trades, strategies, analytics, psychology, and settings.
- Billing uses Razorpay order creation and signature verification.
- The app stores data in MongoDB and uses Mongoose models for schema structure.

## Deployment

This project can be deployed to any platform that supports Next.js, including Vercel. Set the required environment variables in your deployment environment.
