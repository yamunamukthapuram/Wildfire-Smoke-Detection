import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { classifyPixels } from '../../../lib/predict.js';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image is too large. Please use a smaller file.' }, { status: 413 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please upload a valid image file.' }, { status: 400 });
    }

    const image = sharp(bytes);
    const metadata = await image.metadata();
    const resized = await image.resize({ width: 256, height: 256, fit: 'cover' }).raw().toBuffer({ resolveWithObject: true });
    const result = classifyPixels(resized.data);

    return NextResponse.json({
      ...result,
      width: metadata.width,
      height: metadata.height
    });
  } catch (error) {
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
  }
}
