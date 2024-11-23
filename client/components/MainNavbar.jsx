"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

const MainNavbar = () => {
  const { userId } = useAuth();

  return (
    <nav className="border-b fixed w-full backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/">
              <span className="text-2xl font-bold text-[#820000]">TinoGPT</span>
            </Link>
            {userId && (
              <div className="flex gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/resources">
                  <Button variant="ghost">Resources</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <UserButton />
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;