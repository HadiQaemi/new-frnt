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
            <span className={`bg-[#f1f5f9] relative p-1 text-[12px] text-[#353839] pl-4 w-full inline-block`}>
                Procedure
            </span>
            <div className="border-[#f1f5f9] border-l-[10px] border-l-[#f1f5f9] relative">
                <div className="p-2 pt-4">
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