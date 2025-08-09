'use client';

import { useEffect } from 'react';
import { useSessionStore } from 'app/stores/globalStore';

export default function FaviconUpdater() {
  const { config } = useSessionStore(state => state);

  useEffect(() => {
    if (typeof document !== 'undefined' && config?.company?.urlLogo) {
      const link =
        document.querySelector<HTMLLinkElement>("link[rel*='icon']") ||
        document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = config.company.urlLogo;
      document.head.appendChild(link);
    }
  }, [config?.company?.urlLogo]);

  return null;
}
