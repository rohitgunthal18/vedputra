'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './LabelPage.module.css';
import './print.css';

export default function LabelViewPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isMarkingPrinted, setIsMarkingPrinted] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Failed to load order');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 500);
  };

  const handleMarkAsPrinted = async () => {
    if (!order) return;
    
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
      router.back();
    } catch (error) {
      console.error('Error marking as printed:', error);
      alert('Failed to mark as printed');
    } finally {
      setIsMarkingPrinted(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading label...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.errorContainer}>
        <p>Order not found</p>
        <button onClick={() => router.back()} className={styles.backBtn}>
          Go Back
        </button>
      </div>
    );
  }

  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${order.order_id}&code=Code128&translate-esc=on&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&qunit=Mm&quiet=0`;
  const isCOD = order.payment_method === 'cod';
  const codAmount = isCOD ? parseFloat(order.total_amount).toFixed(2) : null;

  return (
    <div className={styles.container}>
      {/* Action Bar - Hidden in print */}
      <div className={styles.actionBar} data-print-hide="true">
        <div className={styles.actionLeft}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Orders
          </button>
          <span className={styles.orderIdLabel}>Order #{order.order_id}</span>
        </div>
        <div className={styles.actionRight}>
          <button 
            onClick={handlePrint} 
            className={styles.printBtn}
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
            onClick={handleMarkAsPrinted}
            className={styles.markPrintedBtn}
            disabled={isMarkingPrinted || order.label_printed}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {order.label_printed ? 'Already Printed' : isMarkingPrinted ? 'Marking...' : 'Mark as Printed'}
          </button>
        </div>
      </div>

      {/* Shipping Label */}
      <div className={styles.labelContainer}>
        <div className={styles.shippingLabel}>
          {/* Compact Header */}
          <div className={styles.header}>
            <div className={styles.branding}>
              <span className={styles.brandName}>VEDPUTRA ORGANICS</span>
              <span className={styles.tagline}>Farm to Home</span>
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
            <strong>FROM:</strong> VEDPUTRA ORGANICS, Shivkrupa Hights, 102, Mokarwadi, Pune | +91 72186 16190
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span>📦 Handle with Care</span>
            <span>📅 {new Date(order.created_at).toLocaleDateString('en-IN')}</span>
            <span>🌐 vedputra.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

