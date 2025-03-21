'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useSessionStore } from 'app/stores/globalStore';
import { useToken } from 'app/utils/token';
import useRoutes from 'app/utils/useRoutes';
import { useRouter } from 'next/navigation';

interface LoginCheckerProps {
  children: ReactNode;
  isLoginPage?: boolean;
}

const LoginChecker: React.FC<LoginCheckerProps> = ({
  children,
  isLoginPage = false,
}) => {
  const router = useRouter();
  const ROUTES = useRoutes();
  const [isLoaded, setIsLoaded] = useState(false);
  const { isValidToken, clearUserLoginResponse } = useToken();
  const { loginUser } = useSessionStore(state => state);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    function validate() {
      if (!isValidToken()) {
        clearUserLoginResponse();
        if (!isLoginPage) {
          router.push(ROUTES.home);
          return;
        }
      } else {
        if (isLoginPage) {
          router.push(ROUTES.menu);
          return;
        }
      }
    }
    setIsLoaded(true);

    const loginTimer = setTimeout(() => {
      if (loginUser !== undefined || loginAttempts > 1) {
        validate();
      } else {
        setLoginAttempts(loginAttempts + 1);
      }
    }, 150);
    return () => clearTimeout(loginTimer);
  }, [loginUser, loginAttempts]);

  if (isLoaded) return <>{children}</>;
  return <></>;
};

export default LoginChecker;
