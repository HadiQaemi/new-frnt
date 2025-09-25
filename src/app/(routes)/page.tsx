import PageClient from './PageClient';
import { InitialParams, ResourceType, SearchType, SortBy, SortOrder } from '../components/json/types';

type Q = Record<string, string | string[] | undefined>;

function toArray(v: Q[keyof Q]) {
  if (Array.isArray(v)) return v.filter(Boolean) as string[];
  if (typeof v === 'string' && v) return [v];
  return [];
}

function clampYear(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  if (Number.isFinite(n)) return Math.min(2025, Math.max(2000, n));
  return fallback;
}
function isResourceType(x: unknown): x is ResourceType {
  return x === 'article' || x === 'dataset' || x === 'loom' || x === 'all';
}
function isSearchType(x: unknown): x is SearchType {
  return x === 'keyword' || x === 'semantic' || x === 'hybrid';
}
function isSortBy(x: unknown): x is SortBy {
  return x === 'alphabet' || x === 'time';
}
function isSortOrder(x: unknown): x is SortOrder {
  return x === 'ASC' || x === 'DESC';
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const rtRaw = Array.isArray(sp.resource_type) ? sp.resource_type[0] : sp.resource_type;
  const stRaw = Array.isArray(sp.search_type) ? sp.search_type[0] : sp.search_type;
  const sbRaw = Array.isArray(sp.sort_by) ? sp.sort_by[0] : sp.sort_by;
  const soRaw = Array.isArray(sp.sort_order) ? sp.sort_order[0] : sp.sort_order;

  const parsed: InitialParams = {
    title: typeof sp.title === 'string' ? sp.title.trim() : undefined,
    start_year: clampYear(typeof sp.start_year === 'string' ? sp.start_year : undefined, 2015),
    end_year: clampYear(typeof sp.end_year === 'string' ? sp.end_year : undefined, 2025),
    page: Math.max(1, Number(sp.page) || 1),
    per_page: Math.min(100, Math.max(1, Number(sp.per_page) || 10)),
    resource_type: isResourceType(rtRaw) ? rtRaw : 'loom',
    sort_by: isSortBy(sbRaw) ? sbRaw : 'alphabet',
    sort_order: isSortOrder(soRaw) ? soRaw : 'ASC',
    search_type: isSearchType(stRaw) ? stRaw : 'keyword',
    authors: toArray(sp.authors),
    scientific_venues: toArray(sp.scientific_venues),
    research_fields: toArray(sp.research_fields),
    concepts: toArray(sp.concepts),
  };

  return <PageClient initialParams={parsed} />;
}
