export interface Styles {
    linkLabel: React.CSSProperties;
    buttonLabel: React.CSSProperties;
}

export interface URLOrTextProps {
    content: string;
    button?: string | null;
    styles?: any;
    color?: string;
}