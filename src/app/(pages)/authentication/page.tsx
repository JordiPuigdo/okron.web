'use client';
import { useState } from 'react';
import { User } from 'app/interfaces/User';
import AuthenticationService from 'app/services/authentication';
import { useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';
import { useRouter } from 'next/navigation';

import AuthenticationComponent from './authentication';

export default function AuthenticationPage() {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const ROUTES = useRoutes();
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [errorEmail, setErrorEmail] = useState<string | undefined>('');
  const { setLoginUser } = useSessionStore(state => state);

  const authService = new AuthenticationService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const handleUserNameChange = (event: any) => {
    const userValue = event.target.value.trim();
    setUserName(userValue);
  };
  const handleChangePassword = (event: any) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    setIsLoading(true);

    const userLogin: User = {
      username: username,
      password: password,
    };

    await authService
      .Login(userLogin.username, userLogin.password)
      .then(async (data: any) => {
        if (data.agentId != null) {
          setLoginUser(data);
          router.push(ROUTES.menu);
        } else {
          handleErrorMessage('Login Incorrecte');
        }
      })
      .catch((err: any) => {
        handleErrorMessage('Login Incorrecte');
      });
  };

  function handleErrorMessage(error: string): void {
    setIsLoading(false);
    setErrorMessage(error);
    setTimeout(() => {
      setErrorMessage(undefined);
    }, 3000);
    setUserName('');
    setPassword('');
  }

  return (
    <>
      <AuthenticationComponent
        username={username}
        password={password}
        handleChangeUsername={handleUserNameChange}
        handleChangePassword={handleChangePassword}
        isLoading={isLoading}
        handleLogin={handleLogin}
        errorMessage={errorMessage}
        errorEmail={errorEmail}
      />
    </>
  );
}
