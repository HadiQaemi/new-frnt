import React from 'react';
import { helper } from '@/app/utils/helper';
import { URLOrTextProps } from './types';

const URLOrText: React.FC<URLOrTextProps> = ({
    content,
    color,
    button = null
}) => {
    if (helper.validURL(content)) {
        return (
            <div className="flex mb-2 w-full">
                <div className="flex-grow text-left w-[85%]">
                    <a href={content} className="text-blue-600 hover:text-blue-800 inline-block" target="_blank" rel="noopener noreferrer">
                        {content}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex mb-2 w-full">
            <div className="flex-grow text-left w-[85%] font-bold">
                <div className="inline-block" dangerouslySetInnerHTML={{ __html: content.replace(/[\[\]']+/g, '') }} />
            </div>
        </div>
    );
};

export default URLOrText;