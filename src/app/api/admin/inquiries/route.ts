
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Endpoint disabled for security. Use client-side RLS.' }, { status: 403 });
}
