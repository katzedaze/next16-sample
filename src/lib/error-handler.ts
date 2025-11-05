/**
 * 安全なエラーハンドリングユーティリティ
 * 本番環境では詳細なエラー情報を隠蔽し、開発環境では詳細を表示
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 安全なエラーレスポンスを生成
 */
export function createErrorResponse(error: unknown, statusCode: number = 500) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // AppErrorの場合
  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      ...(isDevelopment && {
        stack: error.stack,
        details: error,
      }),
    };
  }

  // 通常のErrorの場合
  if (error instanceof Error) {
    return {
      error: isDevelopment
        ? error.message
        : 'サーバーエラーが発生しました。後ほど再度お試しください。',
      statusCode,
      ...(isDevelopment && {
        stack: error.stack,
        name: error.name,
      }),
    };
  }

  // その他のエラー
  return {
    error: isDevelopment
      ? String(error)
      : 'サーバーエラーが発生しました。後ほど再度お試しください。',
    statusCode,
  };
}

/**
 * エラーをログに記録
 */
export function logError(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    // 本番環境では構造化ログを出力
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        context,
      })
    );
  } else {
    // 開発環境では詳細なエラーを出力
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }
}

/**
 * バリデーションエラーのフォーマット
 */
export function formatValidationErrors(errors: any[]): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const error of errors) {
    if (error.path && error.message) {
      const path = Array.isArray(error.path) ? error.path.join('.') : error.path;
      formatted[path] = error.message;
    }
  }

  return formatted;
}

/**
 * SQLエラーの安全な処理
 */
export function handleDatabaseError(error: unknown): AppError {
  if (error instanceof Error) {
    // SQLiteの制約違反
    if (error.message.includes('UNIQUE constraint failed')) {
      return new AppError('この値は既に使用されています', 409);
    }

    // 外部キー制約違反
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return new AppError('関連するデータが存在しません', 400);
    }

    // その他のDB エラー
    return new AppError(
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'データベースエラーが発生しました',
      500
    );
  }

  return new AppError('データベースエラーが発生しました', 500);
}
