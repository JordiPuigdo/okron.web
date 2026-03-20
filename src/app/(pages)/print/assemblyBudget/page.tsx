import { getBudget, getConfig } from 'app/lib/api';

import { AssemblyBudgetPrintClient } from './components/AssemblyBudgetPrintClient';

export const dynamic = 'force-dynamic';

interface AssemblyBudgetPrintPageProps {
  searchParams: { id: string };
}

export default async function AssemblyBudgetPrintPage({
  searchParams,
}: AssemblyBudgetPrintPageProps) {
  const { id } = searchParams;

  if (!id) {
    return <div className="p-4 text-red-500">Missing budget ID</div>;
  }

  try {
    const [budget, config] = await Promise.all([getBudget(id), getConfig()]);

    if (!budget || !config) {
      return <div className="p-4 text-red-500">Failed to load data</div>;
    }

    return (
      <AssemblyBudgetPrintClient
        budget={budget}
        config={config}
      />
    );
  } catch {
    return <div className="p-4 text-red-500">Failed to load data</div>;
  }
}
