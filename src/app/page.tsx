'use client';

import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import Products from '@/components/Products/Products';
import WhyChoose from '@/components/WhyChoose/WhyChoose';
import Process from '@/components/Process/Process';
import Blog from '@/components/Blog/Blog';
import Newsletter from '@/components/Newsletter/Newsletter';
import Footer from '@/components/Footer/Footer';
import ScrollToTop from '@/components/ScrollToTop/ScrollToTop';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Products />
        <WhyChoose />
        <Process />
        <Blog />
        <Newsletter />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
