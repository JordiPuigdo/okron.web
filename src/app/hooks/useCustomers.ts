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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const createCustomer = async (data: CreateCustomerRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer = await customerService.create(data);
      setCustomers(prev => [...prev, newCustomer]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (data: UpdateCustomerRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await customerService.update(data);
      setCustomers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}
