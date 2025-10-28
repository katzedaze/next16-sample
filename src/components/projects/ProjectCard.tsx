import Link from 'next/link';
import { Project } from '@/db/schema';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm(`「${project.name}」を削除してもよろしいですか？`)) {
      onDelete?.(project.id);
    }
  };

  // HTMLタグを削除してプレーンテキストに変換
  const getPlainTextFromHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4"
      style={{ borderLeftColor: project.color }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="プロジェクトを削除"
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

      {project.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {getPlainTextFromHtml(project.description)}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          更新日: {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
        </span>
      </div>
    </Link>
  );
}
