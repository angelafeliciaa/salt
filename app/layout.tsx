export const metadata = {
  title: 'Asteroid Risk Lab — Impactor-2025',
  description: 'Interactive asteroid impact visualization (mock data)',
};

import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


