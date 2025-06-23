# TaxPal Pro - Backend Setup Guide

## 🚀 Backend Architecture

TaxPal Pro uses **Supabase** as the complete backend solution providing:

### 📊 **Backend Services:**
- **Database**: PostgreSQL with complete schema
- **Authentication**: User registration, login, session management
- **Storage**: File uploads (receipts, documents)
- **Real-time**: Live data updates
- **APIs**: Auto-generated REST and GraphQL APIs

### 📁 **Backend Code Locations:**

```
Backend Logic Distribution:
├── supabase/schema.sql           # Database schema (302 lines)
├── src/lib/supabase.ts          # Database client configuration
├── src/lib/auth.ts              # Authentication functions
├── src/lib/utils.ts             # Business logic & calculations
├── src/types/database.ts        # TypeScript type definitions
└── Environment Variables         # Configuration
```

## 🔧 **Setup Instructions**

### Option 1: Quick Development (Mock Mode) - Currently Active
The app runs in **mock mode** for immediate testing without backend setup.

**Features Available:**
- ✅ Homepage and navigation
- ✅ Mock authentication (login/register)
- ✅ Dashboard with sample data
- ✅ All pages functional with demo data
- ✅ UI/UX testing

### Option 2: Full Production Setup (Real Backend)

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning (2-3 minutes)

#### Step 2: Configure Database
1. Go to SQL Editor in Supabase dashboard
2. Copy entire content from `supabase/schema.sql`
3. Execute the SQL to create all tables and functions

#### Step 3: Get Credentials
From your Supabase project settings:
```
Project URL: https://your-project.supabase.co
Anon Key: eyJhbGciOiJ... (public key)
Service Role Key: eyJhbGciOiJ... (private key)
```

#### Step 4: Environment Setup
Create `.env.local` in project root:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe Configuration (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Step 5: Restart Development
```bash
npm run dev
```

## 🗄️ **Database Schema Overview**

### Core Tables:
```sql
users              # User profiles and subscription data
income             # Income tracking with sources
expenses           # Expense management with categories  
filing_requests    # Tax filing requests and CPA assignments
notifications      # Tax deadline and reminder system
deduction_alerts   # AI-generated deduction opportunities
tax_scores         # Gamified tax hygiene scoring
cpas              # Verified CPA directory
```

### Key Features:
- **Row-Level Security (RLS)**: Users can only access their own data
- **Automated Functions**: Tax score calculation, deduction alerts
- **Real-time Triggers**: Automatic updates on data changes
- **Optimized Indexes**: Fast query performance

## 🔐 **Authentication Flow**

### Current Mock Authentication:
```typescript
// Demo credentials (works immediately)
Email: demo@taxpalpro.com
Password: any password
```

### Production Authentication:
```typescript
// Real Supabase auth with:
- Email verification
- Password reset
- Session management
- User metadata storage
```

## 💾 **Data Storage**

### User Profile Data:
```sql
-- Stored in public.users table
{
  id: UUID,
  email: string,
  name: string,
  plan: 'free' | 'pro' | 'premium',
  tax_score: integer,
  created_at: timestamp
}
```

### Financial Data:
```sql
-- Income stored in public.income
-- Expenses stored in public.expenses
-- All with user_id foreign key relationship
```

## 🧮 **Business Logic**

### Tax Calculations:
- Located in `src/lib/utils.ts`
- Functions: `calculateTax()`, `calculateQuarterlyTax()`
- AI categorization: `categorizeExpense()`

### Real-time Features:
- Tax score updates (PostgreSQL functions)
- Deduction alerts (automated triggers)
- Quarterly reminders (notification system)

## 🚀 **Deployment**

### Development:
```bash
npm run dev  # Runs on localhost:3000
```

### Production:
```bash
npm run build  # Creates optimized build
npm start      # Serves production build
```

### Recommended Hosting:
- **Frontend**: Vercel, Netlify
- **Backend**: Supabase (managed)
- **Domain**: Custom domain with SSL

## 🔍 **Current Status**

**✅ Working Now (Mock Mode):**
- All UI pages functional
- Demo authentication 
- Sample data display
- Navigation and routing

**🔧 Needs Setup for Production:**
- Real Supabase project
- Environment variables
- Stripe payment processing
- Email notifications

## 📞 **Next Steps**

1. **Test Current Setup**: All features work in mock mode
2. **When Ready for Production**: Follow Option 2 setup
3. **Deploy**: Use Vercel for instant deployment

Your TaxPal Pro application is **fully functional** right now in development mode! 