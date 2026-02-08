import { useEffect, useState } from 'react';
import {
  Article,
  ArticleWithFullTree,
  CreateArticleProviderRequest,
  CreateArticleRequest,
  UpdateArticleRequest,
} from 'app/interfaces/Article';
import { ArticleService } from 'app/services/articleService';

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const articleService = new ArticleService();

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await articleService.getAll();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const createArticle = async (
    data: CreateArticleRequest
  ): Promise<Article | undefined> => {
    try {
      setError(undefined);
      const newArticle = await articleService.create(data);
      setArticles(prev => [...prev, newArticle]);
      return newArticle;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return undefined;
    }
  };

  const updateArticle = async (
    data: UpdateArticleRequest
  ): Promise<Article | undefined> => {
    try {
      setError(undefined);
      const updated = await articleService.update(data);
      setArticles(prev => prev.map(a => (a.id === data.id ? updated : a)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return undefined;
    }
  };

  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      setError(undefined);
      const success = await articleService.delete(id);
      if (success) {
        setArticles(prev => prev.filter(a => a.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const toggleActive = async (
    id: string,
    active: boolean
  ): Promise<boolean> => {
    try {
      setError(undefined);
      const success = await articleService.toggleActive(id, active);
      if (success) {
        setArticles(prev =>
          prev.map(a => (a.id === id ? { ...a, active } : a))
        );
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const getArticleById = async (id: string): Promise<Article | undefined> => {
    try {
      setError(undefined);
      return await articleService.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return undefined;
    }
  };

  const getArticleWithFullTree = async (
    id: string
  ): Promise<ArticleWithFullTree | undefined> => {
    try {
      setError(undefined);
      return await articleService.getByIdWithFullTree(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return undefined;
    }
  };

  const getArticlesByFamilyId = async (
    familyId: string
  ): Promise<Article[]> => {
    try {
      setError(undefined);
      return await articleService.getByFamilyId(familyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    }
  };

  const recalculateTotals = async (
    id: string
  ): Promise<Article | undefined> => {
    try {
      setError(undefined);
      const updated = await articleService.recalculateTotals(id);
      setArticles(prev => prev.map(a => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return undefined;
    }
  };

  const addProvider = async (
    id: string,
    provider: CreateArticleProviderRequest
  ): Promise<boolean> => {
    try {
      setError(undefined);
      const success = await articleService.addProvider(id, provider);
      if (success) {
        await fetchArticles();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const removeProvider = async (
    id: string,
    providerId: string
  ): Promise<boolean> => {
    try {
      setError(undefined);
      const success = await articleService.removeProvider(id, providerId);
      if (success) {
        await fetchArticles();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const updateProvider = async (
    id: string,
    providerId: string,
    provider: CreateArticleProviderRequest
  ): Promise<boolean> => {
    try {
      setError(undefined);
      const success = await articleService.updateProvider(
        id,
        providerId,
        provider
      );
      if (success) {
        await fetchArticles();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  return {
    articles,
    loading,
    error,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    toggleActive,
    getArticleById,
    getArticleWithFullTree,
    getArticlesByFamilyId,
    recalculateTotals,
    addProvider,
    removeProvider,
    updateProvider,
  };
}
