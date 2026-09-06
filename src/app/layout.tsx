import type { Metadata } from 'next';
import './globals.css';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

export const metadata: Metadata = {
  title: 'EcomUnified - Multi-Platform Seller Management & AI Product Intelligence',
  description: 'Single unified dashboard to manage Amazon India and Flipkart seller accounts, track real profit margins after fees, manage returns & RTOs, and conduct AI product research.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#0b0f17] dark:text-slate-100 antialiased min-h-screen transition-colors duration-200">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
