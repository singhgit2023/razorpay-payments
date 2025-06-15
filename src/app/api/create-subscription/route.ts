import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json();
    console.log('API: Received request:', { planId, userId });

    if (!planId || !userId) {
      console.log('API: Missing required fields');
      return NextResponse.json(
        { error: 'Plan ID and User ID are required' },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.log('API: Missing Razorpay credentials');
      return NextResponse.json(
        { error: 'Razorpay credentials not configured' },
        { status: 500 }
      );
    }

    console.log('API: Creating Razorpay subscription...');
    
    // Create subscription with 14-day free trial
    const trialPeriodDays = 14; // Change this to 7 for 7-day trial
    const startDate = Math.floor(Date.now() / 1000) + (trialPeriodDays * 24 * 60 * 60);
    
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months
      start_at: startDate, // Start billing after trial period
    });

    console.log('API: Razorpay subscription created:', subscription.id);

    return NextResponse.json({
      subscription_id: subscription.id,
      plan_id: planId,
      trial_days: trialPeriodDays,
      message: 'Subscription created successfully'
    });

  } catch (error: any) {
    console.error('API: Subscription creation error:', error);
    console.error('API: Error details:', error.description || error.message);
    
    return NextResponse.json(
      { 
        error: error.description || error.message || 'Failed to create subscription',
        details: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
} 