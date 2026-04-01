'use client';

import { useEffect } from 'react';

interface PrintTriggerProps {
  documentTitle?: string;
}

export default function PrintTrigger({ documentTitle }: PrintTriggerProps) {
  useEffect(() => {
    if (documentTitle) document.title = documentTitle;
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, [documentTitle]);

  return null;
}
