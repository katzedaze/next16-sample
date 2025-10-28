# TaskFlow

Next.js 16、React 19、Drizzle ORMで構築されたモダンなタスク管理アプリケーション。
プロジェクトとタスクを簡単に管理でき、チームでのコラボレーションをサポートします。

## 主な機能

### プロジェクト管理

- プロジェクトの作成・編集・削除
- カラーコーディングによる視覚的な管理
- リッチテキストエディタによる詳細な説明

### タスク管理

- タスクの作成・編集・削除・ステータス管理
- 優先度設定（低・中・高・緊急）
- 担当者の割り当て
- 期限日の設定
- リッチテキストエディタによる詳細な説明

### カンバンボード

- ドラッグ&ドロップによる直感的なタスク管理
- ステータス別のタスク表示（TODO、進行中、レビュー、完了）
- リアルタイムでのステータス更新

### 依存関係グラフ

- タスク間の依存関係を視覚的に表示
- Mermaidライブラリによる依存関係図の自動生成
- インタラクティブなグラフビュー

### その他の機能

- ダークモード対応
- 通知機能
- ダッシュボードでのプロジェクト・タスクの概要表示
- アクティビティログによる変更履歴の追跡
- レスポンシブデザイン

## 技術スタック

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI**: [React 19](https://react.dev/)
- **認証**: [Better Auth](https://www.better-auth.com/)
- **データベース**: [LibSQL](https://github.com/tursodatabase/libsql) (Turso) / SQLite
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/)
- **リッチテキストエディタ**: [Lexical](https://lexical.dev/)
- **ドラッグ&ドロップ**: [dnd-kit](https://dndkit.com/)
- **フロー図**: [React Flow](https://reactflow.dev/) + [Dagre](https://github.com/dagrejs/dagre)
- **フォーム管理**: [React Hook Form](https://react-hook-form.com/)
- **バリデーション**: [Zod](https://zod.dev/)

## セットアップ

### 前提条件

- Node.js 20以上
- npm / yarn / pnpm / bunのいずれか

### インストール

1. リポジトリをクローン:

```bash
git clone <repository-url>
cd next16-sample
```

2. 依存関係をインストール:

```bash
npm install
# または
yarn install
# または
pnpm install
```

3. 環境変数を設定:

`.env.example`をコピーして`.env.local`を作成し、必要な値を設定します:

```bash
cp .env.example .env.local
```

`.env.local`の内容:

```env
# Database
DATABASE_URL="file:./local.db"  # ローカル開発の場合

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32 で生成
BETTER_AUTH_URL="http://localhost:3000"

# App Settings
NODE_ENV="development"
```

4. データベースのセットアップ:

```bash
# スキーマをデータベースに直接プッシュ（開発環境向け）
npx drizzle-kit push

# または、マイグレーションファイルを生成してから適用
npx drizzle-kit generate
npx drizzle-kit migrate
```

5. 開発サーバーを起動:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスしてアプリケーションを確認できます。

## スクリプト

```bash
# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバーの起動
npm start

# Lintの実行
npm run lint
```

## データベースコマンド（Drizzle Kit）

```bash
# マイグレーションファイルの生成
npx drizzle-kit generate

# マイグレーションの適用
npx drizzle-kit migrate

# スキーマを直接プッシュ（開発環境向け）
npx drizzle-kit push

# Drizzle Studio（データベースビューアー）の起動
npx drizzle-kit studio
```

## プロジェクト構成

```text
.
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # 認証が必要なページ
│   ├── api/               # APIルート
│   └── (auth)/            # 認証関連ページ
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── dashboard/    # ダッシュボードコンポーネント
│   │   ├── editor/       # リッチテキストエディタ
│   │   ├── kanban/       # カンバンボード
│   │   ├── layout/       # レイアウトコンポーネント
│   │   ├── projects/     # プロジェクト関連
│   │   └── tasks/        # タスク関連
│   ├── db/               # データベース設定とスキーマ
│   └── lib/              # ユーティリティ関数
├── docs/                  # ドキュメント
└── public/               # 静的ファイル
```

## データベーススキーマ

主要なテーブル:

- **users**: ユーザー情報
- **sessions**: セッション管理
- **accounts**: 外部アカウント連携
- **projects**: プロジェクト情報
- **tasks**: タスク情報
- **taskDependencies**: タスク間の依存関係
- **activityLogs**: アクティビティログ
- **notifications**: 通知

## デプロイ

### Vercel

Next.jsアプリケーションの最も簡単なデプロイ方法は[Vercel Platform](https://vercel.com/new)を使用することです。

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. デプロイ

詳細は[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。

## 参考リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lexical Documentation](https://lexical.dev/docs/intro)
- [React Flow Documentation](https://reactflow.dev/learn)
- [React Aria Documentation](https://react-spectrum.adobe.com/react-aria/)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [Zod Documentation](https://zod.dev/)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [Dagre Documentation](https://github.com/dagrejs/dagre/wiki)
