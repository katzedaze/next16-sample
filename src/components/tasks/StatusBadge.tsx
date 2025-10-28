interface StatusBadgeProps {
  status: 'todo' | 'in_progress' | 'review' | 'done';
}

const STATUS_CONFIG = {
  todo: { label: 'TODO', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: '進行中', color: 'bg-blue-100 text-blue-800' },
  review: { label: 'レビュー', color: 'bg-yellow-100 text-yellow-800' },
  done: { label: '完了', color: 'bg-green-100 text-green-800' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
