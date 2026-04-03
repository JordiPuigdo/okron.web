import { AssetType } from 'app/interfaces/Asset';
import { Box, Cog, Cpu, Factory, GitBranch, LayoutGrid, Truck, Zap } from 'lucide-react';

interface AssetTypeIconProps {
  assetType: AssetType;
  size?: number;
}

const ICON_MAP: Record<AssetType, { icon: React.ElementType; className: string }> = {
  [AssetType.Default]: { icon: Box, className: 'text-gray-500' },
  [AssetType.Factory]: { icon: Factory, className: 'text-slate-600' },
  [AssetType.Area]: { icon: LayoutGrid, className: 'text-indigo-600' },
  [AssetType.Line]: { icon: GitBranch, className: 'text-violet-600' },
  [AssetType.Machine]: { icon: Cog, className: 'text-blue-600' },
  [AssetType.Component]: { icon: Cpu, className: 'text-cyan-600' },
  [AssetType.Vehicle]: { icon: Truck, className: 'text-amber-600' },
  [AssetType.System]: { icon: Zap, className: 'text-orange-600' },
};

const AssetTypeIcon: React.FC<AssetTypeIconProps> = ({ assetType, size = 20 }) => {
  const { icon: Icon, className } = ICON_MAP[assetType] ?? ICON_MAP[AssetType.Default];
  return <Icon size={size} className={className} />;
};

export default AssetTypeIcon;
