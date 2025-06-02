export interface HasCharacteristic {
    number_of_columns?: number;
    number_of_rows?: number;
}

export interface HasPart {
    label: string;
    see_also?: string;
}

export interface HasExpression {
    '@type': string;
    'has_expression#source_url'?: string;
}

'use client';

import { helper } from '@/app/utils/helper';
import React, { useState } from 'react';
import URLOrText from '../../shared/URLOrText';
import JsonTable from '../JsonTable';
import ImagePreview from '../../shared/ImagePreview';
interface HasOutput {
    has_output?: any;
    label?: any;
    statement?: any;
}
const HasOutput: React.FC<HasOutput> = ({ has_output, label, statement }) => {
    const [showTextField, setShowTextField] = useState(false);
    const [textFieldValue, setTextFieldValue] = useState('');
    const [apiResponse, setApiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const source_table = has_output['source_table'];
    const has_expressions = has_output['has_expressions'];
    const has_part = has_output['has_part'];
    const source_url = has_output['source_url'];
    const comment = has_output['comment'];
    const has_characteristic = has_output['has_characteristic'];

    let character = '';
    if (has_characteristic) {
        const number_of_columns = has_characteristic['number_rows'];
        const number_of_rows = has_characteristic['number_columns'];
        if (number_of_columns && number_of_rows) {
            character = `Size: ${number_of_rows} x ${number_of_columns}`;
        }
    }

    let source_url_has_expressions = null;
    let title_has_expressions = null;
    if (has_expressions) {
        source_url_has_expressions = has_expressions['source_url'];
        title_has_expressions = has_expressions['label'];
    }

    const comps: Record<string, string> = {};
    let components = 'Components: ';

    if (has_part) {
        Object.entries(has_part).map(([key, value]) => (
            components = helper.checkType("see_also", value, true) ?
                `${components}${key === '0' ? '' : ','} <a target="_blank" href="${helper.checkType("see_also", value, true)}">${helper.checkType("label", value, true)}</a>` :
                `${components}${key === '0' ? '' : ','} ${helper.checkType("label", value, true)}`
        ))
        Object.entries(has_part).map(([key, value]) => (
            comps[helper.checkType("label", value, true)] = helper.checkType("see_also", value, true)
        ))
    }

    const toggleTextField = () => {
        setShowTextField(!showTextField);
        if (showTextField) {
            setApiResponse('');
            setError('');
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextFieldValue(e.target.value);
    };

    const sendQuestion = async () => {
        if (!textFieldValue.trim()) {
            setError('Please enter a question');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/ask-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: textFieldValue }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setApiResponse(data.answer || JSON.stringify(data));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get answer');
            console.error('Error sending question:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {label && (
                <URLOrText button="Output data" color="#00b050" content={label} />
            )}
            {source_url && (
                <URLOrText button={label ? '' : 'Output data'} color="#00b050" content={source_url} />
            )}
            {character && (
                <URLOrText
                    button={!label && !source_url ? 'Output data' : ''}
                    color="#00b050"
                    content={character}
                />
            )}
            {comment && (
                <URLOrText
                    button={!label && !source_url && !character ? 'Output data' : ''}
                    color="#00b050"
                    content={comment}
                />
            )}
            {components !== 'Components: ' && !source_table && (
                <URLOrText color="#00b050" content={components} />
            )}
            {source_table && (
                <>
                    {/* <div className="flex items-center space-x-2 mb-2">
                        <button
                            onClick={toggleTextField}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                        >
                            {showTextField ? 'Hide Question' : 'Send Question'}
                        </button>
                    </div>
                    {showTextField && (
                        <div className="mt-2 space-y-2 mb-2">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={textFieldValue}
                                    onChange={handleTextChange}
                                    className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your question here..."
                                />
                                <button
                                    onClick={sendQuestion}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none disabled:bg-gray-400"
                                >
                                    {isLoading ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}
                            {apiResponse && (
                                <div className="mt-4 p-4 bg-gray-50 border rounded shadow-sm">
                                    <h3 className="font-medium mb-2">Answer:</h3>
                                    <div dangerouslySetInnerHTML={{ __html: apiResponse }} />
                                </div>
                            )}
                        </div>
                    )} */}
                    <JsonTable Components={statement} data={source_table} color="#00b050" />
                </>
            )}
            {has_expressions?.map((type: any) => {
                return <span key={type}>
                    {type['label'] && (<URLOrText color="#00b050" content={type['label'].replace(/\/\//g, "<br>")} />)}
                    <ImagePreview
                        src={type['source_url']}
                        alt=""
                        className="max-w-4xl max-h-[30rem] w-[100%] mx-5 border border-gray-400 my-5 mx-auto rounded"
                    />
                </span>
            })}
        </div>
    );
};

export default HasOutput;