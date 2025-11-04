'use client';

import { useEffect, useState } from 'react';
import styles from './ShippingLabel.module.css';
import { supabase } from '@/lib/supabase';

interface ShippingLabelProps {
  order: any;
  onClose: () => void;
  onMarkPrinted?: () => void;
}

export default function ShippingLabel({ order, onClose, onMarkPrinted }: ShippingLabelProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMarkingPrinted, setIsMarkingPrinted] = useState(false);

  useEffect(() => {
    // Prevent body scroll when label is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 500);
  };

  const handleMarkAsPrinted = async () => {
    setIsMarkingPrinted(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          label_printed: true,
          label_printed_at: new Date().toISOString()
        })
        .eq('order_id', order.order_id);

      if (error) throw error;
      
      alert('Label marked as printed!');
      if (onMarkPrinted) onMarkPrinted();
      onClose();
    } catch (error) {
      console.error('Error marking as printed:', error);
      alert('Failed to mark as printed');
    } finally {
      setIsMarkingPrinted(false);
    }
  };

  // Generate barcode URL - smaller size for compact label
  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${order.order_id}&code=Code128&translate-esc=on&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&qunit=Mm&quiet=0`;

  const isCOD = order.payment_method === 'cod';
  const codAmount = isCOD ? parseFloat(order.total_amount).toFixed(2) : null;

  return (
    <>
      {/* Screen overlay with buttons */}
      <div className={styles.overlay}>
        <div className={styles.controls}>
          <button 
            className={styles.printBtn} 
            onClick={handlePrint}
            disabled={isPrinting}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            {isPrinting ? 'Printing...' : 'Print Label'}
          </button>
          <button 
            className={styles.markPrintedBtn} 
            onClick={handleMarkAsPrinted}
            disabled={isMarkingPrinted || order.label_printed}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {order.label_printed ? 'Already Printed' : isMarkingPrinted ? 'Marking...' : 'Mark as Printed'}
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close
          </button>
        </div>
      </div>

      {/* Compact shipping label - half A4 size */}
      <div className={styles.shippingLabel}>
        {/* Compact Header */}
        <div className={styles.header}>
          <div className={styles.branding}>
            <span className={styles.brandName}>VEDPUTRA</span>
            <span className={styles.tagline}>Organic Powders</span>
          </div>
          <div className={styles.orderId}>#{order.order_id}</div>
        </div>

        {/* Delivery Address - Main Focus */}
        <div className={styles.deliverTo}>
          <div className={styles.deliverHeader}>DELIVER TO:</div>
          <div className={styles.customerInfo}>
            <div className={styles.customerName}>{order.customer_name}</div>
            <div className={styles.mobile}>📱 {order.customer_mobile}</div>
          </div>
          <div className={styles.address}>
            {order.shipping_address}
            {order.shipping_locality && <>, {order.shipping_locality}</>}
            <br />
            {order.shipping_city}, {order.shipping_state}
            <br />
            <strong>PIN: {order.shipping_pincode}</strong>
          </div>
        </div>

        {/* Barcode */}
        <div className={styles.barcodeSection}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={barcodeUrl} alt="Order barcode" className={styles.barcode} />
        </div>

        {/* COD Amount (if applicable) */}
        {isCOD && codAmount && (
          <div className={styles.codSection}>
            <div className={styles.codLabel}>COLLECT CASH</div>
            <div className={styles.codAmount}>₹{codAmount}</div>
          </div>
        )}

        {/* Sender Info - Compact */}
        <div className={styles.senderInfo}>
          <strong>FROM:</strong> VEDPUTRA, 123 Organic Valley, Mumbai - 400001 | +91 98765 43210
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span>📦 Handle with Care</span>
          <span>📅 {new Date(order.created_at).toLocaleDateString('en-IN')}</span>
          <span>🌐 vedputra.com</span>
        </div>
      </div>
    </>
  );
}

