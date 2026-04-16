"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

export type EmiPlan = {
  id: string;
  productName: string;
  totalAmount: number;
  emiAmount: number;
  monthsTotal: number;
  monthsRemaining: number;
  nextPaymentDate: string;
  status: 'active' | 'completed';
};

interface UserProfile {
  name: string;
  age: number;
  income: number;
  pan: string;
}

interface FlexiContextType {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  creditLimit: number;
  availableCredit: number;
  flexiCoins: number;
  activeEmis: EmiPlan[];
  login: (profile: UserProfile, assignedLimit: number) => void;
  logout: () => void;
  checkout: (product: Product, months: number, downPayment: number, coinsUsed?: number) => boolean;
  payEmi: (emiId: string) => void;
}

const FlexiContext = createContext<FlexiContextType | undefined>(undefined);

export const FlexiProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [creditLimit, setCreditLimit] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [flexiCoins, setFlexiCoins] = useState(0);
  const [activeEmis, setActiveEmis] = useState<EmiPlan[]>([]);

  const login = (profile: UserProfile, assignedLimit: number) => {
    setUserProfile(profile);
    setCreditLimit(assignedLimit);
    setAvailableCredit(assignedLimit);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUserProfile(null);
    setCreditLimit(0);
    setAvailableCredit(0);
    setFlexiCoins(0);
    setIsLoggedIn(false);
    setActiveEmis([]);
  };

  const checkout = (product: Product, months: number, downPayment: number, coinsUsed: number = 0): boolean => {
    let finalAmount = 0;
    let emiAmount = 0;
    
    // Effective price after applying coin discount as cash upfront
    const effectivePrice = product.price - coinsUsed;
    
    // Full payment scenario
    if (months === 1) {
      finalAmount = effectivePrice * 0.95;
    } else {
      const principal = effectivePrice - downPayment;
      let interestRate = 0;
      if (months === 3) interestRate = 0.05;
      else if (months === 6) interestRate = 0.10;
      else if (months === 9) interestRate = 0.15;
      else if (months === 12) interestRate = 0.20;
      
      finalAmount = principal * (1 + interestRate);
      emiAmount = Math.ceil(finalAmount / months);
    }

    if (months > 1 && availableCredit < finalAmount) return false;
    
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    if (months === 1) {
      // Direct charge to credit limit if paying full via FlexiPay, or we just don't add an EMI
      // assuming it's instantly paid off. Let's just create a completed plan.
      const newEmi: EmiPlan = {
        id: Math.random().toString(36).substring(7),
        productName: product.name,
        totalAmount: finalAmount,
        emiAmount: finalAmount,
        monthsTotal: 1,
        monthsRemaining: 0,
        nextPaymentDate: nextDate.toISOString().split('T')[0],
        status: 'completed'
      };
      // For immediate full payment, maybe they use other means, but let's record it.
      setActiveEmis(prev => [...prev, newEmi]);
      if (coinsUsed > 0) {
        setFlexiCoins(prev => prev - coinsUsed);
      }
      return true;
    }

    const newEmi: EmiPlan = {
      id: Math.random().toString(36).substring(7),
      productName: product.name,
      totalAmount: finalAmount,
      emiAmount,
      monthsTotal: months,
      monthsRemaining: months,
      nextPaymentDate: nextDate.toISOString().split('T')[0],
      status: 'active'
    };

    setActiveEmis(prev => [...prev, newEmi]);
    setAvailableCredit(prev => prev - finalAmount);
    if (coinsUsed > 0) {
      setFlexiCoins(prev => prev - coinsUsed);
    }
    return true;
  };

  const payEmi = (emiId: string) => {
    setActiveEmis(prev => prev.map(emi => {
      if (emi.id === emiId && emi.status === 'active') {
        const newRemaining = emi.monthsRemaining - 1;
        const nextDate = new Date(emi.nextPaymentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        // Restore available credit by the EMI amount paid
        setAvailableCredit(curr => Math.min(curr + emi.emiAmount, creditLimit));
        
        // Award FlexiCoins for payment
        setFlexiCoins(prev => prev + 100);

        return {
          ...emi,
          monthsRemaining: newRemaining,
          nextPaymentDate: nextDate.toISOString().split('T')[0],
          status: newRemaining === 0 ? 'completed' : 'active'
        };
      }
      return emi;
    }));
  };

  return (
    <FlexiContext.Provider value={{
      isLoggedIn, userProfile, creditLimit, availableCredit, flexiCoins, activeEmis,
      login, logout, checkout, payEmi
    }}>
      {children}
    </FlexiContext.Provider>
  );
};

export const useFlexi = () => {
  const context = useContext(FlexiContext);
  if (context === undefined) throw new Error('useFlexi must be used within a FlexiProvider');
  return context;
};
