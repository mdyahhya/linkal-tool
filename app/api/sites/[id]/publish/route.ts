import { NextResponse } from 'next/server';
import { getSiteById, saveSite } from '@/lib/storage';
import { executeDeploymentPipeline } from '@/lib/deployment/pipeline';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    let bodySite = null;
    try {
      const body = await request.json();
      if (body && body.site) {
        bodySite = body.site;
      }
    } catch {}

    let site = bodySite || await getSiteById(id);

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (bodySite) {
      site = await saveSite(bodySite);
    }

    const result = await executeDeploymentPipeline(site);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Pipeline execution failed' },
      { status: 500 }
    );
  }
}
