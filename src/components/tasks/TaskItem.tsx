import Link from 'next/link';
import { Task } from '@/db/schema';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { useState, useEffect } from 'react';

interface TaskItemProps {
  task: Task;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  assigneeName?: string;
}

export function TaskItem({ task, onDelete, onStatusChange, assigneeName }: TaskItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`「${task.title}」を削除してもよろしいですか？`)) {
      onDelete?.(task.id);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    onStatusChange?.(task.id, e.target.value as Task['status']);
  };

  // HTMLタグを削除してプレーンテキストに変換
  const getPlainTextFromHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{task.title}</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <StatusBadge status={task.status as 'todo' | 'in_progress' | 'review' | 'done'} />
            <PriorityBadge priority={task.priority as 'low' | 'medium' | 'high' | 'critical'} />
            {task.dueDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
              </span>
            )}
            {assigneeName && (
              <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                担当: {assigneeName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onStatusChange && (
            <select
              value={task.status}
              onChange={handleStatusChange}
              onClick={(e) => e.preventDefault()}
              className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white dark:bg-gray-700 font-medium"
            >
              <option value="todo">TODO</option>
              <option value="in_progress">進行中</option>
              <option value="review">レビュー</option>
              <option value="done">完了</option>
            </select>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors"
              title="タスクを削除"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
          {getPlainTextFromHtml(task.description)}
        </p>
      )}
    </Link>
  );
}
