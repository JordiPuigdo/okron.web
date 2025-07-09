import { useEffect } from 'react';
import ConfigService from 'app/services/configService';
import { useSessionStore } from 'app/stores/globalStore';

export const useConfig = () => {
  const configService = new ConfigService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const { setConfig, config } = useSessionStore(state => ({
    setConfig: state.setConfig,
    config: state.config,
  }));

  const refreshConfig = async () => {
    const newConfig = await configService.get();

    setConfig(newConfig);
    return newConfig;
  };

  useEffect(() => {
    if (!config) {
      refreshConfig();
    }
  }, [config, setConfig]);

  return { config };
};
