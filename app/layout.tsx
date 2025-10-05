export const metadata = {
  title: 'Asteroid Risk — Impactor-2025',
  description: 'Interactive asteroid model',
};

import './globals.css';
import BackgroundSpecs from '../components/BackgroundSpecs';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BackgroundSpecs />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>{children}</div>
      </body>
    </html>
  );
}


