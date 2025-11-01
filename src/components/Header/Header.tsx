'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Update header style on scroll
      setIsScrolled(window.pageYOffset > 100);

      // Update active section
      const sections = ['home', 'products', 'about', 'blog', 'contact'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      closeMenu();
    }
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <nav className={styles.navbar}>
            <div className={styles.logo}>VEDPUTRA</div>
            
            <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
              <li>
                <a
                  href="#home"
                  className={`${styles.navLink} ${activeSection === 'home' ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(e, 'home')}
                >
                  HOME
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  className={`${styles.navLink} ${activeSection === 'products' ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(e, 'products')}
                >
                  SHOP
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className={`${styles.navLink} ${activeSection === 'about' ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(e, 'about')}
                >
                  ABOUT
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className={`${styles.navLink} ${activeSection === 'blog' ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(e, 'blog')}
                >
                  BLOG
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`${styles.navLink} ${activeSection === 'contact' ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(e, 'contact')}
                >
                  CONTACT
                </a>
              </li>
            </ul>

            <div className={styles.navActions}>
              <Link href="/cart" className={styles.cartIcon} aria-label="Shopping Cart">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {getCartCount() > 0 && (
                  <span className={styles.cartBadge}>{getCartCount()}</span>
                )}
              </Link>
              
              <button
                className={`${styles.mobileMenuToggle} ${isMenuOpen ? styles.active : ''}`}
                onClick={toggleMenu}
                aria-label="Menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </nav>
        </div>
      </header>
      
      {isMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={closeMenu} />
      )}
    </>
  );
};

export default Header;

