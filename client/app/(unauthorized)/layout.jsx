// app/unauthorized/layout.jsx
"use client";
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UnauthorizedLayout({ children }) {
  const { isSignedIn } = useAuth();  
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/home');  
    }
  }, [isSignedIn, router]);
  /*
  if (isSignedIn) {
    return <div>Loading...</div>; 
  }
  */
  return (
    <div>
      
      {children}  
    </div>
  );
}
