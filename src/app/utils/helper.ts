import { utils, write } from 'xlsx-js-style';
import axios from 'axios';
import { REBORN_URL } from '../lib/config/constants';

interface ResizeOptions {
    name?: string;
    width?: number;
    height?: number;
}

interface ResizeResult {
    success: boolean;
    imagePath?: string;
    error?: string;
}

export const helper = {
    getPredicateStyle: (key: string, original = "", part: "all" | "background" = "all") => {
        const colorMap: ColorMap = {
            'P117001': { backgroundColor: 'bg-red-500', color: 'text-white' },
            'P117002': { backgroundColor: 'bg-red-600', color: 'text-white' },
            'P1005': { backgroundColor: 'bg-red-700', color: 'text-white' },
            'P71164': { backgroundColor: 'bg-cyan-400', color: 'text-white' },
            'P149023': { backgroundColor: 'bg-cyan-500', color: 'text-white' },
            'P71163': { backgroundColor: 'bg-emerald-200', color: 'text-black' },
            'P135054': { backgroundColor: 'bg-yellow-100', color: 'text-black' },
            'P117003': { backgroundColor: 'bg-rose-200', color: 'text-white' },
            'P71162': { backgroundColor: 'bg-purple-500', color: 'text-white' },
            'P1004': { backgroundColor: 'bg-blue-500', color: 'text-white' },
            'P4077': { backgroundColor: 'bg-orange-500', color: 'text-white' },
            'P32': { backgroundColor: 'bg-green-500', color: 'text-white' },
            'PWC_HAS_BENCHMARK': { backgroundColor: 'bg-red-500', color: 'text-white' },
            'P110081': { backgroundColor: 'bg-yellow-400', color: 'text-black' },
            'P135053': { backgroundColor: 'bg-purple-700', color: 'text-white' },
            'P135055': { backgroundColor: 'bg-gray-800', color: 'text-white' },
            'P135056': { backgroundColor: 'bg-gray-500', color: 'text-white' },
            'P4015': { backgroundColor: 'bg-teal-600', color: 'text-white' },
            'P4003': { backgroundColor: 'bg-green-600', color: 'text-white' }
        };

        if (!colorMap[key]) return original;
        return part === "all" ? colorMap[key] : colorMap[key].backgroundColor;
    },
    analyzeJSONStructure: (jsonElement: unknown): string => {
        if (typeof jsonElement !== 'object' || jsonElement === null) {
            return "The input is not a JSON object";
        }

        if (Array.isArray(jsonElement)) {
            if (jsonElement.length === 0) return "Empty array";

            const allObjects = jsonElement.every(item =>
                typeof item === 'object' && item !== null && !Array.isArray(item)
            );

            return allObjects ? "Array of objects" : "Array of mixed types";
        }

        const keys = Object.keys(jsonElement);
        if (keys.length === 0) return "Empty object";

        const allPrimitive = Object.values(jsonElement).every(value =>
            typeof value !== 'object' || value === null
        );

        return allPrimitive ? "Key-value pairs" : "Object with mixed value types";
    },
    filterByStringMatch: (
        variables: any,
        searchTerm: string
    ): any => {
        if (!Array.isArray(variables)) {
            return [];
        }
        if (!searchTerm) return variables;
        const normalizedSearchTerm = searchTerm.toLowerCase();
        return variables.filter((variable: any) => {
            if (!variable.string_match) return false;

            return variable.string_match.some((match: any) =>
                match.toLowerCase() === normalizedSearchTerm
            );
        });
    },
    validURL: (str: string): boolean => {
        if (typeof str !== 'string') return false;

        const urlPattern = new RegExp(
            '^(?:(?:https?|ftp)://)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:[/?#][^\\s]*)?$',
            'i'
        );

        try {
            if (!urlPattern.test(str)) return false;
            new URL(str.startsWith('http') ? str : `http://${str}`);
            return true;
        } catch {
            return false;
        }
    },
    resizeImage: async (imageUrl: string, options: ResizeOptions = {}): Promise<ResizeResult> => {
        if (!helper.validURL(imageUrl)) {
            return {
                success: false,
                error: 'Invalid URL provided'
            };
        }
        try {
            const formattedUrl = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;
            const width = options.width || 1024;
            const height = options.height || 1024;
            const response = await fetch(`${REBORN_URL}/service/resize-image?imageUrl=${formattedUrl}&imageName=${options.name}&width=${width}&height=${height}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to resize image');
            }
            return {
                success: true,
                imagePath: data.imagePath
            };
        } catch (error) {
            console.error('Error resizing image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    },
    isValidImage: async (imageUrl: string): Promise<boolean> => {
        if (!helper.validURL(imageUrl)) return false;

        try {
            const url = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;
            const response = await axios.head(url);
            const contentType = response.headers['content-type'];
            return contentType && contentType.startsWith('image/');
        } catch {
            return false;
        }
    },
    isFileURL: (url: string): FileValidation => {
        const validExtensions = {
            images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
            sourceCode: ['.r', '.py']
        };

        try {
            const urlObject = new URL(url);

            if (!['http:', 'https:'].includes(urlObject.protocol)) {
                return {
                    isValid: false,
                    reason: 'Invalid protocol. URL must use HTTP or HTTPS'
                };
            }

            const pathname = urlObject.pathname.toLowerCase();
            const extension = pathname.substring(pathname.lastIndexOf('.'));
            const isImage = validExtensions.images.includes(extension);
            const isSourceCode = validExtensions.sourceCode.includes(extension);

            if (!isImage && !isSourceCode) {
                return {
                    isValid: true,
                    fileType: 'string',
                    extension
                };
            }

            return {
                isValid: true,
                fileType: isImage ? 'image' : 'sourceCode',
                extension
            };
        } catch {
            return {
                isValid: false,
                reason: 'Invalid URL format'
            };
        }
    },
    getLevelColor: (level: number): string => {
        const colors = [
            'bg-white',
            'bg-gray-50',
            'bg-gray-100',
            'bg-gray-200',
            'bg-gray-300',
            'bg-gray-400',
            'bg-gray-500',
            'bg-gray-600',
            'bg-gray-700',
            'bg-gray-800',
        ];
        return colors[level % colors.length];
    },
    checkType: (key: string, data: any, keyData?: boolean): string | boolean | any => {
        if (!key || !data || !data['@type']) return false;
        let newKey = ''
        let newType = ''
        if (data[data['@type'] + '#' + key] === undefined) {
            newKey = data['@type'].replace('doi:', 'doi:21.T11969/') + '#' + key
            newType = data['@type'].replace('doi:', 'doi:21.T11969/')
        } else {
            newKey = data['@type'] + '#' + key
            newType = data['@type']
        }

        return keyData ? data[newKey] : newKey;
    },
    concepts: (data: any): void => {
        const storedData = localStorage.getItem('concepts');
        let existingConcepts = []
        if (storedData) {
            existingConcepts = JSON.parse(storedData);
        }
        let addedCount = 0;
        data?.forEach((concept: { id: string | number; name: any; }) => {
            if (!existingConcepts[concept.id]) {
                existingConcepts[concept.id] = concept.name;
                addedCount++;
            }
        });
        localStorage.setItem('concepts', JSON.stringify(existingConcepts));
    },
    getArrayFromURL: (param: string): string[] => {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.getAll(param);
    },
    fetchDOIData: async (doi: string): Promise<string | null> => {
        try {
            const encodedDOI = encodeURIComponent(doi);
            const response = await fetch(
                `https://api.datacite.org/dois?query=relatedIdentifiers.relatedIdentifier:${encodedDOI}%20AND%20relatedIdentifiers.relationType:IsVariantFormOf`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch DOI data');
            }
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                return data.data[0].attributes.doi;
            }
            return null;
        } catch (error) {
            console.error('Error fetching DOI data:', error);
            return null;
        }
    },
    convertTableToExcelBuffer: (source_table: any): ArrayBuffer | null => {
        if (!source_table) return null;
        const columns = source_table?.columns?.sort((a: any, b: any) => a.number - b.number) || [];

        const rows = source_table?.rows?.sort((a: any, b: any) => {
            if (!a.number && !b.number) return 0;
            if (!a.number) return 1;
            if (!b.number) return -1;
            return a.number - b.number;
        }) || [];

        const wsData = rows.map((row: { cells: any[]; }) =>
            columns.reduce((acc: any, col: { [x: string]: any; col_titles: any; }) => {
                const cell = row.cells.find(c => c.column === col['@id']);
                return { ...acc, [col.col_titles]: cell?.value || '' };
            }, {})
        );

        const ws = utils.json_to_sheet(wsData);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Data");

        const excelBinaryString = write(wb, { bookType: 'xlsx', type: 'binary' });

        const buffer = new ArrayBuffer(excelBinaryString.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < excelBinaryString.length; i++) {
            view[i] = excelBinaryString.charCodeAt(i) & 0xFF;
        }

        return buffer;
    },
    convertTableToCSV: (source_table: any, delimiter: string = ','): string | null => {
        if (!source_table) return null;
        const columns = source_table?.columns?.sort((a: any, b: any) => a.number - b.number) || [];
        if (columns.length === 0) return null;

        const rows = source_table?.rows?.sort((a: any, b: any) => {
            if (!a.number && !b.number) return 0;
            if (!a.number) return 1;
            if (!b.number) return -1;
            return a.number - b.number;
        }) || [];
        const rowTitles: any[] = rows.map((row: any) => row.row_titles || '').filter((title: any) => title.replace(/\d+/g, '').length > 0);
        const headers = columns.map((col: any) => col.col_titles || '');
        let csvContent = (rowTitles.length === 0 ? '' : ',') + headers.map((header: any) => {
            if (header.includes(delimiter) || header.includes('"') || header.includes('\n')) {
                return `"${header.replace(/"/g, '""')}"`;
            }
            return header;
        }).join(delimiter) + '\n';

        rows.forEach((row: {
            row_titles: string; cells: any[];
        }) => {
            const rowData = columns.map((col: any) => {
                const cell = row.cells.find(c => c.column === col['@id']);
                const value = cell?.value || '';
                if (value.toString().includes(delimiter) || value.toString().includes('"') || value.toString().includes('\n')) {
                    return `"${value.toString().replace(/"/g, '""')}"`;
                }
                return value;
            });
            const row_titles = row.row_titles || '';
            csvContent += (row_titles.replace(/\d+/g, '').length === 0 ? '' : row_titles + ',') + rowData.join(delimiter) + '\n';
        });
        return csvContent;
    },
    convertTableToCSVBlob: (source_table: any, delimiter: string = ','): Blob | null => {
        const csvString = helper.convertTableToCSV(source_table, delimiter);
        if (!csvString) return null;
        return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    },
    extractDOI: (text: string): string | null => {
        const doiMatch = text.match(/\*\*https:\/\/doi\.org\/([^\s\]]+)/);
        return doiMatch ? doiMatch[1] : null;
    },
    formatExecutesText: (
        label: string,
        hasUrl?: string,
        partOfLabel?: string,
        partOfUrl?: string,
        partOfVersion?: string,
        topPartOfLabel?: string,
        topPartOfUrl?: string,
        topPartOfVersion?: string
    ): string => {
        const labelText = hasUrl ? `<a target="_blank" class="underline" href="${hasUrl}">${label}</a>` : label;

        const partOfText = partOfLabel
            ? `of ${partOfUrl ? `<a target="_blank" class="underline" href="${partOfUrl}">` : ''}${partOfLabel}${partOfUrl ? '</a>' : ''} ${partOfVersion ? `(${partOfVersion})` : ''}`
            : '';

        const topPartOfText = topPartOfLabel
            ? `in ${topPartOfUrl ? `<a target="_blank" class="underline" href="${topPartOfUrl}">` : ''}${topPartOfLabel}${topPartOfUrl ? '</a>' : ''} ${topPartOfVersion ? `(${topPartOfVersion})` : ''}`
            : '';

        return `Executes ${labelText} ${partOfText} ${topPartOfText}`.trim();
    },
    formatEvaluatesText: (
        prefix: string,
        label: string,
        seeAlso?: string,
        requires?: any
    ): string => {
        if (seeAlso && !requires) {
            if (seeAlso[0] && !requires) {
                return `${prefix}: <a target="_blank" class="underline" href="${seeAlso}">${label}</a>`;
            }
            return `${prefix}: ${label}`;
        }
        return `${prefix}: ${label}`;
    },
    formatLinkText: (
        prefix: string,
        label: string,
        seeAlso?: string
    ): string => {
        if (!seeAlso) {
            return `${prefix.length ? prefix + ':' : ''} ${label}`;
        }
        return `${prefix}: <a href="${seeAlso}" target="_blank" class="underline" rel="noopener noreferrer">${label}</a>`;
    },
    capitalizeFirstLetter: (val: string): string => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1).toLowerCase();
    },
    findComponentByStringMatch: (components: any, level: string) => {
        return components.find((component: any) =>
            component.stringMatch.includes(level)
        );
    },
    renderIdentifiersComponentList: (identifiers: any) => {
        if (identifiers[0] === undefined) {

        } else {
            identifiers = identifiers[0]
            if (identifiers['type'].find((identifier: string) => identifier === 'Measure') || identifiers['type'].find((identifier: string) => identifier === 'Property')) {
                let text = ``
                let links = ``
                if (identifiers['label'])
                    text = `${text} <span>${helper.cleanString(identifiers['label'])}</span>`
                if (identifiers['exact_match'])
                    if (identifiers['exact_match'][0])
                        links = `${links} <div class='ml-2'><a href=${identifiers['exact_match'][0]} class='underline text-blue-600' target="_blank">${identifiers['exact_match'][0]}</a></div>`
                if (identifiers['close_match'])
                    if (identifiers['close_match'][0])
                        links = `${links} <div class='ml-2'><a href=${identifiers['close_match'][0]} class='underline text-blue-600' target="_blank">${identifiers['close_match'][0]}</a></div>`
                return `${text} ${links === `` ? `` : `<div class='mt-1'>See also ${links}</div>`}`
            }
            let text = ''
            let links = ''
            if (identifiers['operation'] !== undefined) {
                let temp = ''
                if (identifiers['operation'][0]['exact_match'] !== undefined) {
                    if (identifiers['operation'][0]['exact_match'][0]) {
                        temp = identifiers['operation'][0]['exact_match'][0]
                    }
                }
                else if (identifiers['operation'][0]['close_match'] !== undefined) {
                    if (identifiers['operation'][0]['close_match'][0]) {
                        temp = identifiers['operation'][0]['close_match'][0]
                    }
                }
                text = temp.length === 0 ? `<span>${identifiers['operation'][0]['label'][0]}</span>` : `<a href=${temp} class='underline' target="_blank">${identifiers['operation'][0]['label'][0]}</a>`
                links = `<span class='text-black pt-2 block' target="_blank">${identifiers['operation'][0]['label'][0]} (<a href=${temp} class='underline' target="_blank">${temp}</a>)</span>`
            }
            if (identifiers['properties'][0] !== undefined) {
                let temp = ''
                if (identifiers['properties'][0]['exact_match'] !== undefined) {
                    if (identifiers['properties'][0]['exact_match'][0]) {
                        temp = identifiers['properties'][0]['exact_match'][0]
                    }
                }
                else if (identifiers['properties'][0]['close_match'] !== undefined) {
                    if (identifiers['properties'][0]['close_match'][0]) {
                        temp = identifiers['properties'][0]['close_match'][0]
                    }
                }
                text = text + (text === '' ? '' : ' of ') + (temp.length === 0 ? `<span>${identifiers['properties'][0]['label'][0]}</span>` : `<a href=${temp} class='underline' target="_blank">${identifiers['properties'][0]['label'][0]}</a>`)
                links = links + (links === '' ? '' : '') + `<span class='text-black pt-2 block' target="_blank">${identifiers['properties'][0]['label'][0]} (<a href=${temp} class='underline' target="_blank">${temp}</a>)</span>`
            }
            if (identifiers['object_of_interests'][0] !== undefined) {
                let temp = ''
                if (identifiers['object_of_interests'][0]['exact_match'] !== undefined) {
                    if (identifiers['object_of_interests'][0]['exact_match'][0]) {
                        temp = identifiers['object_of_interests'][0]['exact_match'][0]
                    }
                }
                else if (identifiers['object_of_interests'][0]['close_match'] !== undefined) {
                    if (identifiers['object_of_interests'][0]['close_match'][0]) {
                        temp = identifiers['object_of_interests'][0]['close_match'][0]
                    }
                }
                text = text + (text === '' ? '' : ' of ') + (temp.length === 0 ? `<span>${identifiers['object_of_interests'][0]['label'][0]}</span>` : `<a href=${temp} class='underline' target="_blank">${identifiers['object_of_interests'][0]['label'][0]}</a>`)
                links = links + (links === '' ? '' : '') + `<span class='text-black pt-2 block' target="_blank">${identifiers['object_of_interests'][0]['label'][0]} (<a href=${temp} class='underline' target="_blank">${temp}</a>)</span>`
            }

            if (identifiers['label'][0] !== undefined) {
                if (identifiers['exact_match'] !== undefined) {
                    if (identifiers['exact_match'][0]) {
                        text = text + (text === '' ? '' : ' in ') + `<a href=${identifiers['exact_match'][0]} class='underline' target="_blank">${identifiers['label'][0]}</a>`
                    } else {
                        text = text + (text === '' ? '' : ' in ') + `<span>${identifiers['label'][0]}</span>`
                    }
                } else if (identifiers['close_match'] !== undefined) {
                    if (identifiers['close_match'][0]) {
                        text = text + (text === '' ? '' : ' in ') + `<a href=${identifiers['close_match'][0]} class='underline' target="_blank">${identifiers['label'][0]}</a>`
                    } else {
                        text = text + (text === '' ? '' : ' in ') + `<span>${identifiers['label'][0]}</span>`
                    }
                } else {
                    text = text + (text === '' ? '' : ' in ') + `<span>${identifiers['label'][0]}</span>`
                }
            }

            if (identifiers['matrices'][0] !== undefined) {
                let temp = ''
                if (identifiers['matrices'][0]['exact_match'] !== undefined) {
                    if (identifiers['matrices'][0]['exact_match'][0]) {
                        temp = identifiers['matrices'][0]['exact_match'][0]
                    }
                }
                else if (identifiers['matrices'][0]['close_match'] !== undefined) {
                    if (identifiers['matrices'][0]['close_match'][0]) {
                        temp = identifiers['matrices'][0]['close_match'][0]
                    }
                }
                text = text + (text === '' ? '' : ' in ') + (temp.length === 0 ? `<span>${identifiers['matrices'][0]['label'][0]}</span>` : `<a href=${temp} class='underline' target="_blank">${identifiers['matrices'][0]['label'][0]}</a>`)
                links = links + (links === '' ? '' : '') + `<span class='text-black pt-2 block' target="_blank">${identifiers['matrices'][0]['label'][0]} (<a href=${temp} class='underline' target="_blank">${temp}</a>)</span>`
            }

            if (identifiers['units'][0] !== undefined) {
                let temp = ''
                if (identifiers['units'][0]['exact_match'] !== undefined) {
                    if (identifiers['units'][0]['exact_match'][0]) {
                        temp = identifiers['units'][0]['exact_match'][0]
                    }
                } else if (identifiers['units'][0]['close_match'] !== undefined) {
                    if (identifiers['units'][0]['close_match'][0]) {
                        temp = identifiers['units'][0]['close_match'][0]
                    }
                }
                text = text + (text === '' ? '' : ' ') + (temp.length === 0 ? `[<span>${identifiers['units'][0]['label'][0]}</span>]` : `[<a href=${temp} class='underline' target="_blank">${identifiers['units'][0]['label'][0]}</a>]`)
                links = links + (links === '' ? '' : ' ') + `<span class='text-black pt-2 block' target="_blank">${identifiers['units'][0]['label'][0]} (<a href=${temp} class='underline' target="_blank">${temp}</a>)</span>`
            }
            return text
        }
    },
    cleanFirstLetter: (val: string): string => {
        return String(val).replace('_', ' ');
    },
    cleanString: (val: string): string => {
        return String(val).replace(/[\[\]']/g, '');
    },
    newGetLevelColor: (color: string, level: number): string => {
        const opacityMap: Record<number, string> = {
            0: 'opacity-5',
            1: 'opacity-10',
            2: 'opacity-20',
            3: 'opacity-30',
            4: 'opacity-40',
            5: 'opacity-50',
            6: 'opacity-60',
            7: 'opacity-70',
            8: 'opacity-80',
            9: 'opacity-90',
        };

        return `${color} ${opacityMap[level] || 'opacity-10'}`;
    }
};
