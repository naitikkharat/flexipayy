"use client";

import React, { useState } from 'react';
import { Product, ShippingAddress, Order, useFlexi } from '@/context/FlexiContext';
import styles from './CheckoutModal.module.css';
import { X, CheckCircle, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import InvoiceModal from './InvoiceModal';

type Step = 'plan' | 'address' | 'success';

export default function CheckoutModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { isLoggedIn, availableCredit, flexiCoins, checkout } = useFlexi();
  const [step, setStep] = useState<Step>('plan');
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [coinsUsed, setCoinsUsed] = useState(0);
  const [downPayment, setDownPayment] = useState(Math.ceil(product.price * 0.1));
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const router = useRouter();

  // Address state
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const emiOptions = [
    { months: 3, rate: 0.05 },
    { months: 6, rate: 0.10 },
    { months: 9, rate: 0.15 },
    { months: 12, rate: 0.20 },
  ];

  const maxCoinsToUse = Math.min(product.price, flexiCoins);
  const effectivePrice = product.price - coinsUsed;
  const minDownPayment = Math.ceil(effectivePrice * 0.1);

  const calculateDetails = () => {
    if (selectedMonths === 1) {
      const discount = effectivePrice * 0.05;
      const finalPrice = effectivePrice - discount;
      return { principal: 0, interest: 0, emiAmount: 0, finalPrice, discount };
    }
    const principal = effectivePrice - downPayment;
    const option = emiOptions.find(o => o.months === selectedMonths);
    const interestRate = option ? option.rate : 0;
    const interest = principal * interestRate;
    const finalPrice = principal + interest;
    const emiAmount = Math.ceil(finalPrice / selectedMonths);
    return { principal, interest, emiAmount, finalPrice, discount: 0 };
  };

  const details = calculateDetails();

  /* ─── Step 1: Plan ─────────────────────────────────────────────── */
  const handlePlanNext = () => {
    setError('');
    if (!isLoggedIn) {
      setError('Please complete KYC first to receive your credit limit.');
      return;
    }
    if (selectedMonths > 1 && availableCredit < details.finalPrice) {
      setError('Insufficient credit limit for the loan amount.');
      return;
    }
    setStep('address');
  };

  /* ─── Step 2: Address → Confirm order ─────────────────────────── */
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!address.pincode.match(/^\d{6}$/)) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await checkout(product, selectedMonths, downPayment, address, coinsUsed);
      if (result) {
        setCompletedOrder(result);
        setStep('success');
      } else {
        setError('Checkout failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAddr = (field: keyof ShippingAddress, val: string) =>
    setAddress(prev => ({ ...prev, [field]: val }));

  /* ─── Success screen ───────────────────────────────────────────── */
  if (step === 'success' && completedOrder) {
    return (
      <>
        <div className={styles.modalOverlay}>
          <div className={`glass-panel ${styles.modalContent} ${styles.successState}`}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '16px' }} />
            <h2>Order Placed! 🎉</h2>
            <p className="text-secondary" style={{ marginTop: '8px', textAlign: 'center' }}>
              Your order <strong>#{completedOrder.orderId}</strong> is confirmed.
            </p>

            <div className={styles.deliveryBadge}>
              <Calendar size={16} />
              Estimated delivery in <strong>{completedOrder.deliveryDays} days</strong>
              &nbsp;·&nbsp;by <strong>{completedOrder.deliveryDate}</strong>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                className="glass-button"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)' }}
                onClick={() => setShowInvoice(true)}
              >
                Download Invoice
              </button>
              <button
                className="glass-button"
                onClick={() => {
                  onClose();
                  router.push('/');
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {showInvoice && completedOrder && (
          <InvoiceModal order={completedOrder} onClose={() => setShowInvoice(false)} />
        )}
      </>
    );
  }

  /* ─── Step 2: Address ──────────────────────────────────────────── */
  if (step === 'address') {
    return (
      <div className={styles.modalOverlay}>
        <div className={`glass-panel ${styles.modalContent}`}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>

          <div className={styles.stepIndicator}>
            <span className={styles.stepDone}>✓ Plan</span>
            <ChevronRight size={14} />
            <span className={styles.stepActive}>Delivery Address</span>
          </div>

          <h2 style={{ marginBottom: '6px' }}>
            <MapPin size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Shipping Address
          </h2>

          {/* Delivery estimate banner */}
          <div className={styles.deliveryBanner}>
            <Calendar size={15} />
            Delivery in approximately <strong>3–10 business days</strong>. Exact date confirmed after order.
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleConfirmOrder} className={styles.addressForm}>
            <div className={styles.addrRow}>
              <div className={styles.addrGroup}>
                <label>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={address.fullName}
                  onChange={e => setAddr('fullName', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.addrGroup}>
              <label>Address Line</label>
              <input
                required
                type="text"
                placeholder="Flat 4B, Shiv Nagar, MG Road"
                value={address.line1}
                onChange={e => setAddr('line1', e.target.value)}
              />
            </div>

            <div className={styles.addrRow}>
              <div className={styles.addrGroup}>
                <label>City</label>
                <input
                  required
                  type="text"
                  placeholder="Mumbai"
                  value={address.city}
                  onChange={e => setAddr('city', e.target.value)}
                />
              </div>
              <div className={styles.addrGroup}>
                <label>State</label>
                <input
                  required
                  type="text"
                  placeholder="Maharashtra"
                  value={address.state}
                  onChange={e => setAddr('state', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.addrGroup}>
              <label>Pincode</label>
              <input
                required
                type="text"
                placeholder="400001"
                maxLength={6}
                value={address.pincode}
                onChange={e => setAddr('pincode', e.target.value.replace(/\D/g, ''))}
              />
            </div>

            {/* Order mini-summary */}
            <div className={styles.miniSummary}>
              <div className={styles.miniRow}>
                <span className="text-secondary">Product</span>
                <span>{product.name}</span>
              </div>
              <div className={styles.miniRow}>
                <span className="text-secondary">
                  {selectedMonths === 1 ? 'Total (with 5% off)' : 'Loan Amount'}
                </span>
                <span>₹{details.finalPrice.toLocaleString()}</span>
              </div>
              {selectedMonths > 1 && (
                <div className={styles.miniRow}>
                  <span className="text-secondary">Monthly EMI</span>
                  <span>₹{details.emiAmount.toLocaleString()} × {selectedMonths}m</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="glass-button"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', flex: '0 0 auto' }}
                onClick={() => setStep('plan')}
              >
                Back
              </button>
              <button type="submit" className={`glass-button ${styles.confirmBtn}`}>
                {selectedMonths === 1 ? 'Confirm & Pay Now' : 'Confirm & Pay Later'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ─── Step 1: Plan selection ───────────────────────────────────── */
  return (
    <div className={styles.modalOverlay}>
      <div className={`glass-panel ${styles.modalContent}`}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.stepIndicator}>
          <span className={styles.stepActive}>Plan</span>
          <ChevronRight size={14} />
          <span className={styles.stepPending}>Delivery Address</span>
        </div>

        <h2>Complete Purchase</h2>

        <div className={styles.productSummary}>
          <div
            className={styles.productImage}
            style={{ backgroundImage: `url(${product.image})` }}
          />
          <div>
            <h3>{product.name}</h3>
            <div className={styles.price}>₹{product.price.toLocaleString()}</div>
          </div>
        </div>

        {flexiCoins > 0 && (
          <div className={styles.coinsSection} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                Spend FlexiCoins (Max: {maxCoinsToUse})
              </h4>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>- ₹{coinsUsed}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxCoinsToUse}
              step={10}
              value={coinsUsed}
              onChange={e => setCoinsUsed(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
          </div>
        )}

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.emiSection}>
          <h4>Select Plan</h4>
          <p className="text-secondary mb-4" style={{ fontSize: '0.85rem' }}>
            Select full payment for 5% OFF
          </p>
          <div className={styles.monthOptions}>
            <button
              className={`${styles.monthOption} ${selectedMonths === 1 ? styles.selected : ''}`}
              onClick={() => setSelectedMonths(1)}
            >
              <div className={styles.monthNumber}>Full Pmt</div>
              <div className={styles.monthLabel}>-5% OFF</div>
            </button>
            {emiOptions.map(opt => (
              <button
                key={opt.months}
                className={`${styles.monthOption} ${selectedMonths === opt.months ? styles.selected : ''}`}
                onClick={() => setSelectedMonths(opt.months)}
              >
                <div className={styles.monthNumber}>{opt.months}m</div>
                <div className={styles.monthLabel}>{opt.rate * 100}% int.</div>
              </button>
            ))}
          </div>
        </div>

        {selectedMonths > 1 && (
          <div className={styles.downPaymentSection}>
            <h4>Downpayment Amount (Min 10%: ₹{minDownPayment.toLocaleString()})</h4>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
              <input
                type="range"
                min={minDownPayment}
                max={effectivePrice}
                step={100}
                value={downPayment}
                onChange={e => setDownPayment(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
              />
              <input
                type="number"
                className={styles.dpInput}
                min={minDownPayment}
                max={effectivePrice}
                value={downPayment}
                onChange={e => setDownPayment(Number(e.target.value))}
                onBlur={e => {
                  const val = Number(e.target.value);
                  if (val < minDownPayment) setDownPayment(minDownPayment);
                  if (val > effectivePrice) setDownPayment(effectivePrice);
                }}
                style={{ width: '120px', marginTop: 0, marginBottom: 0 }}
              />
            </div>
          </div>
        )}

        <div className={styles.checkoutDetails}>
          <div className={styles.detailRow}>
            <span>Item Price</span>
            <span>₹{product.price.toLocaleString()}</span>
          </div>

          {coinsUsed > 0 && (
            <div className={styles.detailRow}>
              <span>FlexiCoins Discount</span>
              <span style={{ color: '#f59e0b' }}>- ₹{coinsUsed.toLocaleString()}</span>
            </div>
          )}

          {selectedMonths === 1 ? (
            <div className={styles.detailRow}>
              <span>Discount (5%)</span>
              <span className="text-success">- ₹{details.discount.toLocaleString()}</span>
            </div>
          ) : (
            <>
              <div className={styles.detailRow}>
                <span>Downpayment (Paid Upfront)</span>
                <span>- ₹{downPayment.toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Principal to Finance</span>
                <span>₹{details.principal.toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span>
                  Interest ({(emiOptions.find(o => o.months === selectedMonths)?.rate || 0) * 100}%)
                </span>
                <span className="text-warning">+ ₹{details.interest.toLocaleString()}</span>
              </div>
            </>
          )}

          <div className={`${styles.detailRow} ${styles.highlightRow}`}>
            <span>{selectedMonths === 1 ? 'Total to Pay Now' : 'Loan Amount (uses limit)'}</span>
            <span>₹{details.finalPrice.toLocaleString()}</span>
          </div>

          {selectedMonths > 1 && (
            <div
              className={`${styles.detailRow} ${styles.highlightRow}`}
              style={{ marginTop: 0, border: 'none' }}
            >
              <span>Monthly EMI</span>
              <span>₹{details.emiAmount.toLocaleString()} / mo</span>
            </div>
          )}
        </div>

        <button className={`glass-button ${styles.confirmBtn}`} onClick={handlePlanNext}>
          Next: Delivery Address <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
