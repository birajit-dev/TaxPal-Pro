# TaxPal Pro - Smart Tax Management for Freelancers

A comprehensive, production-grade SaaS application designed specifically for US freelancers and gig workers to track income, manage expenses, estimate taxes, and file returns with professional CPAs.

## 🌟 Features

### 🔐 Authentication & User Management
- Secure email/password authentication via Supabase
- User profiles with subscription plan management
- Row-level security for data protection

### 📊 Financial Tracking
- **Income Tracking**: Multiple sources (Upwork, Fiverr, PayPal, Direct Clients)
- **Expense Management**: AI-powered categorization and receipt OCR
- **Real-time Tax Estimation**: Quarterly and annual calculations
- **PDF Reports**: Downloadable tax summaries

### 🧠 AI-Powered Features
- Smart expense categorization based on descriptions
- Missing deduction alerts
- Tax optimization recommendations
- Forecasting and "what-if" scenarios

### 📱 Modern UI/UX
- Responsive design optimized for mobile
- Clean, professional interface
- Real-time data updates
- Interactive charts and visualizations

### 💼 Professional Services
- **CPA Marketplace**: Connect with verified tax professionals
- **Filing Integration**: Streamlined tax return process
- **Audit Support**: Professional guidance when needed

### 🎯 Tax Score System
- Gamified tax hygiene tracking
- Performance comparison with other users
- Achievement badges and milestones

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe (subscriptions and one-time payments)
- **PDF Generation**: @react-pdf/renderer
- **OCR**: Tesseract.js
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account for payments
- Git for version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd taxpal-pro
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the database schema in your Supabase SQL editor:

```bash
# The schema is located in supabase/schema.sql
# Copy and execute it in your Supabase dashboard
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Main application
│   │   ├── layout.tsx     # Dashboard navigation
│   │   └── page.tsx       # Dashboard home
│   ├── income/            # Income tracking
│   ├── expenses/          # Expense management
│   ├── estimate/          # Tax estimation
│   ├── report/            # PDF reports
│   ├── pricing/           # Subscription plans
│   ├── file/              # CPA filing
│   └── layout.tsx         # Root layout
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase.ts        # Database client
│   ├── auth.ts            # Authentication helpers
│   └── utils.ts           # Utility functions
└── types/
    └── database.ts        # TypeScript types
```

## 💳 Pricing Plans

| Feature | Free | Pro ($49/year) | Premium ($99/year) |
|---------|------|----------------|--------------------|
| Income/Expense Tracking | ✅ | ✅ | ✅ |
| Basic Tax Estimation | ✅ | ✅ | ✅ |
| PDF Reports | ✅ | ✅ | ✅ |
| AI Categorization | ❌ | ✅ | ✅ |
| Missing Deduction Alerts | ❌ | ✅ | ✅ |
| OCR Receipt Scanning | ❌ | ✅ | ✅ |
| CPA Filing | ❌ | ❌ | ✅ (1 return) |
| Priority Support | ❌ | ✅ | ✅ |

## 🗄 Database Schema

### Core Tables

- **users**: User profiles and subscription data
- **income**: Income tracking with sources and amounts
- **expenses**: Expense management with categories and receipts
- **filing_requests**: Tax filing requests and CPA assignments
- **notifications**: Tax deadline and reminder system
- **deduction_alerts**: AI-generated deduction opportunities
- **tax_scores**: Gamified tax hygiene scoring
- **cpas**: Verified CPA directory

### Key Features

- Row-level security (RLS) for data protection
- Automatic tax score calculation via PostgreSQL functions
- Real-time deduction alert generation
- Optimized indexes for performance

## 🔒 Security

- **Authentication**: Supabase Auth with email verification
- **Authorization**: Row-level security policies
- **Data Protection**: Encrypted data at rest and in transit
- **PCI Compliance**: Stripe handles all payment processing
- **GDPR Ready**: User data export and deletion capabilities

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel via GitHub integration
```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Supabase credentials
- Stripe API keys
- App URL (production domain)

### Database Migrations

Use Supabase migrations for production database updates:

```bash
# Generate migration
supabase gen types typescript --local > types/database.ts

# Apply to production
supabase db push
```

## 📊 Analytics & Monitoring

- User behavior tracking via Supabase Analytics
- Error monitoring (integrate Sentry for production)
- Performance monitoring via Vercel Analytics
- Financial metrics tracking for business insights

## 🧪 Testing

```bash
# Run tests
npm run test

# E2E testing (when implemented)
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

- **Documentation**: [docs.taxpalpro.com](https://docs.taxpalpro.com)
- **Community**: [Discord](https://discord.gg/taxpalpro)
- **Email**: support@taxpalpro.com
- **Business**: enterprise@taxpalpro.com

## 🔄 Roadmap

### Q1 2024
- [ ] Mobile app (React Native)
- [ ] Bank account integration (Plaid)
- [ ] Advanced tax planning tools

### Q2 2024
- [ ] Multi-state tax filing
- [ ] Automated quarterly payments
- [ ] Business entity formation

### Q3 2024
- [ ] API for third-party integrations
- [ ] White-label solutions
- [ ] International tax support

## ⚖️ Legal

- **Privacy Policy**: Compliant with CCPA and GDPR
- **Terms of Service**: Clear usage guidelines
- **Tax Disclaimer**: Professional CPA advice recommended
- **Data Retention**: User-controlled data lifecycle

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the freelance community**

For questions, feedback, or support, reach out to us at [hello@taxpalpro.com](mailto:hello@taxpalpro.com) 