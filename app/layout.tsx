export const metadata = {
  title: 'Asteroid Risk — Impactor-2025',
  description: 'Interactive asteroid model',
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


