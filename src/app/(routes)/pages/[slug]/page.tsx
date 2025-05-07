type Page = {
  id: string;
  title: string;
  content: string;
}
import PocketBase from 'pocketbase';
import { notFound } from 'next/navigation';
import React from 'react';
import RichTextRenderer from './RichTextRenderer';

const pb = new PocketBase(process.env.POCKETBASE_URL);

type Props = {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const decodedUrl = decodeURIComponent(slug);
  try {
    const record = await pb.collection(process.env.POCKETBASE_PAGES || '').getFirstListItem(`url = "${decodedUrl}"`, {
      $autoCancel: false,
    });
    if (!record) {
      console.log('No record found');
      notFound();
    }
    const page = record as unknown as Page;
    return (
      <div className="min-h-[calc(100vh-19.1rem)] container mx-auto px-4 py-8">
        <RichTextRenderer htmlContent={page.content} />
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-[calc(100vh-19.1rem)] container mx-auto px-4 py-8">
        <div className="bg-gray-50 h-[calc(50vh)] flex items-center justify-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-4xl font-bold border-r border-gray-300 pr-6">404</h1>
            <p className="text-lg">This page could not be found.</p>
          </div>
        </div>
      </div>
    );
  }
}