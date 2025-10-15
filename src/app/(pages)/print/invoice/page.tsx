import React from 'react';
import { SystemConfiguration } from 'app/interfaces/Config';
import { Invoice } from 'app/interfaces/Invoice';

import { InvoiceBody } from './components/InvoiceBody';
import { InvoiceFooter } from './components/InvoiceFooter';
import { InvoiceHeader } from './components/InvoiceHeader';

async function getInvoiceNote(id: string): Promise<Invoice> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}invoices/${id}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch invoices' + url);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching delivery :', error);
    return {} as Invoice;
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
  const invoice = await getInvoiceNote(searchParams.id);
  return {
    title: invoice.code || 'invoice',
  };
}

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const invoice = await getInvoiceNote(searchParams.id);
  const config = await getConfig();

  return (
    <div className="relative px-4 w-full flex-grow text-sm flex flex-col bg-white">
      <div className="flex flex-col flex-grow p-4">
        <InvoiceHeader invoice={invoice} config={config} />
        <InvoiceBody deliveryNotes={invoice.deliveryNotes} />
        <InvoiceFooter invoice={invoice} company={config.company} />
      </div>
      {/* Texto legal en vertical a la izquierda */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center">
        <span className="text-[10px] text-gray-600 [writing-mode:vertical-rl] rotate-180 px-2">
          KÖLDER REFRIGERACIÓ, SLU - Inscrita en el Registre Mercantil de
          Barcelona, Volum 48966, Full B 602794, Inscripció 1 - B56446651
        </span>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}
