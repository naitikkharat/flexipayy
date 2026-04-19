"use client";

import React from 'react';
import { Order } from '@/context/FlexiContext';
import styles from './InvoiceModal.module.css';
import { X, Download, FileText } from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const handleDownload = async () => {
    // Dynamically import jsPDF to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const colRight = pageW - margin;

    // ── Header ──────────────────────────────────────────────
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('FlexiPay', margin, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Buy Now, Pay Later — India', margin, 28);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', colRight, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${order.orderId}`, colRight, 25, { align: 'right' });
    doc.text(`Date: ${order.invoiceDate}`, colRight, 31, { align: 'right' });

    // ── Divider ──────────────────────────────────────────────
    let y = 50;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, colRight, y);

    // ── Bill To / Ship To ────────────────────────────────────
    y += 10;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', margin, y);
    doc.text('SHIP TO', pageW / 2 + 5, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);

    // Bill To
    const billLines = [
      order.userName,
      `Email: ${order.userEmail}`,
      `Phone: ${order.userPhone}`,
      `PAN: ${order.userId}`,
    ];
    billLines.forEach(line => {
      doc.text(line, margin, y);
      y += 6;
    });

    // Ship To (reset y to where we started)
    let yShip = y - billLines.length * 6;
    const shipLines = [
      order.address.fullName,
      order.address.line1,
      `${order.address.city}, ${order.address.state}`,
      `Pincode: ${order.address.pincode}`,
    ];
    shipLines.forEach(line => {
      doc.text(line, pageW / 2 + 5, yShip);
      yShip += 6;
    });

    y = Math.max(y, yShip) + 6;

    // ── Divider ──────────────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, colRight, y);
    y += 8;

    // ── Delivery Info ────────────────────────────────────────
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, pageW - margin * 2, 14, 3, 3, 'F');
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Estimated Delivery: ${order.deliveryDays} business days  ·  Expected by ${order.deliveryDate}`,
      margin + 5,
      y + 9
    );
    y += 22;

    // ── Items Table Header ───────────────────────────────────
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, y, pageW - margin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', margin + 4, y + 7);
    doc.text('CATEGORY', margin + 90, y + 7);
    doc.text('AMOUNT', colRight - 4, y + 7, { align: 'right' });
    y += 14;

    // ── Items Table Row ──────────────────────────────────────
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.productName, margin + 4, y);
    doc.text('Product', margin + 90, y);
    doc.text(`INR ${order.productPrice.toLocaleString()}`, colRight - 4, y, { align: 'right' });

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y + 4, colRight, y + 4);
    y += 14;

    // ── Payment Breakdown ────────────────────────────────────
    const addRow = (label: string, value: string, bold = false, color?: [number,number,number]) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 10.5 : 10);
      if (color) doc.setTextColor(...color);
      else doc.setTextColor(80, 80, 80);
      doc.text(label, margin + 4, y);
      if (color) doc.setTextColor(...color);
      else doc.setTextColor(30, 30, 30);
      doc.text(value, colRight - 4, y, { align: 'right' });
      y += 8;
    };

    if (order.coinsUsed > 0) {
      addRow('FlexiCoins Discount', `- INR ${order.coinsUsed.toLocaleString()}`, false, [180, 120, 0]);
    }

    if (order.paymentPlan === 1) {
      addRow('Full Payment Discount (5%)', `- INR ${Math.round(order.productPrice * 0.05).toLocaleString()}`, false, [5, 150, 105]);
    } else {
      addRow('Downpayment (Upfront)', `INR ${order.downPayment.toLocaleString()}`);
      addRow(`Interest (${order.paymentPlan === 3 ? '5' : order.paymentPlan === 6 ? '10' : order.paymentPlan === 9 ? '15' : '20'}%)`,
        `+ INR ${(order.loanAmount - (order.productPrice - order.coinsUsed - order.downPayment)).toLocaleString()}`,
        false, [200, 80, 0]);
    }

    // Total line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.4);
    doc.line(margin, y, colRight, y);
    y += 6;
    addRow(
      order.paymentPlan === 1 ? 'Total Paid' : 'Total Financed',
      `INR ${order.loanAmount.toLocaleString()}`,
      true,
      [15, 23, 42]
    );

    if (order.paymentPlan > 1) {
      addRow(
        `Monthly EMI (${order.paymentPlan} months)`,
        `INR ${order.emiAmount.toLocaleString()} / month`,
        true,
        [59, 130, 246]
      );
    }

    // ── Payment Status ───────────────────────────────────────
    y += 4;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, pageW - margin * 2, 12, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105);
    doc.text(
      order.paymentPlan === 1 ? '✓ Payment Completed' : '✓ BNPL Plan Activated — EMI Schedule Started',
      margin + 6,
      y + 8
    );

    // ── Footer ───────────────────────────────────────────────
    y += 24;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, y, pageW, 30, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(
      'FlexiPay — Buy Now Pay Later for GenZ   |   support@flexipay.in   |   This is a computer-generated invoice.',
      pageW / 2,
      y + 10,
      { align: 'center' }
    );
    doc.text(
      'No physical signature required. Subject to FlexiPay Terms & Conditions.',
      pageW / 2,
      y + 18,
      { align: 'center' }
    );

    doc.save(`FlexiPay_Invoice_${order.orderId}.pdf`);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <div className={styles.iconWrap}>
          <FileText size={36} color="var(--accent-primary)" />
        </div>

        <h3>Invoice Ready</h3>
        <p className={styles.sub}>Order <strong>#{order.orderId}</strong></p>

        <div className={styles.previewTable}>
          <div className={styles.pRow}><span>Customer</span><span>{order.userName}</span></div>
          <div className={styles.pRow}><span>Email</span><span>{order.userEmail}</span></div>
          <div className={styles.pRow}><span>Phone</span><span>{order.userPhone}</span></div>
          <div className={styles.pRow}><span>Product</span><span>{order.productName}</span></div>
          <div className={styles.pRow}><span>Amount</span><span>₹{order.loanAmount.toLocaleString()}</span></div>
          <div className={styles.pRow}>
            <span>Plan</span>
            <span>{order.paymentPlan === 1 ? 'Full Payment' : `${order.paymentPlan} months EMI`}</span>
          </div>
          <div className={styles.pRow}>
            <span>Delivery</span>
            <span>{order.deliveryDays} days · by {order.deliveryDate}</span>
          </div>
          <div className={styles.pRow}>
            <span>Ship To</span>
            <span>{order.address.city}, {order.address.state} — {order.address.pincode}</span>
          </div>
        </div>

        <button className={`glass-button ${styles.downloadBtn}`} onClick={handleDownload}>
          <Download size={18} />
          Download PDF Invoice
        </button>
      </div>
    </div>
  );
}
