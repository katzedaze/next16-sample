'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { StatusBadge } from '@/components/tasks/StatusBadge';
import { PriorityBadge } from '@/components/tasks/PriorityBadge';
import Link from 'next/link';

interface TaskNodeData {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeName?: string;
}

function TaskNode({ data }: NodeProps<TaskNodeData>) {
  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 hover:border-blue-400 transition-colors min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />

      <div className="p-3">
        <Link
          href={`/tasks/${data.id}`}
          className="block hover:text-blue-600 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {data.title}
          </h3>
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={data.status} />
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={data.priority} />
          </div>

          {data.assigneeName && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {data.assigneeName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600 truncate">
                {data.assigneeName}
              </span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500"
      />
    </div>
  );
}

export default memo(TaskNode);
