
import { getPaperServer } from '@/app/lib/api/server-side';
import { Metadata } from 'next';
import PageClient from './PageClient';
import { helper } from '@/app/utils/helper';
import { REBORN_URL } from '@/app/lib/config/constants';
import fs from 'fs';
import path from 'path';
type Props = {
  params: Promise<{
    id: string;
  }>;
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { id } = await params;
//   const data = await getPaperServer(id);

//   if (!data || !data.article) {
//     return {
//       title: 'Article Not Found',
//       description: 'The requested scientific article could not be found',
//     };
//   }
//   let paper = data.article

//   const authors = paper.authors ? paper.authors.map((author: any) => ({
//     givenName: author.givenName,
//     familyName: author.familyName
//   })) : [];

//   const tags = [];
//   if (paper.research_fields) {
//     if (Array.isArray(paper.research_fields)) {
//       tags.push(...paper.research_fields.map((field: any) => field.label));
//     } else if (paper.research_fields.label) {
//       tags.push(paper.research_fields.label);
//     }
//   }

//   const title = paper.name || 'Article - ORKG reborn';
//   const description = paper.abstract
//     ? (paper.abstract.length > 200 ? paper.abstract.substring(0, 197) + '...' : paper.abstract)
//     : 'Scientific article on ORKG reborn';

//   const uploadDir = path.join(process.cwd(), 'public', 'uploads');
//   const fullPath = path.join(uploadDir, `article-${id}.jpg`)
//   let imageUrl = `${REBORN_URL}/logo.jpg`;
//   if (!fs.existsSync(fullPath)) {
//     // for (const paper of papers) {
//     const statement = paper
//     if (statement.content) {
//       // const has_parts = helper.checkType('has_part', statement.content, true);
//       // const iterableParts = Array.isArray(has_parts) ? has_parts : [has_parts];
//       // for (const has_part of iterableParts) {
//       //   const hasOutput = helper.checkType('has_output', has_part, true);
//       //   if (hasOutput) {
//       //     const hasExpression = helper.checkType('has_expression', hasOutput, true);
//       //     if (hasExpression) {
//       //       const sourceUrl = hasExpression[`${hasExpression['@type']}#source_url`];
//       //       if (sourceUrl && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(sourceUrl)) {
//       //         const result = await helper.resizeImage(sourceUrl, {
//       //           name: `article-${id}`,
//       //           width: 1024,
//       //           height: 1024
//       //         });
//       //         imageUrl = `${REBORN_URL}` + result.imagePath;
//       //         break
//       //       }
//       //     }
//       //   }
//       // }
//       // if (imageUrl === `${REBORN_URL}/logo.jpg`) {
//       //   const has_parts = helper.checkType('has_part', statement.content, true);
//       //   const iterableParts = Array.isArray(has_parts) ? has_parts : [has_parts];
//       //   for (const has_part of iterableParts) {
//       //     const hasInput = helper.checkType('has_input', has_part, true);
//       //     if (hasInput) {
//       //       const hasExpression = helper.checkType('has_expression', hasInput, true);
//       //       if (hasExpression) {
//       //         const sourceUrl = hasExpression[`${hasExpression['@type']}#source_url`];
//       //         if (sourceUrl && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(sourceUrl)) {
//       //           const result = await helper.resizeImage(sourceUrl, {
//       //             name: `article-${id}`,
//       //             width: 1024,
//       //             height: 1024
//       //           });
//       //           imageUrl = `${REBORN_URL}` + result.imagePath;
//       //           break
//       //         }
//       //       }
//       //     }
//       //   }
//       // }
//       // if (imageUrl !== `${REBORN_URL}/logo.jpg`)
//       //   break
//     }
//     // }
//   } else {
//     imageUrl = `${REBORN_URL}/uploads/article-${id}.jpg`
//   }

//   return {
//     title: title,
//     description,
//     openGraph: {
//       title: `ORKG reborn: ${title}`,
//       description,
//       url: paper.rebornDOI || `${REBORN_URL}/article/${id}`,
//       type: 'article',
//       authors,
//       tags,
//       publishedTime: paper.articleDatePublished,
//       images: [{ url: imageUrl }],
//     },
//   };
// }

export default async function PaperPage({ params }: Props) {
  const { id } = await params;
  const initialData = await getPaperServer(id);
  return <PageClient initialData={initialData} id={id} />;
}