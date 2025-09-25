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
    <div className="px-4 w-full flex-grow text-sm flex flex-col">
      <div className="flex flex-col flex-grow p-4 bg-white"></div>

      <InvoiceHeader invoice={invoice} config={config} />
      <InvoiceBody deliveryNotes={invoice.deliveryNotes} />
      <InvoiceFooter invoice={invoice} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}
