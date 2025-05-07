import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.POCKETBASE_URL);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const nodeKey = searchParams.get('key');

        if (!nodeKey) {
            return NextResponse.json(
                { error: 'Node key is required' },
                { status: 400 }
            );
        }
        const pocketbaseCollection = process.env.POCKETBASE_DATATYPE;
        if (!pocketbaseCollection) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }
        try {
            const cachedRecord = await pb
                .collection(pocketbaseCollection)
                .getFirstListItem(`doi = "${encodeURIComponent(nodeKey)}"`);
            if (cachedRecord?.schema) {
                return NextResponse.json({
                    name: cachedRecord.schema.name,
                    schema: cachedRecord.schema.Schema,
                    properties: cachedRecord.schema.Schema.Properties.map(
                        (prop: { Name: string }) => prop.Name
                    )
                });
            }
        } catch (pocketbaseError) {
            console.log('PocketBase fetch failed, trying external API:', pocketbaseError);
        }
        const datatypeUrl = process.env.DATATYPE_URL;
        if (!datatypeUrl) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }
        const response = await fetch(`${datatypeUrl}${encodeURIComponent(nodeKey)}`);
        if (!response.ok) {
            throw new Error(`External API error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data?.Schema?.Properties) {
            return NextResponse.json(
                { error: 'Invalid data structure received from API' },
                { status: 500 }
            );
        }
        const typeInfo = {
            name: data.name,
            schema: data.Schema,
            properties: data.Schema.Properties.map((prop: { Name: string }) => prop.Name)
        };

        try {
            await pb.collection(pocketbaseCollection).create({
                doi: nodeKey,
                schema: data
            });
        } catch (cacheError) {
            console.warn('Failed to cache in PocketBase:', cacheError);
        }
        return NextResponse.json(typeInfo);
    } catch (error) {
        console.error('Error in type-info API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch type info' },
            { status: 500 }
        );
    }
}