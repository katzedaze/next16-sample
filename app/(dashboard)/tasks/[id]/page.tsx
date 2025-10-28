'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Task, Project } from '@/db/schema';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { PriorityBadge } from '@/components/tasks/PriorityBadge';
import dynamic from 'next/dynamic';

const LexicalEditor = dynamic(() => import('@/components/editor/LexicalEditor'), {
  ssr: false,
});

const taskSchema = z.object({
  title: z.string().min(1, 'タスク名は必須です').max(200),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Member {
  id: string;
  name: string;
  email: string;
}

interface ActivityLog {
  id: string;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  userName: string;
  userEmail: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = useSession();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchTask();
    }
  }, [session, params.id]);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/projects');
          return;
        }
        throw new Error('タスクの取得に失敗しました');
      }

      const data = await response.json();
      setTask(data);
      reset({
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId || '',
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
      });

      // Fetch project info and members
      if (data.projectId) {
        fetchProject(data.projectId);
        fetchMembers(data.projectId);
      }

      // Fetch activity logs
      fetchActivityLogs();
    } catch (error) {
      console.error('Error fetching task:', error);
      setMessage({ type: 'error', text: 'タスクの取得に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchMembers = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch(`/api/tasks/${params.id}/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSaving(true);
      setMessage(null);

      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('タスクの更新に失敗しました');
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'タスクを更新しました' });

      // Refresh activity logs
      fetchActivityLogs();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating task:', error);
      setMessage({ type: 'error', text: 'タスクの更新に失敗しました' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${task?.title}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('タスクの削除に失敗しました');
      }

      router.push(`/projects/${task?.projectId}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('タスクの削除に失敗しました');
    }
  };

  if (isPending || isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/projects"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  プロジェクト
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{session.user?.name}</span>
                <Link
                  href="/settings"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  設定
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link
                href={`/projects/${task.projectId}`}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            </div>

            {project && (
              <div className="flex items-center mb-4">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: project.color }}
                />
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {project.name}
                </Link>
              </div>
            )}

            {message && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* タスク詳細 */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">タスク詳細</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      編集
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        タスク名 *
                      </label>
                      <input
                        {...register('title')}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium placeholder-gray-400"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        説明
                      </label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <LexicalEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="タスクの詳細を入力..."
                          />
                        )}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          ステータス
                        </label>
                        <select
                          {...register('status')}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium"
                        >
                          <option value="todo">TODO</option>
                          <option value="in_progress">進行中</option>
                          <option value="review">レビュー</option>
                          <option value="done">完了</option>
                        </select>
                        {errors.status && (
                          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          優先度
                        </label>
                        <select
                          {...register('priority')}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium"
                        >
                          <option value="low">低</option>
                          <option value="medium">中</option>
                          <option value="high">高</option>
                          <option value="critical">緊急</option>
                        </select>
                        {errors.priority && (
                          <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        担当者
                      </label>
                      <select
                        {...register('assigneeId')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium"
                      >
                        <option value="">未割り当て</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      {errors.assigneeId && (
                        <p className="mt-1 text-sm text-red-600">{errors.assigneeId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        期限日
                      </label>
                      <input
                        {...register('dueDate')}
                        type="date"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium"
                      />
                      {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          reset();
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        タスク名
                      </label>
                      <p className="text-lg text-gray-900">{task.title}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        説明
                      </label>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {task.description || '説明なし'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          ステータス
                        </label>
                        <StatusBadge status={task.status as 'todo' | 'in_progress' | 'review' | 'done'} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          優先度
                        </label>
                        <PriorityBadge priority={task.priority as 'low' | 'medium' | 'high' | 'critical'} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        担当者
                      </label>
                      <p className="text-gray-900">
                        {task.assigneeId
                          ? members.find(m => m.id === task.assigneeId)?.name || '不明'
                          : '未割り当て'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        期限日
                      </label>
                      <p className="text-gray-900">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('ja-JP')
                          : '期限なし'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        作成日
                      </label>
                      <p className="text-gray-900">
                        {new Date(task.createdAt).toLocaleString('ja-JP')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        更新日
                      </label>
                      <p className="text-gray-900">
                        {new Date(task.updatedAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* アクティビティログ */}
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">アクティビティ</h2>
                <div className="space-y-4">
                  {activityLogs.length === 0 ? (
                    <p className="text-sm text-gray-500">アクティビティはありません</p>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {activityLogs.map((log, index) => (
                          <li key={log.id}>
                            <div className="relative pb-8">
                              {index !== activityLogs.length - 1 ? (
                                <span
                                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              ) : null}
                              <div className="relative flex items-start space-x-3">
                                <div className="relative">
                                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                    <span className="text-gray-500 font-medium text-sm">
                                      {log.userName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div>
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-900">
                                        {log.userName}
                                      </span>
                                    </div>
                                    <p className="mt-0.5 text-sm text-gray-500">
                                      {new Date(log.createdAt).toLocaleString('ja-JP')}
                                    </p>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-700">
                                    {log.action === 'created' ? (
                                      <span>タスクを作成しました</span>
                                    ) : log.action === 'updated' && log.field ? (
                                      <span>
                                        <span className="font-medium">{log.field}</span> を{' '}
                                        {log.oldValue && (
                                          <>
                                            <span className="text-red-600">{log.oldValue}</span> から{' '}
                                          </>
                                        )}
                                        <span className="text-green-600">{log.newValue}</span> に変更しました
                                      </span>
                                    ) : (
                                      <span>タスクを{log.action}しました</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* クイックアクション */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  クイックアクション
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/projects/${task.projectId}`}
                    className="block w-full px-4 py-2 text-sm font-medium text-center text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    プロジェクトに戻る
                  </Link>
                </div>
              </div>

              {/* 危険な操作 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  危険な操作
                </h3>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  タスクを削除
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  この操作は取り消せません。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
