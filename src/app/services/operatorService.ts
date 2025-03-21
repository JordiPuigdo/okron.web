import Operator from 'app/interfaces/Operator';

class OperatorService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getOperators(): Promise<Operator[]> {
    try {

      const url = `${this.baseUrl}operator`
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch operators');
      }
      if (response.status === 204) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }
  }

  async getOperator(id: string): Promise<Operator> {
    try {

      const url = `${this.baseUrl}operator/${id}`
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch operators');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }
  }

  async updateOperator(operator: Operator): Promise<boolean> {
    try {
      const url = `${this.baseUrl}operator/${operator.id}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operator),
      });
      if (!response.ok) {
        console.log(`Failed to update operator with ID ${operator.id}`);
        return false;
      }
      
      const result = await response.json();

      if (result === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error updating operators:', error);
      throw error;
    }
  }

  async createOperator(operator: Operator | null): Promise<string> {
    try {
      const url = `${this.baseUrl}operator`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operator),
      });
      if (!response.ok) {
        throw new Error(`Failed to create operator`);
      }
      const responseBody = await response.text();
      return responseBody;
    } catch (error) {
      console.error('Error creating operators:', error);
      throw error;
    }
  }

  async deleteOperator(id: string): Promise<string> {
    try {
      const url = `${this.baseUrl}operator/${id}`
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete operator with ID ${id}`);
      }
      const responseBody = await response.text();
      return responseBody;
    } catch (error) {
      console.error('Error deleting operators:', error);
      throw error;
    }
  }

}

export default OperatorService;
