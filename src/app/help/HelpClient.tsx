"use client";

import React, { useState } from 'react';
import { useFlexi } from '@/context/FlexiContext';
import styles from './Help.module.css';
import { Send, CheckCircle, HelpCircle } from 'lucide-react';

export default function HelpClient() {
  const { isLoggedIn, userProfile } = useFlexi();
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('Please login or complete KYC first to submit a ticket.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile?.pan,
          userName: userProfile?.name,
          userEmail: userProfile?.email,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit ticket.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.helpContainer}>
        <div className={`glass-card ${styles.successCard}`}>
          <div className={styles.successIcon}>
            <CheckCircle size={40} />
          </div>
          <h2>Ticket Generated!</h2>
          <p className="text-secondary mb-6">
            Your support ticket has been registered. Our team will get back to you at {userProfile?.email} within 24 hours.
          </p>
          <button 
            className="glass-button w-full" 
            onClick={() => {
              setIsSuccess(false);
              setFormData({ subject: '', message: '' });
            }}
          >
            Submit Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.helpContainer}>
      <header className={styles.header}>
        <h1 className="gradient-text">How can we help?</h1>
        <p>Describe your issue and our support team will regenerate a solution for you.</p>
      </header>

      <div className={styles.helpContent}>
        <div className={`glass-card ${styles.contactForm}`}>
          <h2><HelpCircle size={22} className="inline mr-2 text-accent" /> Create a Ticket</h2>
          <p className="text-secondary mb-8">Tell us about the problem you are facing.</p>

          {error && <div className="error-alert mb-6">{error}</div>}

          {!isLoggedIn && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm">
              Note: You must be logged in to generate a support ticket.
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Subject</label>
              <input
                required
                type="text"
                placeholder="Payment issue, Credit limit update, etc."
                value={formData.subject}
                onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                disabled={!isLoggedIn || isSubmitting}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Description of the issue</label>
              <textarea
                required
                placeholder="Please provide details about your problem..."
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                disabled={!isLoggedIn || isSubmitting}
              />
            </div>

            <button 
              type="submit" 
              className={`glass-button ${styles.submitBtn}`}
              disabled={!isLoggedIn || isSubmitting}
            >
              <Send size={18} />
              {isSubmitting ? 'Generating Ticket...' : 'Generate Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
