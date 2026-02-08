import { BaseModel } from './BaseModel';

export enum ArticleType {
  Component = 0,
  BillOfMaterials = 1,
}

export interface Article extends BaseModel {
  code: string;
  description: string;
  articleType: ArticleType;
  unitPrice: number;
  marginPercentage: number;
  totalAmount: number;
  familyId: string;
  familyName: string;
  familyCode: string;
  familyPath?: string;
  fullFamilyCode?: string;
  providers: ArticleProvider[];
  components: ArticleComponent[];
  notes?: string;
}

export interface ArticleProvider extends BaseModel {
  providerId: string;
  providerName: string;
  providerReference: string;
  price: number;
  discount: number;
  isDefault: boolean;
  leadTimeDays: number;
}

export interface ArticleComponent {
  articleId: string;
  articleCode: string;
  articleDescription: string;
  articleType: ArticleType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sortOrder: number;
}

export interface CreateArticleRequest {
  description: string;
  articleType: ArticleType;
  unitPrice: number;
  marginPercentage: number;
  familyId: string;
  providers?: CreateArticleProviderRequest[];
  components?: CreateArticleComponentRequest[];
  notes?: string;
}

export interface UpdateArticleRequest extends CreateArticleRequest {
  id: string;
}

export interface CreateArticleProviderRequest {
  providerId: string;
  providerReference: string;
  price: number;
  discount: number;
  isDefault: boolean;
  leadTimeDays: number;
}

export interface CreateArticleComponentRequest {
  articleId: string;
  quantity: number;
  sortOrder: number;
}

export interface ArticleWithFullTree extends Article {
  expandedComponents?: ArticleWithFullTree[];
}
