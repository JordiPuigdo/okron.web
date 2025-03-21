
import Machine from '../../app/interfaces/machine'; // Import your Machine model

class MachineService {
  private baseUrl: string; // Replace with your API base URL

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAllMachines(): Promise<Machine[]> {
    try {
      const response = await fetch(`${this.baseUrl}machines`);
      if (!response.ok) {
        throw new Error('Failed to fetch machines');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching machines:', error);
      throw error; // Re-throw the error to propagate it to the caller
    }
  }
  async getMachineById(id: string): Promise<Machine | null> {
    const response = await fetch(`${this.baseUrl}machines/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch machine with ID ${id}`);
    }
    return response.json();
  }

  async createMachine(machine: Machine): Promise<void> {
    const response = await fetch(`${this.baseUrl}machines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(machine),
    });
    if (!response.ok) {
      throw new Error('Failed to create machine');
    }
  }

  async updateMachine(id: string, machine: Machine): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}machines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(machine),
    });
      if (response.ok) {
      return true;
    } else {
      throw new Error(`Failed to update machine with ID ${id}`);
    }
  }

  async deleteMachine(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}machines/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete machine with ID ${id}`);
    }
  }


}

export default MachineService;
