'use client';

import styles from './Features.module.css';

const features = [
  {
    icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
    title: 'Free Shipping',
    description: 'On orders above ₹999',
  },
  {
    icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    title: 'Fast Delivery',
    description: 'Within 3-5 business days',
  },
  {
    icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
    title: 'Certified Organic',
    description: '100% natural ingredients',
  },
  {
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    title: '24/7 Support',
    description: "We're here to help",
  },
];

const Features = () => {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {feature.icon}
                </svg>
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

