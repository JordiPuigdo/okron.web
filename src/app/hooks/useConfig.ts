import { useEffect, useState } from 'react';
import Company from 'app/interfaces/Company';
import ConfigService from 'app/services/configService';
import { useSessionStore } from 'app/stores/globalStore';

export const useConfig = () => {
  const configService = new ConfigService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );

  const [success, setSuccess] = useState<boolean | undefined>(undefined);

  const { setConfig, config } = useSessionStore(state => ({
    setConfig: state.setConfig,
    config: state.config,
  }));

  const refreshConfig = async (refresh = false) => {
    const newConfig = await configService.get(refresh);

    setConfig(newConfig);
    return newConfig;
  };

  useEffect(() => {
    if (!config) {
      refreshConfig();
    }
  }, [config, setConfig]);

  async function updateCompany(company: Company) {
    try {
      await configService.UpdateCompany(company);
      setSuccess(true);
      refreshSuccess();
    } catch (error) {
      console.error('Error updating company:', error);
      setSuccess(false);
      refreshSuccess();
    }
    refreshConfig(true);
  }

  function refreshSuccess() {
    setTimeout(() => {
      setSuccess(undefined);
    }, 3000);
  }

  async function getCompany() {
    const company = await configService.getCompany();
    setConfig(company);
  }

  return { config, updateCompany, getCompany, success };
};
