import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// GET /api/tasks/[id]/dependencies - タスクの依存関係取得
export async function GET(
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

    const dependencies = await db
      .select()
      .from(taskDependencies)
      .where(eq(taskDependencies.taskId, id));

    return NextResponse.json(dependencies);
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    return NextResponse.json(
      { error: '依存関係の取得に失敗しました' },
      { status: 500 }
    );
  }
}
