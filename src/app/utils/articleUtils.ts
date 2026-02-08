import { Article, ArticleType } from 'app/interfaces/Article';

export const getArticleTypeLabel = (type: ArticleType): string => {
  switch (type) {
    case ArticleType.Component:
      return 'Component';
    case ArticleType.BillOfMaterials:
      return 'Bill of Materials';
    default:
      return 'Unknown';
  }
};

export const calculateComponentsTotal = (article: Article): number => {
  if (!article.components || article.components.length === 0) {
    return 0;
  }
  return article.components.reduce((sum, component) => sum + component.subtotal, 0);
};

export const calculateTotalWithMargin = (
  baseAmount: number,
  marginPercentage: number
): number => {
  if (marginPercentage === 0) {
    return baseAmount;
  }
  return baseAmount * (1 + marginPercentage / 100);
};

export const getDefaultProvider = (article: Article) => {
  return article.providers?.find(p => p.isDefault);
};

export const calculateProviderNetPrice = (price: number, discount: number): number => {
  if (discount === 0) return price;
  return price * (1 - discount / 100);
};

export const formatArticleCode = (article: Article): string => {
  return article.code || `${article.familyCode}-PENDING`;
};
