import { NextResponse } from 'next/server';
import { analyzeTyreImage } from '../../../lib/ai-engine';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, vehicle } = body;

    if (!image) {
      return NextResponse.json({ error: 'Tyre image data is required' }, { status: 400 });
    }

    const scanResults = analyzeTyreImage(image, vehicle);
    return NextResponse.json({ success: true, result: scanResults });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process AI scan', details: err.message }, { status: 500 });
  }
}
