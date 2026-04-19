"use client";

import React, { useState } from 'react';
import { useFlexi } from '@/context/FlexiContext';
import styles from './Onboarding.module.css';

export default function Onboarding() {
  const { login } = useFlexi();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    income: '',
    pan: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const age = parseInt(formData.age);
    const income = parseInt(formData.income);

    if (age < 18 || age > 30) {
      setError('FlexiPay is currently only available for ages 18–30.');
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Phone validation — 10 digits
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!formData.pan.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
      setError('Please enter a valid PAN card format (e.g., ABCDE1234F).');
      return;
    }

    let assignedLimit = 10000;
    if (income > 20000) assignedLimit = 25000;
    if (income > 50000) assignedLimit = 60000;
    if (income > 100000) assignedLimit = 100000;

    login(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age,
        income,
        pan: formData.pan,
      },
      assignedLimit
    );
  };

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>
          Your Favorite Brands,<br />
          <span className="gradient-text">Zero Compromise.</span>
        </h1>
        <p className={styles.subtitle}>
          Get instant credit limit up to ₹1,00,000. No physical paperwork, no credit card required. Try FlexiPay today.
        </p>
      </div>

      <div className={`glass-card ${styles.formCard}`}>
        <h2>Complete your KYC</h2>
        <p className="mb-6 text-secondary">Unlock your Flexi Limit in 60 seconds.</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <label>Full Name (as per PAN)</label>
            <input
              required
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          {/* Email + Phone */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Gmail / Email</label>
              <input
                required
                type="email"
                placeholder="john@gmail.com"
                value={formData.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input
                required
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={formData.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          {/* Age + Income */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>Age</label>
              <input
                required
                type="number"
                placeholder="22"
                min="18"
                max="30"
                value={formData.age}
                onChange={e => set('age', e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Monthly Income (₹)</label>
              <input
                required
                type="number"
                placeholder="25000"
                value={formData.income}
                onChange={e => set('income', e.target.value)}
              />
            </div>
          </div>

          {/* PAN */}
          <div className={styles.inputGroup}>
            <label>PAN Card Number</label>
            <input
              required
              type="text"
              placeholder="ABCDE1234F"
              value={formData.pan}
              onChange={e => set('pan', e.target.value.toUpperCase())}
            />
          </div>

          <button type="submit" className={`glass-button ${styles.submitBtn}`}>
            Check Eligibility Limit
          </button>
        </form>
      </div>
    </div>
  );
}
