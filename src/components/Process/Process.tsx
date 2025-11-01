'use client';

import Image from 'next/image';
import styles from './Process.module.css';
import process1 from '@/img/process1.png';
import process2 from '@/img/process2.png';
import process3 from '@/img/process3.png';
import process4 from '@/img/process4.png';

const processSteps = [
  {
    id: 1,
    number: '01',
    title: 'Organic Farming',
    description: 'Cultivated on our own certified organic farm with natural farming methods',
    image: process1,
  },
  {
    id: 2,
    number: '02',
    title: 'Hand Harvesting',
    description: 'Carefully hand-picked at peak potency to ensure maximum nutrient retention',
    image: process2,
  },
  {
    id: 3,
    number: '03',
    title: 'Traditional Grinding',
    description: 'Cold-ground using wooden khalbatta to preserve all natural properties',
    image: process3,
  },
  {
    id: 4,
    number: '04',
    title: 'Quality Packaging',
    description: 'Sealed fresh in eco-friendly packaging to maintain purity and potency',
    image: process4,
  },
];

const Process = () => {
  return (
    <section className={styles.process}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>OUR PROCESS</span>
          <h2 className={styles.title}>Farm to Your Home</h2>
          <p className={styles.subtitle}>Every step carefully monitored for uncompromising quality</p>
        </div>

        <div className={styles.steps}>
          {processSteps.map((step, index) => (
            <div key={step.id} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.imageBox}>
                <Image 
                  src={step.image} 
                  alt={step.title}
                  className={styles.stepImage}
                  width={200}
                  height={200}
                />
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              {index < processSteps.length - 1 && (
                <div className={styles.arrow}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#4A6741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;

