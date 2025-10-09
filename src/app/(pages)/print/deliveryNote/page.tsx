import { SystemConfiguration } from 'app/interfaces/Config';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import { getConfig, getDeliveryNote } from 'app/lib/api';

import { AutoPrint } from '../workorder/components/AutoPrint';
import { DeliveryNoteBody } from './components/DeliveryNoteBody';
import { DeliveryNoteFooter } from './components/DeliveryNoteFooter';
import { DeliveryNoteHeader } from './components/DeliveryNoteHeader';

interface DeliveryNotePageProps {
  searchParams: { id: string };
}

export default async function DeliveryNotePage({
  searchParams,
}: DeliveryNotePageProps) {
  const { id } = searchParams;

  if (!id) {
    return <div className="p-4 text-red-500">Missing delivery note ID</div>;
  }

  let deliveryNote: DeliveryNote;
  let config: SystemConfiguration;

  try {
    [deliveryNote, config] = await Promise.all([
      getDeliveryNote(id),
      getConfig(),
    ]);
  } catch (error) {
    console.error(error);
    return <div className="p-4 text-red-500">Failed to load data</div>;
  }

  if (!deliveryNote || !config) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="px-4 w-full flex-grow text-sm flex flex-col">
      <AutoPrint enabled={!!deliveryNote && !!config} />
      <div className="flex flex-col flex-grow p-4 bg-white">
        <DeliveryNoteHeader deliveryNote={deliveryNote} config={config} />
        <DeliveryNoteBody deliveryNote={deliveryNote} />
        <DeliveryNoteFooter deliveryNote={deliveryNote} />
      </div>
    </div>
  );
}
