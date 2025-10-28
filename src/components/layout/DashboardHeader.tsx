'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface DashboardHeaderProps {
  userName?: string | null;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">
                  TaskFlow
                </h1>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className={`${
                  isActive('/dashboard')
                    ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                ダッシュボード
              </Link>
              <Link
                href="/projects"
                className={`${
                  isActive('/projects')
                    ? 'border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                プロジェクト
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <ThemeToggle />
              {userName && (
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {userName}
                </span>
              )}
              <Link
                href="/settings"
                className="text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                設定
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
