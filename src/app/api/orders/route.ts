import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

// GET /api/orders — return orders (supports ?userId filter)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    const query = userId ? { userId } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — create a new order
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.orderId || !body.userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order = await Order.create(body);
    return NextResponse.json(order.toObject(), { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/orders] Error Details:', err);
    return NextResponse.json({ 
      error: 'Failed to save order', 
      details: err.message || 'Unknown error' 
    }, { status: 500 });
  }
}
