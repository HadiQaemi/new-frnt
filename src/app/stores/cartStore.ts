import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStatementServer } from '../lib/api/server-side';

export interface Author {
    id: string;
    name: string;
}
export interface Article {
    id: string;
    doi: string;
    rebornDOI: string;
    rebornDatePublished: string;
    abstract: string;
    articleDatePublished: string;
    authors: Author[];
    name: string;
    journal?: {
        label: string;
        id?: string;
    };
}
export interface Statement {
    _id?: any;
    content?: string;
    name?: string;
}
export interface Items {
    _id: string;
    article_id: string;
    article?: Article;
    statement?: Statement;
}
interface CartState {
    items: Items[];
    addItem: (item: Statement, article: any) => void;
    removeItem: (id: string) => void;
    clearItems: () => void;
    isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: async (item: any, article: any) => {
                const authors = article.authors.map((author: any) => {
                    return {
                        name: `${author.label}`,
                        id: author.author_id,
                        orcid: author.orcid
                    }
                })
                const article_info = {
                    'abstract': article.abstract,
                    'articleDatePublished': article.date_published,
                    'authors': authors,
                    'id': article.article_id,
                    'doi': article.dois,
                    'rebornDOI': article.reborn_doi,
                    'rebornDatePublished': article.reborn_date,
                    'name': article.name,
                    'journal': {
                        'label': article.academic_publication ? article.academic_publication.label : "",
                        'id': article.academic_publication ? article.academic_publication.academic_publication_id : "",
                    },
                }
                const initialData = await getStatementServer(item.statement_id);
                const statement = {
                    '_id': item.statement_id,
                    'content': initialData.data_type,
                    'concepts': item.concepts,
                    'authors': item.authors,
                    'name': item.label
                }
                const data = {
                    _id: item.statement_id,
                    article_id: article.article_id,
                    article: article_info,
                    statement: statement
                }
                const { items } = get();
                if (!items.some(i => i._id === data._id)) {
                    set({ items: [...items, data] });
                }
            },
            removeItem: (id) => {
                const { items } = get();
                set({ items: items.filter(item => item._id !== id) });
            },
            clearItems: () => set({ items: [] }),
            isInCart: (id) => {
                const { items } = get();
                return items.some(item => item._id === id);
            }
        }),
        {
            name: 'statement-storage',
            storage: typeof window !== 'undefined' ?
                {
                    getItem: (name) => {
                        const str = localStorage.getItem(name);
                        if (!str) return null;
                        return JSON.parse(str);
                    },
                    setItem: (name, value) => {
                        localStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem: (name) => {
                        localStorage.removeItem(name);
                    },
                } : undefined,
        }
    )
);