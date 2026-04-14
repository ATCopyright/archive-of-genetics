export interface Gene {
  id: string;
  symbol: string;
  name: string;
  description: string;
  location: string;
  tags: string[];
  history?: string;
  accessibilityNotes?: string;
  authorUid: string;
  lastUpdated: string;
}

export const GENE_DATABASE: Gene[] = [];
export const NEWS_ITEMS: any[] = [];
