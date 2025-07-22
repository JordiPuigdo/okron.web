import { useApiClient } from 'app/hooks/useApiClient';
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from 'app/interfaces/Account';

const { getBaseUrl } = useApiClient();

export class AccountService {
  baseUrl = getBaseUrl()!;

  async getAll(): Promise<Account[]> {
    const url = `${this.baseUrl}Account`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }

  async getById(id: string): Promise<Account> {
    const url = `${this.baseUrl}Account/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }

  async create(Account: CreateAccountRequest): Promise<Account> {
    const url = `${this.baseUrl}Account`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Account),
    });
    return await response.json();
  }

  async update(Account: UpdateAccountRequest): Promise<void> {
    const url = `${this.baseUrl}Account/${Account.id}`;
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Account),
    });
  }

  async delete(id: string): Promise<void> {
    const url = `${this.baseUrl}Account/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }
}
