import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Community Board',
  description: 'A platform for community engagement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
