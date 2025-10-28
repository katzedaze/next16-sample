import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Welcome to TaskFlow
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
            A modern task management application built with Next.js 16, React Aria, and Drizzle ORM.
            Manage your projects and tasks with ease.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Project Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Organize your work into projects and track progress efficiently.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Task Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create, assign, and manage tasks with priorities and due dates.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              Visual Workflows
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Kanban boards and dependency graphs for better visualization.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
