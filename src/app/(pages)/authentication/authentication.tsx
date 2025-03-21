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

const AuthenticationComponent: React.FC<AuthenticationProps> = ({
  username,
  password,
  handleChangeUsername,
  handleChangePassword,
  isLoading,
  handleLogin,
  errorMessage,
  errorEmail,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 ">
      <div className="flex flex-col bg-white rounded-xl p-8 text-center shadow-xl overflow-hidden">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800">Okron</h1>
          <p className="text-sm text-gray-600">
            Software de gestió de recanvis i manteniment.
          </p>
        </div>
        <div className="relative mb-6">
          <input
            type="text"
            className="w-full mt-2 py-3 px-4 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:border-indigo-500"
            placeholder="Usuari"
            onChange={handleChangeUsername}
            value={username}
          />
        </div>
        <div className="relative mb-6">
          <input
            type="password"
            className="w-full mt-2 py-3 px-4 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:border-indigo-500"
            placeholder="Contrasenya"
            onChange={handleChangePassword}
            value={password}
          />
        </div>
        <button
          className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-600 hover:to-blue-400 text-white font-bold py-3 rounded-md shadow-md transition duration-300"
          onClick={handleLogin}
        >
          {isLoading ? (
            <SvgSpinner className="inline-block w-6 h-6 mr-3 animate-spin" />
          ) : null}
          Entrar
        </button>
        {errorMessage && (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default AuthenticationComponent;
