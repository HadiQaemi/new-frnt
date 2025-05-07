'use client';

import React, { useState } from 'react';
import { FileArchive, X, Download, Trash2 } from 'lucide-react';
import { useCartStore } from '@/app/stores/cartStore';
import { useToast } from '@/components/ui/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getTypeFromStorage, saveTypeToStorage } from '../json/utils/storage';
import { TypeInfo } from '../json/types';
import { helper } from '@/app/utils/helper';
import { REBORN_URL } from '@/app/lib/config/constants';

const CartComponent: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { items, removeItem, clearItems } = useCartStore();
    const { toast } = useToast();

    const toggleCart = () => {
        setIsOpen(!isOpen);
    };

    const handleRemoveItem = (id: string) => {
        removeItem(id);
        toast({
            title: 'Item removed',
            description: 'Statement has been removed from your list',
            className: 'bg-yellow-100',
        });
    };

    const handleClearCart = () => {
        clearItems();
        toast({
            title: 'List cleared',
            description: 'All statements have been removed from your list',
            className: 'bg-yellow-100',
        });
    };

    const getContentType = (filename: string): string | null => {
        const extension = filename.split('.').pop()?.toLowerCase();
        if (!extension) return null;

        const contentTypes: { [key: string]: string } = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            'py': 'text/x-python',
            'r': 'text/x-r',
            'txt': 'text/plain',
            'json': 'application/json',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'xml': 'application/xml',
            'pdf': 'application/pdf'
        };

        return contentTypes[extension] || null;
    };

    const getFileTypeFromUrl = (url: string): string => {
        try {
            const urlObj = new URL(url);
            let filename = urlObj.pathname.split('/').pop() || 'file';
            filename = filename.split('?')[0];
            return `${filename.split('.').pop()}`;
        } catch (error) {
            console.error('Error parsing URL:', error);
            return `file_${Date.now()}`;
        }
    };

    const downloadAndAddToZip = async (url: any, zipFolder: any, filename: any) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                redirect: 'follow',
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }
            const fileData = await response.arrayBuffer();
            zipFolder.file(filename, fileData);
            return true;
        } catch (error) {
            console.error(`Error downloading file from ${url}:`, error);
            return false;
        }
    };

    const downloadStatements = async () => {
        try {
            const zip = new JSZip();
            let statement_article: { [key: string]: any } = {};
            items.forEach(item => {
                const article_id = item.article_id || 'unknown_article';

                if (!statement_article[article_id]) {
                    statement_article[article_id] = {
                        article_id: article_id,
                        article: item.article || {},
                        statements: [item.statement || item]
                    };
                } else {
                    statement_article[article_id].statements.push(item.statement || item);
                }
            });
            const groupedArticles: any[] = Object.values(statement_article);

            for (const group of groupedArticles) {
                const article = group.article;
                let folderName = 'unknown_author';
                let year = 'unknownYear';
                if (article.articleDatePublished) {
                    const match = article.articleDatePublished.match(/\d{4}/);
                    if (match) year = match[0];
                }

                if (article.authors && article.authors.length > 0) {
                    const firstAuthor = article.authors[0];
                    const lastName = firstAuthor.name;

                    if (lastName) {
                        folderName = `${lastName}_${year}`;
                    }
                }

                folderName = folderName.replace(/[^a-zA-Z0-9_-]/g, '_');
                const articleFolder = zip.folder(folderName);
                if (!articleFolder) {
                    throw new Error(`Failed to create folder: ${folderName}`);
                }
                const article_metadata = generateArticleMetadata(article)
                articleFolder.file(`${folderName}_Metadata.txt`, article_metadata);

                for (const [statementIndex, statement] of group.statements.entries()) {
                    const statement_metadata = article_metadata + '\n' +
                        `Statement: ${statement.name}\n` +
                        `ORKG: ${REBORN_URL}/statement/${statement._id}`
                    const statementName = `${folderName}_${statementIndex + 1}`;
                    const statementFolder = articleFolder.folder(statementName);
                    statementFolder?.file(`${statementName}_Metadata.txt`, statement_metadata);
                    const nodeKey = statement.content['@type']
                        .replace('doi:', '')
                        .replace('21.T11969/', '');

                    const cachedTypeInfo: TypeInfo = getTypeFromStorage(nodeKey)!;
                    let source_code = "";

                    for (const property of cachedTypeInfo.properties) {
                        if (property === 'is_implemented_by') {
                            const URL_code = helper.checkType(property, statement.content, true);
                            const source_code_type = getFileTypeFromUrl(URL_code);
                            if (source_code_type.length < 3) {
                                const response = await fetch(URL_code);
                                source_code = await response.text();
                                statementFolder?.file(`${statementName}_Implementation_1.${source_code_type}`, source_code);
                            }
                        }
                        if (property === 'has_part') {
                            const has_parts = helper.checkType(property, statement.content, true);
                            let has_partIndex = 0
                            const iterableParts = Array.isArray(has_parts) ? has_parts : [has_parts];
                            for (const has_part of iterableParts) {
                                const HasPartName = `${statementName}_${++has_partIndex}`;
                                const HasPartFolder = statementFolder?.folder(HasPartName);
                                const nodeKey = has_part['@type'].replace('doi:', '').replace('21.T11969/', '')
                                let hasPartTypeInfo: TypeInfo = getTypeFromStorage(nodeKey)!;
                                if (!hasPartTypeInfo) {
                                    const response = await fetch(`/service/type-info?key=${encodeURIComponent(nodeKey)}`);
                                    if (!response.ok) {
                                        throw new Error(`API error: ${response.status}`);
                                    }
                                    const fetchedTypeInfo = await response.json();
                                    if (fetchedTypeInfo.error) {
                                        throw new Error(fetchedTypeInfo.error);
                                    }

                                    saveTypeToStorage(nodeKey, fetchedTypeInfo);
                                    hasPartTypeInfo = getTypeFromStorage(nodeKey)!;
                                }
                                for (const property of hasPartTypeInfo.properties) {
                                    if (property === 'label') {
                                        const label = helper.checkType(property, has_part, true);
                                        if (label) {
                                            const name = hasPartTypeInfo.name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toLowerCase())
                                            const HasPartMetadata = statement_metadata + '\n\n' +
                                                `${name[0].toUpperCase() + name.slice(1)}: ${label}\n`
                                            HasPartFolder?.file(`${HasPartName}_Metadata.txt`, HasPartMetadata);
                                        }
                                    }
                                    if (property === 'has_input') {
                                        const has_input = helper.checkType(property, has_part, true);
                                        const has_expression = helper.checkType("has_expression", has_input, true);
                                        const source_url = helper.checkType("source_url", has_expression, true);
                                        if (source_url) {
                                            const file_type = getFileTypeFromUrl(source_url);
                                            await downloadAndAddToZip(source_url, HasPartFolder, `${HasPartName}_Input_Figure_1.${file_type}`)
                                        }
                                        const source_table = helper.checkType('source_table', has_input, true);
                                        if (source_table) {
                                            const buffer = helper.convertTableToCSVBlob(source_table)
                                            if (buffer) {
                                                HasPartFolder?.file(`${HasPartName}_Input_Data_1.csv`, buffer);
                                            }
                                        }
                                    }
                                    if (property === 'has_output') {
                                        const has_output = helper.checkType(property, has_part, true);
                                        const has_expression = helper.checkType("has_expression", has_output, true);
                                        const source_url = helper.checkType("source_url", has_expression, true);
                                        if (source_url) {
                                            const file_type = getFileTypeFromUrl(source_url);
                                            await downloadAndAddToZip(source_url, HasPartFolder, `${HasPartName}_Output_Figure_1.${file_type}`)
                                        }
                                        const source_table = helper.checkType('source_table', has_output, true);
                                        if (source_table) {
                                            const buffer = helper.convertTableToCSVBlob(source_table)
                                            if (buffer) {
                                                HasPartFolder?.file(`${HasPartName}_Output_Data_1.csv`, buffer);
                                            }
                                        }
                                    }
                                }
                                const label = helper.checkType("label", has_part, true);
                            }
                        }
                    }
                };
            };

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, 'orkg_statements.zip');

            toast({
                title: 'Download complete',
                description: `${items.length} statements across ${groupedArticles.length} articles have been downloaded`,
                className: 'bg-green-100',
            });
        } catch (error) {
            console.error('Error creating zip file:', error);
            toast({
                title: 'Download failed',
                description: 'There was an error creating the zip file',
                className: 'bg-red-100',
            });
        }
    };

    const generateArticleMetadata = (article: any): string => {
        let text = '';

        text += `Title: ${article.name || 'Unnamed article'}\n`;

        if (article.authors && article.authors.length > 0) {
            text += 'Authors: ';
            article.authors.forEach((author: any, index: number) => {
                const authorName = author.name;
                text += `${index > 0 ? `, ` : ``}${authorName}`;
            });
            text += '\n';
        }

        if (article.articleDatePublished) {
            text += `Publication year: ${article.articleDatePublished}\n`;
        }

        if (article.journal || article.conference) {
            const venue = article.journal || article.conference;
            text += `Journal: ${venue.label}\n`;
        }

        if (article.doi) {
            text += `DOI: ${article.doi}\n`;
        }

        if (article.rebornDOI) {
            text += `ORKG: ${article.rebornDOI}\n`;
        }

        return text;
    };
    items.sort((a: any, b: any) => a.article_id.localeCompare(b.article_id));
    let statement_article: { [key: string]: any } = {}

    items.map((item) => {
        if (!statement_article[item.article_id]) {
            statement_article[item.article_id] = {
                article_id: item.article_id,
                article_name: `${item.article?.name} ...`,
                statements: [{
                    id: item._id,
                    name: item.statement?.name,
                }]
            };
        } else {
            statement_article[item.article_id].statements.push({
                id: item._id,
                name: item.statement?.name,
            });
        }
    })
    const groupedArticles: any[] = [];
    for (const key in statement_article) {
        groupedArticles.push(statement_article[key]);
    }
    return (
        <div className="relative z-50">
            <button
                onClick={toggleCart}
                className="fixed bottom-6 right-6 p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors text-white"
                aria-label="Shopping Cart"
            >
                <FileArchive className="h-6 w-6" />
                {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {items.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end">
                    <div className="w-full max-w-md bg-white h-full overflow-auto animate-slide-in-right">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-semibold">Statements ({items.length})</h2>
                            <button onClick={toggleCart}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            {items.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FileArchive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>Your list is empty</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex justify-between">
                                        <button
                                            onClick={downloadStatements}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download All
                                        </button>
                                        <button
                                            onClick={handleClearCart}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Clear All
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {groupedArticles.map((item: any) => {
                                            return (
                                                <div key={item.article_id} className={`border rounded-t-md`}>
                                                    <div className="p-2 bg-gray-100 hover:bg-gray-100 transition-colors mb-[10px]">
                                                        <div className="flex-1">
                                                            <p className="text-justify text-xs leading-[20px]">{item?.article_name}</p>
                                                        </div>
                                                    </div>
                                                    {item.statements.map((statement: any) => (
                                                        <div key={statement.id} className="flex justify-between items-start p-2 pr-1">
                                                            <div className="flex-1">
                                                                <p className="text-justify text-xs leading-[15px]">{statement.name}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveItem(statement.id)}
                                                                className="text-red-500 hover:text-red-700 pl-1"
                                                                aria-label="Remove item"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        })}

                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartComponent;