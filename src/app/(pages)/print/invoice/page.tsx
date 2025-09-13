'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SystemConfiguration } from 'app/interfaces/Config';
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

interface InvoicePageProps {
  searchParams: { id: string };
}

export default function InvoicePage({ searchParams }: InvoicePageProps) {
  const { t } = useTranslations();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [config, setConfig] = useState<SystemConfiguration | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const invoiceData = await getInvoice(searchParams.id);
      const configData = await getConfig();
      setInvoice(invoiceData);
      setConfig(configData);
    };
    loadData();
  }, [searchParams.id]);

  useEffect(() => {
    if (invoice && config) {
      // Auto-print after data loads
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, config]);

  if (!invoice || !config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <head>
        <title>{invoice.code}</title>
      </head>
      <div className="flex flex-col bg-white gap-4 p-4 w-full">
        <InvoiceHeader invoice={invoice} config={config} />
        <InvoiceBody invoice={invoice} />
        {invoice.externalComments && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">{t('comments')}:</h4>
            <p className="text-sm">{invoice.externalComments}</p>
          </div>
        )}
      </div>
      <InvoiceFooter invoice={invoice} />
    </div>
  );
}
