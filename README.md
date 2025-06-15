Developer Function Guide

SubscriptionPlans Component Functions (src/components/SubscriptionPlans.tsx)

- handleSubscribe(planId): Creates Razorpay subscription via API call
- handleCancelSubscription(): Cancels active subscription
- isTrialActive(): Checks if user's trial period is still valid
- calculateDaysLeft(): Returns remaining trial/subscription days
- formatDate(): Displays dates in readable format

API Route Functions
create-subscription API (src/app/api/create-subscription/route.ts)

- POST handler: Creates Razorpay subscription with 14-day start delay
- Validates user authentication
- Returns subscription details for frontend payment processing

Cancel-subscription API (src/app/api/cancel-subscription/route.ts)

- POST handler: Cancels Razorpay subscription immediately
- Updates user's subscription status in Firestore
- Returns cancellation confirmation

Key Variables and Constants
- SUBSCRIPTION_PLANS: Object containing plan details (ID, name, price, features)
- User subscription statuses: "trial", "active", "cancelled"
- Trial duration: 14 days (calculated from signup date)
- Payment currency: INR (Indian Rupees)

Data Flow
1. User signup → AuthContext.signUp() → Firestore user creation with trial
2. Plan selection → handleSubscribe() → API call → Razorpay payment
3. Payment success → updateUserSubscription() → Firestore update
4. Subscription management → Component state updates → UI changes

Environment Variables Required
- Firebase config (6 variables)
- Razorpay keys (3 variables)

Vairable:
Create a .env.local file with the following variables:

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
