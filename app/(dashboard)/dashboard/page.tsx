'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import StatCard from '@/components/dashboard/StatCard';
import RecentTasks from '@/components/dashboard/RecentTasks';
import ProgressChart from '@/components/dashboard/ProgressChart';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Task, Project } from '@/db/schema';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  doneTasks: number;
  myTasks: number;
}

interface ActivityLog {
  id: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  taskId: string;
  userName: string | null;
  userEmail: string;
  task?: Task;
}

interface DashboardData {
  stats: DashboardStats;
  dueTodayTasks: Task[];
  dueThisWeekTasks: Task[];
  recentTasks: (Task & { project?: Project })[];
  recentActivities: ActivityLog[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">読み込み中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">データの読み込みに失敗しました</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <DashboardHeader userName={session.user?.name} />

      {/* メインコンテンツ */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              プロジェクトとタスクの概要
            </p>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard
              title="プロジェクト数"
              value={data.stats.totalProjects}
              color="bg-blue-500"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              }
            />
            <StatCard
              title="総タスク数"
              value={data.stats.totalTasks}
              color="bg-purple-500"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />
            <StatCard
              title="進行中のタスク"
              value={data.stats.inProgressTasks}
              color="bg-yellow-500"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            />
            <StatCard
              title="自分のタスク"
              value={data.stats.myTasks}
              color="bg-green-500"
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />
          </div>

          {/* タスクステータス詳細と進捗チャート */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* タスクステータス詳細 */}
            <div className="lg:col-span-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">未着手</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {data.stats.todoTasks}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">進行中</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {data.stats.inProgressTasks}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">レビュー</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {data.stats.reviewTasks}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">完了</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {data.stats.doneTasks}
                </div>
              </div>
            </div>

            {/* 進捗チャート */}
            <div className="lg:col-span-1">
              <ProgressChart
                todoTasks={data.stats.todoTasks}
                inProgressTasks={data.stats.inProgressTasks}
                reviewTasks={data.stats.reviewTasks}
                doneTasks={data.stats.doneTasks}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 今日の期限タスク */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  今日が期限のタスク
                </h2>
              </div>
              <div className="p-6">
                {data.dueTodayTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    今日が期限のタスクはありません
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.dueTodayTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-md"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          今日
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 今週の期限タスク */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  今週が期限のタスク
                </h2>
              </div>
              <div className="p-6">
                {data.dueThisWeekTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    今週が期限のタスクはありません
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.dueThisWeekTasks.slice(0, 5).map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                            {new Date(task.dueDate).toLocaleDateString('ja-JP', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 最近のタスクとアクティビティ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* 最近のタスク */}
            <RecentTasks tasks={data.recentTasks} />

            {/* 最近のアクティビティ */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  最近のアクティビティ
                </h2>
              </div>
              <div className="p-6">
                {data.recentActivities.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    アクティビティがありません
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {data.recentActivities.map((activity) => (
                      <li key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                              {activity.userName?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">
                              {activity.userName || activity.userEmail}
                            </span>{' '}
                            が{' '}
                            <span className="font-medium">
                              {activity.task?.title || 'タスク'}
                            </span>{' '}
                            を{activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(activity.createdAt).toLocaleString('ja-JP')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
