import type { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy - Your Data Security Matters',
  description:
    'VedPutra Organics Privacy Policy: Learn how we collect, use, protect your personal information. GDPR compliant. Secure payments. Your privacy is our priority.',
  keywords: [
    'privacy policy',
    'data protection',
    'VedPutra Organics privacy',
    'secure shopping',
    'GDPR compliance',
    'personal information protection',
    'data security India',
  ],
  openGraph: {
    title: 'Privacy Policy | VedPutra Organics',
    description: 'Learn how VedPutra Organics protects your personal data and ensures secure online shopping experience.',
  },
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
      name: 'Privacy Policy',
      item: `${siteUrl}/privacy-policy`,
    },
  ],
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Script
        id="privacy-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main className={styles.privacyPage}>
        <div className="container">
          <div className={styles.header}>
            <h1>Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: November 5, 2025</p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Introduction</h2>
              <p>
                Welcome to <strong>VedPutra Organics</strong>. We are committed to protecting your personal information
                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you visit our website{' '}
                <a href="https://www.vedputra.com">www.vedputra.com</a> and purchase our organic superfood products
                including moringa powder, beetroot powder, and roasted soyabean protein.
              </p>
              <p>
                By using VedPutra Organics website, you agree to the collection and use of information in accordance
                with this Privacy Policy. If you do not agree with our policies and practices, please do not use our
                website.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Personal Information</h3>
              <p>We collect personal information that you voluntarily provide to us when you:</p>
              <ul>
                <li>Register an account on VedPutra Organics</li>
                <li>Place an order for moringa powder, beetroot powder, or soyabean protein</li>
                <li>Subscribe to our wellness newsletter</li>
                <li>Contact us via email or phone</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              
              <p>Personal information may include:</p>
              <ul>
                <li><strong>Name:</strong> First and last name</li>
                <li><strong>Email address:</strong> info@vedputra.com for inquiries</li>
                <li><strong>Phone number:</strong> +91-72186-16190</li>
                <li><strong>Delivery address:</strong> Shipping address in India</li>
                <li><strong>Payment information:</strong> Processed securely via third-party payment gateways</li>
                <li><strong>Order history:</strong> Products purchased (moringa, beetroot, soyabean powders)</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <p>When you visit VedPutra Organics, we automatically collect certain information about your device:</p>
              <ul>
                <li>IP address and location (city, state, country)</li>
                <li>Browser type and version</li>
                <li>Device type (mobile, desktop, tablet)</li>
                <li>Pages viewed and time spent on VedPutra Organics website</li>
                <li>Referring website or search terms</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. How We Use Your Information</h2>
              <p>VedPutra Organics uses your personal information for the following purposes:</p>
              
              <div className={styles.card}>
                <h4>✅ Order Processing & Delivery</h4>
                <p>
                  Process and fulfill your orders for moringa powder, beetroot powder, and roasted soyabean protein.
                  Ship products from our Maharashtra farm to your home within 3-7 business days.
                </p>
              </div>

              <div className={styles.card}>
                <h4>✅ Customer Support</h4>
                <p>
                  Respond to your inquiries, provide product guidance, and resolve issues. Contact us at
                  info@vedputra.com or +91-72186-16190 for personalized support.
                </p>
              </div>

              <div className={styles.card}>
                <h4>✅ Marketing Communications</h4>
                <p>
                  Send you promotional emails about new organic products, wellness tips, recipes, and special offers.
                  You can unsubscribe anytime.
                </p>
              </div>

              <div className={styles.card}>
                <h4>✅ Website Improvement</h4>
                <p>
                  Analyze website usage to improve user experience, optimize product pages, and enhance our farm-to-home
                  delivery service.
                </p>
              </div>

              <div className={styles.card}>
                <h4>✅ Legal Compliance</h4>
                <p>Comply with applicable laws, regulations, and legal processes in India.</p>
              </div>
            </section>

            <section className={styles.section}>
              <h2>4. Information Sharing & Disclosure</h2>
              <p>
                <strong>VedPutra Organics does NOT sell your personal information.</strong> We may share your
                information only in the following circumstances:
              </p>

              <ul>
                <li>
                  <strong>Service Providers:</strong> Payment processors, shipping partners, and cloud hosting services
                  (all GDPR compliant)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, court order, or government authorities in
                  India
                </li>
                <li>
                  <strong>Business Transfers:</strong> In case of merger, acquisition, or sale of VedPutra Organics
                  assets
                </li>
                <li>
                  <strong>With Your Consent:</strong> Any other disclosure with your explicit permission
                </li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>5. Data Security</h2>
              <p>
                VedPutra Organics implements industry-standard security measures to protect your personal information:
              </p>
              <ul>
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure payment gateways (PCI DSS compliant)</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication for employee access</li>
                <li>Encrypted database storage</li>
                <li>Firewall protection and intrusion detection</li>
              </ul>
              <p>
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your
                data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Cookies & Tracking Technologies</h2>
              <p>VedPutra Organics uses cookies to enhance your browsing experience:</p>
              
              <h3>Types of Cookies We Use:</h3>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for website functionality (shopping cart, checkout)</li>
                <li><strong>Performance Cookies:</strong> Analyze website traffic and user behavior (Google Analytics)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Show relevant ads for organic superfoods</li>
              </ul>

              <p>
                You can control cookies through your browser settings. Disabling cookies may affect website
                functionality.
              </p>
            </section>

            <section className={styles.section}>
              <h2>7. Your Privacy Rights</h2>
              <p>As a VedPutra Organics customer in India, you have the following rights:</p>

              <div className={styles.card}>
                <h4>🔍 Right to Access</h4>
                <p>Request a copy of your personal data we hold.</p>
              </div>

              <div className={styles.card}>
                <h4>✏️ Right to Rectification</h4>
                <p>Correct inaccurate or incomplete personal information.</p>
              </div>

              <div className={styles.card}>
                <h4>🗑️ Right to Deletion</h4>
                <p>Request deletion of your personal data (subject to legal obligations).</p>
              </div>

              <div className={styles.card}>
                <h4>⛔ Right to Object</h4>
                <p>Object to processing of your data for marketing purposes.</p>
              </div>

              <div className={styles.card}>
                <h4>📦 Right to Data Portability</h4>
                <p>Receive your data in a structured, machine-readable format.</p>
              </div>

              <p>
                To exercise these rights, contact us at <strong>info@vedputra.com</strong> or call{' '}
                <strong>+91-72186-16190</strong>.
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. Children's Privacy</h2>
              <p>
                VedPutra Organics does not knowingly collect personal information from children under 18 years of age.
                Our organic superfoods (moringa, beetroot, soyabean) are intended for adult consumers. If you are a
                parent and believe your child has provided us with personal information, please contact us immediately
                at info@vedputra.com.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Third-Party Links</h2>
              <p>
                VedPutra Organics website may contain links to third-party websites (social media, payment processors).
                We are not responsible for the privacy practices of these external sites. We recommend reviewing their
                privacy policies before providing any personal information.
              </p>
            </section>

            <section className={styles.section}>
              <h2>10. Data Retention</h2>
              <p>We retain your personal information for as long as necessary to:</p>
              <ul>
                <li>Fulfill orders and provide customer support</li>
                <li>Comply with legal, tax, and accounting obligations (minimum 7 years for financial records)</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Improve VedPutra Organics products and services</li>
              </ul>
              <p>
                After the retention period, we will securely delete or anonymize your data.
              </p>
            </section>

            <section className={styles.section}>
              <h2>11. International Data Transfers</h2>
              <p>
                VedPutra Organics primarily operates in India. If you access our website from outside India, your
                information may be transferred to and processed in India. By using our website, you consent to such
                transfers.
              </p>
            </section>

            <section className={styles.section}>
              <h2>12. Updates to This Privacy Policy</h2>
              <p>
                VedPutra Organics may update this Privacy Policy periodically to reflect changes in our practices,
                technology, legal requirements, or business operations. We will notify you of significant changes via:
              </p>
              <ul>
                <li>Email notification to registered users</li>
                <li>Prominent notice on our website homepage</li>
                <li>Updated "Last Updated" date at the top of this policy</li>
              </ul>
              <p>
                Continued use of VedPutra Organics website after changes constitutes acceptance of the updated Privacy
                Policy.
              </p>
            </section>

            <section className={styles.section}>
              <h2>13. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please
                contact VedPutra Organics:
              </p>

              <div className={styles.contactCard}>
                <h3>VedPutra Organics</h3>
                <p>
                  <strong>Address:</strong> Shivkrupa Heights, 102, Mokarwadi, Pune, Maharashtra 411001, India
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:info@vedputra.com">info@vedputra.com</a>
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+917218616190">+91-72186-16190</a>
                </p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a href="https://www.vedputra.com">www.vedputra.com</a>
                </p>
                <p>
                  <strong>Response Time:</strong> Within 48 hours for privacy-related inquiries
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2>14. Consent</h2>
              <p>
                By using VedPutra Organics website and purchasing our organic superfoods (moringa powder, beetroot
                powder, roasted soyabean protein), you acknowledge that you have read, understood, and agree to this
                Privacy Policy and our data collection, usage, and sharing practices.
              </p>
            </section>
          </div>

          <div className={styles.footer}>
            <p>
              <strong>VedPutra Organics</strong> is committed to transparency, data protection, and your right to
              privacy. Your trust is our priority.
            </p>
            <div className={styles.buttons}>
              <a href="/" className={styles.btnPrimary}>
                Back to Home
              </a>
              <a href="/#products" className={styles.btnSecondary}>
                Shop Organic Superfoods
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

