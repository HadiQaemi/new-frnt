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
            <span className={`bg-[#8fbbe3] relative p-1 text-[12px] text-[#1a1a1a] pl-4 w-full inline-block`}>
                Setup
            </span>
            <div className="p-2 pt-4 border-[#8fbbe3] border-l-[10px] border-l-[#8fbbe3] relative">
                <URLOrText content={evaluatesText} />
                <URLOrText content={evaluatesForText} />
            </div>
        </div>
    );
};

export default Evaluates;