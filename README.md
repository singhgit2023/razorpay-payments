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
