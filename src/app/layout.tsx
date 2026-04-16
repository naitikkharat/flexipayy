import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FlexiProvider } from '@/context/FlexiContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'FlexiPay | BNPL for GenZ',
  description: 'Instant credit and easy EMIs on your favorite products.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FlexiProvider>
          <Navbar />
          <main className="container mt-8 animate-fade-in">
            {children}
          </main>
        </FlexiProvider>
      </body>
    </html>
  );
}
