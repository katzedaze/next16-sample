interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const PRIORITY_CONFIG = {
  low: { label: '低', color: 'bg-gray-100 text-gray-600' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-600' },
  high: { label: '高', color: 'bg-orange-100 text-orange-600' },
  critical: { label: '緊急', color: 'bg-red-100 text-red-600' },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
