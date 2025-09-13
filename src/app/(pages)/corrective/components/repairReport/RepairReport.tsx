import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderForm } from 'components/layout/HeaderForm';

import { RepairReportForm } from './RepairReportForm';

export default function RepairReportPage() {
  const { t } = useTranslations();
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 ">
          <HeaderForm header={t('incident.management')} isCreate={false} />
        </div>
        <RepairReportForm />
      </div>
    </div>
  );
}
