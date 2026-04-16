"use client";

import React from 'react';
import { useFlexi } from '@/context/FlexiContext';
import styles from './Dashboard.module.css';
import { Calendar, CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { userProfile, creditLimit, availableCredit, activeEmis, payEmi } = useFlexi();

  const usedCredit = creditLimit - availableCredit;
  const usagePercentage = (usedCredit / creditLimit) * 100;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Welcome back, {userProfile?.name.split(' ')[0]}
          </h1>
          <p className="text-secondary">Here is your financial overview.</p>
        </div>
        <Link href="/store" className="glass-button">
          Shop Now <ChevronRight size={18} />
        </Link>
      </header>

      <div className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`}>
          <h3>Available Credit</h3>
          <div className={styles.amount}>₹{availableCredit.toLocaleString()}</div>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${usagePercentage}%`, backgroundColor: usagePercentage > 80 ? 'var(--warning)' : 'var(--accent-primary)' }}
              />
            </div>
            <div className={styles.progressLabels}>
              <span>{usagePercentage.toFixed(0)}% Used</span>
              <span>Total: ₹{creditLimit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`glass-card ${styles.statCard}`}>
          <h3>Active EMIs</h3>
          <div className={styles.amount}>{activeEmis.filter(e => e.status === 'active').length}</div>
          <p className="text-secondary mt-2">Currently ongoing plans</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 style={{ marginBottom: '20px' }}>Your Installments</h2>
        
        {activeEmis.length === 0 ? (
          <div className={`glass-card ${styles.emptyState}`}>
            <CreditCard size={48} color="var(--text-secondary)" />
            <h3>No active EMIs</h3>
            <p>You don't have any pending payments. Browse the store to shop now!</p>
          </div>
        ) : (
          <div className={styles.emiList}>
            {activeEmis.map(emi => (
              <div key={emi.id} className={`glass-card ${styles.emiCard}`}>
                <div className={styles.emiHeader}>
                  <h4>{emi.productName}</h4>
                  <span className={`${styles.statusBadge} ${emi.status === 'completed' ? styles.statusCompleted : styles.statusActive}`}>
                    {emi.status}
                  </span>
                </div>
                
                <div className={styles.emiDetails}>
                  <div className={styles.emiDetailItem}>
                    <span className="text-secondary">Total Amount</span>
                    <strong>₹{emi.totalAmount.toLocaleString()}</strong>
                  </div>
                  <div className={styles.emiDetailItem}>
                    <span className="text-secondary">Monthly EMI</span>
                    <strong>₹{emi.emiAmount.toLocaleString()}</strong>
                  </div>
                  <div className={styles.emiDetailItem}>
                    <span className="text-secondary">Months Left</span>
                    <strong>{emi.monthsRemaining} / {emi.monthsTotal}</strong>
                  </div>
                </div>

                {emi.status === 'active' && (
                  <div className={styles.emiAction}>
                    <div className={styles.nextPayment}>
                      <Calendar size={16} />
                      Next due: {emi.nextPaymentDate}
                    </div>
                    <button 
                      onClick={() => payEmi(emi.id)} 
                      className={`glass-button ${styles.payBtn}`}
                    >
                      Pay ₹{emi.emiAmount.toLocaleString()}
                    </button>
                  </div>
                )}
                
                {emi.status === 'completed' && (
                  <div className={styles.completedMessage}>
                    <CheckCircle size={16} color="var(--success)" />
                    Plan fully repaid.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
