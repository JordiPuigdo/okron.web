import { UpdateDowntimesRequest } from 'app/interfaces/Production/Downtimes';
import {
  DowntimesTicketReport,
  DowntimesTicketRequest,
} from 'app/interfaces/Production/DowntimesTicketReport';
import WorkOrder, {
  AddCommentToWorkOrderRequest,
  AddWorkOrderOperatorTimes,
  CreateWorkOrderRequest,
  DeleteWorkOrderOperatorTimes,
  FinishWorkOrderOperatorTimes,
  SaveInspectionResultPointRequest,
  SearchWorkOrderFilters,
  UpdateStateWorkOrder,
  UpdateWorkOrderOperatorTimes,
  WorkOrderComment,
  WorkOrderType,
} from 'app/interfaces/workOrder';

class WorkOrderService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createWorkOrder(
    WorkOrder: CreateWorkOrderRequest,
    machineId: string
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}workorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(WorkOrder),
    });
    if (!response.ok) {
      throw new Error('Failed to create machine WorkOrder');
    }
  }

  async addWorkOrderOperatorTimes(
    AddWorkOrderOperatorTimesValues: AddWorkOrderOperatorTimes
  ): Promise<AddWorkOrderOperatorTimes> {
    try {
      const url = `${this.baseUrl}AddWorkOrderOperatorTimes`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(AddWorkOrderOperatorTimesValues),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch AddWorkOrderOperatorTimes');
      }
      if (response.status === 204) {
        return response.json();
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching AddWorkOrderOperatorTimes:', error);
      throw error;
    }
  }

  async finishWorkOrderOperatorTimes(
    FinishWorkOrderOperatorTimes: FinishWorkOrderOperatorTimes
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}FinishWorkOrderOperatorTimes`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(FinishWorkOrderOperatorTimes),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch AddWorkOrderOperatorTimes');
      }
      if (response.status === 204) {
        return true;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching AddWorkOrderOperatorTimes:', error);
      throw error;
    }
  }

  async updateWorkOrderOperatorTimes(
    updateWorkOrderOperatorTimes: UpdateWorkOrderOperatorTimes
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}UpdateWorkOrderOperatorTimes`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateWorkOrderOperatorTimes),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch UpdateWorkOrderOperatorTimes');
      }
      if (response.status === 204) {
        return true;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching UpdateWorkOrderOperatorTimes:', error);
      throw error;
    }
  }

  async deleteWorkOrderOperatorTimes(
    deleteWorkOrderOperatorTimes: DeleteWorkOrderOperatorTimes
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}DeleteWorkOrderOperatorTimes`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteWorkOrderOperatorTimes),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch UpdateWorkOrderOperatorTimes');
      }
      if (response.status === 204) {
        return true;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching UpdateWorkOrderOperatorTimes:', error);
      throw error;
    }
  }

  async getWorkOrdersByMachine(Id: string): Promise<WorkOrder[]> {
    try {
      const url = `${this.baseUrl}workorder?MachineId=${Id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch WorkOrders-machines');
      }
      if (response.status === 204) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching WorkOrders by machines:', error);
      throw error;
    }
  }

  async getWorkOrdersById(Id: string): Promise<WorkOrder[]> {
    try {
      const url = `${this.baseUrl}workorder?MachineId=${Id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch WorkOrders-machines');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching WorkOrders by machines:', error);
      throw error;
    }
  }

  async getWorkOrderById(Id: string): Promise<WorkOrder | undefined> {
    try {
      const url = `${this.baseUrl}workorder/${Id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch WorkOrders');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching WorkOrder:', error);
      throw error;
    }
  }

  async updateWorkOrder(
    updateWorkOrder: CreateWorkOrderRequest
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}workorder`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateWorkOrder),
      });

      if (!response.ok) {
        throw new Error('Failed to update WorkOrder');
      }

      if (response.status === 204) {
        return true;
      }

      return response.json();
    } catch (error) {
      console.error('Error updating WorkOrder:', error);
      throw error;
    }
  }

  async getWorkOrdersWithFilters(
    searchWorkOrderFilters: SearchWorkOrderFilters
  ): Promise<WorkOrder[]> {
    try {
      const url = `${this.baseUrl}GetWorkOrderWithFilters`;

      const response = await fetch(url, {
        method: 'Post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchWorkOrderFilters),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch WorkOrders-machines');
      }
      if (response.status === 204) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching WorkOrders by machines:', error);
      throw error;
    }
  }

  async deleteWorkOrder(id: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}workorder/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete work order`);
      }

      return true;
    } catch (error) {
      console.error('Error delete work order:', error);
      throw error;
    }
  }

  async countByWorkOrderType(workOrderType: WorkOrderType): Promise<number> {
    try {
      const url = `${this.baseUrl}CountByWorkOrderType?type=${workOrderType}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to CountByWorkOrderType`);
      }

      return parseInt(await response.text(), 10);
    } catch (error) {
      console.error('Error CountByWorkOrderType:', error);
      throw error;
    }
  }

  async saveInspectionPointResult(
    saveInspectionPointResul: SaveInspectionResultPointRequest
  ): Promise<WorkOrder[]> {
    try {
      const url = `${this.baseUrl}SaveInsepctionPointResult`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveInspectionPointResul),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch WorkOrders-machines');
      }
      if (response.status === 204) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching WorkOrders by machines:', error);
      throw error;
    }
  }

  async updateStateWorkOrder(
    updateStateWorkOrder: UpdateStateWorkOrder[]
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}workorder/state`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateStateWorkOrder),
      });

      if (!response.ok) {
        throw new Error('Failed to update WorkOrder');
      }
      return true;
    } catch (error) {
      console.error('Error updating WorkOrder:', error);
      throw error;
    }
  }
  async addCommentToWorkOrder(
    addCommentToWorkOrder: AddCommentToWorkOrderRequest
  ): Promise<WorkOrderComment> {
    try {
      const url = `${this.baseUrl}AddCommentToWorkOrder`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addCommentToWorkOrder),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch addCommentToWorkOrder');
      }
      if (response.status === 204) {
        return {} as WorkOrderComment;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching addCommentToWorkOrder:', error);
      throw error;
    }
  }

  async deleteCommentToWorkOrder(
    workOrderId: string,
    commentId: string
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}CommentToWorkOrder?workOrderId=${workOrderId}&commentId=${commentId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch addCommentToWorkOrder');
      }
      if (response.status === 204) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error fetching addCommentToWorkOrder:', error);
      throw error;
    }
  }

  async finishWorkOrdersByDate(date: Date): Promise<boolean> {
    try {
      const isoDateString = date.toISOString();
      const url = `${this.baseUrl}FinishWorkOrdersByDate`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isoDateString),
      });

      if (!response.ok) {
        throw new Error('Failed to update WorkOrder');
      }

      if (response.status === 204) {
        return true;
      }

      return response.json();
    } catch (error) {
      console.error('Error updating WorkOrder:', error);
      throw error;
    }
  }

  async cleanCache(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}workorder/CleanCache`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch WorkOrders-machines');
      }
      if (response.status === 204) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating WorkOrder:', error);
      throw error;
    }
  }

  async UpdateDowntime(request: UpdateDowntimesRequest): Promise<boolean> {
    try {
      const url = `${this.baseUrl}workOrder/UpdateDowntimes`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to update WorkOrder');
      }

      if (response.status === 204) {
        return true;
      }
    } catch (error) {
      console.error('Error updating Downtime:', error);
      throw error;
    }
    return false;
  }

  async getDowntimesTicketReport(
    request: DowntimesTicketRequest
  ): Promise<DowntimesTicketReport[]> {
    try {
      const url = `${this.baseUrl}workOrder/DowntimesTicketReport?from=${request.from}&to=${request.to}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GetDowntimesTicketReport');
      }
      if (response.status === 204) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching GetDowntimesTicketReport:', error);
      throw error;
    }
  }
}

export default WorkOrderService;
