import type { Metadata } from 'next';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from '../privacy-policy/privacy.module.css';

export const metadata: Metadata = {
  title: 'Shipping Policy - Fast Delivery Across India',
  description:
    'VedPutra Organics Shipping Policy: Free shipping above ₹999, 3-7 days delivery, track your order, farm-fresh moringa, beetroot, soyabean powders shipped direct from Maharashtra.',
  keywords: ['shipping policy', 'delivery India', 'free shipping', 'order tracking', 'VedPutra delivery'],
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <main className={styles.privacyPage}>
        <div className="container">
          <div className={styles.header}>
            <h1>Shipping & Delivery Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: November 5, 2025</p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Delivery Coverage</h2>
              <p>
                <strong>VedPutra Organics</strong> delivers organic moringa powder, beetroot powder, and roasted
                soyabean protein to <strong>all states and union territories across India</strong> from our farm in
                Maharashtra.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Shipping Charges</h2>
              
              <div className={styles.card}>
                <h4>🎉 FREE Shipping</h4>
                <p>Orders above <strong>₹999</strong> qualify for FREE shipping anywhere in India!</p>
              </div>

              <div className={styles.card}>
                <h4>💰 Standard Shipping</h4>
                <p>Orders below ₹999: ₹50-100 depending on delivery location and product weight.</p>
              </div>
            </section>

            <section className={styles.section}>
              <h2>3. Delivery Timeline</h2>
              <ul>
                <li><strong>Metro Cities:</strong> 3-5 business days</li>
                <li><strong>Tier 2/3 Cities:</strong> 5-7 business days</li>
                <li><strong>Remote Areas:</strong> 7-10 business days</li>
              </ul>
              <p>
                Delivery timelines start from order confirmation and payment verification. VedPutra Organics processes
                orders within 24-48 hours of payment.
              </p>
            </section>

            <section className={styles.section}>
              <h2>4. Order Tracking</h2>
              <p>
                Track your order in real-time! After dispatch, you'll receive:
              </p>
              <ul>
                <li>Email with tracking link</li>
                <li>SMS with tracking number</li>
                <li>Real-time updates on delivery status</li>
              </ul>
              <p>
                For tracking support, contact us at <a href="mailto:info@vedputra.com">info@vedputra.com</a> or call{' '}
                <a href="tel:+917218616190">+91-72186-16190</a>.
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Packaging</h2>
              <p>
                All VedPutra Organics products are packed in:
              </p>
              <ul>
                <li>Food-grade, airtight containers to preserve freshness</li>
                <li>Eco-friendly, recyclable packaging materials</li>
                <li>Secure outer boxes to prevent damage during transit</li>
                <li>Tamper-proof seals for product safety</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>6. Contact Us</h2>
              <div className={styles.contactCard}>
                <h3>VedPutra Organics</h3>
                <p><strong>Email:</strong> <a href="mailto:info@vedputra.com">info@vedputra.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+917218616190">+91-72186-16190</a></p>
                <p><strong>Address:</strong> Shivkrupa Heights, 102, Mokarwadi, Pune, Maharashtra 411001</p>
              </div>
            </section>
          </div>

          <div className={styles.footer}>
            <div className={styles.buttons}>
              <a href="/" className={styles.btnPrimary}>Back to Home</a>
              <a href="/#products" className={styles.btnSecondary}>Shop Now</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

