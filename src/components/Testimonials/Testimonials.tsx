'use client';

import { testimonials } from '@/data/products';
import styles from './Testimonials.module.css';

const Testimonials = () => {
  return (
    <section className={styles.testimonials}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>Testimonials</div>
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <p className={styles.sectionSubtitle}>Join thousands of satisfied customers</p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>★★★★★</div>
              <p className={styles.testimonialText}>{testimonial.text}</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>{testimonial.avatar}</div>
                <div>
                  <div className={styles.authorName}>{testimonial.name}</div>
                  <div className={styles.authorLocation}>{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

