import { useTranslations } from 'app/hooks/useTranslations';
import { SvgLockedIcon } from 'app/icons/designSystem/SvgLockedIcon';
import { SvgUser } from 'app/icons/designSystem/SvgUser';
import { SvgSpinner } from 'app/icons/icons';

interface AuthenticationProps {
  username: string;
  password: string;
  handleChangeUsername: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangePassword: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  handleLogin: () => void;
  errorMessage?: string;
  errorEmail?: string;
}

export const AuthenticationComponent: React.FC<AuthenticationProps> = ({
  username,
  password,
  handleChangeUsername,
  handleChangePassword,
  isLoading,
  handleLogin,
  errorMessage,
  errorEmail,
}) => {
  const { t } = useTranslations();
  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      onKeyDown={e => {
        if (e.key === 'Enter') {
          handleLogin();
        }
      }}
    >
      <div className="flex flex-col bg-white rounded-xl p-8 text-center shadow-xl overflow-hidden w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800">Okron</h1>
          <p className="text-sm text-gray-600">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Username input with icon */}
        <div className="relative mb-6">
          <SvgUser className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:border-indigo-500"
            onChange={handleChangeUsername}
            value={username}
            placeholder={t('username')}
            aria-label={t('username')}
          />
        </div>

        {/* Password input with icon */}
        <div className="relative mb-6">
          <SvgLockedIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            type="password"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:border-indigo-500"
            onChange={handleChangePassword}
            value={password}
            placeholder={t('password')}
            aria-label={t('password')}
          />
        </div>

        <button
          className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-600 hover:to-blue-400 text-white font-bold py-3 rounded-md shadow-md transition duration-300"
          onClick={handleLogin}
        >
          {isLoading ? (
            <SvgSpinner className="inline-block w-6 h-6 mr-3 animate-spin" />
          ) : null}
          {t('login')}
        </button>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};