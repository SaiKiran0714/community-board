'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
          throw new Error('Invalid login link');
        }

        const response = await fetch(`http://127.0.0.1:5000/api/auth/verify?token=${token}&email=${email}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify login');
        }

        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAdmin', JSON.stringify(data.isAdmin));

        toast({
          title: 'Success',
          description: 'You have been logged in successfully',
        });

        // Redirect to home page or dashboard
        router.push('/');
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to verify login',
          variant: 'destructive',
        });
        // Clear any stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        // Redirect to home page after a short delay
        setTimeout(() => router.push('/'), 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [router, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {verifying ? (
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Verifying your login...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Redirecting...</h1>
        </div>
      )}
    </div>
  );
} 