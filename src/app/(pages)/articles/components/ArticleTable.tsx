'use client';

import { useArticles } from 'app/hooks/useArticles';
import { useTranslations } from 'app/hooks/useTranslations';
import { Article, ArticleType } from 'app/interfaces/Article';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  ColumnnAlign,
  Filters,
  FiltersFormat,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

const getArticleTypeLabel = (type: ArticleType): string => {
  return type === ArticleType.Component ? 'Component' : 'Bill of Materials';
};

const getColumnsArticle = (t: (key: string) => string): Column[] => [
  {
    label: t('code'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('article.type'),
    key: 'articleType',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('family'),
    key: 'familyName',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('family.code'),
    key: 'fullFamilyCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('unit.price'),
    key: 'unitPrice',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
  {
    label: t('margin.percentage'),
    key: 'marginPercentage',
    format: ColumnFormat.NUMBER,
    align: ColumnnAlign.RIGHT,
  },
  {
    label: t('total.amount'),
    key: 'totalAmount',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
  {
    label: t('active'),
    key: 'active',
    format: ColumnFormat.BOOLEAN,
  },
];

const getFilterArticle = (t: (key: string) => string): Filters[] => [
  {
    label: t('code'),
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('description'),
    key: 'description',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('family'),
    key: 'familyName',
    format: FiltersFormat.TEXT,
  },
];

export const tableButtons = {
  edit: true,
  detail: true,
};

interface ArticleTableProps {
  onEdit?: (article: Article) => void;
}

export const ArticleTable = ({ onEdit }: ArticleTableProps) => {
  const { t } = useTranslations();
  const { articles, loading, error } = useArticles();

  const articlesWithLabels = articles.map(article => ({
    ...article,
    articleType: getArticleTypeLabel(article.articleType),
    fullFamilyCode: article.fullFamilyCode || article.familyCode || '-',
  }));

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">{t('loading.articles')}</div>
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        {t('error')}: {error}
      </div>
    );

  return (
    <div className="w-full">
      <DataTable
        data={articlesWithLabels}
        columns={getColumnsArticle(t)}
        entity={EntityTable.ARTICLE}
        tableButtons={tableButtons}
        hideShadow={false}
        filters={getFilterArticle(t)}
        onEdit={onEdit}
      />
    </div>
  );
};
