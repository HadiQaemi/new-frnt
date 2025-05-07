import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTypeFromStorage } from '../components/json/utils/storage';

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
    addItem: (item: Statement) => void;
    removeItem: (id: string) => void;
    clearItems: () => void;
    isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item: any) => {
                const authors = item.article.authors.map((author: any) => {
                    return {
                        name: `${author.givenName} ${author.familyName}`,
                        id: author['@id']
                    }
                })
                const article = {
                    'abstract': item.article.abstract,
                    'articleDatePublished': item.article.articleDatePublished,
                    'authors': authors,
                    'id': item.article.id,
                    'doi': item.article.doi,
                    'rebornDOI': item.article.rebornDOI,
                    'rebornDatePublished': item.article.rebornDatePublished,
                    'name': item.article.name,
                    'journal': {
                        'label': item.article.journal ? item.article.journal.label : item.article.conference.label,
                        'id': item.article.journal ? item.article.journal['@id'] : item.article.conference['@id'],
                    },
                }
                const statement = {
                    '_id': item._id,
                    'content': item.content,
                    'name': item.supports[0].notation.label
                }
                const data = {
                    _id: item._id,
                    article_id: item.article.id,
                    article: article,
                    statement: statement
                }

                const nodeKey = item.content['@type'].replace('doi:', '').replace('21.T11969/', '');
                const cachedTypeInfo = getTypeFromStorage(nodeKey);
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