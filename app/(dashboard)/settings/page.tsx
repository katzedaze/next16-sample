'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession, signOut } from '@/lib/auth-client';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

const profileSchema = z.object({
  name: z.string().min(2, '名前は2文字以上である必要があります'),
  email: z.string().email('有効なメールアドレスを入力してください'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'パスワードは8文字以上である必要があります'),
    newPassword: z
      .string()
      .min(8, 'パスワードは8文字以上である必要があります')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'パスワードは大文字、小文字、数字を含む必要があります'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // セッションからユーザー情報を読み込み
  useEffect(() => {
    if (session?.user) {
      resetProfile({
        name: session.user.name || '',
        email: session.user.email || '',
      });
    }
  }, [session, resetProfile]);

  // 未認証の場合はログインページにリダイレクト
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [isPending, session, router]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setIsLoadingProfile(true);
      setProfileMessage(null);

      // TODO: プロフィール更新APIの実装
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   throw new Error('プロフィールの更新に失敗しました');
      // }

      setProfileMessage({
        type: 'success',
        text: 'プロフィールを更新しました',
      });

      // 一時的な実装（APIが実装されるまで）
      console.log('Profile update:', data);
      setProfileMessage({
        type: 'error',
        text: 'プロフィール更新APIは未実装です（Phase 2完了後に実装予定）',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileMessage({
        type: 'error',
        text: 'プロフィールの更新に失敗しました',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      setIsLoadingPassword(true);
      setPasswordMessage(null);

      // TODO: パスワード変更APIの実装
      // const response = await fetch('/api/user/password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: data.currentPassword,
      //     newPassword: data.newPassword,
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error('パスワードの変更に失敗しました');
      // }

      setPasswordMessage({
        type: 'success',
        text: 'パスワードを変更しました',
      });
      resetPassword();

      // 一時的な実装（APIが実装されるまで）
      console.log('Password change:', { currentPassword: data.currentPassword });
      setPasswordMessage({
        type: 'error',
        text: 'パスワード変更APIは未実装です（Phase 2完了後に実装予定）',
      });
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordMessage({
        type: 'error',
        text: 'パスワードの変更に失敗しました',
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <DashboardHeader userName={session.user?.name} />

      <div className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">設定</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              アカウント情報とセキュリティ設定を管理します
            </p>
          </div>

          {/* プロフィール設定 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              プロフィール情報
            </h2>

            {profileMessage && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  profileMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}
              >
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  名前
                </label>
                <input
                  {...registerProfile('name')}
                  type="text"
                  id="name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white dark:bg-gray-700 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  メールアドレス
                </label>
                <input
                  {...registerProfile('email')}
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white dark:bg-gray-700 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoadingProfile}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoadingProfile ? '更新中...' : 'プロフィールを更新'}
              </button>
            </form>
          </div>

          {/* パスワード変更 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              パスワード変更
            </h2>

            {passwordMessage && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  現在のパスワード
                </label>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  id="currentPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white dark:bg-gray-700 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  新しいパスワード
                </label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  id="newPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white dark:bg-gray-700 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  新しいパスワード（確認）
                </label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  id="confirmPassword"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white dark:bg-gray-700 font-medium placeholder-gray-400 dark:placeholder-gray-500"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoadingPassword}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoadingPassword ? '変更中...' : 'パスワードを変更'}
              </button>
            </form>
          </div>

          {/* アカウント管理 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              アカウント管理
            </h2>

            <div className="space-y-4">
              <div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ログアウト
                </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  アカウント削除
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
                </p>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'アカウントを削除してもよろしいですか？この操作は取り消せません。'
                      )
                    ) {
                      // TODO: アカウント削除APIの実装
                      alert('アカウント削除APIは未実装です（Phase 2完了後に実装予定）');
                    }
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  アカウントを削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
