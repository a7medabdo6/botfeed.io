import { PUBLIC_API_URL } from '@/src/constants/route';
import { getServerSession } from 'next-auth';
import { authoption } from '@/src/app/api/auth/[...nextauth]/authOption';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params;
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string | undefined;
    const body = await request.json();

    const response = await fetch(`${PUBLIC_API_URL}/widget-configs/conversations/${conversationId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error replying to conversation:', error);
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
}
