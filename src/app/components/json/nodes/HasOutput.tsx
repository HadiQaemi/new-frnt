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
import CustomPopover from '../../shared/CustomPopover';
import { nanoid } from 'nanoid';
import { usePopoverManager } from '@/app/hooks/usePopoverManager';
interface HasOutput {
    has_output?: any;
    label?: any;
    components?: any;
}
const HasOutput: React.FC<HasOutput> = ({ has_output, label, components }) => {
    const source_table = has_output['source_table'];
    const has_expressions = has_output['has_expressions'];
    const has_parts = has_output['has_parts'];
    const source_url = has_output['source_url'];
    const comment = has_output['comment'];
    const has_characteristic = has_output['has_characteristic'];

    let character = '';
    if (has_characteristic) {
        const number_of_columns = has_characteristic['number_rows'];
        const number_of_rows = has_characteristic['number_columns'];
        if (number_of_columns && number_of_rows) {
            character = `${number_of_columns} x ${number_of_rows}`;
        }
    }

    let source_url_has_expressions = null;
    let title_has_expressions = null;
    if (has_expressions) {
        source_url_has_expressions = has_expressions['source_url'];
        title_has_expressions = has_expressions['label'];
    }
    const { activePopover, handlePopoverToggle } = usePopoverManager()

    return (
        <div>
            {label && (
                <div className='flex text-sm font-thin my-[5px]'>
                    <URLOrText button="Output data" color="#00b050" content={label} />
                </div>
            )}
            {source_url && (
                <div className='flex text-sm font-thin my-[5px]'>
                    <URLOrText button={label ? '' : 'Output data'} color="#00b050" content={source_url} />
                </div>
            )}
            {character && (
                <div className='flex text-sm font-thin my-[5px]'>
                    <span className="mr-1">Size:</span>
                    <URLOrText
                        button={!label && !source_url ? 'Output data' : ''}
                        color="#00b050"
                        content={character}
                    />
                </div>
            )}
            {comment && (
                <div className='flex text-sm font-thin my-[5px]'>
                    <URLOrText
                        button={!label && !source_url && !character ? 'Output data' : ''}
                        color="#00b050"
                        content={comment}
                    />
                </div>
            )}

            {!source_table && has_parts && (
                has_parts.map((type: any, index: number) => {
                    return (
                        helper.filterByStringMatch(components, type.label).length !== 0 ?
                            <CustomPopover
                                key={`CustomPopover-${nanoid()}`}
                                id={`popover-${type.label}`}
                                subTitle=""
                                title={type.label}
                                show={activePopover === type.label}
                                onToggle={(show) => handlePopoverToggle(type.label, show)}
                                trigger={
                                    <span key={`CustomPopover-Components-${nanoid()}`}>
                                        {index === 0 ? 'Components: ' : ', '}
                                        <span
                                            className="cursor-pointer overlay-trigger mb-2 text-sm font-thin underline"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handlePopoverToggle(type.label, activePopover !== type.label)
                                            }}
                                        >
                                            {type.label}
                                        </span>
                                    </span>
                                }
                            >
                                <div className="inline-block" dangerouslySetInnerHTML={{ __html: `<span class='block'>` + helper.renderIdentifiersComponentList(helper.filterByStringMatch(components, type.label)) + `</span>` }} />
                            </CustomPopover> :
                            (
                                <span key={`no-see_also-${nanoid()}`}>
                                    {index === 0 ? 'Components: ' : ', '}
                                    <span className="overlay-trigger mb-2 text-sm font-thin">
                                        {type.label}
                                    </span>
                                </span>
                            )
                    );
                })
            )}

            {source_table && (
                <div className='flex text-sm font-thin my-[5px]'>
                    <JsonTable Components={components} data={source_table} color="#00b050" />
                </div>
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