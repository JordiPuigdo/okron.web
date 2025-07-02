import { PaymentMethod } from 'app/interfaces/Customer';

export class PaymentMethodService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL! + 'paymentMethods';

  async getAll(): Promise<PaymentMethod[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Error al obtener los métodos de pago');
    return await response.json();
  }

  async getById(id: string): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Método de pago no encontrado');
    return await response.json();
  }

  async create(dto: Omit<PaymentMethod, 'id'>): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Error al crear el método de pago');
  }

  async update(dto: PaymentMethod): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!response.ok) throw new Error('Error al actualizar el método de pago');
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el método de pago');
  }
}
