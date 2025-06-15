#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up your Subscription Management System...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Firebase Configuration
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
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created successfully!\n');
} else {
  console.log('✅ .env.local already exists.\n');
}

console.log('📋 Next Steps:');
console.log('1. Setup Firebase:');
console.log('   - Go to https://console.firebase.google.com/');
console.log('   - Create a new project');
console.log('   - Enable Authentication (Email/Password + Google)');
console.log('   - Enable Firestore Database');
console.log('   - Copy your config to .env.local\n');

console.log('2. Setup Razorpay:');
console.log('   - Go to https://dashboard.razorpay.com/');
console.log('   - Get your API keys');
console.log('   - Create subscription plans:');
console.log('     * Starter Plan (₹100/month)');
console.log('     * Pro Plan (₹500/month)');
console.log('   - Update plan IDs in src/components/SubscriptionPlans.tsx\n');

console.log('3. Run the development server:');
console.log('   npm run dev\n');

console.log('📖 Check DOCUMENTATION.md for detailed setup instructions.');
console.log('�� Happy coding!'); 