import type { Metadata } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import { ThemeScript } from '../components/theme/theme-script';
import { Toaster } from '../components/ui/Toaster';
import '../styles/globals.css';
import { Providers } from './providers';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'VM Console',
    template: '%s · VM Console',
  },
  description: 'Gestión local de máquinas virtuales',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${manrope.variable} ${jetbrains.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
