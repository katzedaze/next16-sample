import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications, tasks, projects } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

// GET /api/notifications - 通知一覧取得
export async function GET(request: NextRequest) {
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

    const userId = session.user.id;

    // 通知を取得（タスクとプロジェクト情報も含める）
    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        taskId: notifications.taskId,
        taskTitle: tasks.title,
        projectId: notifications.projectId,
        projectName: projects.name,
      })
      .from(notifications)
      .leftJoin(tasks, eq(notifications.taskId, tasks.id))
      .leftJoin(projects, eq(notifications.projectId, projects.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: '通知の取得に失敗しました' },
      { status: 500 }
    );
  }
}
