import type { Metadata } from 'next';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from '../privacy-policy/privacy.module.css';

export const metadata: Metadata = {
  title: 'Return & Refund Policy - Easy Returns',
  description:
    'VedPutra Organics Return Policy: 7-day easy returns, full refund on damaged products, hassle-free return process for moringa, beetroot, soyabean powders. Customer satisfaction guaranteed.',
  keywords: ['return policy', 'refund policy', 'VedPutra returns', 'product refund India', 'easy returns'],
};

export default function ReturnPolicyPage() {
  return (
    <>
      <Header />
      <main className={styles.privacyPage}>
        <div className="container">
          <div className={styles.header}>
            <h1>Return & Refund Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: November 5, 2025</p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Return Window</h2>
              <p>
                <strong>VedPutra Organics</strong> accepts returns within <strong>7 days</strong> of delivery for
                defective, damaged, or wrong products.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Eligible Returns</h2>
              <div className={styles.card}>
                <h4>✅ We Accept Returns For:</h4>
                <ul>
                  <li>Damaged or defective products</li>
                  <li>Wrong product delivered</li>
                  <li>Tampered or unsealed packaging</li>
                  <li>Product quality issues</li>
                  <li>Expired or near-expiry products</li>
                </ul>
              </div>

              <div className={styles.card}>
                <h4>❌ Non-Returnable Items:</h4>
                <ul>
                  <li>Opened or used products (hygiene reasons)</li>
                  <li>Products past 7-day return window</li>
                  <li>Products damaged due to customer misuse</li>
                  <li>Products without original packaging</li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2>3. Return Process</h2>
              <ol>
                <li>
                  <strong>Contact Us:</strong> Email info@vedputra.com or call +91-72186-16190 within 7 days of
                  delivery
                </li>
                <li>
                  <strong>Provide Details:</strong> Order number, product name, reason for return, and photos of
                  damaged product
                </li>
                <li>
                  <strong>Approval:</strong> We'll review your request within 24-48 hours
                </li>
                <li>
                  <strong>Return Shipping:</strong> We'll arrange pickup or provide return shipping instructions
                </li>
                <li>
                  <strong>Inspection:</strong> Upon receiving the product, we'll inspect it within 2-3 business days
                </li>
                <li>
                  <strong>Refund:</strong> If approved, refund will be processed within 5-7 business days
                </li>
              </ol>
            </section>

            <section className={styles.section}>
              <h2>4. Refund Method</h2>
              <p>Refunds will be credited to:</p>
              <ul>
                <li>Your original payment method (credit/debit card, UPI, net banking)</li>
                <li>Bank account (for COD orders - provide bank details)</li>
              </ul>
              <p>
                <strong>Note:</strong> Shipping charges are non-refundable except in cases of our error (wrong/damaged
                product).
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Exchanges</h2>
              <p>
                VedPutra Organics offers product exchange for damaged or defective items. We'll send you a replacement
                free of charge within 3-5 business days after receiving the returned product.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Contact Us</h2>
              <div className={styles.contactCard}>
                <h3>VedPutra Organics</h3>
                <p>
                  <strong>Email:</strong> <a href="mailto:info@vedputra.com">info@vedputra.com</a>
                </p>
                <p>
                  <strong>Phone:</strong> <a href="tel:+917218616190">+91-72186-16190</a>
                </p>
                <p>
                  <strong>Address:</strong> Shivkrupa Heights, 102, Mokarwadi, Pune, Maharashtra 411001
                </p>
              </div>
            </section>
          </div>

          <div className={styles.footer}>
            <p>Your satisfaction is our priority. We're here to help!</p>
            <div className={styles.buttons}>
              <a href="/" className={styles.btnPrimary}>
                Back to Home
              </a>
              <a href="/#products" className={styles.btnSecondary}>
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

