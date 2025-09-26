export interface EvaluatesData {
    evaluates: {
        label: string;
        see_also?: string;
        requires?: any;
    };
    evaluates_for: {
        label: string;
        see_also?: string;
    };
}

export interface StyleProps {
    [key: string]: string | number;
}

import { helper } from '@/app/utils/helper';
import React from 'react';
import URLOrText from '../../shared/URLOrText';

interface EvaluatesProps {
    data?: EvaluatesData;
    evaluates_for: any;
    evaluates: any;
}

const Evaluates: React.FC<EvaluatesProps> = ({ evaluates_for, evaluates }) => {
    const label = evaluates['label'];
    const see_also = evaluates['see_also'];
    const requires = evaluates['requires'];

    const label_for = evaluates_for['label'];
    const see_also_for = evaluates_for['see_also'];

    const evaluatesText = helper.formatEvaluatesText('Evaluates', label, see_also, requires);
    const evaluatesForText = helper.formatEvaluatesText('Evaluates for', label_for, see_also_for, requires);

    return (
        <div className="w-full">
            <div className="border-[#d9ebf7] border-l-[5px] border-t-[5px] border-l-[#d9ebf7] relative scrollbar-custom sm:overflow-visible overflow-auto">
                <div className={`bg-[#f7fafc] relative p-1 text-[12px] text-[#353839] pl-4`}>
                    Setup
                </div>
                <div className='p-2'>
                    <URLOrText content={evaluatesText} />
                    <URLOrText content={evaluatesForText} />
                </div>
            </div>
        </div>
    );
};

export default Evaluates;