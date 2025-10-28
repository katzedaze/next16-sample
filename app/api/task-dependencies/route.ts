import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskDependencies, tasks } from '@/db/schema';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { eq, and, or } from 'drizzle-orm';

const createDependencySchema = z.object({
  taskId: z.string().min(1, 'タスクIDは必須です'),
  dependsOnTaskId: z.string().min(1, '依存先タスクIDは必須です'),
});

// 循環依存をチェックする関数
async function checkCircularDependency(
  taskId: string,
  dependsOnTaskId: string
): Promise<boolean> {
  // BFS（幅優先探索）で循環依存をチェック
  const visited = new Set<string>();
  const queue = [dependsOnTaskId];

  while (queue.length > 0) {
    const currentTaskId = queue.shift()!;

    if (currentTaskId === taskId) {
      return true; // 循環依存を検出
    }

    if (visited.has(currentTaskId)) {
      continue;
    }

    visited.add(currentTaskId);

    // このタスクが依存しているタスクを取得
    const dependencies = await db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.taskId, currentTaskId));

    for (const dep of dependencies) {
      queue.push(dep.dependsOnTaskId);
    }
  }

  return false; // 循環依存なし
}

// POST /api/task-dependencies - タスク依存関係追加
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createDependencySchema.parse(body);

    // 同じタスクへの自己依存をチェック
    if (validatedData.taskId === validatedData.dependsOnTaskId) {
      return NextResponse.json(
        { error: 'タスクは自分自身に依存できません' },
        { status: 400 }
      );
    }

    // タスクの存在確認
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, validatedData.taskId));

    const [dependsOnTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, validatedData.dependsOnTaskId));

    if (!task || !dependsOnTask) {
      return NextResponse.json(
        { error: '指定されたタスクが見つかりません' },
        { status: 404 }
      );
    }

    // 既存の依存関係をチェック
    const [existing] = await db
      .select()
      .from(taskDependencies)
      .where(
        and(
          eq(taskDependencies.taskId, validatedData.taskId),
          eq(taskDependencies.dependsOnTaskId, validatedData.dependsOnTaskId)
        )
      );

    if (existing) {
      return NextResponse.json(
        { error: 'この依存関係は既に存在します' },
        { status: 400 }
      );
    }

    // 循環依存をチェック
    const hasCircular = await checkCircularDependency(
      validatedData.taskId,
      validatedData.dependsOnTaskId
    );

    if (hasCircular) {
      return NextResponse.json(
        { error: '循環依存が検出されました。この依存関係は追加できません' },
        { status: 400 }
      );
    }

    const [newDependency] = await db
      .insert(taskDependencies)
      .values({
        taskId: validatedData.taskId,
        dependsOnTaskId: validatedData.dependsOnTaskId,
      })
      .returning();

    return NextResponse.json(newDependency, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating dependency:', error);
    return NextResponse.json(
      { error: '依存関係の作成に失敗しました' },
      { status: 500 }
    );
  }
}
