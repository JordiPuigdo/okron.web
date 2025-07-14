import { useEffect, useState } from 'react';
import {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from 'app/interfaces/Customer';
import { CustomerService } from 'app/services/customerService';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customerService = new CustomerService();

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const createCustomer = async (data: CreateCustomerRequest) => {
    const newRates = data.rates?.map(({ id, ...rest }) => rest);

    const addresses = data.address?.map(({ ...rest }) => rest);

    const newInstallations = data.installations?.map(
      ({ id, rates, ...rest }) => ({
        ...rest,
        rates: rates?.map(({ id, ...rateRest }) => rateRest),
      })
    );

    const dataNew = {
      ...data,
      rates: newRates,
      installations: newInstallations,
      address: addresses,
    };

    setLoading(true);
    setError(null);
    try {
      const newCustomer = await customerService.create(dataNew);
      setCustomers(prev => [...prev, newCustomer]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      const customer = await customerService.getById(id);
      return customer;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (
    data: UpdateCustomerRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await customerService.update(data);
      if (updated) {
        return true;
      }
      //setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const deleteCustomer = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await customerService.remove(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNewCustomerCode = async () => {
    try {
      const code = await customerService.getCode();
      return code;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getById,
    getNewCustomerCode,
  };
}
