import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    if (!client) {
      // Fallback mock history if MongoDB is not active
      return NextResponse.json({
        success: true,
        source: 'mock',
        data: [
          { date: '29 Sep 2026', vehicle: 'Ferrari F40 (FL)', depth: '4.8 mm', condition: '🟢 Good', remaining: '28,500 km' },
          { date: '15 Jul 2026', vehicle: 'Ferrari F40 (FR)', depth: '5.6 mm', condition: '🟢 Good', remaining: '34,000 km' },
          { date: '02 May 2026', vehicle: 'Ferrari F40 (RR)', depth: '3.2 mm', condition: '🟡 Monitor', remaining: '14,000 km' }
        ]
      });
    }

    const db = client.db('tyrz_telemetry');
    const records = await db.collection('scans').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, source: 'mongodb', data: records });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;

    if (client) {
      const db = client.db('tyrz_telemetry');
      await db.collection('scans').insertOne({
        ...body,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ success: true, message: 'Scan record saved' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
