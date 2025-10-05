SF Pro Font Setup

Important licensing note
- Apple’s SF Pro fonts are licensed and must be downloaded directly from Apple. Do not commit or redistribute the font files in this repository.
- Keep this folder tracked, but ignore the actual font binaries (see .gitignore suggestion below).

Download
1) Sign in and download from Apple: https://developer.apple.com/fonts/
2) Unzip the package locally. You’ll typically get families like SF Pro, SF Pro Display, SF Pro Text, and SF Pro Rounded in .otf/.ttf/.woff2 formats depending on the package.

Where to place files
- This folder (static serving): /Users/angelafelicia/VSC/nasa/public/fonts/sf-pro/
  - Place your .woff2 (preferable), .woff, or .otf files here.
- Optional (using next/font/local): /Users/angelafelicia/VSC/nasa/app/fonts/sf-pro/
  - If you prefer Next.js automatic font optimization, put the font files under app/fonts/sf-pro and import them via next/font/local.

Usage option A — classic CSS @font-face (using public/)
Add something like this to app/globals.css (adjust file names to match yours):

```css
@font-face {
  font-family: 'SF Pro';
  src: url('/fonts/sf-pro/SFProText-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'SF Pro';
  src: url('/fonts/sf-pro/SFProText-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'SF Pro';
  src: url('/fonts/sf-pro/SFProText-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Example usage */
body {
  font-family: 'SF Pro', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;
}
```

Usage option B — next/font/local (automatic optimization)
If you place fonts under app/fonts/sf-pro, you can do:

```ts
// app/fonts/sf-pro/index.ts
import localFont from 'next/font/local';

export const sfPro = localFont({
  src: [
    { path: './SFProText-Regular.woff2', weight: '400', style: 'normal' },
    { path: './SFProText-Medium.woff2',  weight: '500', style: 'normal' },
    { path: './SFProText-Bold.woff2',    weight: '700', style: 'normal' },
  ],
  variable: '--font-sfpro',
  display: 'swap',
});
```

Then include it in your root layout:

```tsx
// app/layout.tsx
import './globals.css';
import { sfPro } from './fonts/sf-pro';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sfPro.variable}>
      <body>{children}</body>
    </html>
  );
}
```

And reference the CSS variable in globals.css:

```css
:root { --font-sfpro: 'SF Pro', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji; }
body { font-family: var(--font-sfpro); }
```

.gitignore suggestion
If this repo is public, prevent committing the actual font binaries:

```gitignore
public/fonts/sf-pro/*
!public/fonts/sf-pro/README.md

app/fonts/sf-pro/*
!app/fonts/sf-pro/README.md
```

Notes
- Prefer .woff2 for best performance.
- If you use different family subsets (Display/Text/Rounded), add corresponding @font-face or next/font entries with the correct weights and names.

