import React from 'react';
import { helper } from '@/app/utils/helper';
import { Metadata } from 'next';
import { getStatementServer } from '@/app/lib/api/server-side';
import PageClient from './PageClient';
import { REBORN_URL } from '@/app/lib/config/constants';
import fs from 'fs';
import path from 'path';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getStatementServer(id);

  if (!data || !data.content) {
    return {
      title: 'Statement Not Found',
      description: 'The requested scientific statement could not be found',
    };
  }
  let statements = data.content;
  statements = Object.values(data.content)[0]
  const statement = statements.find((item: any) => item._id === id);
  const abstract = statement.article.abstract;
  const title = `${statement.supports?.[0]?.notation?.label ||
    statement.name ||
    'Scientific Statement - TIB Knowledge Loom'}`;
  let description = '';
  if (abstract) {
    description = abstract.substring(0, 197) + '...';
  } else if (statement.supports?.[0]?.notation?.label) {
    description = `Scientific statement: ${statement.supports[0].notation.label}`;
  } else {
    description = 'View this scientific statement on TIB Knowledge Loom';
  }
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const fullPath = path.join(uploadDir, `statement-${id}.jpg`)
  let imageUrl = `${REBORN_URL}/logo.jpg`;
  if (!fs.existsSync(fullPath)) {
    if (statement.content) {
      const has_parts = helper.checkType('has_part', statement.content, true);
      const iterableParts = Array.isArray(has_parts) ? has_parts : [has_parts];
      for (const has_part of iterableParts) {
        const hasOutput = helper.checkType('has_output', has_part, true);
        if (hasOutput) {
          const iterableHasOutput = Array.isArray(hasOutput) ? hasOutput : [hasOutput];
          for (const _hasOutput of iterableHasOutput) {
            const hasExpression = helper.checkType('has_expression', _hasOutput, true);
            if (hasExpression) {
              const sourceUrl = hasExpression[`${hasExpression['@type']}#source_url`];
              if (sourceUrl && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(sourceUrl)) {
                const result = await helper.resizeImage(sourceUrl, {
                  name: `statement-${id}`,
                  width: 1024,
                  height: 1024
                });
                imageUrl = `${REBORN_URL}` + result.imagePath;
                break
              }
            }
          }
        }
        if (imageUrl !== `${REBORN_URL}/logo.jpg`)
          break
      }
      if (imageUrl === `${REBORN_URL}/logo.jpg`) {
        const has_parts = helper.checkType('has_part', statement.content, true);
        const iterableParts = Array.isArray(has_parts) ? has_parts : [has_parts];
        for (const has_part of iterableParts) {
          const hasInput = helper.checkType('has_input', has_part, true);
          if (hasInput) {
            const iterableHasInput = Array.isArray(hasInput) ? hasInput : [hasInput];
            for (const _hasInput of iterableHasInput) {
              const hasExpression = helper.checkType('has_expression', hasInput, true);
              if (hasExpression) {
                const sourceUrl = hasExpression[`${hasExpression['@type']}#source_url`];
                if (sourceUrl && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(sourceUrl)) {
                  const result = await helper.resizeImage(sourceUrl, {
                    name: `statement-${id}`,
                    width: 1024,
                    height: 1024
                  });
                  imageUrl = `${REBORN_URL}` + result.imagePath;
                  break
                }
              }
            }
            if (imageUrl !== `${REBORN_URL}/logo.jpg`)
              break
          }
        }
      }
    }
  } else {
    imageUrl = `${REBORN_URL}/uploads/statement-${id}.jpg`
  }

  const authors = statement.supports?.[0]?.author?.map((author: any) => ({
    givenName: author.givenName,
    familyName: author.familyName
  })) || [];
  const tags = statement.supports?.[0]?.notation?.concept?.map((concept: any) =>
    concept.label
  ) || [];

  return {
    title: title,
    description,
    openGraph: {
      title: `TIB Knowledge Loom: ${title}`,
      description,
      url: `${REBORN_URL}/statement/${id}`,
      type: 'article',
      authors,
      tags,
      images: [{ url: imageUrl }],
    },
  };
}

export default async function StatementPage({ params }: Props) {
  const { id } = await params;
  return <PageClient id={id} />;
}