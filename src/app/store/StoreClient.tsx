"use client";

import React, { useState } from 'react';
import { dummyProducts } from '@/data/products';
import { Product } from '@/context/FlexiContext';
import styles from './Store.module.css';
import CheckoutModal from '@/components/CheckoutModal';

const categories = ['All', 'Electronics', 'Fashion', 'Accessories', 'Home Appliances'];

export default function StoreClient() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = selectedCategory === 'All' 
    ? dummyProducts 
    : dummyProducts.filter(p => p.category === selectedCategory);

  return (
    <div className={`animate-fade-in ${styles.storeContainer}`}>
      <div className={styles.header}>
        <h1 className="gradient-text">The Flexi Store</h1>
        <p className="text-secondary">Shop the latest trends right now, pay later in easy installments.</p>
        
        <div className={styles.categoriesFilter}>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryBtnActive : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filteredProducts.map(product => (
          <div key={product.id} className={`glass-card ${styles.productCard}`}>
            <div 
              className={styles.productImage} 
              style={{ backgroundImage: `url(${product.image})` }}
            />
            <div className={styles.productInfo}>
              <span className={styles.category}>{product.category}</span>
              <h3>{product.name}</h3>
              <div className={styles.priceRow}>
                <span className={styles.price}>₹{product.price.toLocaleString()}</span>
                <span className={styles.emiHint}>from ₹{Math.ceil((product.price * 0.9 * 1.2) / 12).toLocaleString()}/mo</span>
              </div>
              <button 
                className={`glass-button ${styles.buyBtn}`}
                onClick={() => setSelectedProduct(product)}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <CheckoutModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
