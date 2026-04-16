"use client";

import React from 'react';
import { useFlexi } from '@/context/FlexiContext';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { isLoggedIn } = useFlexi();

  return (
    <>
      {isLoggedIn ? <Dashboard /> : <Onboarding />}
    </>
  );
}
