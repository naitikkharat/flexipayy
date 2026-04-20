import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    if (!data.userId || !data.subject || !data.message) {
      return NextResponse.json({ error: 'Missing required ticket fields' }, { status: 400 });
    }

    const newTicket = await Ticket.create({
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      subject: data.subject,
      message: data.message,
      status: 'open',
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error: any) {
    console.error('Ticket creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support updating status (resolving tickets)
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const updated = await Ticket.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
