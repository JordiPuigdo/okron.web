import { memo } from 'react';

const CRMStatusButton = memo(({ item, isCRM, showHasDeliveryNote }: any) => {
  if (!item || !isCRM) return null;
  const isInvoiced = item.isInvoiced;
  const hasDeliveryNote = item.hasDeliveryNote;
  return (
    <div className="flex justify-between items-center pr-3">
      <div className="flex flex-col gap-1.5">
        {showHasDeliveryNote && (
          <span
            title="Albaranada"
            className={hasDeliveryNote ? 'text-base' : 'text-base opacity-30'}
          >
            📦
          </span>
        )}
        <span
          title="Facturada"
          className={isInvoiced ? 'text-base' : 'text-base opacity-30'}
        >
          💰
        </span>
      </div>
    </div>
  );
});
CRMStatusButton.displayName = 'CRMStatusButton';
export default CRMStatusButton;
