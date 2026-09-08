import { NextResponse } from 'next/server';
import { getAllSites, saveSite } from '@/lib/storage';
import { SiteData } from '@/types/site';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const localSites: SiteData[] = body.sites || [];

    if (!Array.isArray(localSites) || localSites.length === 0) {
      const current = await getAllSites();
      return NextResponse.json({ sites: current });
    }

    const currentSites = await getAllSites();
    const currentIds = new Set(currentSites.map((s) => s.id));

    // Save any local sites that don't exist on server
    for (const site of localSites) {
      if (!currentIds.has(site.id)) {
        await saveSite(site);
      }
    }

    const merged = await getAllSites();
    return NextResponse.json({ success: true, sites: merged });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
