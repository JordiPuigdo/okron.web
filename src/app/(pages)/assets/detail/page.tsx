import { UserType } from 'app/interfaces/User';

import AssetHeader from './components/AssetHeaderComponent';
import WorkOrderContainer from './components/WorkOrderAssetContainer';

export default function AssetDetailsQRPage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const id = searchParams.id;
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 10);
  const userType = UserType.Maintenance;
  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabecera - fondo azul claro */}
      <AssetHeader assetId={id} />

      {/* Contenido principal - fondo gris claro */}
      <main className="flex-grow bg-gray-50 p-4">
        <div className="max-w-md mx-auto gap-8 flex flex-col">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-2">
              <WorkOrderContainer
                assetId={id}
                operatorId={''}
                startDate={lastMonth}
                endDate={today}
                userType={userType}
                searchPreventive
              />
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página opcional */}
      <footer className="bg-blue-50 p-3 border-t">
        <div className="max-w-md mx-auto text-center text-xs text-gray-500">
          Escaneado el {new Date().toLocaleDateString()}
        </div>
      </footer>
    </div>
  );
}
