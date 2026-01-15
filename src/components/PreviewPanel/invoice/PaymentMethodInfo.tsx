'use client';

import { CreditCard } from 'lucide-react';

interface PaymentMethod {
  description: string;
  days: number;
}

interface PaymentMethodInfoProps {
  paymentMethod: PaymentMethod;
}

/**
 * Muestra información del método de pago.
 * Principio SRP: Solo renderiza datos de método de pago.
 */
export function PaymentMethodInfo({ paymentMethod }: PaymentMethodInfoProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <CreditCard className="w-5 h-5 text-gray-400" />
      <div>
        <p className="font-medium text-gray-900">{paymentMethod.description}</p>
        <p className="text-sm text-gray-500">{paymentMethod.days} dies</p>
      </div>
    </div>
  );
}
