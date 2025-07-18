'use client';

import { useEffect, useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { Invoice, InvoiceUpdateRequest } from 'app/interfaces/Invoice';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import { InvoiceDetailForm } from '../components/InvoiceDetailForm';

interface InvoiceDetailPageProps {
  params: { id: string };
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/invoices/${params.id}`);
      const invoiceData = await response.json();
      setInvoice(invoiceData);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updateRequest: InvoiceUpdateRequest) => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateRequest),
      });

      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoice(updatedInvoice);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Container>
          <div className="flex justify-center items-center h-64">
            <SvgSpinner className="w-8 h-8" />
          </div>
        </Container>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center text-red-500">
            Factura no trobada
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <InvoiceDetailForm invoice={invoice} onUpdate={handleUpdate} />
      </Container>
    </MainLayout>
  );
}