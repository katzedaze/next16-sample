interface ProgressChartProps {
  todoTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  doneTasks: number;
}

export default function ProgressChart({
  todoTasks,
  inProgressTasks,
  reviewTasks,
  doneTasks,
}: ProgressChartProps) {
  const totalTasks = todoTasks + inProgressTasks + reviewTasks + doneTasks;

  if (totalTasks === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">タスク進捗</h2>
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">タスクがありません</p>
        </div>
      </div>
    );
  }

  const todoPercent = (todoTasks / totalTasks) * 100;
  const inProgressPercent = (inProgressTasks / totalTasks) * 100;
  const reviewPercent = (reviewTasks / totalTasks) * 100;
  const donePercent = (doneTasks / totalTasks) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">タスク進捗</h2>

      <div className="flex items-center justify-center mb-6">
        {/* 円グラフ */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* 背景の円 */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="20"
            />

            {/* 完了（緑） */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10B981"
              strokeWidth="20"
              strokeDasharray={`${donePercent * 2.51} ${251 - donePercent * 2.51}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />

            {/* レビュー（黄） */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="20"
              strokeDasharray={`${reviewPercent * 2.51} ${251 - reviewPercent * 2.51}`}
              strokeDashoffset={`-${donePercent * 2.51}`}
              strokeLinecap="round"
            />

            {/* 進行中（青） */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="20"
              strokeDasharray={`${inProgressPercent * 2.51} ${251 - inProgressPercent * 2.51}`}
              strokeDashoffset={`-${(donePercent + reviewPercent) * 2.51}`}
              strokeLinecap="round"
            />

            {/* 未着手（グレー） */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#6B7280"
              strokeWidth="20"
              strokeDasharray={`${todoPercent * 2.51} ${251 - todoPercent * 2.51}`}
              strokeDashoffset={`-${(donePercent + reviewPercent + inProgressPercent) * 2.51}`}
              strokeLinecap="round"
            />
          </svg>

          {/* 中央のテキスト */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900">
              {Math.round((doneTasks / totalTasks) * 100)}%
            </div>
            <div className="text-sm text-gray-500">完了</div>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-600 mr-2"></div>
            <span className="text-sm text-gray-700">未着手</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {todoTasks} ({Math.round(todoPercent)}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-700">進行中</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {inProgressTasks} ({Math.round(inProgressPercent)}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-700">レビュー</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {reviewTasks} ({Math.round(reviewPercent)}%)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-700">完了</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {doneTasks} ({Math.round(donePercent)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
