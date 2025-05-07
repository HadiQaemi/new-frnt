import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('imageUrl');
        const imageName = searchParams.get('imageName');
        const width = searchParams.get('width');
        const height = searchParams.get('height');

        if (!imageUrl || typeof imageUrl !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Image URL is required and must be a string' },
                { status: 400 }
            );
        }
        const targetWidth = parseInt(String(width), 10) || 1024;
        const targetHeight = parseInt(String(height), 10) || 1024;
        let imageBuffer: Buffer;
        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data, 'binary');
            const metadata = await sharp(imageBuffer).metadata();
        } catch (downloadError) {
            console.error('Error downloading image:', downloadError);
            return NextResponse.json(
                { success: false, error: 'Failed to download image from URL' },
                { status: 400 }
            );
        }

        const filename = `${imageName}.jpg`;
        const relativePath = `/uploads/${filename}`;
        const fullPath = path.join(uploadDir, filename);

        try {
            await sharp(imageBuffer)
                .resize({
                    width: targetWidth,
                    height: targetHeight,
                    fit: sharp.fit.inside,
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 90 })
                .toFile(fullPath);
        } catch (resizeError) {
            console.error('Error resizing image:', resizeError);
            return NextResponse.json(
                { success: false, error: 'Failed to process the image' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            imagePath: relativePath,
            cached: false,
            dimensions: {
                width: targetWidth,
                height: targetHeight
            }
        });
    } catch (error) {
        console.error('Error in resize-image API1111:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to resize image' },
            { status: 500 }
        );
    }
}