"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

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

export type ShippingAddress = {
  fullName: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

export type Order = {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  productId: string;
  productName: string;
  productPrice: number;
  address: ShippingAddress;
  deliveryDays: number;
  deliveryDate: string;
  paymentPlan: number;
  monthsRemaining: number;
  nextPaymentDate: string;
  downPayment: number;
  loanAmount: number;
  emiAmount: number;
  coinsUsed: number;
  invoiceDate: string;
  status: 'processing' | 'shipped' | 'delivered';
};

export type RegisteredUser = {
  pan: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  income: number;
  creditLimit: number;
  flexiCoins: number;
  employmentStatus: 'salaried' | 'non-salaried';
  joinedAt: string;
};

interface UserProfile {
  name: string;
  age: number;
  income: number;
  pan: string;
  email: string;
  phone: string;
  employmentStatus: 'salaried' | 'non-salaried';
}

interface FlexiContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  creditLimit: number;
  availableCredit: number;
  flexiCoins: number;
  activeEmis: EmiPlan[];
  allUsers: RegisteredUser[];
  allOrders: Order[];
  login: (profile: UserProfile, assignedLimit: number) => void;
  logout: () => void;
  checkout: (
    product: Product,
    months: number,
    downPayment: number,
    address: ShippingAddress,
    coinsUsed?: number
  ) => Promise<Order | false>;
  payEmi: (emiId: string) => Promise<void>;
  refreshAdminData: () => Promise<void>;
}

const FlexiContext = createContext<FlexiContextType | undefined>(undefined);

const PAN_STORAGE_KEY = 'flexipay_user_pan';

function randomDeliveryDays(): number {
  const pool = [3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 10];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const FlexiProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [creditLimit, setCreditLimit] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [flexiCoins, setFlexiCoins] = useState(0);
  const [activeEmis, setActiveEmis] = useState<EmiPlan[]>([]);
  
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const fetchUserData = useCallback(async (pan: string) => {
    try {
      // 1. Fetch user profile
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const users: RegisteredUser[] = await usersRes.json();
        const me = users.find(u => u.pan === pan);
        if (me) {
          setUserProfile({
            pan: me.pan,
            name: me.name,
            email: me.email,
            phone: me.phone,
            age: me.age,
            income: me.income,
            employmentStatus: me.employmentStatus || 'salaried'
          });
          setCreditLimit(me.creditLimit);
          setAvailableCredit(me.creditLimit); 
          setFlexiCoins(me.flexiCoins || 0); // Recover coins from Atlas
          setIsLoggedIn(true);
        }
      }

      // 2. Fetch user orders
      const ordersRes = await fetch(`/api/orders?userId=${pan}`);
      if (ordersRes.ok) {
        const myOrders: Order[] = await ordersRes.json();
        
        // Derive EMI plans and available credit
        const plans: EmiPlan[] = myOrders.map(o => ({
          id: o.orderId,
          productName: o.productName,
          totalAmount: o.loanAmount,
          emiAmount: o.emiAmount,
          monthsTotal: o.paymentPlan,
          monthsRemaining: o.monthsRemaining ?? (o.paymentPlan === 1 ? 0 : o.paymentPlan),
          nextPaymentDate: o.nextPaymentDate || '',
          status: (o.monthsRemaining === 0 || o.paymentPlan === 1) ? 'completed' : 'active'
        }));
        
        setActiveEmis(plans);

        // Adjust available credit: creditLimit - sum of loanAmounts of active EMI plans
        let used = 0;
        myOrders.forEach(o => {
          // If it's a BNPL order (paymentPlan > 1) and not fully paid
          if (o.paymentPlan > 1 && (o.monthsRemaining === undefined || o.monthsRemaining > 0)) {
            used += o.loanAmount;
          }
        });
        setAvailableCredit(prev => prev - used);
      }
    } catch (err) {
      console.error('Failed to sync user data from Atlas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAdminData = async () => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/orders'),
      ]);
      if (usersRes.ok) setAllUsers(await usersRes.json());
      if (ordersRes.ok) setAllOrders(await ordersRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    const savedPan = localStorage.getItem(PAN_STORAGE_KEY);
    if (savedPan) {
      fetchUserData(savedPan);
    } else {
      setIsLoading(false);
    }
    refreshAdminData();
  }, [fetchUserData]);

  const syncUserToAtlas = useCallback(async (profile: UserProfile, limit: number, coins: number) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pan: profile.pan,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          age: profile.age,
          income: profile.income,
          employmentStatus: profile.employmentStatus,
          creditLimit: limit,
          flexiCoins: coins
        }),
      });
      refreshAdminData();
    } catch (err) {
      console.error('Failed to sync user to Atlas:', err);
    }
  }, []);

  const login = (profile: UserProfile, assignedLimit: number) => {
    setUserProfile(profile);
    setCreditLimit(assignedLimit);
    setAvailableCredit(assignedLimit);
    setIsLoggedIn(true);
    setFlexiCoins(0); 
    localStorage.setItem(PAN_STORAGE_KEY, profile.pan);

    syncUserToAtlas(profile, assignedLimit, 0);
  };

  const logout = () => {
    setUserProfile(null);
    setCreditLimit(0);
    setAvailableCredit(0);
    setFlexiCoins(0);
    setIsLoggedIn(false);
    setActiveEmis([]);
    localStorage.removeItem(PAN_STORAGE_KEY);
  };

  const checkout = async (
    product: Product,
    months: number,
    downPayment: number,
    address: ShippingAddress,
    coinsUsed: number = 0
  ): Promise<Order | false> => {
    if (!userProfile) return false;

    let finalAmount = 0;
    let emiAmount = 0;
    const effectivePrice = product.price - coinsUsed;

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

    const deliveryDays = randomDeliveryDays();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    const orderId = 'FP' + Date.now().toString(36).toUpperCase();

    const order: Order = {
      orderId,
      userId: userProfile.pan,
      userName: userProfile.name,
      userEmail: userProfile.email,
      userPhone: userProfile.phone,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      address,
      deliveryDays,
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      paymentPlan: months,
      monthsRemaining: months === 1 ? 0 : months,
      nextPaymentDate: months === 1 ? '' : nextDate.toISOString().split('T')[0],
      downPayment: months === 1 ? 0 : downPayment,
      loanAmount: Math.round(finalAmount),
      emiAmount,
      coinsUsed,
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'processing',
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || 'Server failed to save order');
      }
    } catch (err: any) {
      console.error('Failed to save order:', err);
      throw err; // Re-throw to be caught by the component
    }

    if (coinsUsed > 0) {
      const newCoins = flexiCoins - coinsUsed;
      setFlexiCoins(newCoins);
      syncUserToAtlas(userProfile, creditLimit, newCoins);
    }

    // Refresh data
    await fetchUserData(userProfile.pan);
    refreshAdminData();

    return order;
  };

  const payEmi = async (orderId: string) => {
    if (!userProfile) return;

    const emi = activeEmis.find(e => e.id === orderId);
    if (!emi || emi.status !== 'active') return;

    const newRemaining = emi.monthsRemaining - 1;
    const nextDate = new Date(emi.nextPaymentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthsRemaining: newRemaining,
          nextPaymentDate: newRemaining === 0 ? '' : nextDate.toISOString().split('T')[0]
        }),
      });

      if (res.ok) {
        const newCoins = flexiCoins + 100;
        setFlexiCoins(newCoins);
        await syncUserToAtlas(userProfile, creditLimit, newCoins);
        await fetchUserData(userProfile.pan); 
        refreshAdminData();
      }
    } catch (err) {
      console.error('Failed to pay EMI in Atlas:', err);
    }
  };

  return (
    <FlexiContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        userProfile,
        creditLimit,
        availableCredit,
        flexiCoins,
        activeEmis,
        allUsers,
        allOrders,
        login,
        logout,
        checkout,
        payEmi,
        refreshAdminData,
      }}
    >
      {children}
    </FlexiContext.Provider>
  );
};

export const useFlexi = () => {
  const context = useContext(FlexiContext);
  if (context === undefined) throw new Error('useFlexi must be used within a FlexiProvider');
  return context;
};
