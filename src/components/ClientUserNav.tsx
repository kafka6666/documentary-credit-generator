'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import UserNav with SSR disabled to prevent hydration errors
const UserNav = dynamic(() => import("@/components/UserNav"), { 
  ssr: false,
  loading: () => <LoadingNav />
});

// Separate loading component to ensure consistent loading state
function LoadingNav() {
  return (
    <div className="h-[48px] flex items-center">
      <div className="h-10 w-24 animate-pulse bg-gray-800 rounded"></div>
    </div>
  );
}

export default function ClientUserNav() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <LoadingNav />;
  }
  
  return <UserNav />;
}
