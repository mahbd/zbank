"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2">
              <img
                className="w-8"
                src="zeuz-logo.png"
                alt="ZeuZ Bank Logo"
              />
              <h1 data-testid="dashboard-title" className="text-3xl font-bold text-gray-900">
                ZeuZ Bank
              </h1>
            </div>
            <p className="text-gray-600">
              Digital Banking Platform
            </p>
          </div>
          {session && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {session?.user?.name || session?.user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}