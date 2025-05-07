type ColorMap = {
    [key: string]: {
        backgroundColor: string;
        color: string;
    };
};

type FileTypes = 'image' | 'sourceCode' | 'string';

type FileValidation = {
    isValid: boolean;
    fileType?: FileTypes;
    extension?: string;
    reason?: string;
};