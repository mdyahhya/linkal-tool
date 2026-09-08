import { NextResponse } from 'next/server';
import { getSiteById } from '@/lib/storage';
import { generateStaticHtml } from '@/lib/generator';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const site = await getSiteById(id);

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const html = generateStaticHtml(site);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${site.slug}-index.html"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
