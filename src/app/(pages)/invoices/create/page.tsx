'use client';

import { SvgDocument } from 'app/icons/icons';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import InvoiceCreateForm from './components/InvoiceCreateForm';

export default function CreateInvoicePage() {
  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgDocument />
            Crear Factura
          </h2>
          <span className="text-l">Facturació - Nova Factura</span>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader()}
          <InvoiceCreateForm />
        </div>
      </Container>
    </MainLayout>
  );
}