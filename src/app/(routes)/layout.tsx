import "./globals.css";
import { Providers } from "../providers/providers";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Inter, Roboto } from 'next/font/google'
import Matomo from "./Matomo/Matomo";
import CartComponent from "../components/cart/StatementCart";
import type { Metadata } from 'next';
import { REBORN_URL } from "../lib/config/constants";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    template: 'TIB Knowledge Loom: %s',
    default: 'TIB Knowledge Loom'
  },
  description: 'The TIB Knowledge Loom is an Open Science Digital Library for FAIR scientific knowledge.',
  openGraph: {
    type: 'website',
    siteName: 'TIB Knowledge Loom',
    images: [
      {
        url: `${REBORN_URL}/logo.jpg`,
      },
    ],
  },
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <body className="font-inter dark:text-black dark:bg-white">
        <Suspense fallback={null}>
          <Navbar />
          <Providers>
            {children}
            <CartComponent />
          </Providers>
          <Matomo />
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
