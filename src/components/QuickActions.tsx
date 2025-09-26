import { useEffect, useRef, useState } from 'react';
import { SvgAdd } from 'app/icons/designSystem/SvgAdd';
import { SvgSpinner } from 'app/icons/icons';
import useRoutes from 'app/utils/useRoutes';
import Link from 'next/link';

import { useTranslations } from '../app/hooks/useTranslations';

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const ROUTES = useRoutes();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslations();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-okron-main/50 text-black px-4 py-2 rounded-lg transition"
      >
        <SvgAdd className="font-semibold" />
      </button>

      {open && (
        <div
          className="absolute z-10 mt-2 w-52 border bg-white border-gray-200  rounded-lg text-okron-main shadow-lg p-2  hover:cursor-pointer hover:bg-okron-main hover:text-white"
          onClick={() => setIsLoading(true)}
        >
          <Link
            href={ROUTES.orders.orderPurchase}
            className="flex w-full items-center justify-between "
          >
            <p>➕ {t('create.order')}</p>
            {isLoading && <SvgSpinner className="w-6 h-6 " />}
          </Link>
        </div>
      )}
    </div>
  );
}
