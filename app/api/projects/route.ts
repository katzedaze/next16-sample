import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc, like, or } from 'drizzle-orm';
import { z } from 'zod';

// バリデーションスキーマ
const createProjectSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です').max(100),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '有効なカラーコードを入力してください').default('#3B82F6'),
});

// GET /api/projects - プロジェクト一覧取得
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

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let query = db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, session.user.id))
      .orderBy(desc(projects.updatedAt));

    // 検索機能
    if (search) {
      query = db
        .select()
        .from(projects)
        .where(
          or(
            like(projects.name, `%${search}%`),
            like(projects.description, `%${search}%`)
          )
        )
        .orderBy(desc(projects.updatedAt));
    }

    const allProjects = await query;

    return NextResponse.json(allProjects, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'プロジェクトの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST /api/projects - プロジェクト作成
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
    const validatedData = createProjectSchema.parse(body);

    const [newProject] = await db
      .insert(projects)
      .values({
        name: validatedData.name,
        description: validatedData.description || null,
        color: validatedData.color,
        ownerId: session.user.id,
      })
      .returning();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'プロジェクトの作成に失敗しました' },
      { status: 500 }
    );
  }
}
