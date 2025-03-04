'use client';

import dynamic from 'next/dynamic';

// Dynamically import UserNav with SSR disabled to prevent hydration errors
const UserNav = dynamic(() => import("@/components/UserNav"), { 
  ssr: false,
  loading: () => (
    <div className="h-[48px] flex items-center">
      <div className="h-10 w-24 animate-pulse bg-gray-800 rounded"></div>
    </div>
  )
});

export default function ClientUserNav() {
  return <UserNav />;
}
