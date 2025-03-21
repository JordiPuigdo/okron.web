import {
  GetOrderWithFiltersRequest,
  Order,
  OrderCreationRequest,
  OrderType,
  OrderUpdateRequest,
} from 'app/interfaces/Order';

export interface IOrderService {
  create(createOrderRequest: OrderCreationRequest): Promise<Order>;
  getById(id: string): Promise<Order>;
  getPendingOrders(): Promise<Order[]>;
  getNextCode(orderType: OrderType): Promise<string>;
  getWithFilters(filters: GetOrderWithFiltersRequest): Promise<Order[]>;
  update(updateOrderRequest: OrderUpdateRequest): Promise<Order>;
  getLowStockOrders(): Promise<Order[]>;
}

export class OrderService implements IOrderService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL!) {
    this.baseUrl = baseUrl;
  }
  async getLowStockOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${this.baseUrl}orders/lowStock`);
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }
  async create(createOrderRequest: OrderCreationRequest): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createOrderRequest),
      });
      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}orders/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getPendingOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${this.baseUrl}orders/pendingOrders`);
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getNextCode(orderType: OrderType): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}orders/getNextCode?orderType=${orderType}`
      );
      return await response.text();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getWithFilters(filters: GetOrderWithFiltersRequest): Promise<Order[]> {
    try {
      const response = await fetch(`${this.baseUrl}orders/getWithFilters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async update(updateOrderRequest: OrderUpdateRequest): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}orders`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateOrderRequest),
      });
      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
}
export default OrderService;
