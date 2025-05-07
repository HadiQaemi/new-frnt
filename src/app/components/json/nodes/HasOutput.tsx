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
import React from 'react';
import URLOrText from '../../shared/URLOrText';
import JsonTable from '../JsonTable';
import ImagePreview from '../../shared/ImagePreview';
interface HasOutput {
    has_output?: any;
    label?: any;
    statement?: any;
}
const HasOutput: React.FC<HasOutput> = ({ has_output, label, statement }) => {
    const source_table = has_output['source_table'];
    const has_expressions = has_output['has_expressions'];
    const has_part = has_output['has_part'];
    const source_url = has_output['source_url'];
    const comment = has_output['comment'];
    const has_characteristic = has_output['has_characteristic'];

    console.log("has_characteristic")
    console.log(has_characteristic)
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
                <JsonTable Components={statement} data={source_table} color="#00b050" />
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