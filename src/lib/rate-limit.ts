/**
 * シンプルなメモリベースのレート制限実装
 * 本番環境では Redis や他の永続化ストレージの使用を推奨
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

// 古いエントリーのクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // 1分ごとにクリーンアップ

export interface RateLimitConfig {
  /**
   * タイムウィンドウ（秒単位）
   */
  interval: number;
  /**
   * タイムウィンドウ内の最大リクエスト数
   */
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * レート制限をチェック
 * @param identifier - 識別子（通常はIPアドレスまたはユーザーID）
 * @param config - レート制限の設定
 * @returns レート制限の結果
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.interval * 1000;

  let record = store.get(identifier);

  // レコードが存在しない、または期限切れの場合は新規作成
  if (!record || record.resetTime < now) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(identifier, record);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: record.resetTime,
    };
  }

  // リクエスト数をインクリメント
  record.count++;

  // 制限を超えた場合
  if (record.count > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: record.resetTime,
  };
}

/**
 * IPアドレスを取得
 */
export function getClientIp(request: Request): string {
  // Next.jsの場合、x-forwarded-forヘッダーからIPを取得
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // フォールバック
  return 'unknown';
}
