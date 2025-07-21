import React from 'react';
import { getInsightServer } from '@/app/lib/api/server-side';
import PageClient from './PageClient';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StatementPage({}: Props) {
  const initialData = await getInsightServer();
  return <PageClient initialData={initialData} />;
}