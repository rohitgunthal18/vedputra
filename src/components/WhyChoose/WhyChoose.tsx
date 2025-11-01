'use client';

import Image from 'next/image';
import styles from './WhyChoose.module.css';
import woodenKhalbatta from '@/img/wooden-khalbatta.png';
import steelGrinder from '@/img/steel-grinder.png';

const WhyChoose = () => {
  return (
    <section className={styles.whyChoose} id="about">
      <div className="container">
        <div className={styles.content}>
          {/* Left Side - Title */}
          <div className={styles.leftSide}>
            <span className={styles.badge}>WHY VEDPUTRA</span>
            <h2 className={styles.title}>Cold-Ground<br />Wooden Process</h2>
            <p className={styles.tagline}>While competitors use heat-generating steel grinders that destroy nutrients, we use traditional wooden khalbatta—preserving 100% potency.</p>
          </div>

          {/* Right Side - Visual Comparison */}
          <div className={styles.rightSide}>
            <div className={styles.comparison}>
              {/* Our Method - Wooden Khalbatta */}
              <div className={styles.method}>
                <div className={styles.imageWrapper}>
                  <Image 
                    src={woodenKhalbatta} 
                    alt="Wooden Khalbatta - Traditional Cold Grinding"
                    className={styles.methodImage}
                    width={150}
                    height={150}
                  />
                  <div className={styles.badge} data-type="success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <h4>Wooden Khalbatta</h4>
                <p className={styles.description}>Preserves nutrients, enzymes & natural potency</p>
              </div>

              <div className={styles.vs}>VS</div>

              {/* Their Method - Steel Grinder */}
              <div className={styles.method}>
                <div className={styles.imageWrapper}>
                  <Image 
                    src={steelGrinder} 
                    alt="Steel Grinder - Heat Generating Process"
                    className={styles.methodImage}
                    width={150}
                    height={150}
                  />
                  <div className={styles.badge} data-type="danger">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
                <h4>Steel Grinder</h4>
                <p className={styles.description}>Generates heat, destroys nutrients & quality</p>
              </div>
            </div>

            {/* Key Differentiators */}
            <div className={styles.features}>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#7FA64A" strokeWidth="2.5"/>
                  <path d="M8 12L11 15L16 9" stroke="#7FA64A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>Own Organic Farm</span>
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#7FA64A" strokeWidth="2.5"/>
                  <path d="M8 12L11 15L16 9" stroke="#7FA64A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>Botany + Chemistry Expert</span>
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#7FA64A" strokeWidth="2.5"/>
                  <path d="M8 12L11 15L16 9" stroke="#7FA64A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>In-House Processing</span>
              </div>
              <div className={styles.feature}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#7FA64A" strokeWidth="2.5"/>
                  <path d="M8 12L11 15L16 9" stroke="#7FA64A" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                <span>Zero Bulk Reselling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;

