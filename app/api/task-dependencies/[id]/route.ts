import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// DELETE /api/task-dependencies/[id] - タスク依存関係削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const [existing] = await db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: '依存関係が見つかりません' },
        { status: 404 }
      );
    }

    await db
      .delete(taskDependencies)
      .where(eq(taskDependencies.id, id));

    return NextResponse.json(
      { message: '依存関係を削除しました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting dependency:', error);
    return NextResponse.json(
      { error: '依存関係の削除に失敗しました' },
      { status: 500 }
    );
  }
}
