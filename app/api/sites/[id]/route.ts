import { NextResponse } from 'next/server';
import { getSiteById, saveSite, deleteSite, getAllSites } from '@/lib/storage';

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
    return NextResponse.json({ site });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const updates = await request.json();
    const existing = await getSiteById(id);
    
    if (!existing) {
      // Upsert: Save directly if missing on cold start
      const newSite = {
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };
      const saved = await saveSite(newSite);
      return NextResponse.json({ site: saved });
    }

    // If slug changed, verify uniqueness
    if (updates.slug && updates.slug !== existing.slug) {
      const cleanSlug = updates.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const allSites = await getAllSites();
      if (allSites.some((s) => s.id !== id && s.slug === cleanSlug)) {
        return NextResponse.json(
          { error: `Slug "${cleanSlug}" is already taken by another site` },
          { status: 400 }
        );
      }
      updates.slug = cleanSlug;
    }

    const merged = {
      ...existing,
      ...updates,
      id, // protect id
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveSite(merged);
    return NextResponse.json({ site: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const success = await deleteSite(id);
    if (!success) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
