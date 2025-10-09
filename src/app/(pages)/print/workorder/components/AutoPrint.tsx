'use client';

import { useEffect } from 'react';

export function AutoPrint({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return null;
}
