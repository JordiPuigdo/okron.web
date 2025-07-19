'use client';

import { useEffect, useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { Invoice, InvoiceUpdateRequest } from 'app/interfaces/Invoice';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import { InvoiceService } from '../../../services/invoiceService';
import { InvoiceDetailForm } from '../components/InvoiceDetailForm';

interface InvoiceDetailPageProps {
  params: { id: string };
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invoiceService = new InvoiceService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await invoiceService.getById(params.id);
      setInvoice(response);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updateRequest: InvoiceUpdateRequest) => {
    try {
      const updatedInvoice = await invoiceService.update(updateRequest);
      setInvoice(updatedInvoice);

    } catch (error) {
      console.error('Error actualizando la factura:', error);
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