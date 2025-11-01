'use client';

import { useState, FormEvent } from 'react';
import styles from './Newsletter.module.css';

const Newsletter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [activeTab, setActiveTab] = useState<'info' | 'form'>('info');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Thank you for contacting us, ${formData.name}! We'll get back to you soon.`);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section className={styles.contact} id="contact">
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>GET IN TOUCH</span>
          <h2 className={styles.title}>Contact Us</h2>
          <p className={styles.subtitle}>Have questions? We'd love to hear from you. Send us a message!</p>
        </div>

        {/* Mobile Tab Buttons */}
        <div className={styles.mobileTabButtons}>
          <button
            className={`${styles.tabButton} ${activeTab === 'info' ? styles.active : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Contact Info
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'form' ? styles.active : ''}`}
            onClick={() => setActiveTab('form')}
          >
            Contact Form
          </button>
        </div>

        <div className={styles.contactWrapper}>
          {/* Contact Form */}
          <div className={`${styles.formSection} ${activeTab === 'form' ? styles.mobileActive : ''}`}>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={styles.input}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.input}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={styles.input}
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  className={styles.textarea}
                  placeholder="Tell us how we can help you..."
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                SEND MESSAGE
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className={`${styles.infoSection} ${activeTab === 'info' ? styles.mobileActive : ''}`}>
            <div className={styles.infoItems}>
              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <h4>Our Location</h4>
                  <p>123 Organic Farm Road<br />Mumbai, Maharashtra 400001</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <h4>Email Us</h4>
                  <p>info@vedputra.com<br />support@vedputra.com</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.iconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <h4>Call Us</h4>
                  <p>+91 98765 43210<br />Mon-Sat: 9AM - 6PM</p>
                </div>
              </div>
            </div>

            <div className={styles.socialLinks}>
              <h4>Follow Us</h4>
              <div className={styles.socialIcons}>
                <a href="#" aria-label="Facebook" className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Twitter" className={styles.socialIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

