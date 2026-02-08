import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies PDB file fetch from RCSB to bypass CORS when loading from localhost.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const safeId = id?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!safeId || safeId.length < 4) {
      return NextResponse.json({ error: 'Invalid PDB ID' }, { status: 400 });
    }

    const url = `https://files.rcsb.org/view/${safeId}.pdb`;
    const res = await fetch(url, {
      headers: { Accept: 'text/plain' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDB: ${res.status}` },
        { status: res.status }
      );
    }

    const text = await res.text();
    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('PDB proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to load structure' },
      { status: 500 }
    );
  }
}
