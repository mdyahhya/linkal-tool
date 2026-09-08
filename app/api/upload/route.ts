import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { base64, filename, siteSlug } = body;

    if (!base64 || !filename) {
      return NextResponse.json(
        { error: 'Image base64 data and filename are required' },
        { status: 400 }
      );
    }

    // Clean base64 data
    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;

    // If GitHub credentials available, save image directly to GitHub repository
    if (githubToken && githubOwner) {
      const repo = 'linkal-tool';
      const path = `public/uploads/${cleanFilename}`;

      try {
        const res = await fetch(`https://api.github.com/repos/${githubOwner}/${repo}/contents/${path}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Linkal-Website-Builder',
          },
          body: JSON.stringify({
            message: `Upload image asset: ${cleanFilename}`,
            content: cleanBase64,
          }),
        });

        if (res.ok) {
          const rawUrl = `https://raw.githubusercontent.com/${githubOwner}/${repo}/main/${path}`;
          const cdnUrl = `https://cdn.jsdelivr.net/gh/${githubOwner}/${repo}@main/${path}`;
          console.log(`[Upload] Image saved to GitHub repo ${repo}/${path}`);
          return NextResponse.json({
            success: true,
            url: cdnUrl,
            rawUrl,
            dataUrl: base64,
            filename: cleanFilename,
          });
        } else {
          const errText = await res.text();
          console.warn('[Upload] GitHub upload response status:', res.status, errText);
        }
      } catch (err) {
        console.warn('[Upload] GitHub image upload fallback to data URL:', err);
      }
    }

    // Fallback to data URL (works in all browsers & static HTML bundles)
    return NextResponse.json({
      success: true,
      url: base64,
      dataUrl: base64,
      filename: cleanFilename,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
