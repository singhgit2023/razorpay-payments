Developer Function Guide

**AuthContext Functions (src/contexts/AuthContext.tsx)**
- signUp(email, password, name): Creates new user account + sets 14-day trial
- signIn(email, password): Authenticates existing user
- signInWithGoogle(): Google OAuth authentication + trial setup for new users
- signOut(): Logs out current user
- updateUserSubscription(subscriptionData): Updates user's subscription info in Firestore

**AuthForms Component Functions (src/components/AuthForms.tsx)**
- handleSignUp(): Processes signup form with Formik validation
- handleSignIn(): Processes login form with error handling
- toggleAuthMode(): Switches between login/signup views
- Form validation using Yup schema for email/password requirements

**SubscriptionPlans Component Functions (src/components/SubscriptionPlans.tsx)**
- handleSubscribe(planId): Creates Razorpay subscription via API call
- handleCancelSubscription(): Cancels active subscription
- isTrialActive(): Checks if user's trial period is still valid
- calculateDaysLeft(): Returns remaining trial/subscription days
- formatDate(): Displays dates in readable format

**API Route Functions**

**create-subscription API (src/app/api/create-subscription/route.ts)**
- POST handler: Creates Razorpay subscription with 14-day start delay
- Validates user authentication
- Returns subscription details for frontend payment processing

**cancel-subscription API (src/app/api/cancel-subscription/route.ts)**
- POST handler: Cancels Razorpay subscription immediately
- Updates user's subscription status in Firestore
- Returns cancellation confirmation

**Firebase Functions (src/lib/firebase.ts)**
- initializeApp(): Sets up Firebase connection
- getAuth(): Returns Firebase Auth instance
- getFirestore(): Returns Firestore database instance
- GoogleAuthProvider(): Configures Google sign-in

**Key Variables and Constants**
- SUBSCRIPTION_PLANS: Object containing plan details (ID, name, price, features)
- User subscription statuses: "trial", "active", "cancelled"
- Trial duration: 14 days (calculated from signup date)
- Payment currency: INR (Indian Rupees)

**Data Flow**
1. User signup → AuthContext.signUp() → Firestore user creation with trial
2. Plan selection → handleSubscribe() → API call → Razorpay payment
3. Payment success → updateUserSubscription() → Firestore update
4. Subscription management → Component state updates → UI changes

**Environment Variables Required**
- Firebase config (6 variables)
- Razorpay keys (3 variables)
- All must be set in .env.local for functionality 