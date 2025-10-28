import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, activityLogs } from '@/db/schema';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// バリデーションスキーマ
const createTaskSchema = z.object({
  title: z.string().min(1, 'タスク名は必須です').max(200),
  description: z.string().nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  projectId: z.string().min(1, 'プロジェクトIDは必須です'),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

// POST /api/tasks - タスク作成
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
    const validatedData = createTaskSchema.parse(body);

    const [newTask] = await db
      .insert(tasks)
      .values({
        title: validatedData.title,
        description: validatedData.description || null,
        status: validatedData.status,
        priority: validatedData.priority,
        projectId: validatedData.projectId,
        assigneeId: validatedData.assigneeId || null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        createdBy: session.user.id,
      })
      .returning();

    // Record activity log for task creation
    await db.insert(activityLogs).values({
      taskId: newTask.id,
      userId: session.user.id,
      action: 'created',
      field: null,
      oldValue: null,
      newValue: null,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'タスクの作成に失敗しました' },
      { status: 500 }
    );
  }
}
