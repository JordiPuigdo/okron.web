'use client';

import { useTranslations } from 'app/hooks/useTranslations';
import Company from 'app/interfaces/Company';
import { Order } from 'app/interfaces/Order';
import dayjs from 'dayjs';

export const OrderHeader = ({
  order,
  company,
}: {
  order: Order;
  company: Company;
}) => {
  const { t } = useTranslations();
  return (
    <div>
      <div className="flex justify-between">
        <img
          src={company.urlLogo}
          alt={company.name}
          className="h-[150px] w-[150px] p-2 "
        />
        <div className="flex">
          <div className="border p-2 my-6">
            <p className="relative">{t('order')}</p>
            <div className="p-4">
              <p className="font-semibold">{order.code}</p>
            </div>
          </div>
          <div className="border p-2 my-6">
            <p className="relative">{t('date')}</p>
            <div className="p-4">
              <p className="font-semibold">
                {dayjs(order.date).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-start">
        <div>
          <p className="font-semibold">{company.name}</p>
          <p>{company.nif}</p>
          <p className="font-semibold">{company.address.address}</p>
          <p>Tel: {company.phone}</p>
          <p>{company.email}</p>
        </div>
        <div className="flex flex-col justify-center items-end">
          <p className="font-semibold">{order.provider?.name}</p>
          <p>{order.provider?.nie}</p>
          <p className="font-semibold">{order.provider?.address}</p>
        </div>
      </div>
    </div>
  );
};
