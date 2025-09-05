import React from 'react';
import { SystemConfiguration } from 'app/interfaces/Config';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';

import { DeliveryNoteBody } from './components/DeliveryNoteBody';
import { DeliveryNoteFooter } from './components/DeliveryNoteFooter';
import { DeliveryNoteHeader } from './components/DeliveryNoteHeader';

async function getDeliveryNote(id: string): Promise<DeliveryNote> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}deliverynotes/${id}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch delivery note' + url);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching delivery note:', error);
    return {} as DeliveryNote;
  }
}

async function getConfig() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}config`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch config');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching config:', error);
    return {} as SystemConfiguration;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const deliveryNote = await getDeliveryNote(searchParams.id);
  return {
    title: deliveryNote.code || 'Delivery Note',
  };
}

export default async function DeliveryNotePage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const deliveryNote = await getDeliveryNote(searchParams.id);
  const config = await getConfig();

  return (
    <div className="px-4 w-full flex-grow text-sm flex flex-col">
      <div className="flex flex-col flex-grow p-4 bg-white">
        <DeliveryNoteHeader deliveryNote={deliveryNote} config={config} />
        <DeliveryNoteBody deliveryNote={deliveryNote} />
        <DeliveryNoteFooter deliveryNote={deliveryNote} />
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}
