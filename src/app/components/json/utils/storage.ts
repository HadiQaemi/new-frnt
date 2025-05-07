import { TypeInfo } from "../types";

export const getTypeFromStorage = (nodeKey: string): TypeInfo | null => {
    try {
        const storedData = localStorage.getItem('node-keys');
        if (!storedData) return null;
        const nodeKeys = JSON.parse(storedData);
        return nodeKeys[nodeKey] || null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
};

export const saveTypeToStorage = (nodeKey: string, typeInfo: TypeInfo): void => {
    try {
        const storedData = localStorage.getItem('node-keys');
        const nodeKeys = storedData ? JSON.parse(storedData) : {};
        nodeKeys[nodeKey] = typeInfo;
        localStorage.setItem('node-keys', JSON.stringify(nodeKeys));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};