'use client';

import Container from 'components/layout/Container';
import { HeaderTable } from 'components/layout/HeaderTable';
import MainLayout from 'components/layout/MainLayout';

import { TableDataInvoices } from './components/TableDataInvoices';

export default function InvoicesPage() {
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          <HeaderTable
            title="Factures"
            subtitle="Inici - Llistat de Factures"
            createButton="Crear Factura"
            urlCreateButton="/invoices/create"
          />
          <TableDataInvoices className="bg-white p-4 rounded-xl shadow-md" />
        </div>
      </Container>
    </MainLayout>
  );
}