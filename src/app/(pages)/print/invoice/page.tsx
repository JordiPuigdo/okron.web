import React from 'react';
import { Invoice } from 'app/interfaces/Invoice';

import { InvoiceBody } from './components/InvoiceBody';
import { InvoiceFooter } from './components/InvoiceFooter';
import { InvoiceHeader } from './components/InvoiceHeader';

async function getInvoice(id: string): Promise<Invoice> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}invoices/${id}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch invoice' + url);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return {} as Invoice;
  }
}

export async function generateMetadata({
                                         searchParams,
                                       }: {
  searchParams: { id: string };
}) {
  const invoice = await getInvoice(searchParams.id);
  return {
    title: invoice.code || 'Invoice',
  };
}

export default async function InvoicePage({
                                            searchParams,
                                          }: {
  searchParams: { id: string };
}) {
  const invoice = await getInvoice(searchParams.id);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <head>
        <title>{invoice.code}</title>
      </head>
      <div className="flex flex-col bg-white gap-4 p-4 w-full">
        <InvoiceHeader invoice={invoice} />
        <InvoiceBody invoice={invoice} />
        {invoice.comment && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Comentaris:</h4>
            <p className="text-sm">{invoice.comment}</p>
          </div>
        )}
      </div>
      <InvoiceFooter invoice={invoice} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}