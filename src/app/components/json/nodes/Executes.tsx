import { helper } from '@/app/utils/helper';
import React from 'react';
import URLOrText from '../../shared/URLOrText';
import JsonSourceCode from '../JsonSourceCode';
export interface ExecutesData {
    executes: {
        label: string;
        is_implemented_by?: any;
        has_support_url?: string;
        part_of?: {
            label: string;
            has_support_url?: string;
            version_info?: string;
            part_of?: {
                label: string;
                version_info?: string;
                has_support_url?: string;
            };
        };
    };
}

export interface StyleProps {
    [key: string]: string | number;
}

interface ExecutesProps {
    executes: any;
    styles?: StyleProps;
}

const Executes: React.FC<ExecutesProps> = ({ executes, styles }) => {
    const label = executes['label'];
    const is_implemented_by = executes['is_implemented_by'];
    const has_support_url = executes['has_support_url'];
    const part_of = executes['part_of'][0];

    let part_of_label = '';
    let part_of_url = '';
    let part_of_version = '';
    let top_part_of_label = '';
    let top_part_of_url = '';
    let top_part_of_version = '';

    if (typeof part_of === 'object') {
        part_of_label = part_of['label'];
        part_of_url = part_of['has_support_url'];
        part_of_version = part_of['version_info'];
        const part_of_part_of = part_of['part_of'];

        if (typeof part_of_part_of === 'object') {
            top_part_of_label = part_of_part_of['label'];
            top_part_of_url = part_of_part_of['has_support_url'];
            top_part_of_version = part_of_part_of['version_info'];
        }
    }

    const text = helper.formatExecutesText(
        label,
        has_support_url,
        part_of_label,
        part_of_url,
        part_of_version,
        top_part_of_label,
        top_part_of_url,
        top_part_of_version
    );

    return (
        <div className="w-full">
            <div className="border-[#d9ebf7] border-l-[5px] border-t-[5px] border-l-[#d9ebf7] relative scrollbar-custom sm:overflow-visible overflow-auto rounded-tl-[10px]">
                <div className={`bg-[#f7fafc] relative p-1 text-[12px] text-[#353839] pl-2 rounded-tl-[5px] font-[700]`}>
                    Procedure
                </div>
                <div className="p-2">
                    <URLOrText content={text} />
                    {is_implemented_by && (
                        <JsonSourceCode
                            highlightCode={is_implemented_by}
                            isCodeLoading={false}
                            sourceCode={is_implemented_by}
                            showAllCode={true}
                            toggleShowAllCode={undefined}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Executes;