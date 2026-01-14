import { Budget } from 'app/interfaces/Budget';
import { SystemConfiguration } from 'app/interfaces/Config';
import { getBudget, getConfig } from 'app/lib/api';

import { AutoPrint } from '../workorder/components/AutoPrint';
import { BudgetBody } from './components/BudgetBody';
import { BudgetFooter } from './components/BudgetFooter';
import { BudgetHeader } from './components/BudgetHeader';

interface BudgetPageProps {
  searchParams: { id: string };
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const { id } = searchParams;

  if (!id) {
    return <div className="p-4 text-red-500">Missing budget ID</div>;
  }

  let budget: Budget;
  let config: SystemConfiguration;

  try {
    [budget, config] = await Promise.all([getBudget(id), getConfig()]);
  } catch (error) {
    console.error(error);
    return <div className="p-4 text-red-500">Failed to load data</div>;
  }

  if (!budget || !config) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="px-4 w-full flex-grow text-sm flex flex-col">
      <AutoPrint enabled={!!budget && !!config} />
      <div className="flex flex-col flex-grow p-4 bg-white">
        <BudgetHeader budget={budget} config={config} />
        <BudgetBody budget={budget} />
        <BudgetFooter budget={budget} />
      </div>
    </div>
  );
}
