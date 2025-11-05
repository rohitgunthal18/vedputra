import type { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from '../privacy-policy/privacy.module.css';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Shopping Guidelines',
  description:
    'VedPutra Organics Terms & Conditions: Understand your rights and obligations when purchasing organic moringa, beetroot, and soyabean powders. Clear policies for safe shopping.',
  keywords: [
    'terms and conditions',
    'VedPutra terms of service',
    'online shopping terms India',
    'organic product purchase terms',
    'ecommerce terms',
    'customer rights India',
  ],
};

const siteUrl = 'https://www.vedputra.com';

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Terms & Conditions',
      item: `${siteUrl}/terms`,
    },
  ],
};

export default function TermsPage() {
  return (
    <>
      <Script
        id="terms-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main className={styles.privacyPage}>
        <div className="container">
          <div className={styles.header}>
            <h1>Terms & Conditions</h1>
            <p className={styles.lastUpdated}>Last Updated: November 5, 2025</p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Agreement to Terms</h2>
              <p>
                Welcome to <strong>VedPutra Organics</strong>. By accessing our website at{' '}
                <a href="https://www.vedputra.com">www.vedputra.com</a> and purchasing our organic superfoods
                (moringa powder, beetroot powder, roasted soyabean protein), you agree to be bound by these Terms and
                Conditions, our Privacy Policy, and all applicable laws and regulations.
              </p>
              <p>
                If you do not agree with any of these terms, you are prohibited from using or accessing VedPutra
                Organics website. Please read these terms carefully before placing an order.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Use of Website</h2>
              
              <h3>2.1 Permitted Use</h3>
              <p>You may use VedPutra Organics website to:</p>
              <ul>
                <li>Browse our organic product catalog (moringa, beetroot, soyabean powders)</li>
                <li>Place orders for delivery across India</li>
                <li>Read wellness blogs and recipes</li>
                <li>Contact customer support at info@vedputra.com or +91-72186-16190</li>
                <li>Subscribe to our newsletter for health tips and promotions</li>
              </ul>

              <h3>2.2 Prohibited Use</h3>
              <p>You must NOT:</p>
              <ul>
                <li>Use our website for any unlawful purpose or fraudulent activity</li>
                <li>Attempt to hack, reverse engineer, or compromise website security</li>
                <li>Copy, reproduce, or distribute our content without written permission</li>
                <li>Impersonate VedPutra Organics or misrepresent your affiliation with us</li>
                <li>Upload viruses, malware, or any harmful code</li>
                <li>Scrape or harvest data from our website using automated tools</li>
                <li>Interfere with other users' access to the website</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. Product Information</h2>
              
              <div className={styles.card}>
                <h4>🌿 Product Accuracy</h4>
                <p>
                  VedPutra Organics strives to provide accurate product descriptions, images, nutritional information,
                  and pricing for our moringa powder, beetroot powder, and roasted soyabean protein. However, we do not
                  warrant that product descriptions, images, or other content is error-free, complete, or current.
                </p>
              </div>

              <div className={styles.card}>
                <h4>📦 Product Availability</h4>
                <p>
                  All products are subject to availability. We reserve the right to discontinue any product at any time.
                  If a product you ordered is unavailable, we will notify you within 24-48 hours and offer a full refund
                  or suitable alternative.
                </p>
              </div>

              <div className={styles.card}>
                <h4>💰 Pricing</h4>
                <p>
                  Prices for VedPutra Organics products are listed in Indian Rupees (INR) and are subject to change
                  without notice. The price charged for a product will be the price in effect at the time of order
                  placement. Promotional discounts are valid for limited periods only.
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2>4. Orders & Payment</h2>

              <h3>4.1 Order Acceptance</h3>
              <p>
                Your order is an offer to purchase products from VedPutra Organics. We reserve the right to accept or
                reject your order for any reason, including product availability, pricing errors, or suspected
                fraudulent activity. Order confirmation does not guarantee acceptance.
              </p>

              <h3>4.2 Payment Methods</h3>
              <p>VedPutra Organics accepts the following payment methods for orders in India:</p>
              <ul>
                <li>Credit/Debit Cards (Visa, Mastercard, RuPay)</li>
                <li>UPI (Google Pay, PhonePe, Paytm, BHIM)</li>
                <li>Net Banking (all major Indian banks)</li>
                <li>Digital Wallets (Paytm, PhonePe, Mobikwik)</li>
                <li>Cash on Delivery (COD) - Available for orders below ₹5,000</li>
              </ul>

              <h3>4.3 Payment Security</h3>
              <p>
                All payments are processed through secure, PCI DSS compliant payment gateways. VedPutra Organics does
                NOT store your complete credit card information. Your payment data is encrypted using SSL/TLS technology.
              </p>

              <h3>4.4 Order Cancellation by VedPutra</h3>
              <p>We reserve the right to cancel any order if:</p>
              <ul>
                <li>Product is out of stock or discontinued</li>
                <li>Pricing error occurred</li>
                <li>Delivery address is unserviceable</li>
                <li>Payment authorization fails</li>
                <li>Order is suspected to be fraudulent</li>
              </ul>
              <p>In case of cancellation, full refund will be processed within 5-7 business days.</p>
            </section>

            <section className={styles.section}>
              <h2>5. Shipping & Delivery</h2>

              <div className={styles.card}>
                <h4>📍 Delivery Coverage</h4>
                <p>
                  VedPutra Organics delivers organic superfoods to all states across India from our farm in Maharashtra.
                  Delivery timelines: 3-7 business days for most locations, 7-10 days for remote areas.
                </p>
              </div>

              <div className={styles.card}>
                <h4>🚚 Shipping Charges</h4>
                <p>
                  <strong>Free shipping</strong> on orders above ₹999. For orders below ₹999, standard shipping charges
                  of ₹50-100 apply depending on location.
                </p>
              </div>

              <div className={styles.card}>
                <h4>📦 Order Tracking</h4>
                <p>
                  Track your VedPutra Organics order in real-time using the tracking link sent via email and SMS. For
                  support, contact us at info@vedputra.com.
                </p>
              </div>

              <p>
                For detailed shipping policies, visit our{' '}
                <a href="/shipping-policy">Shipping Policy</a> page.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Returns & Refunds</h2>
              
              <h3>6.1 Return Eligibility</h3>
              <p>VedPutra Organics accepts returns within <strong>7 days</strong> of delivery if:</p>
              <ul>
                <li>Product received is damaged or defective</li>
                <li>Wrong product delivered</li>
                <li>Product packaging is tampered or unsealed</li>
                <li>Product quality does not meet our organic standards</li>
              </ul>

              <h3>6.2 Non-Returnable Items</h3>
              <p>The following items are NOT eligible for return:</p>
              <ul>
                <li>Opened or used products (for hygiene reasons)</li>
                <li>Products damaged due to misuse or negligence</li>
                <li>Products past the return window (7 days)</li>
              </ul>

              <h3>6.3 Refund Process</h3>
              <p>
                Upon receiving and inspecting the returned product, we will process your refund within 5-7 business days
                to your original payment method. Shipping charges are non-refundable.
              </p>

              <p>
                For complete return guidelines, visit our{' '}
                <a href="/return-policy">Return & Refund Policy</a> page.
              </p>
            </section>

            <section className={styles.section}>
              <h2>7. Intellectual Property Rights</h2>
              
              <p>
                All content on VedPutra Organics website, including text, graphics, logos, images, product descriptions,
                videos, and software, is the property of VedPutra Organics or its content suppliers and is protected by
                Indian and international copyright, trademark, and intellectual property laws.
              </p>

              <h3>Trademarks</h3>
              <ul>
                <li><strong>"VedPutra Organics"</strong> - Registered trademark</li>
                <li><strong>VedPutra logo</strong> - Protected design</li>
                <li>Product names, packaging designs, and marketing materials</li>
              </ul>

              <p>
                You may not reproduce, distribute, modify, or create derivative works of any content without explicit
                written permission from VedPutra Organics. Contact info@vedputra.com for licensing inquiries.
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. User Accounts</h2>

              <h3>8.1 Account Creation</h3>
              <p>
                To place orders on VedPutra Organics, you may create an account by providing accurate and complete
                information. You are responsible for maintaining the confidentiality of your account credentials.
              </p>

              <h3>8.2 Account Security</h3>
              <p>You agree to:</p>
              <ul>
                <li>Keep your password secure and not share it with others</li>
                <li>Notify us immediately of any unauthorized account access</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Provide accurate contact and delivery information</li>
              </ul>

              <h3>8.3 Account Termination</h3>
              <p>
                VedPutra Organics reserves the right to suspend or terminate your account if you violate these Terms,
                engage in fraudulent activity, or misuse our website.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Product Health Claims & Disclaimer</h2>

              <div className={styles.card}>
                <h4>⚠️ Important Health Notice</h4>
                <p>
                  VedPutra Organics products (moringa powder, beetroot powder, roasted soyabean protein) are natural
                  dietary supplements intended to support general wellness. They are <strong>NOT intended to diagnose,
                  treat, cure, or prevent any disease</strong>.
                </p>
              </div>

              <p><strong>Before using our products, please note:</strong></p>
              <ul>
                <li>Consult your healthcare provider before use, especially if pregnant, nursing, or on medication</li>
                <li>Individual results may vary based on diet, lifestyle, and health conditions</li>
                <li>Our products are not a substitute for a balanced diet and healthy lifestyle</li>
                <li>Keep products out of reach of children</li>
                <li>Store in a cool, dry place away from direct sunlight</li>
              </ul>

              <p>
                VedPutra Organics makes no medical claims. The health benefits mentioned on our website and blogs are
                based on traditional use, nutritional science, and published research, not FDA or FSSAI approval for
                specific medical treatments.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. Limitation of Liability</h2>

              <p>
                To the maximum extent permitted by Indian law, VedPutra Organics shall NOT be liable for any indirect,
                incidental, special, consequential, or punitive damages, including:
              </p>
              <ul>
                <li>Loss of profits or revenue</li>
                <li>Loss of data or business opportunities</li>
                <li>Allergic reactions or adverse health effects (use products at your own risk)</li>
                <li>Delays or failures in delivery due to circumstances beyond our control (natural disasters, strikes,
                  government restrictions)</li>
                <li>Errors or inaccuracies in product information</li>
              </ul>

              <p>
                Our total liability for any claim arising from your use of VedPutra Organics website or products shall
                not exceed the purchase price of the product in question.
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. Governing Law & Dispute Resolution</h2>

              <h3>11.1 Jurisdiction</h3>
              <p>
                These Terms & Conditions are governed by the laws of India. Any disputes arising from your use of
                VedPutra Organics website or products shall be subject to the exclusive jurisdiction of the courts in
                Pune, Maharashtra, India.
              </p>

              <h3>11.2 Dispute Resolution Process</h3>
              <p>Before initiating legal proceedings, we encourage you to:</p>
              <ol>
                <li>Contact our customer support at info@vedputra.com or +91-72186-16190</li>
                <li>Allow us 7 business days to investigate and respond to your complaint</li>
                <li>Attempt to resolve the issue amicably through negotiation</li>
              </ol>

              <p>
                If the dispute cannot be resolved informally, you agree to submit to binding arbitration in accordance
                with the Arbitration and Conciliation Act, 1996 (India).
              </p>
            </section>

            <section className={styles.section}>
              <h2>12. Force Majeure</h2>
              <p>
                VedPutra Organics shall not be liable for any delay or failure to perform due to causes beyond our
                reasonable control, including but not limited to:
              </p>
              <ul>
                <li>Acts of God (floods, earthquakes, pandemics, natural disasters)</li>
                <li>War, terrorism, civil unrest, or government actions</li>
                <li>Strikes, labor disputes, or supply chain disruptions</li>
                <li>Internet or telecommunications failures</li>
                <li>Crop failures or agricultural disruptions affecting our farm in Maharashtra</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>13. Severability</h2>
              <p>
                If any provision of these Terms & Conditions is found to be invalid, unlawful, or unenforceable by a
                court, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            <section className={styles.section}>
              <h2>14. Changes to Terms</h2>
              <p>
                VedPutra Organics reserves the right to modify these Terms & Conditions at any time. Changes will be
                effective immediately upon posting on our website with an updated "Last Updated" date.
              </p>
              <p>
                Your continued use of our website after changes constitutes acceptance of the revised terms. We
                recommend reviewing this page periodically.
              </p>
            </section>

            <section className={styles.section}>
              <h2>15. Contact Information</h2>

              <div className={styles.contactCard}>
                <h3>VedPutra Organics</h3>
                <p>
                  <strong>Address:</strong> Shivkrupa Heights, 102, Mokarwadi, Pune, Maharashtra 411001, India
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:info@vedputra.com">info@vedputra.com</a>
                </p>
                <p>
                  <strong>Phone:</strong> <a href="tel:+917218616190">+91-72186-16190</a>
                </p>
                <p>
                  <strong>Website:</strong> <a href="https://www.vedputra.com">www.vedputra.com</a>
                </p>
                <p>
                  <strong>Customer Support Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2>16. Acknowledgment</h2>
              <p>
                By using VedPutra Organics website and purchasing our organic superfoods, you acknowledge that you have
                read, understood, and agree to be bound by these Terms & Conditions.
              </p>
            </section>
          </div>

          <div className={styles.footer}>
            <p>
              <strong>VedPutra Organics</strong> - Delivering farm-fresh moringa, beetroot, and soyabean powders from
              Maharashtra to your home with transparency and trust.
            </p>
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

