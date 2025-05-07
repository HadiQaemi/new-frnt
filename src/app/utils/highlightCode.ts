export const createSearchPattern = (searchText: string): string => {
    const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped
        .replace(/([(),=])\s*/g, '$1\\s*')
        .replace(/[\n]\s*/g, '\\s*')
        .replace(/\s*,\s*/g, '\\s*,\\s*')
        .replace(/\s+/g, '\\s+');
};

interface Match {
    start: number;
    end: number;
    text: string;
}

const highlightLongWords = (
    sourceCode: string,
    searchText: string,
    patternMatches: Match[]
): string => {
    const searchWords = searchText
        .split(/[.\s(),=]+/)
        .filter(word => word.length > 3)
        .map(word => word.replace(/[*+?^${}()[\]\\]/g, '\\$&'));

    let result = '';
    let lastIndex = 0;

    patternMatches.forEach(match => {
        let start = sourceCode.slice(lastIndex, match.start);
        searchWords.forEach(word => {
            const wordRegex = new RegExp(word, 'g');
            start = start.replace(
                wordRegex,
                `<span class="text-blue-500">$&</span>`
            );
        });
        result += start;
        result += `<span class="text-purple-500">${match.text}</span>`;
        lastIndex = match.end;
    });

    let remainingText = sourceCode.slice(lastIndex);
    searchWords.forEach(word => {
        const wordRegex = new RegExp(word, 'g');
        remainingText = remainingText.replace(
            wordRegex,
            `<span class="text-blue-500">$&</span>`
        );
    });
    result += remainingText;
    return result;
};

export const highlightCode = (sourceCode: string, searchText: string): string => {
    if (!sourceCode || !searchText) {
        return sourceCode;
    }

    try {
        const pattern = createSearchPattern(searchText);
        const regex = new RegExp(pattern, 'g');
        const matches: Match[] = [];
        let match;

        let safetyCounter = 0;
        const MAX_ITERATIONS = 10000;

        while ((match = regex.exec(sourceCode)) !== null) {
            if (safetyCounter++ > MAX_ITERATIONS) {
                console.warn('Maximum iterations reached in highlightCode');
                break;
            }

            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
                continue;
            }

            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });
        }

        return highlightLongWords(sourceCode, searchText, matches);
    } catch (error) {
        console.error('Error in highlightCode:', error);
        return sourceCode;
    }
};
