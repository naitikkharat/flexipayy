import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users — return all users
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).sort({ joinedAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users — upsert a user by PAN
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { pan, name, email, phone, age, income, creditLimit, flexiCoins } = body;

    if (!pan || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { pan },
      { pan, name, email, phone, age, income, creditLimit, flexiCoins, joinedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/users] Error Details:', err);
    return NextResponse.json({ 
      error: 'Failed to save user',
      details: err.message || 'Unknown error'
    }, { status: 500 });
  }
}
