import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bio-Genomic What-If Engine',
  description: 'From code to consequence — AI-driven prediction of genetic mutation outcomes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://3Dmol.csb.pitt.edu/build/3Dmol-min.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
