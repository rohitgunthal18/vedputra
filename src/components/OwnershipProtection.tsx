'use client';

import { useEffect } from 'react';

export default function OwnershipProtection() {
  useEffect(() => {
    // Display ownership warning in console
    const displayWarning = () => {
      const styles = {
        title: 'color: #ff0000; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
        warning: 'color: #ff4444; font-size: 16px; font-weight: bold;',
        info: 'color: #4CAF50; font-size: 14px;',
        contact: 'color: #2196F3; font-size: 14px; font-weight: bold;',
        border: 'color: #ff0000; font-size: 12px;',
      };

      console.clear();
      console.log('%c⚠️ STOP! WEBSITE OWNERSHIP WARNING ⚠️', styles.title);
      console.log('%c' + '═'.repeat(70), styles.border);
      console.log('%c⛔ UNAUTHORIZED ACCESS ATTEMPT DETECTED', styles.warning);
      console.log('%c' + '═'.repeat(70), styles.border);
      
      console.log('\n%c📋 PLATFORM OWNERSHIP INFORMATION:', styles.info);
      console.log('%c├─ Platform Name: VedPutra Organics E-Commerce Platform', styles.info);
      console.log('%c├─ Owner: Rohit Gunthal', styles.info);
      console.log('%c├─ All Rights Reserved: Copyright © 2025', styles.info);
      console.log('%c└─ Jurisdiction: India', styles.info);
      
      console.log('\n%c⚖️ LEGAL NOTICE:', styles.warning);
      console.log('%cThis website, including all code, design, assets, databases, and intellectual property,');
      console.log('%cis the exclusive property of Rohit Gunthal. Any unauthorized access, modification,');
      console.log('%cdata scraping, reverse engineering, or malicious activity is strictly prohibited');
      console.log('%cand will be prosecuted under applicable cyber laws including:');
      console.log('%c  • Information Technology Act, 2000 (India)');
      console.log('%c  • Copyright Act, 1957 (India)');
      console.log('%c  • Intellectual Property Rights Laws');
      
      console.log('\n%c🔒 SECURITY NOTICE:', styles.warning);
      console.log('%cIf you are inspecting this website without authorization:');
      console.log('%c  ⚠️ Your IP address and activity are being logged');
      console.log('%c  ⚠️ Suspicious activity will be reported to authorities');
      console.log('%c  ⚠️ Legal action may be taken against unauthorized access');
      
      console.log('\n%c📞 LEGITIMATE CONTACT INFORMATION:', styles.contact);
      console.log('%c├─ Owner Name: Rohit Gunthal', styles.contact);
      console.log('%c├─ Email: rohitgunthal1819@gmail.com', styles.contact);
      console.log('%c├─ Business Email: info@vedputra.com', styles.contact);
      console.log('%c└─ Purpose: For authorized collaborations, partnerships, or security reports only', styles.contact);
      
      console.log('\n%c✅ AUTHORIZED USE:', styles.info);
      console.log('%cIf you are a developer, security researcher, or have legitimate reasons to inspect:');
      console.log('%c  1. Please contact the owner first: rohitgunthal1819@gmail.com');
      console.log('%c  2. Wait for written authorization');
      console.log('%c  3. Respect intellectual property rights');
      console.log('%c  4. Report any security vulnerabilities responsibly');
      
      console.log('\n%c🛡️ SECURITY RESEARCHERS:', styles.info);
      console.log('%cFound a security vulnerability? Please report responsibly to:');
      console.log('%c  Email: rohitgunthal1819@gmail.com');
      console.log('%c  Subject: [SECURITY] VedPutra Organics Vulnerability Report');
      console.log('%c  We appreciate responsible disclosure and will acknowledge your contribution.');
      
      console.log('\n%c' + '═'.repeat(70), styles.border);
      console.log('%c⚠️ This message will be displayed every time DevTools is opened ⚠️', styles.warning);
      console.log('%c' + '═'.repeat(70), styles.border);
      
      console.log('\n%c💚 VedPutra Organics - Farm to Home Superfoods', 'color: #4CAF50; font-size: 12px;');
      console.log('%c🌐 https://www.vedputra.com', 'color: #2196F3; font-size: 12px;');
    };

    // Display warning immediately
    displayWarning();

    // Detect DevTools opening and display warning
    let devtoolsOpen = false;
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        displayWarning();
      } else if (!widthThreshold && !heightThreshold && devtoolsOpen) {
        devtoolsOpen = false;
      }
    };

    // Check periodically
    const interval = setInterval(detectDevTools, 1000);

    // Display on right-click context menu (inspect element)
    const handleContextMenu = () => {
      setTimeout(displayWarning, 500);
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // Display on common DevTools keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Cmd+Option+I (Mac)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.altKey && e.key === 'I')
      ) {
        setTimeout(displayWarning, 500);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // This component doesn't render anything
}

