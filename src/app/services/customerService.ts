import {
  Customer,
  CustomerInstallations,
  UpdateCustomerRequest,
} from 'app/interfaces/Customer';

export class CustomerService {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL! + 'customers'
  ) {
    this.baseUrl = baseUrl;
  }

  private async extractErrorMessage(res: Response): Promise<string> {
    try {
      const text = await res.text();
      if (!text) return `Error ${res.status}`;

      try {
        const data = JSON.parse(text) as {
          message?: string;
          error?: string;
          title?: string;
        };

        return data.message || data.error || data.title || text;
      } catch {
        return text;
      }
    } catch {
      return `Error ${res.status}`;
    }
  }

  async getAll(): Promise<Customer[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error(await this.extractErrorMessage(res));
    return res.json();
  }

  async getById(id: string): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error(await this.extractErrorMessage(res));
    return res.json();
  }

  async create(data: object): Promise<Customer> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await this.extractErrorMessage(res));
    return res.json();
  }

  async update(data: UpdateCustomerRequest): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await this.extractErrorMessage(res));
    return res.ok;
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await this.extractErrorMessage(res));
  }

  async getCode(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/code`);
    if (!res.ok) throw new Error(await this.extractErrorMessage(res));
    return res.text();
  }

  async getInstallationsByCustomerId(
    id: string
  ): Promise<CustomerInstallations[]> {
    const res = await fetch(`${this.baseUrl}/installations/${id}`);
    if (!res.ok) throw new Error(await this.extractErrorMessage(res));
    return res.json();
  }
}
