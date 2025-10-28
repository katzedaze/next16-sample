'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* ダイアログコンテナ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full bg-white rounded-lg shadow-xl transform transition-all',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                aria-label="閉じる"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* コンテンツ */}
          <div className="px-6 py-4">{children}</div>

          {/* フッター */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
