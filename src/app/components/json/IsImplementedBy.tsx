'use client';

import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Tooltip } from '@/components/ui/tooltip';
import { helper } from '@/app/utils/helper';
import { highlightCode } from '@/app/utils/highlightCode';
import URLOrText from '../shared/URLOrText';

const JsonSourceCode = dynamic(() => import('./JsonSourceCode'), {
    loading: () => <p>Loading...</p>
});

export interface HelperType {
    checkType: (type: string, data: any, depth: number) => any;
    isFileURL: (url: string) => { fileType: string };
}

export interface IsImplementedByProps {
    data: any;
}

const IsImplementedBy: FC<IsImplementedByProps> = ({
    data
}) => {
    const [sourceCode, setSourceCode] = useState('');
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [showAllCode, setShowAllCode] = useState(false);
    const [stringType, setStringType] = useState<any>({ fileType: '' });

    useEffect(() => {
        const loadSourceCode = async () => {
            const is_implemented_by = data;

            if (typeof is_implemented_by === 'string') {
                const str_type = helper.isFileURL(is_implemented_by);
                setStringType(str_type);

                if (str_type.fileType === 'sourceCode') {
                    setIsCodeLoading(true);
                    try {
                        const response = await fetch(is_implemented_by);
                        const text = await response.text();
                        setSourceCode(text);
                    } catch (error) {
                        console.error('Error fetching source code:', error);
                    } finally {
                        setIsCodeLoading(false);
                    }
                }
            }
        };

        loadSourceCode();
    }, [data]);

    const toggleShowAllCode = () => setShowAllCode(!showAllCode);

    const is_implemented_by = data;
    const has_part = helper.checkType('has_part', data, true);

    let executes_is_implemented_by = '';
    // if (has_part !== undefined) {
    //     const executes = helper.checkType('executes', has_part, true);
    //     if (executes !== undefined) {
    //         executes_is_implemented_by = helper.checkType('is_implemented_by', executes, true);
    //     }
    // }

    return (
        <>
            <div className="d-flex mb-4 border-[#71b4ef] border-l-[5px] border-t-[5px] border-l-[#71b4ef] rounded-tl-[10px]">
                <div className='bg-[#f7fafc] text-[#353839] relative p-1 text-[12px] pl-4 rounded-tl-[5px]'>
                    Implementation
                </div>
                <div className='p-2'>
                    {stringType.fileType === 'sourceCode' ? (
                        <JsonSourceCode
                            highlightCode={highlightCode(sourceCode, executes_is_implemented_by)}
                            isCodeLoading={isCodeLoading}
                            sourceCode={sourceCode}
                            showAllCode={showAllCode}
                            toggleShowAllCode={toggleShowAllCode}
                        />
                    ) : (
                        <div className="font-bold flex cursor-help">
                            <span className="inline">Source code: </span>
                            <span className="inline ml-2">
                                <URLOrText
                                    content={String(is_implemented_by)}
                                    button=""
                                />
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default IsImplementedBy;
