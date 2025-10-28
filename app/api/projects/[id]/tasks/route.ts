import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, like, or, desc, sql } from 'drizzle-orm';

// GET /api/projects/[id]/tasks - プロジェクトのタスク一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where conditions
    const whereConditions: any[] = [eq(tasks.projectId, projectId)];

    if (search) {
      whereConditions.push(like(tasks.title, `%${search}%`));
    }

    if (status) {
      whereConditions.push(eq(tasks.status, status));
    }

    if (priority) {
      whereConditions.push(eq(tasks.priority, priority));
    }

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(...whereConditions));

    const totalCount = Number(countResult[0]?.count) || 0;

    // Apply pagination
    const offset = (page - 1) * limit;
    const allTasks = await db
      .select()
      .from(tasks)
      .where(and(...whereConditions))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      tasks: allTasks,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'タスクの取得に失敗しました' },
      { status: 500 }
    );
  }
}
