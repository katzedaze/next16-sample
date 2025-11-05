'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ReactFlowとdagreを動的インポート（重いライブラリなので遅延読み込み）
const DependencyGraphClient = dynamic(
  () => import('./DependencyGraphClient'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">依存関係グラフを読み込んでいます...</div>
      </div>
    ),
  }
);

export default function DependencyGraphPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-lg text-gray-900 dark:text-white">読み込み中...</div>
        </div>
      }
    >
      <DependencyGraphClient />
    </Suspense>
  );
}
