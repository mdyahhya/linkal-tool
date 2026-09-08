import { NextResponse } from 'next/server';
import { verifyCredentials, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const isValid = verifyCredentials(email, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid owner email or password' },
        { status: 401 }
      );
    }

    await createSession(email);
    return NextResponse.json({
      success: true,
      user: { email, role: 'owner' },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
