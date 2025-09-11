import React from 'react';
import { getInsightServer } from '@/app/lib/api/server-side';
import PageClient from './PageClient';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function InsightPage({ }: Props) {
  let initialData = null;

  try {
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE !== 'phase-production-build') {
      initialData = await getInsightServer();
    }
  } catch (error) {
    console.log('Failed to fetch initial data during build, will fetch client-side:', error);
    initialData = null;
  }

  return <PageClient initialData={initialData} />;
}