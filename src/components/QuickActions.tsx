import { useEffect, useRef, useState } from 'react';
import { SvgAdd } from 'app/icons/designSystem/SvgAdd';
import { SvgAvarie, SvgOrder } from 'app/icons/icons';
import useRoutes from 'app/utils/useRoutes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useTranslations } from '../app/hooks/useTranslations';
import { CorrectiveFormModal } from '../app/(pages)/corrective/components/CorrectiveFormModal';

interface QuickAction {
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const [showCorrectiveModal, setShowCorrectiveModal] = useState(false);
  const ROUTES = useRoutes();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslations();

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

  const quickActions: QuickAction[] = [
    {
      label: t('create.corrective'),
      icon: <SvgAvarie className="w-5 h-5" />,
      onClick: () => {
        setOpen(false);
        setShowCorrectiveModal(true);
      },
    },
    {
      label: t('create.order'),
      href: ROUTES.orders.orderPurchase,
      icon: <SvgOrder className="w-5 h-5" />,
    },
  ];

  function handleActionClick(action: QuickAction) {
    if (action.onClick) {
      action.onClick();
    } else {
      setOpen(false);
    }
  }

  const handleCorrectiveSuccess = (workOrderId?: string) => {
    setShowCorrectiveModal(false);
    if (workOrderId) {
      router.push(`${ROUTES.workOrders}/${workOrderId}`);
    } else {
      window.location.reload();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          open
            ? 'bg-okron-main text-white shadow-md'
            : 'bg-white text-okron-main hover:bg-okron-main/10 border border-gray-200'
        }`}
        aria-label={t('create.order')}
      >
        <SvgAdd className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
          <div className="py-2">
            {quickActions.map((action, index) => (
              action.href ? (
                <Link
                  key={index}
                  href={action.href}
                  onClick={() => handleActionClick(action)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-okron-main/10 transition-colors duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-center text-okron-main group-hover:scale-110 transition-transform duration-150">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-okron-main/10 transition-colors duration-150 cursor-pointer group"
                >
                  <div className="flex items-center justify-center text-okron-main group-hover:scale-110 transition-transform duration-150">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      )}

      <CorrectiveFormModal
        isVisible={showCorrectiveModal}
        onSuccess={handleCorrectiveSuccess}
        onCancel={() => setShowCorrectiveModal(false)}
      />
    </div>
  );
}
