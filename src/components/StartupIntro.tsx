"use client";

import React from 'react';
import styles from './StartupIntro.module.css';
import { ChevronRight, CreditCard, Zap, Coins, Wallet } from 'lucide-react';

export default function StartupIntro({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className={styles.introContainer}>
      <div className={styles.heroContent}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Wallet size={32} />
          </div>
          <span className={styles.logoText}>FlexiPay</span>
        </div>

        <h1 className={styles.title}>
          Financial Freedom,<br />
          <span className="gradient-text">Your Way.</span>
        </h1>
        
        <p className={styles.subtitle}>
          The smarter way to shop. Get instant credit, pay later in easy installments, 
          and earn rewards on every purchase.
        </p>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <Zap className={styles.featureIcon} size={28} />
            <div>
              <h3>Instant Credit</h3>
              <p>Get up to ₹1 Lakh limit in 60s</p>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <CreditCard className={styles.featureIcon} size={28} />
            <div>
              <h3>Zero Interest</h3>
              <p>Pay over time with 0% interest</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <Coins className={styles.featureIcon} size={28} />
            <div>
              <h3>FlexiCoins</h3>
              <p>Rewards on every EMI payment</p>
            </div>
          </div>
        </div>

        <button className={`glass-button ${styles.getStartedBtn}`} onClick={onGetStarted}>
          Get Started <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
