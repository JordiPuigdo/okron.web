'use client';

import { useEffect, useState } from 'react';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import { useTranslations } from 'app/hooks/useTranslations';
import SparePart from 'app/interfaces/SparePart';
import { Modal2, ModalBackground } from 'designSystem/Modals/Modal';

interface SparePartDetailModalProps {
  sparePartId: string | null;
  isVisible: boolean;
  onClose: () => void;
}

interface SparePartInfoRowProps {
  label: string;
  value: string | number | undefined;
}

const SparePartInfoRow = ({ label, value }: SparePartInfoRowProps) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-900">{value ?? '-'}</span>
  </div>
);

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-4 first:mt-0">
    {title}
  </h3>
);

export default function SparePartDetailModal({
  sparePartId,
  isVisible,
  onClose,
}: SparePartDetailModalProps) {
  const { t } = useTranslations();
  const { getSparePartById } = useSparePartsHook();
  const [sparePart, setSparePart] = useState<SparePart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && sparePartId) {
      loadSparePartDetail();
    }
  }, [isVisible, sparePartId]);

  const loadSparePartDetail = async () => {
    if (!sparePartId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getSparePartById(sparePartId);
      setSparePart(data);
    } catch (err) {
      setError(t('spareParts.errorLoadingSparePart'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSparePart(null);
    setError(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      <Modal2
        isVisible={isVisible}
        setIsVisible={handleClose}
        type="center"
        width="w-full max-w-2xl"
        height="max-h-[85vh]"
        className="p-6 overflow-y-auto border border-gray-300 shadow-xl"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t('detail')}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('common.close')}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {sparePart && !loading && (
            <>
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <SparePartInfoRow
                  label={t('spareParts.code')}
                  value={sparePart.code}
                />
                <SparePartInfoRow
                  label={t('spareParts.description')}
                  value={sparePart.description}
                />
                <SparePartInfoRow
                  label={t('spareParts.family')}
                  value={sparePart.family}
                />
                <SparePartInfoRow label={t('brand')} value={sparePart.brand} />
                <SparePartInfoRow
                  label={t('spareParts.location')}
                  value={sparePart.ubication}
                />
              </div>

              {/* Stock Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <SparePartInfoRow
                  label={t('spareParts.stock')}
                  value={sparePart.stock}
                />
                <SparePartInfoRow
                  label={t('spareParts.minStock')}
                  value={sparePart.minium}
                />
                <SparePartInfoRow
                  label={t('spareParts.maxStock')}
                  value={sparePart.maximum}
                />
                <SparePartInfoRow
                  label={t('providers.price')}
                  value={`${sparePart.price} €`}
                />
              </div>

              {/* Providers */}
              {sparePart.providers && sparePart.providers.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <SectionHeader title={t('providers')} />
                  <div className="space-y-3">
                    {sparePart.providers.map((provider, index) => (
                      <div
                        key={index}
                        className={`p-3 bg-white rounded-md border ${
                          provider.isDefault
                            ? 'border-green-400'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">
                            {provider.provider?.name ?? t('providers.name')}
                          </span>
                          {provider.isDefault && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {t('providers.default')}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
                          <span>
                            {t('providers.reference')}:{' '}
                            {provider.refProvider || '-'}
                          </span>
                          <span>
                            {t('providers.price')}: {provider.price} €
                          </span>
                          <span>
                            {t('providers.discount.percentage')}:{' '}
                            {provider.discount}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warehouses */}
              {sparePart.warehouses && sparePart.warehouses.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <SectionHeader title={t('spareParts.selectWarehouse')} />
                  <div className="flex flex-wrap gap-2">
                    {sparePart.warehouses.map((warehouse, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white border border-orange-200 rounded-full text-sm text-gray-700"
                      >
                        {warehouse.warehouseName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </Modal2>
    </>
  );
}
