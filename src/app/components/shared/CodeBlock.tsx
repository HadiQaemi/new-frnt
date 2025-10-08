import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-r';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'r' }) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    return (
        <div className="code-block rounded-lg overflow-hidden">
            <pre className="p-4 bg-gray-900 overflow-x-auto text-[#353839]">
                <code className={`language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default CodeBlock;