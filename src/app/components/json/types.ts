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