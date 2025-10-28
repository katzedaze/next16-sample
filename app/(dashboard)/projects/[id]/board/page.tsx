'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Task, Project } from '@/db/schema';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TaskCard } from '@/components/kanban/TaskCard';

interface Member {
  id: string;
  name: string;
  email: string;
}

const columns = [
  { id: 'todo' as const, title: 'TODO' },
  { id: 'in_progress' as const, title: '進行中' },
  { id: 'review' as const, title: 'レビュー' },
  { id: 'done' as const, title: '完了' },
];

export default function KanbanBoardPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      const response = await fetch(`/api/projects/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${params.id}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
    setOriginalStatus(task?.status || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging over a column
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      const activeTask = tasks.find((t) => t.id === activeId);
      if (activeTask && activeTask.status !== overColumn.id) {
        // Optimistically update UI
        setTasks((tasks) =>
          tasks.map((t) =>
            t.id === activeId ? { ...t, status: overColumn.id } : t
          )
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const draggedTaskId = active.id as string;

    setActiveTask(null);

    if (!over) {
      // Revert if dropped outside
      if (originalStatus) {
        setTasks((tasks) =>
          tasks.map((t) =>
            t.id === draggedTaskId ? { ...t, status: originalStatus } : t
          )
        );
      }
      setOriginalStatus(null);
      return;
    }

    const overId = over.id as string;

    // Determine the target status
    // Check if dropped on a column directly
    let targetStatus: 'todo' | 'in_progress' | 'review' | 'done' | undefined =
      columns.find((col) => col.id === overId)?.id;

    // If not dropped on a column, check if dropped on a task
    if (!targetStatus) {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status as 'todo' | 'in_progress' | 'review' | 'done';
      }
    }

    // Update status if changed
    if (targetStatus && originalStatus && originalStatus !== targetStatus) {
      try {
        // Update task status via API
        const response = await fetch(`/api/tasks/${draggedTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: targetStatus,
          }),
        });

        if (!response.ok) {
          // Revert on error
          setTasks((tasks) =>
            tasks.map((t) =>
              t.id === draggedTaskId ? { ...t, status: originalStatus } : t
            )
          );
          throw new Error('Failed to update task status');
        }
      } catch (error) {
        console.error('Error updating task:', error);
      }
    } else if (!targetStatus && originalStatus) {
      // Revert if no valid target
      setTasks((tasks) =>
        tasks.map((t) =>
          t.id === draggedTaskId ? { ...t, status: originalStatus } : t
        )
      );
    }

    setOriginalStatus(null);
  };

  if (isPending || isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white shadow">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダー */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href={`/projects/${params.id}`}
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project?.name} - カンバンボード
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    タスクをドラッグ&ドロップしてステータスを変更
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/projects/${params.id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  リストビュー
                </Link>
              </div>
            </div>
          </div>

          {/* カンバンボード */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  status={column.id}
                  title={column.title}
                  tasks={tasks.filter((task) => task.status === column.id)}
                  members={members}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="opacity-75">
                  <TaskCard
                    task={activeTask}
                    assigneeName={
                      members.find((m) => m.id === activeTask.assigneeId)?.name
                    }
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
