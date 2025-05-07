import { TypeInfo } from "../types";
import { saveTypeToStorage } from "./storage";

export const fetchTypeInfo = async (nodeKey: string): Promise<TypeInfo | null> => {
    try {
        const response = await fetch(`/service/type-info/${nodeKey}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const typeInfo = {
            name: data.name,
            schema: data.Schema,
            properties: data.Schema.Properties.map((prop: { Name: string }) => prop.Name)
        };

        saveTypeToStorage(nodeKey, typeInfo);
        return typeInfo;
    } catch (error) {
        console.error('Error fetching type info:', error);
        return null;
    }
};