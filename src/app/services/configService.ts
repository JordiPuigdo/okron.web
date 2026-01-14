import Company from 'app/interfaces/Company';

class ConfigService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(refresh = false) {
    try {
      let url = `${this.baseUrl}config`;
      refresh ? (url += '?refresh=' + refresh) : '';
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Failed to add asset');
        throw new Error('Failed to add asset');
      }

      return response.json();
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  }

  async getCompany() {
    try {
      const url = `${this.baseUrl}company`;
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Failed to add asset');
        throw new Error('Failed to add asset');
      }

      return response.json();
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  }

  async UpdateCompany(company: Company) {
    try {
      const url = `${this.baseUrl}company`;
      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(company),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to add asset');
        throw new Error('Failed to add asset');
      }
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  }

  async getLanguages(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}config/Languages`;
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('Failed to get languages');
        throw new Error('Failed to get languages');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting languages:', error);
      throw error;
    }
  }
}

export default ConfigService;
