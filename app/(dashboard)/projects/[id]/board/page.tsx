'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// DnD-kitを動的インポート（重いライブラリなので遅延読み込み）
const KanbanBoardClient = dynamic(
  () => import('./KanbanBoardClient'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">カンバンボードを読み込んでいます...</div>
      </div>
    ),
  }
);

export default function KanbanBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-lg text-gray-900 dark:text-white">読み込み中...</div>
        </div>
      }
    >
      <KanbanBoardClient />
    </Suspense>
  );
}
