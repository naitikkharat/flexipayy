"use client";

import React from 'react';
import Link from 'next/link';
import { useFlexi } from '@/context/FlexiContext';
import { Wallet, Store, LogOut, LayoutDashboard, Coins, ShieldCheck } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isLoggedIn, availableCredit, flexiCoins, userProfile, logout } = useFlexi();

  return (
    <nav className={`glass-panel ${styles.navbar}`}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>F</div>
        <Link href="/" className={styles.logoText}>
          Flexi<span className="gradient-text">Pay</span>
        </Link>
      </div>

      <div className={styles.navLinks}>
        <Link href="/" className={styles.navLink}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link href="/store" className={styles.navLink}>
          <Store size={18} />
          <span>Store</span>
        </Link>
      </div>

      <div className={styles.userSection}>
        {isLoggedIn ? (
          <>
            <div className={styles.coinBadge} title="FlexiCoins Earned">
              <Coins size={16} color="#f59e0b" />
              <span>{flexiCoins}</span>
            </div>
            <div className={styles.creditBadge} title="Available Credit">
              <Wallet size={16} color="#10b981" />
              <span>₹{availableCredit.toLocaleString()}</span>
            </div>
            <div className={styles.profileInitials}>
              {userProfile?.name.charAt(0)}
            </div>
            <button onClick={logout} className={styles.logoutBtn} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className={styles.loginHint}>Complete KYC to get credit Limit</div>
        )}

        {/* Subtle admin access */}
        <Link href="/admin" className={styles.adminLink} title="Admin Panel">
          <ShieldCheck size={15} />
        </Link>
      </div>
    </nav>
  );
}
