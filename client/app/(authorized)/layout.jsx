// app/authorized/layout.jsx
"use client";
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Script from "next/script";
export default function AuthorizedLayout({ children }) {
  const { isSignedIn } = useAuth();  
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');  
    }
  }, [isSignedIn, router]);
  /*
  if (!isSignedIn) {
    return <div>Loading...</div>; 
  }
  */

  return (
    <div>

      
    <Script src="https://cdn.botpress.cloud/webchat/v2.2/inject.js"></Script>
    <Script src="https://files.bpcontent.cloud/2024/11/23/01/20241123014156-VDNEQXDO.js"></Script>
      
      
    
      
      {children}
      
    </div>
  );
}
