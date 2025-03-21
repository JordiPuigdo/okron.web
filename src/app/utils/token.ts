import { useSessionStore } from 'app/stores/globalStore';

export const useToken = () => {
  const { setLoginUser, loginUser } = useSessionStore(state => state);

  const isValidToken = () => loginUser && !isTokenExpired();

  const isTokenExpired = () => {
    if (!loginUser) return true;
    const refreshTokenExpiryTimestamp = getRefreshTokenExpiryTimestamp();
    const currentTimestamp = Date.now();
    return refreshTokenExpiryTimestamp <= currentTimestamp;
  };

  const getRefreshTokenExpiryTimestamp = () =>
    new Date(loginUser!.refreshTokenExpiryTime).getTime();

  const clearUserLoginResponse = () => setLoginUser(undefined);

  return {
    isValidToken,
    isTokenExpired,
    getRefreshTokenExpiryTimestamp,
    clearUserLoginResponse,
  };
};
