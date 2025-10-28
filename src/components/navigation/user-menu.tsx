'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // TODO: Replace with actual user data from auth
  const user = {
    name: 'User',
    email: 'user@example.com',
    avatarUrl: null,
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onPress={toggleMenu}
        className="flex items-center gap-2"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:inline">{user.name}</span>
        <svg
          className="h-4 w-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 p-3 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <nav className="p-2">
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                onClick={closeMenu}
                className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Settings
              </Link>
              <div className="my-1 border-t border-gray-200 dark:border-gray-800" />
              <button
                onClick={() => {
                  closeMenu();
                  // TODO: Implement sign out
                  console.log('Sign out');
                }}
                className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
