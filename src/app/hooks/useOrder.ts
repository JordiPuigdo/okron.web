import { useState } from 'react';
import {
  GetOrderWithFiltersRequest,
  Order,
  OrderCreationRequest,
  OrderType,
  OrderUpdateRequest,
} from 'app/interfaces/Order';
import OrderService, { IOrderService } from 'app/services/orderService';

export const useOrder = (orderService: IOrderService = new OrderService()) => {
  // const [warehouses, setWarehouses] = useState<WareHouse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrderById = async (id: string): Promise<Order> => {
    try {
      const response = await orderService.getById(id);
      return response;
    } catch (error) {
      console.error('Error fetching fetchOrderById:', error);
      throw error;
    }
  };

  const fetchLowStockOrders = async (): Promise<Order[]> => {
    try {
      const response = await orderService.getLowStockOrders();
      return response;
    } catch (error) {
      console.error('Error fetching low stock orders:', error);
      throw error;
    }
  };

  const createOrder = async (order: OrderCreationRequest): Promise<Order> => {
    try {
      const response = await orderService.create(order);

      return response;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  };

  const getPendingOrders = async (): Promise<Order[]> => {
    try {
      const response = await orderService.getPendingOrders();
      return response;
    } catch (error) {
      console.log('error getting pending orders', error);
      throw error;
    }
  };

  const getNextCode = async (orderType: OrderType): Promise<string> => {
    return await orderService.getNextCode(orderType);
  };

  const getOrderWithFilters = async (filters: GetOrderWithFiltersRequest) => {
    try {
      const response = await orderService.getWithFilters(filters);
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };

  const updateOrder = async (order: OrderUpdateRequest) => {
    try {
      const response = await orderService.update(order);
      return response;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  return {
    fetchOrderById,
    createOrder,
    getPendingOrders,
    getNextCode,
    getOrderWithFilters,
    orders,
    updateOrder,
    fetchLowStockOrders,
  };
};
