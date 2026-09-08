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

    // Save any local sites that don't exist on server or update existing ones if local has live status/newer updates
    for (const site of localSites) {
      const existing = currentSites.find((s) => s.id === site.id);
      if (!existing) {
        await saveSite(site);
      } else if (site.status === 'live' && existing.status !== 'live') {
        await saveSite({
          ...existing,
          ...site,
          status: 'live',
          liveUrl: site.liveUrl || `https://${site.slug}.dominal.in`,
        });
      } else if (
        new Date(site.updatedAt || 0).getTime() >
        new Date(existing.updatedAt || 0).getTime()
      ) {
        await saveSite({ ...existing, ...site });
      }
    }

    const merged = await getAllSites();
    return NextResponse.json({ success: true, sites: merged });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
