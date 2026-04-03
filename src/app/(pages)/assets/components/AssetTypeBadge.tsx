import { AssetType } from 'app/interfaces/Asset';
import { useTranslations } from 'app/hooks/useTranslations';

interface AssetTypeBadgeProps {
  assetType: AssetType;
}

const BADGE_COLORS: Record<AssetType, string> = {
  [AssetType.Default]: 'bg-gray-100 text-gray-700',
  [AssetType.Factory]: 'bg-slate-100 text-slate-700',
  [AssetType.Area]: 'bg-indigo-100 text-indigo-700',
  [AssetType.Line]: 'bg-violet-100 text-violet-700',
  [AssetType.Machine]: 'bg-blue-100 text-blue-700',
  [AssetType.Component]: 'bg-cyan-100 text-cyan-700',
  [AssetType.Vehicle]: 'bg-amber-100 text-amber-700',
  [AssetType.System]: 'bg-orange-100 text-orange-700',
};

const TYPE_KEYS: Record<AssetType, string> = {
  [AssetType.Default]: 'asset.type.default',
  [AssetType.Factory]: 'asset.type.factory',
  [AssetType.Area]: 'asset.type.area',
  [AssetType.Line]: 'asset.type.line',
  [AssetType.Machine]: 'asset.type.machine',
  [AssetType.Component]: 'asset.type.component',
  [AssetType.Vehicle]: 'asset.type.vehicle',
  [AssetType.System]: 'asset.type.system',
};

const AssetTypeBadge: React.FC<AssetTypeBadgeProps> = ({ assetType }) => {
  const { t } = useTranslations();
  const colorClass = BADGE_COLORS[assetType] ?? BADGE_COLORS[AssetType.Default];
  const label = t(TYPE_KEYS[assetType] ?? TYPE_KEYS[AssetType.Default]);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
};

export default AssetTypeBadge;
