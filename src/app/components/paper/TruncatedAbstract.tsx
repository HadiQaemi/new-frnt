export interface TruncatedAbstractProps {
    text: string;
    maxWords?: number;
}

import { useState } from 'react';

const TruncatedAbstract: React.FC<TruncatedAbstractProps> = ({
    text,
    maxWords = 1500
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    if (!text) return null;

    const words = text.split(/\s+/);
    const shouldTruncate = words.length > maxWords;
    const displayText = isExpanded ? text : words.slice(0, maxWords).join(' ');

    return (
        <div className="items-center justify-center text-justify">
            <p className="text-gray-700 inline">
                {displayText}
                {!isExpanded && shouldTruncate && maxWords > 0 && '...'}
            </p>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`${isExpanded ? 'ml-[2px]' : 'ml-[2px]'} text-blue-600 hover:text-blue-800 font-semibold focus:outline-none`}
                    type="button"
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? ' Show less' : ' Show more'}
                </button>
            )}
        </div>
    );
};

export default TruncatedAbstract;