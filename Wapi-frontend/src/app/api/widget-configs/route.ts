import { PUBLIC_API_URL } from '@/src/constants/route';
import { getServerSession } from 'next-auth';
import { authoption } from '@/src/app/api/auth/[...nextauth]/authOption';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string | undefined;
    const qs = request.nextUrl.searchParams.toString();

    const response = await fetch(`${PUBLIC_API_URL}/widget-configs?${qs}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching widget configs:', error);
    return NextResponse.json({ error: 'Failed to fetch widget configs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string | undefined;
    const body = await request.json();

    const response = await fetch(`${PUBLIC_API_URL}/widget-configs`, {
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
    console.error('Error creating widget config:', error);
    return NextResponse.json({ error: 'Failed to create widget config' }, { status: 500 });
  }
}
