import { NextResponse } from 'next/server';

export async function GET() {
  const githubToken = Boolean(process.env.GITHUB_TOKEN);
  const githubOwner = Boolean(process.env.GITHUB_OWNER);
  const vercelToken = Boolean(process.env.VERCEL_TOKEN);
  const cloudflareToken = Boolean(process.env.CLOUDFLARE_API_TOKEN);
  const cloudflareZone = Boolean(process.env.CLOUDFLARE_ZONE_ID);

  const allConnected = githubToken && githubOwner && vercelToken && cloudflareToken && cloudflareZone;

  return NextResponse.json({
    connected: allConnected,
    isVercelEnv: Boolean(process.env.VERCEL),
    details: {
      githubToken,
      githubOwner,
      vercelToken,
      cloudflareToken,
      cloudflareZone,
    },
    ownerName: process.env.GITHUB_OWNER || null,
  });
}
