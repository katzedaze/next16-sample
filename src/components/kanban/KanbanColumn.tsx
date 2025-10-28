'use client';

import { Task } from '@/db/schema';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  status: 'todo' | 'in_progress' | 'review' | 'done';
  title: string;
  tasks: Task[];
  members: { id: string; name: string }[];
}

const statusColors = {
  todo: 'bg-gray-100',
  in_progress: 'bg-blue-100',
  review: 'bg-yellow-100',
  done: 'bg-green-100',
};

const statusTextColors = {
  todo: 'text-gray-700',
  in_progress: 'text-blue-700',
  review: 'text-yellow-700',
  done: 'text-green-700',
};

export function KanbanColumn({ status, title, tasks, members }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-semibold ${statusTextColors[status]}`}>
            {title}
          </h2>
          <span className="text-xs text-gray-500 bg-white rounded-full px-2 py-1">
            {tasks.length}
          </span>
        </div>
      </div>

      <SortableContext
        items={tasks.map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`min-h-[500px] transition-colors ${
            isOver ? 'bg-blue-50' : ''
          }`}
        >
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-gray-400">
              タスクをドロップ
            </div>
          ) : (
            tasks.map((task) => {
              const assignee = members.find((m) => m.id === task.assigneeId);
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  assigneeName={assignee?.name}
                />
              );
            })
          )}
        </div>
      </SortableContext>
    </div>
  );
}
