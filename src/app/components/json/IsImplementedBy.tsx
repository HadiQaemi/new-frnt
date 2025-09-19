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
        <div className="p-2 pt-4 border-[#c40dfd] border-l-[10px] border-l-[#c40dfd] my-1 relative">
            <span className={`bg-[#c40dfd] absolute -top-[12px] text-[12px] -left-[10px] p-[2px] text-white pl-4 pr-2 w-[140px]`}>
                Implementation
            </span>
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
    );
};

export default IsImplementedBy;
