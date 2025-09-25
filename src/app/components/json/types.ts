export interface TypeInfo {
  name: string;
  schema: {
    Properties: Array<{ Name: string }>;
  };
  properties: string[];
}
export interface TreeNodeProps {
  data: any;
  handleTreeViewerClick?: any;
  parentOpen?: boolean;
  onConceptSelect?: (concept: string) => void;
  onAuthorSelect?: (author: string) => void;
  statement?: any;
  article?: any;
  statementDetails?: any;
  parent?: string | null;
  label?: string | null;
  sourceUrl?: string | null;
  button?: string | null;
  tooltip?: string | null;
  level?: number;
  color?: string;
}

export type ResourceType = 'article' | 'dataset' | 'loom' | 'all';
export type SearchType = 'keyword' | 'semantic' | 'hybrid';
export type SortBy = 'alphabet' | 'time';
export type SortOrder = 'ASC' | 'DESC';

export interface InitialParams {
  title?: string;
  start_year: number;
  end_year: number;
  page: number;
  per_page: number;
  resource_type: ResourceType;
  sort_by: SortBy,
  sort_order: SortOrder,
  search_type: SearchType;
  authors: string[];
  scientific_venues: string[];
  research_fields: string[];
  concepts: string[];
}