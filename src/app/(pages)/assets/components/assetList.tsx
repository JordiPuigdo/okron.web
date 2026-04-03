'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgCreate, SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Asset, AssetType } from 'app/interfaces/Asset';
import { assetService } from 'app/services/assetService';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { cn } from 'lib/utils';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import AssetTypeBadge from './AssetTypeBadge';
import AssetTypeIcon from './AssetTypeIcon';

interface HighlightedTextProps {
  text: string;
  term: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, term }) => {
  if (!term) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 rounded-sm px-0.5">{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </span>
  );
};

interface DeleteModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isVisible, onConfirm, onCancel }) => {
  const { t } = useTranslations();
  return (
    <Modal2 isVisible={isVisible} setIsVisible={onCancel} type="center" width="w-96" closeOnEsc>
      <div className="p-6 flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('asset.delete.title')}</h3>
        <p className="text-gray-600 text-sm">{t('asset.delete.message')}</p>
        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('asset.delete.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            {t('asset.delete.confirm')}
          </button>
        </div>
      </div>
    </Modal2>
  );
};

interface AssetListItemProps {
  asset: Asset;
  onDelete: (id: string) => Promise<void>;
  searchTerm: string;
  expandedTargetId: string;
  depth?: number;
}

const AssetListItem: React.FC<AssetListItemProps> = ({
  asset,
  onDelete,
  searchTerm,
  expandedTargetId,
  depth = 0,
}) => {
  const { t } = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isHighlighted = asset.id === expandedTargetId;
  const hasChildren = asset.childs?.length > 0;

  useEffect(() => {
    if (!expandedTargetId) return;
    const hasDescendant = (a: Asset): boolean => {
      if (a.id === expandedTargetId) return true;
      return a.childs?.some(hasDescendant) ?? false;
    };
    if (hasDescendant(asset)) setExpanded(true);
  }, [expandedTargetId, asset]);

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    try {
      await onDelete(asset.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={cn('relative', depth > 0 && 'ml-6 border-l-2 border-gray-200')}>
      <div
        onClick={() => hasChildren && setExpanded(v => !v)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 bg-white rounded-lg border transition-all',
          isHighlighted
            ? 'border-blue-400 border-l-4 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          hasChildren && 'cursor-pointer'
        )}
      >
        <button
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          className={cn(
            'flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors',
            hasChildren ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200' : 'invisible'
          )}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-shrink-0">
          <AssetTypeIcon assetType={asset.assetType ?? AssetType.Default} size={22} />
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
          <span className="font-mono font-semibold text-sm text-gray-800">
            <HighlightedText text={asset.code} term={searchTerm} />
          </span>
          <span className="text-gray-400 text-sm">—</span>
          <span className="text-sm text-gray-700">
            <HighlightedText text={asset.description} term={searchTerm} />
          </span>
          {asset.brand && (
            <span className="text-xs text-gray-500 italic">{asset.brand}</span>
          )}
          <AssetTypeBadge assetType={asset.assetType ?? AssetType.Default} />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {asset.level < 7 && (
            <Link href={`/assets/0?parentId=${asset.id}&level=${asset.level + 1}`}>
              <button
                title={t('add.asset')}
                className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </Link>
          )}
          <Link href={`/assets/${asset.id}?search=${encodeURIComponent(searchTerm)}&id=${asset.id}`}>
            <button
              title={t('edit')}
              className="p-1.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Pencil size={16} />
            </button>
          </Link>
          <button
            title={t('delete')}
            disabled={isDeleting}
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            {isDeleting ? <SvgSpinner className="w-4 h-4" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="mt-1 flex flex-col gap-1">
          {asset.childs.map(child => (
            <AssetListItem
              key={child.id}
              asset={child}
              onDelete={onDelete}
              searchTerm={searchTerm}
              expandedTargetId={expandedTargetId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      <DeleteModal
        isVisible={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

const AssetListSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3 mt-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
    ))}
  </div>
);

const AssetList: React.FC = () => {
  const { t } = useTranslations();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get('search') ?? '';
  const expandedTargetId = searchParams.get('id') ?? '';

  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadAssets = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await assetService.getAll();
      setAssets(data);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await assetService.deleteAsset(id);
      setAssets(prev => removeAssetRecursive(prev, id));
    } catch {
      setDeleteError(t('error.deleting.asset'));
      setTimeout(() => setDeleteError(''), 3000);
    }
  };

  const removeAssetRecursive = (list: Asset[], id: string): Asset[] =>
    list
      .filter(a => a.id !== id)
      .map(a => ({ ...a, childs: removeAssetRecursive(a.childs ?? [], id) }));

  const filterAssetsRecursive = (list: Asset[], term: string): Asset[] =>
    list.reduce<Asset[]>((acc, asset) => {
      const matches =
        asset.code.toLowerCase().includes(term.toLowerCase()) ||
        asset.description.toLowerCase().includes(term.toLowerCase()) ||
        (asset.brand?.toLowerCase().includes(term.toLowerCase()) ?? false);
      const filteredChildren = filterAssetsRecursive(asset.childs ?? [], term);
      if (matches || filteredChildren.length > 0) {
        acc.push({ ...asset, childs: filteredChildren });
      }
      return acc;
    }, []);

  const displayed = searchTerm ? filterAssetsRecursive(assets, searchTerm) : assets;

  return (
    <div className="w-full mx-auto py-4">
      <div className="flex w-full mb-6">
        <div className="w-full flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-black flex gap-2 items-center">
            <SvgMachines />
            {t('assets.equipment')}
          </h2>
          <span className="text-gray-500 text-sm">
            {t('start')} - {t('assets.equipment.list')}
          </span>
        </div>
        <div className="flex justify-end items-center">
          <Link href="/assets/0" passHref>
            <Button className="py-4" customStyles="flex gap-2">
              <SvgCreate className="text-white" />
              {t('create.parent.equipment')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <input
          type="text"
          placeholder={t('search.by.code.description')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
        />
      </div>

      {isLoading && <AssetListSkeleton />}

      {!isLoading && loadError && (
        <div className="flex flex-col items-center gap-3 mt-8 text-gray-500">
          <p className="text-red-500">{t('asset.list.error')}</p>
          <button
            onClick={loadAssets}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('asset.list.retry')}
          </button>
        </div>
      )}

      {!isLoading && !loadError && displayed.length === 0 && (
        <div className="mt-8 text-center text-gray-400 text-sm">
          {t('asset.list.empty')}
        </div>
      )}

      {!isLoading && !loadError && displayed.length > 0 && (
        <ul className="flex flex-col gap-2">
          {displayed.map(asset => (
            <AssetListItem
              key={asset.id}
              asset={asset}
              onDelete={handleDelete}
              searchTerm={searchTerm}
              expandedTargetId={expandedTargetId}
            />
          ))}
        </ul>
      )}

      {deleteError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-md text-sm">
          {deleteError}
        </div>
      )}
    </div>
  );
};

export default AssetList;
