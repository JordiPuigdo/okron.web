import { User } from "app/interfaces/User";


class UserService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

    async getUser(username: string, password: string): Promise<User> {
    try {
        const url = `${this.baseUrl}user?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        const response = await fetch(url);

        if (!response.ok) {
        throw new Error('Failed to fetch user data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
    }

    async getUsers(): Promise<User[]> {
    try {
        const url = `${this.baseUrl}user/All`;
        const response = await fetch(url);

        if (!response.ok) {
        throw new Error('Failed to fetch user data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
    }

}


export default UserService;