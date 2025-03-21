import Operator from "app/interfaces/Operator";
import { LoginUser } from "app/interfaces/User";


class AuthenticationService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

    async Login(username: string, password: string): Promise<LoginUser> {
        try {
            const url = `${this.baseUrl}Authentication`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }

    async LoginOperator(code: string): Promise<Operator> {
        try {
            const url = `${this.baseUrl}Operator/${code}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                
            });
            if (!response.ok) {
                console.log('Failed to fetch user data');
                return {} as Operator;
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }
}


export default AuthenticationService;