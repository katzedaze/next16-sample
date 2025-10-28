'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/navigation/nav-link';
import { MobileMenu } from '@/components/navigation/mobile-menu';
import { UserMenu } from '@/components/navigation/user-menu';

interface HeaderProps {
  showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
  // TODO: Get auth state from Better Auth
  const isAuthenticated = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            TF
          </div>
          <span className="text-xl font-bold">TaskFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          {isAuthenticated && (
            <>
              <NavLink
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Dashboard
              </NavLink>
              <NavLink
                href="/projects"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Projects
              </NavLink>
            </>
          )}

          {showAuth && (
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <MobileMenu />
      </div>
    </header>
  );
}
