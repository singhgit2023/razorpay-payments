"use client";

import { useAuth } from '@/contexts/AuthContext';
import { AuthForms } from '@/components/AuthForms';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {user ? <SubscriptionPlans /> : <AuthForms />}
    </div>
  );
}