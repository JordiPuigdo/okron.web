class ConfigService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get() {
    try {
      const url = `${this.baseUrl}config`;
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
}

export default ConfigService;
