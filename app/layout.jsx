import { Fraunces, Work_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-work',
  display: 'swap',
});

export const metadata = {
  title: 'Amigo secreto · Adivina quién',
  description: 'Descubre a tu amigo secreto por sus características',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${workSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
