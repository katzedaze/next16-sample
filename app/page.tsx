import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            TaskFlowへようこそ
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl px-4">
            Next.js 16、React Aria、Drizzle
            ORMで構築されたモダンなタスク管理アプリケーション。
            <br />
            プロジェクトとタスクを簡単に管理できます。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <Button variant="primary" size="lg">
              今すぐ始める
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              ログイン
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              プロジェクト管理
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              作業をプロジェクトごとに整理し、進捗を効率的に追跡できます。
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              タスク管理
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              優先度や期限を設定して、タスクを作成・割り当て・管理できます。
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
              ビジュアルワークフロー
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              カンバンボードと依存関係グラフで視覚的に管理できます。
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
