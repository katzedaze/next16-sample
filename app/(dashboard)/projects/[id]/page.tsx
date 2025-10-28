'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Project, Task } from '@/db/schema';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { TaskItem } from '@/components/tasks/TaskItem';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

const projectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').max(100),
  description: z.string().max(500).nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const COLOR_PRESETS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
];

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'tasks'>('tasks');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchProject();
      fetchTasks();
      fetchMembers();
    }
  }, [session, params.id]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/projects');
          return;
        }
        throw new Error('プロジェクトの取得に失敗しました');
      }

      const data = await response.json();
      setProject(data);
      reset({
        name: data.name,
        description: data.description || '',
        color: data.color,
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      setMessage({ type: 'error', text: 'プロジェクトの取得に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (page: number = 1) => {
    try {
      setIsLoadingTasks(true);
      const response = await fetch(`/api/projects/${params.id}/tasks?page=${page}&limit=20`);

      if (!response.ok) {
        throw new Error('タスクの取得に失敗しました');
      }

      const data = await response.json();
      setTasks(data.tasks || data);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('タスクの削除に失敗しました');
      }

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('タスクの削除に失敗しました');
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('タスクの更新に失敗しました');
      }

      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('タスクの更新に失敗しました');
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSaving(true);
      setMessage(null);

      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('プロジェクトの更新に失敗しました');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'プロジェクトを更新しました' });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating project:', error);
      setMessage({ type: 'error', text: 'プロジェクトの更新に失敗しました' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${project?.name}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('プロジェクトの削除に失敗しました');
      }

      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('プロジェクトの削除に失敗しました');
    }
  };

  if (isPending || isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

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
                  className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
                href="/projects"
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
              <div
                className="w-8 h-8 rounded-full mr-3"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            </div>

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

            {/* タブナビゲーション */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`${
                    activeTab === 'tasks'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  タスク ({taskStats.total})
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  プロジェクト情報
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* タスク一覧 */}
              <div className="lg:col-span-3">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">タスク一覧</h2>
                    <div className="flex space-x-2">
                      <Link
                        href={`/projects/${params.id}/board`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                          />
                        </svg>
                        カンバンボード
                      </Link>
                      <Link
                        href={`/projects/${params.id}/graph`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
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
                        依存関係グラフ
                      </Link>
                      <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        新規タスク
                      </button>
                    </div>
                  </div>

                  {isLoadingTasks ? (
                    <div className="flex justify-center py-12">
                      <div className="text-gray-600">読み込み中...</div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
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
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        タスクがありません
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        新しいタスクを作成して始めましょう
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleStatusChange}
                          assigneeName={
                            task.assigneeId
                              ? members.find(m => m.id === task.assigneeId)?.name
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  )}

                  {/* ページネーション */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center items-center space-x-2">
                      <button
                        onClick={() => fetchTasks(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        前へ
                      </button>
                      <span className="text-sm text-gray-600">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => fetchTasks(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        次へ
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* サイドバー - 統計 */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">統計</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">合計タスク</div>
                      <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">TODO</div>
                      <div className="text-2xl font-bold text-gray-600">{taskStats.todo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">進行中</div>
                      <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">レビュー</div>
                      <div className="text-2xl font-bold text-yellow-600">{taskStats.review}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">完了</div>
                      <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                    </div>
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
                    プロジェクトを削除
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    この操作は取り消せません。プロジェクトに関連するすべてのタスクも削除されます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* プロジェクト情報 */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      プロジェクト情報
                    </h2>
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
                          プロジェクト名
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          説明
                        </label>
                        <textarea
                          {...register('description')}
                          rows={4}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium"
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.description.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          カラー
                        </label>
                        <div className="flex items-center space-x-2 mb-3">
                          {COLOR_PRESETS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setValue('color', color)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                selectedColor === color
                                  ? 'border-gray-900 scale-110'
                                  : 'border-gray-300 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <input
                          {...register('color')}
                          type="color"
                          className="w-full h-10 rounded cursor-pointer"
                        />
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
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          プロジェクト名
                        </label>
                        <p className="mt-1 text-gray-900">{project.name}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          説明
                        </label>
                        <p className="mt-1 text-gray-900">
                          {project.description || '説明なし'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          カラー
                        </label>
                        <div className="mt-1 flex items-center">
                          <div
                            className="w-6 h-6 rounded-full mr-2"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-gray-900">{project.color}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          作成日
                        </label>
                        <p className="mt-1 text-gray-900">
                          {new Date(project.createdAt).toLocaleString('ja-JP')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          更新日
                        </label>
                        <p className="mt-1 text-gray-900">
                          {new Date(project.updatedAt).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* サイドバー - 統計 */}
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">統計</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">タスク数</div>
                      <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">完了タスク</div>
                      <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">進行中タスク</div>
                      <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* モーダル */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchTasks}
        projectId={params.id as string}
      />
    </div>
  );
}
