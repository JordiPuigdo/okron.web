import { getClientConfig } from 'config';

export const useApiClient = () => {
  const getBaseUrl = () => {
    /*if (typeof window === 'undefined') {
      console.warn(
        'getBaseUrl called on server side, using environment variable'
      );
      return process.env.NEXT_PUBLIC_API_BASE_URL;
    }*/
    return getClientConfig(window.location.hostname).apiBaseUrl;
  };

  return {
    getBaseUrl,
  };
};
