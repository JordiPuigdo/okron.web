import { useCallback, useEffect, useMemo, useState } from 'react';
import { PaymentMethod } from 'app/interfaces/Customer';
import { PaymentMethodService } from 'app/services/paymentMethod';

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => new PaymentMethodService(), []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAll();
      setPaymentMethods(data);
    } catch (e) {
      setError('Error al obtener los métodos de pago');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const create = useCallback(
    async (dto: Omit<PaymentMethod, 'id'>) => {
      setLoading(true);
      setError(null);
      try {
        await service.create(dto);
        await fetchAll();
      } catch (e) {
        setError('Error al crear el método de pago');
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll]
  );

  const update = useCallback(
    async (dto: PaymentMethod) => {
      setLoading(true);
      setError(null);
      try {
        await service.update(dto);
        await fetchAll();
      } catch (e) {
        setError('Error al actualizar el método de pago');
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll]
  );

  const remove = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await service.delete(id);
        await fetchAll();
      } catch (e) {
        setError('Error al eliminar el método de pago');
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    paymentMethods,
    loading,
    error,
    refresh: fetchAll,
    create,
    update,
    remove,
  };
}
