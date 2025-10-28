import Link from 'next/link';
import { Task, Project } from '@/db/schema';

interface RecentTasksProps {
  tasks: (Task & { project?: Project })[];
}

const statusLabels = {
  todo: '未着手',
  in_progress: '進行中',
  review: 'レビュー',
  done: '完了',
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
};

const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '緊急',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

export default function RecentTasks({ tasks }: RecentTasksProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近のタスク</h2>
        <p className="text-sm text-gray-500">タスクがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">最近のタスク</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <li key={task.id} className="px-6 py-4 hover:bg-gray-50">
            <Link
              href={`/projects/${task.projectId}`}
              className="block"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  {task.project && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {task.project.name}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      priorityColors[task.priority as keyof typeof priorityColors]
                    }`}
                  >
                    {priorityLabels[task.priority as keyof typeof priorityLabels]}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[task.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[task.status as keyof typeof statusLabels]}
                  </span>
                </div>
              </div>
              {task.dueDate && (
                <p className="text-xs text-gray-500 mt-2">
                  期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
