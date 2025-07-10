import { FC } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import CodeBlock from '../shared/CodeBlock';

interface JsonSourceCodeProps {
    highlightCode: string;
    isCodeLoading: boolean;
    sourceCode: string;
    showAllCode: boolean;
    toggleShowAllCode?: () => void;
}

const JsonSourceCode: FC<JsonSourceCodeProps> = ({
    highlightCode,
    isCodeLoading,
    sourceCode,
    showAllCode,
    toggleShowAllCode
}) => {
    const { toast } = useToast();
    if (isCodeLoading) {
        return <div className="animate-pulse">Loading source code...</div>;
    }
    const copyToClipboard = () => {
        if (Array.isArray(highlightCode))
            highlightCode = highlightCode.join('\n')
        const rawText = highlightCode ?
            highlightCode.replace(/<[^>]+>/g, '') :
            sourceCode;

        const formattedText = sourceCode;//.split('\n').join('\n\n');

        navigator.clipboard.writeText(formattedText)
            .then(() =>
                toast({
                    title: "Success!",
                    description: "Code copied to clipboard!",
                    className: "bg-green-100",
                })
            )
            .catch(() =>
                toast({
                    title: "Error!",
                    description: "Failed to copy code",
                    className: "bg-red-100",
                })
            );
    };
    return (
        <div className="font-mono text-sm relative">
            <Button
                className="absolute text-white !bg-[#e86161] border border-gray-200 right-2 top-3 mr-1 mt-2 py-0 px-1 h-8"
                onClick={copyToClipboard}
                aria-label="Copy to clipboard"
            >
                <Copy />
            </Button>
            <div className="whitespace-pre-wrap w-full font-mono text-sm">
                <CodeBlock code={showAllCode ? sourceCode : sourceCode.split('\n').slice(0, 5).join('\n')} />
                {toggleShowAllCode !== undefined && (
                    <button
                        onClick={toggleShowAllCode}
                        className="px-4 py-2 bg-[#ff6464] text-[#fff]"
                    >
                        {showAllCode ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default JsonSourceCode;