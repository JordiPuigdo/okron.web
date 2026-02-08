import {
  Article,
  ArticleWithFullTree,
  CreateArticleProviderRequest,
  CreateArticleRequest,
  UpdateArticleRequest,
} from 'app/interfaces/Article';

export class ArticleService {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL! + 'article'
  ) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Article[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error('Error fetching articles');
    return res.json();
  }

  async getById(id: string): Promise<Article> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error('Error fetching article');
    return res.json();
  }

  async getByIdWithFullTree(id: string): Promise<ArticleWithFullTree> {
    const res = await fetch(`${this.baseUrl}/${id}/full-tree`);
    if (!res.ok) throw new Error('Error fetching article with full tree');
    return res.json();
  }

  async getByFamilyId(familyId: string): Promise<Article[]> {
    const res = await fetch(`${this.baseUrl}/family/${familyId}`);
    if (!res.ok) throw new Error('Error fetching articles by family');
    return res.json();
  }

  async create(data: CreateArticleRequest): Promise<Article> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Error creating article');
    return res.json();
  }

  async update(data: UpdateArticleRequest): Promise<Article> {
    const res = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Error updating article');
    return res.json();
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error deleting article');
    return res.ok;
  }

  async toggleActive(id: string, active: boolean): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}/active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(active),
    });
    if (!res.ok) throw new Error('Error toggling article active state');
    return res.ok;
  }

  async recalculateTotals(id: string): Promise<Article> {
    const res = await fetch(`${this.baseUrl}/${id}/recalculate-totals`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error recalculating totals');
    return res.json();
  }

  async addProvider(
    id: string,
    provider: CreateArticleProviderRequest
  ): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}/provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    });
    if (!res.ok) throw new Error('Error adding provider');
    return res.ok;
  }

  async removeProvider(id: string, providerId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}/provider/${providerId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error removing provider');
    return res.ok;
  }

  async updateProvider(
    id: string,
    providerId: string,
    provider: CreateArticleProviderRequest
  ): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${id}/provider/${providerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provider),
    });
    if (!res.ok) throw new Error('Error updating provider');
    return res.ok;
  }
}
