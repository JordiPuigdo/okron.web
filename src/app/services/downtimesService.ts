import {
  DowntimesReasons,
  DowntimesReasonsRequest,
  DowntimesReasonsUpdateRequest,
} from 'app/interfaces/Production/Downtimes';

class DowntimesService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<DowntimesReasons[]> {
    try {
      const url = `${this.baseUrl}DowntimeReasons`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch DowntimesReasons');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching DowntimesReasons:', error);
      throw error;
    }
  }

  async getDowntimesReasonsByMachineId(
    machineId: string,
    showDefault: boolean = false
  ): Promise<DowntimesReasons[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}DowntimeReasons/machine/${machineId}?showDefault=${showDefault}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch DowntimesReasons');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching DowntimesReasons:', error);
      throw error;
    }
  }

  async createDowntimesReason(request: DowntimesReasonsRequest) {
    try {
      const response = await fetch(`${this.baseUrl}DowntimeReasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create DowntimesReasons');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating DowntimesReasons:', error);
      throw error;
    }
  }

  async deleteDowntimesReason(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}DowntimeReasons/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete DowntimesReasons');
      }
    } catch (error) {
      console.error('Error deleting DowntimesReasons:', error);
      throw error;
    }
  }

  async updateDowntimesReason(request: DowntimesReasonsUpdateRequest) {
    try {
      const response = await fetch(
        `${this.baseUrl}DowntimeReasons/${request.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update DowntimesReasons');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating DowntimesReasons:', error);
      throw error;
    }
  }
}

export default DowntimesService;
