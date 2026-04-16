import React, { useState, useEffect } from 'react';
import { Product, useFlexi } from '@/context/FlexiContext';
import styles from './CheckoutModal.module.css';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const { isLoggedIn, availableCredit, flexiCoins, checkout } = useFlexi();
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [coinsUsed, setCoinsUsed] = useState(0);
  const [downPayment, setDownPayment] = useState(Math.ceil(product.price * 0.10));
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const maxCoinsToUse = Math.min(product.price, flexiCoins);
  const effectivePrice = product.price - coinsUsed;
  const minDownPayment = Math.ceil(effectivePrice * 0.10);

  // EMI Options
  const emiOptions = [
    { months: 3, rate: 0.05 },
    { months: 6, rate: 0.10 },
    { months: 9, rate: 0.15 },
    { months: 12, rate: 0.20 }
  ];

  // We handle down payment forcing onBlur and via a range slider to allow easy input.


  const calculateDetails = () => {
    if (selectedMonths === 1) { // 1 means full payment
      const discount = effectivePrice * 0.05;
      const finalPrice = effectivePrice - discount;
      return { principal: 0, interest: 0, emiAmount: 0, finalPrice, discount };
    }

    const principal = effectivePrice - downPayment;
    const option = emiOptions.find(o => o.months === selectedMonths);
    const interestRate = option ? option.rate : 0;
    const interest = principal * interestRate;
    const finalPrice = principal + interest; // This is the loan amount
    const emiAmount = Math.ceil(finalPrice / selectedMonths);

    return { principal, interest, emiAmount, finalPrice, discount: 0 };
  };

  const details = calculateDetails();

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setError('Please complete KYC (login) first to receive your credit limit.');
      return;
    }
    
    if (selectedMonths > 1 && availableCredit < details.finalPrice) {
      setError('Insufficient credit limit for the loan amount.');
      return;
    }

    const success = checkout(product, selectedMonths, downPayment, coinsUsed);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        router.push('/');
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.modalOverlay}>
        <div className={`glass-panel ${styles.modalContent} ${styles.successState}`}>
          <CheckCircle size={64} color="var(--success)" className="mb-4" />
          <h2>Purchase Successful!</h2>
          <p className="text-secondary">Your transaction was completed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={`glass-panel ${styles.modalContent}`}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        
        <h2>Complete Purchase</h2>
        
        <div className={styles.productSummary}>
          <div className={styles.productImage} style={{ backgroundImage: `url(${product.image})` }} />
          <div>
            <h3>{product.name}</h3>
            <div className={styles.price}>₹{product.price.toLocaleString()}</div>
          </div>
        </div>

        {flexiCoins > 0 && (
          <div className={styles.coinsSection} style={{marginBottom: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <h4 style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b'}}>
                Spend FlexiCoins (Max: {maxCoinsToUse})
              </h4>
              <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>- ₹{coinsUsed}</span>
            </div>
            <input 
              type="range" 
              min={0}
              max={maxCoinsToUse}
              step={10}
              value={coinsUsed}
              onChange={(e) => setCoinsUsed(Number(e.target.value))}
              style={{width: '100%', accentColor: '#f59e0b'}}
            />
          </div>
        )}

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.emiSection}>
          <h4>Select Plan</h4>
          <p className="text-secondary mb-4" style={{fontSize: '0.85rem'}}>Select full payment for 5% OFF</p>
          
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
                <div className={styles.monthLabel}>{(opt.rate * 100)}% int.</div>
              </button>
            ))}
          </div>
        </div>

        {selectedMonths > 1 && (
          <div className={styles.downPaymentSection}>
            <h4>Downpayment Amount (Min 10%: ₹{minDownPayment.toLocaleString()})</h4>
            <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px'}}>
              <input 
                type="range" 
                min={minDownPayment}
                max={effectivePrice}
                step={100}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                style={{flex: 1, accentColor: 'var(--accent-primary)'}}
              />
              <input 
                type="number" 
                className={styles.dpInput}
                min={minDownPayment}
                max={effectivePrice}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val < minDownPayment) setDownPayment(minDownPayment);
                  if (val > effectivePrice) setDownPayment(effectivePrice);
                }}
                style={{width: '120px', marginTop: 0, marginBottom: 0}}
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
              <span style={{color: '#f59e0b'}}>- ₹{coinsUsed.toLocaleString()}</span>
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
                 <span>Interest ({(emiOptions.find(o => o.months === selectedMonths)?.rate || 0) * 100}%)</span>
                 <span className="text-warning">+ ₹{details.interest.toLocaleString()}</span>
               </div>
             </>
          )}

          <div className={`${styles.detailRow} ${styles.highlightRow}`}>
            <span>{selectedMonths === 1 ? 'Total to Pay Now' : 'Loan Amount (uses limit)'}</span>
            <span>₹{details.finalPrice.toLocaleString()}</span>
          </div>

          {selectedMonths > 1 && (
            <div className={`${styles.detailRow} ${styles.highlightRow}`} style={{marginTop: 0, border: 'none'}}>
              <span>Monthly EMI</span>
              <span>₹{details.emiAmount.toLocaleString()} / mo</span>
            </div>
          )}
        </div>

        <button 
          className={`glass-button ${styles.confirmBtn}`}
          onClick={handleCheckout}
        >
          {selectedMonths === 1 ? 'Confirm & Pay in Full' : 'Confirm & Pay Later'}
        </button>
      </div>
    </div>
  );
}
