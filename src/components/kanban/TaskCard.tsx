'use client';

import { Task } from '@/db/schema';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { PriorityBadge } from '@/components/tasks/PriorityBadge';
import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  assigneeName?: string;
}

export function TaskCard({ task, assigneeName }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow p-4 mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <Link href={`/tasks/${task.id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-gray-900 mb-2 hover:text-blue-600">
          {task.title}
        </h3>
      </Link>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority as 'low' | 'medium' | 'high' | 'critical'} />

        {task.dueDate && (
          <span className="text-xs text-gray-500">
            {new Date(task.dueDate).toLocaleDateString('ja-JP', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {assigneeName && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs font-medium text-gray-600">
                {assigneeName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-600">{assigneeName}</span>
          </div>
        </div>
      )}
    </div>
  );
}
