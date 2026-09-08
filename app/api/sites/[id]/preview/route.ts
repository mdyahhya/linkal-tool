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
      return new Response('<h1>Site not found</h1>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const html = generateStaticHtml(site);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return new Response(`<h1>Error generating preview: ${error.message}</h1>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
