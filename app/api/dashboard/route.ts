import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, projects, activityLogs, users } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

// GET /api/dashboard - ダッシュボード情報取得
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

    // ユーザーが関わっているプロジェクトを取得
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, userId));

    const projectIds = userProjects.map(p => p.id);

    // 統計情報を計算
    let allTasks: typeof tasks.$inferSelect[] = [];
    if (projectIds.length > 0) {
      allTasks = await db
        .select()
        .from(tasks)
        .where(sql`${tasks.projectId} IN ${projectIds}`);
    }

    const stats = {
      totalProjects: userProjects.length,
      totalTasks: allTasks.length,
      todoTasks: allTasks.filter(t => t.status === 'todo').length,
      inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
      reviewTasks: allTasks.filter(t => t.status === 'review').length,
      doneTasks: allTasks.filter(t => t.status === 'done').length,
      myTasks: allTasks.filter(t => t.assigneeId === userId).length,
    };

    // 今日の期限タスク
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueTodayTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });

    // 今週の期限タスク
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const dueThisWeekTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= today && dueDate < weekEnd;
    });

    // 最近のタスク（作成日順）
    const recentTasks = allTasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(task => ({
        ...task,
        project: userProjects.find(p => p.id === task.projectId),
      }));

    // 最近のアクティビティ
    let recentActivities: any[] = [];
    if (projectIds.length > 0) {
      const taskIds = allTasks.map(t => t.id);
      if (taskIds.length > 0) {
        recentActivities = await db
          .select({
            id: activityLogs.id,
            action: activityLogs.action,
            field: activityLogs.field,
            oldValue: activityLogs.oldValue,
            newValue: activityLogs.newValue,
            createdAt: activityLogs.createdAt,
            taskId: activityLogs.taskId,
            userName: users.name,
            userEmail: users.email,
          })
          .from(activityLogs)
          .leftJoin(users, eq(activityLogs.userId, users.id))
          .where(sql`${activityLogs.taskId} IN ${taskIds}`)
          .orderBy(desc(activityLogs.createdAt))
          .limit(10);

        // タスク情報を追加
        recentActivities = recentActivities.map(activity => ({
          ...activity,
          task: allTasks.find(t => t.id === activity.taskId),
        }));
      }
    }

    return NextResponse.json({
      stats,
      dueTodayTasks,
      dueThisWeekTasks,
      recentTasks,
      recentActivities,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'ダッシュボード情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
