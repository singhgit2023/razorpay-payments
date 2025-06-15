'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

interface UserData {
  name: string;
  email: string;
  subscription?: {
    planId: string;
    planName: string;
    status: 'active' | 'cancelled' | 'trial';
    startDate: string;
    endDate: string;
    trialStartDate?: string;
    trialEndDate?: string;
    billingStartDate?: string;
    razorpaySubscriptionId?: string;
  };
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create basic user document without subscription
    const newUserData: UserData = {
      name,
      email
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
    setUserData(newUserData);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user document exists, if not create one
    const docRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const newUserData: UserData = {
        name: result.user.displayName || 'User',
        email: result.user.email || ''
      };

      await setDoc(docRef, newUserData);
      setUserData(newUserData);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed - user:', user);
      setUser(user);
      
      if (user) {
        try {
          // Fetch user data from Firestore
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data() as UserData;
            console.log('User data found:', userData);
            setUserData(userData);
          } else {
            console.log('No user document found, creating new user data');
            // Create basic user document if it doesn't exist (for existing auth users)
            const newUserData: UserData = {
              name: user.displayName || 'User',
              email: user.email || ''
            };

            await setDoc(docRef, newUserData);
            setUserData(newUserData);
            console.log('New user data created:', newUserData);
          }
        } catch (error) {
          console.error('Error fetching/creating user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 