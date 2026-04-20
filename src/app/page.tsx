// Build trigger: 2026-04-20
"use client";

import React, { useState } from 'react';
import { useFlexi } from '@/context/FlexiContext';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import StartupIntro from '@/components/StartupIntro';

export default function Home() {
  const { isLoggedIn, isLoading } = useFlexi();
  const [showIntro, setShowIntro] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse gradient-text" style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Syncing with FlexiAtlas...
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? <Dashboard /> : <Onboarding />}
    </>
  );
}
