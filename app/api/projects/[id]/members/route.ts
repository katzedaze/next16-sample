import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, users } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// GET /api/projects/[id]/members - プロジェクトメンバー取得
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

    // プロジェクトの所有者を取得
    const [project] = await db
      .select({
        ownerId: projects.ownerId,
      })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project) {
      return NextResponse.json(
        { error: 'プロジェクトが見つかりません' },
        { status: 404 }
      );
    }

    // 現時点では所有者のみをメンバーとして返す
    // 将来的にはproject_membersテーブルからメンバーを取得
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, project.ownerId));

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      { error: 'メンバーの取得に失敗しました' },
      { status: 500 }
    );
  }
}
