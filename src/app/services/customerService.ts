import {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from 'app/interfaces/Customer';

export class CustomerService {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL! + 'customers'
  ) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Customer[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error('Error fetching customers');
    return res.json();
  }

  async getById(id: string): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error('Error fetching customer');
    return res.json();
  }

  async create(data: CreateCustomerRequest): Promise<Customer> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error creating customer');
    return data as Customer;
  }

  async update(data: UpdateCustomerRequest): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error updating customer');
    return res.json();
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error deleting customer');
  }
}
