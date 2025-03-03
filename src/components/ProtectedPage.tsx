// src/components/ProtectedPage.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ProtectedPageProps {
  children: React.ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push('/auth/sign-in?redirectTo=' + window.location.pathname);
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}