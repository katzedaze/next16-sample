import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { activityLogs, users } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

// GET /api/tasks/[id]/activity - タスクのアクティビティログ取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // Get activity logs with user information
    const logs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        field: activityLogs.field,
        oldValue: activityLogs.oldValue,
        newValue: activityLogs.newValue,
        createdAt: activityLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.taskId, taskId))
      .orderBy(desc(activityLogs.createdAt));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'アクティビティログの取得に失敗しました' },
      { status: 500 }
    );
  }
}
