import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Vedputra - Premium Organic Powder Collection',
  description: 'Experience nature\'s finest powders, ethically sourced and meticulously crafted for your wellness journey. Pure, potent, and sustainably produced.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

