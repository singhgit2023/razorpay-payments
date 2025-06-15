'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Script from 'next/script';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ✅ Updated with your actual Razorpay Plan IDs
const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'plan_Qh1RfLdVoEhqL6', // ✅ Correct Starter Plan ID
    name: 'Starter Plan',
    price: 100,
    features: ['Basic features', 'Email support', '5 projects']
  },
  pro: {
    id: 'plan_Qh1T27iaXRPL8a', // ✅ Correct Pro Plan ID  
    name: 'Pro Plan', 
    price: 500,
    features: ['All features', 'Priority support', 'Unlimited projects', 'Advanced analytics']
  }
};

export const SubscriptionPlans: React.FC = () => {
  const { user, userData, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isTrialActive = () => {
    if (!userData?.subscription?.trialEndDate) return false;
    return new Date() < new Date(userData.subscription.trialEndDate);
  };

  const getTrialDaysLeft = () => {
    if (!userData?.subscription?.trialEndDate) return 0;
    const trialEndDate = new Date(userData.subscription.trialEndDate);
    const today = new Date();
    const diffTime = trialEndDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getDaysLeft = () => {
    if (!userData?.subscription?.endDate) return 0;
    const endDate = new Date(userData.subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const hasActiveSubscription = () => {
    return userData?.subscription?.status === 'active';
  };

  const hasTrialSubscription = () => {
    return userData?.subscription?.status === 'trial';
  };

  const handleSubscribe = async (planType: 'starter' | 'pro') => {
    setLoading(true);
    setSelectedPlan(planType);
    
    try {
      console.log('Creating subscription with:', {
        planId: SUBSCRIPTION_PLANS[planType].id,
        userId: user?.uid
      });

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: SUBSCRIPTION_PLANS[planType].id,
          userId: user?.uid
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      if (!data.subscription_id) {
        throw new Error('No subscription ID received from server');
      }

      const updateUserSubscription = async (subscriptionId: string, planId: string, trialDays: number) => {
        try {
          const userRef = doc(db, 'users', user!.uid);
          
          // Trial period dates
          const trialStartDate = new Date();
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + trialDays);
          
          // Subscription billing starts after trial
          const subscriptionStartDate = new Date();
          subscriptionStartDate.setDate(subscriptionStartDate.getDate() + trialDays);
          
          // First billing cycle ends 1 month after billing starts
          const subscriptionEndDate = new Date();
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + trialDays + 30);

          await updateDoc(userRef, {
            'subscription.razorpaySubscriptionId': subscriptionId,
            'subscription.status': 'trial',
            'subscription.planId': planId,
            'subscription.planName': planId.includes('starter') ? 'Starter Plan' : 'Pro Plan',
            'subscription.trialStartDate': trialStartDate.toISOString(),
            'subscription.trialEndDate': trialEndDate.toISOString(),
            'subscription.billingStartDate': subscriptionStartDate.toISOString(),
            'subscription.startDate': subscriptionStartDate.toISOString(),
            'subscription.endDate': subscriptionEndDate.toISOString(),
          });

          console.log('Subscription data updated in Firestore with trial period');
        } catch (error) {
          console.error('Error updating subscription in Firestore:', error);
          throw error;
        }
      };

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscription_id,
        name: "Subscription App",
        description: `${SUBSCRIPTION_PLANS[planType].name} Subscription`,
        handler: async function(response: any) {
          console.log('Payment successful:', response);
          
          try {
            // Update Firestore with subscription data
            await updateUserSubscription(data.subscription_id, data.plan_id, data.trial_days);
            alert(`Subscription activated with ${data.trial_days}-day free trial!`);
            // Refresh user data
            window.location.reload();
          } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Payment successful but failed to update subscription. Please contact support.');
          }
        },
        prefill: {
          name: userData?.name || user?.displayName || 'User',
          email: userData?.email || user?.email || '',
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function() {
            console.log('Payment dialog closed');
            setLoading(false);
            setSelectedPlan(null);
          }
        }
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert(`Subscription Error: ${error.message}`);
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userData?.subscription?.razorpaySubscriptionId) return;
    
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    setLoading(true);
    try {
      // Cancel subscription in Razorpay
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userData.subscription.razorpaySubscriptionId,
          userId: user?.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription in Razorpay');
      }

      // Update Firestore
      const userRef = doc(db, 'users', user!.uid);
      await updateDoc(userRef, {
        'subscription.status': 'cancelled',
      });

      alert('Subscription cancelled successfully');
      window.location.reload();
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      alert(error.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  // Debug logging
  console.log('SubscriptionPlans - user:', user);
  console.log('SubscriptionPlans - userData:', userData);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your subscription</h2>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="text-2xl font-bold mb-4 mt-4">Loading your subscription data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome, {userData.name}!
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Manage your subscription
          </p>
          <button
            onClick={logout}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Logout
          </button>
        </div>



        {/* Current Subscription Status */}
        {(hasActiveSubscription() || hasTrialSubscription()) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Subscription</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Active Plan</h3>
                <p className="text-xl font-bold text-indigo-600">
                  {userData.subscription?.planName || 'No Plan'}
                </p>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  userData.subscription?.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : userData.subscription?.status === 'trial'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {userData.subscription?.status === 'trial' 
                    ? 'FREE TRIAL' 
                    : userData.subscription?.status?.toUpperCase() || 'INACTIVE'
                  }
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {hasTrialSubscription() ? 'Trial Start' : 'Billing Start'}
                </h3>
                <p className="text-gray-900">
                  {hasTrialSubscription() && userData.subscription?.trialStartDate
                    ? formatDate(userData.subscription.trialStartDate)
                    : userData.subscription?.startDate 
                    ? formatDate(userData.subscription.startDate)
                    : 'N/A'
                  }
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {hasTrialSubscription() ? 'Trial Ends' : 'Next Billing'}
                </h3>
                <p className="text-gray-900">
                  {hasTrialSubscription() && userData.subscription?.trialEndDate
                    ? formatDate(userData.subscription.trialEndDate)
                    : userData.subscription?.endDate 
                    ? formatDate(userData.subscription.endDate)
                    : 'N/A'
                  }
                </p>
                {hasTrialSubscription() && userData.subscription?.trialEndDate && (
                  <p className="text-sm text-blue-600 font-medium">
                    {getTrialDaysLeft()} days of free trial left
                  </p>
                )}
                {hasActiveSubscription() && userData.subscription?.endDate && (
                  <p className="text-sm text-gray-600">
                    {getDaysLeft()} days until next billing
                  </p>
                )}
              </div>
            </div>

            {userData.subscription?.status === 'active' && userData.subscription?.razorpaySubscriptionId && (
              <div className="mt-6">
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            )}

            {/* Trial Information Banner */}
            {hasTrialSubscription() && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-blue-800 font-semibold">Free Trial Active!</h4>
                    <p className="text-blue-700 text-sm">
                      You have {getTrialDaysLeft()} days left in your free trial. 
                      Your first billing will start on {userData.subscription?.billingStartDate ? formatDate(userData.subscription.billingStartDate) : 'N/A'}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Plans */}
        {!hasActiveSubscription() && !hasTrialSubscription() && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Choose Your Plan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors"
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-indigo-600">₹{plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        14 Days Free Trial
                      </span>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      onClick={() => handleSubscribe(key as 'starter' | 'pro')}
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
                        selectedPlan === key
                          ? 'bg-indigo-400 text-white cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {loading && selectedPlan === key
                        ? 'Processing...'
                        : `Subscribe to ${plan.name}`
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 