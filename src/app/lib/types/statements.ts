export interface ORKGResponse {
    results: unknown;
    content: Statement[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface Statement {
    id: string;
    label: string;
    created_at: string;
    classes: string[];
    shared: boolean;
}