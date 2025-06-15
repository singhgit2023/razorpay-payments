# Subscription Management System Documentation

## Overview
This is a simple subscription management system built with:
- **Next.js 15** - React framework
- **Firebase** - Authentication and database
- **Razorpay** - Payment processing
- **Formik** - Form handling and validation
- **TailwindCSS** - Styling

## Features
- ✅ User authentication (Email/Password + Google Sign-in)
- ✅ 14-day free trial for new users
- ✅ Two subscription plans (Starter ₹100/month, Pro ₹500/month)
- ✅ Subscription management (view, cancel)
- ✅ Secure payment processing with Razorpay
- ✅ Responsive design

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── create-subscription/route.ts  # Creates Razorpay subscriptions
│   │   └── cancel-subscription/route.ts  # Cancels subscriptions
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout with AuthProvider
│   └── page.tsx                         # Main page
├── components/
│   ├── AuthForms.tsx                    # Login/Signup forms with Formik
│   └── SubscriptionPlans.tsx            # Subscription management UI
├── contexts/
│   └── AuthContext.tsx                  # Authentication state management
└── lib/
    └── firebase.ts                      # Firebase configuration
```

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <your-repo>
cd payment
npm install
```

### 2. Environment Variables
Create a `.env.local` file with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
5. Get your config from Project Settings > General > Your apps

### 4. Razorpay Setup
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create an account and get API keys
3. Create subscription plans:
   - Starter Plan (₹100/month)
   - Pro Plan (₹500/month)
4. Note down the plan IDs and update them in `src/components/SubscriptionPlans.tsx`

### 5. Run the Application
```bash
npm run dev
```

## How It Works

### Authentication Flow
1. **New User Registration**: Creates a user account and sets up a 14-day free trial
2. **Google Sign-in**: Alternative authentication method
3. **User Data Storage**: User info and subscription details stored in Firestore

### Subscription Flow
1. **Free Trial**: All new users get 14 days free
2. **Plan Selection**: Choose between Starter or Pro plans
3. **Payment Processing**: Razorpay handles secure payments
4. **Subscription Activation**: Plan starts after trial period ends
5. **Management**: Users can view details and cancel subscriptions

### Key Components Explained

#### AuthContext (`src/contexts/AuthContext.tsx`)
- Manages authentication state
- Handles user registration with automatic trial setup
- Provides authentication methods throughout the app

#### AuthForms (`src/components/AuthForms.tsx`)
- Uses Formik for form validation
- Handles both login and signup
- Includes error handling and loading states

#### SubscriptionPlans (`src/components/SubscriptionPlans.tsx`)
- Displays current subscription status
- Shows trial/subscription end dates
- Provides plan selection and cancellation

#### API Routes
- **create-subscription**: Creates Razorpay subscription with 14-day delay
- **cancel-subscription**: Cancels active subscriptions

## Database Schema

### Firestore Collections

#### users/{userId}
```javascript
{
  name: "User Name",
  email: "user@example.com",
  subscription: {
    planId: "plan_xyz",
    planName: "Pro Plan",
    status: "active" | "trial" | "cancelled",
    startDate: "2023-01-01T00:00:00.000Z",
    endDate: "2023-02-01T00:00:00.000Z",
    trialEndDate: "2023-01-15T00:00:00.000Z", // Optional
    razorpaySubscriptionId: "sub_xyz" // Optional
  }
}
```

## Customization Guide

### Adding New Plans
1. Create plan in Razorpay Dashboard
2. Update `SUBSCRIPTION_PLANS` object in `SubscriptionPlans.tsx`
3. Add plan ID and features

### Modifying Trial Period
1. Update trial duration in `AuthContext.tsx` (signUp and signInWithGoogle methods)
2. Update API route in `create-subscription/route.ts` (start_at parameter)

### Styling Changes
- All components use TailwindCSS classes
- Global styles in `src/app/globals.css`
- Responsive design included

## Security Features
- ✅ Environment variables for sensitive data
- ✅ Server-side API routes for Razorpay operations
- ✅ Firebase Security Rules (recommended to configure)
- ✅ Input validation with Formik and Yup

## Common Issues and Solutions

### Firebase Authentication Errors
- Check Firebase configuration in console
- Ensure authentication methods are enabled
- Verify domain is authorized

### Razorpay Integration Issues
- Verify API keys are correct
- Check plan IDs match your Razorpay dashboard
- Ensure webhook URLs are configured (if needed)

### Build Errors
- Make sure all environment variables are set
- Check import paths are correct
- Verify all dependencies are installed

## Next Steps for Enhancement

1. **Add Webhooks**: Handle payment failures and subscription updates
2. **Email Notifications**: Send trial expiry and payment confirmations
3. **Usage Tracking**: Monitor plan usage and limits
4. **Admin Dashboard**: Manage users and subscriptions
5. **Proration**: Handle plan upgrades/downgrades
6. **Analytics**: Track conversion rates and churn

## Support
For issues or questions:
1. Check this documentation
2. Review console errors
3. Check Firebase and Razorpay dashboards
4. Ensure all environment variables are set correctly

---

**Note**: This is a basic implementation for learning purposes. For production use, consider adding more robust error handling, logging, and security measures. 