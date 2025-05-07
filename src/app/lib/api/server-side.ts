import { REBORN_API_URL } from "../config/constants";

export async function getPaperServer(id: string) {
    try {
        const response = await fetch(`${REBORN_API_URL}/articles/get_article/?id=${id}`, {
            next: {
                revalidate: 3600,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch paper: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching paper:', error);
        return null;
    }
}

export async function getStatementServer(id: string) {
    try {
        const response = await fetch(`${REBORN_API_URL}/articles/get_statement_by_id/?id=${id}`, {
            next: {
                revalidate: 3600
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch statement: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching statement:', error);
        return null;
    }
}
