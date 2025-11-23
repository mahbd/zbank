"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Trash2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/users/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        await signOut({ callbackUrl: "/auth/signin" });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <Image
                src="/zeuz-logo.png"
                alt="ZeuZ Bank Logo"
                width={32}
                height={32}
                priority
                className="w-8 h-8 object-contain"
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
              
              {/* Dropdown Menu */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                {dropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut({ callbackUrl: "/auth/signin" });
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setDeleteDialogOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data including cards, transactions, and
              account balance from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}