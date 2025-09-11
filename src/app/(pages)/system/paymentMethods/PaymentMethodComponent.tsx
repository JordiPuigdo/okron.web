'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { usePaymentMethods } from 'app/hooks/usePaymentMethod';
import { SvgSpinner } from 'app/icons/icons';
import { PaymentMethod } from 'app/interfaces/Customer';

import { EditableTable } from '../rates/components/EditableTable';
import { PaymentMethodForm } from './PaymentMethodForm';

function PaymentMethodComponent() {
  const { t } = useTranslations();
  const { paymentMethods, loading, error, create, update, remove } =
    usePaymentMethods();
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const columns = [
    {
      header: t('description'),
      accessor: 'description',
      editable: true,
      inputType: 'text',
    },
    {
      header: t('active'),
      accessor: 'active',
      editable: true,
      inputType: 'checkbox',
      width: 'w-16',
    },
  ];

  const handleUpdate = async (id: string, newData: Partial<PaymentMethod>) => {
    if (!id) return;
    if ('id' in newData) delete newData.id; // por si acaso
    await update({ id, ...newData } as PaymentMethod);
  };
  const handleDelete = async (id: string) => {
    if (window.confirm(t('system.paymentMethods.confirmDelete'))) {
      await remove(id);
    }
  };

  const handleSave = async (pm: PaymentMethod) => {
    setFormLoading(true);
    try {
      if (pm.id == '') {
        const { id, ...pmWithoutId } = pm;
        await create(pmWithoutId);
      } else {
        await update(pm);
      }

      setEditing(null);
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('system.paymentMethods.configuration')}
        </h2>
        <PaymentMethodForm
          initialData={editing ?? undefined}
          onSubmit={handleSave}
          onCancel={() => {
            setEditing(null);
          }}
          loading={formLoading}
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <SvgSpinner className="w-5 h-5 animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('system.paymentMethods.existing')}
          </h2>
          <EditableTable
            columns={columns}
            data={paymentMethods}
            loading={loading}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

export default PaymentMethodComponent;
