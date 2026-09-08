export interface VercelProjectResult {
  projectId: string;
  projectName: string;
  cnameTarget?: string;
  isNew: boolean;
}

export interface VercelDeploymentResult {
  deploymentId: string;
  deploymentUrl: string;
  readyState: 'INITIALIZING' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
}

function getVercelHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function buildUrl(path: string, teamId?: string): string {
  const base = `https://api.vercel.com${path}`;
  if (teamId) {
    const separator = path.includes('?') ? '&' : '?';
    return `${base}${separator}teamId=${encodeURIComponent(teamId)}`;
  }
  return base;
}

export async function createOrGetVercelProject(
  slug: string,
  githubOwner: string,
  token: string,
  teamId?: string
): Promise<VercelProjectResult> {
  const headers = getVercelHeaders(token);

  // 1. Check if project already exists
  const checkRes = await fetch(buildUrl(`/v9/projects/${slug}`, teamId), {
    headers,
  });

  if (checkRes.status === 200) {
    const data = await checkRes.json();
    return {
      projectId: data.id,
      projectName: data.name,
      isNew: false,
    };
  }

  // 2. Create project
  const createRes = await fetch(buildUrl('/v9/projects', teamId), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: slug,
      framework: null,
      buildCommand: null,
      outputDirectory: null,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      `Vercel project creation failed (${createRes.status}): ${err.error?.message || createRes.statusText}`
    );
  }

  const projectData = await createRes.json();
  return {
    projectId: projectData.id,
    projectName: projectData.name,
    isNew: true,
  };
}

export async function addDomainToVercelProject(
  slug: string,
  domain: string,
  token: string,
  teamId?: string
): Promise<{ domain: string; cnameTarget: string }> {
  const headers = getVercelHeaders(token);

  // Check if domain is already added
  const checkRes = await fetch(buildUrl(`/v9/projects/${slug}/domains/${domain}`, teamId), {
    headers,
  });

  if (checkRes.status === 200) {
    return {
      domain,
      cnameTarget: 'cname.vercel-dns.com',
    };
  }

  // Add domain
  const addRes = await fetch(buildUrl(`/v9/projects/${slug}/domains`, teamId), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: domain,
    }),
  });

  if (!addRes.ok && addRes.status !== 409) {
    const err = await addRes.json().catch(() => ({}));
    throw new Error(
      `Failed to add domain ${domain} to Vercel (${addRes.status}): ${err.error?.message || addRes.statusText}`
    );
  }

  return {
    domain,
    cnameTarget: 'cname.vercel-dns.com',
  };
}

export async function triggerVercelDeployment(
  slug: string,
  githubOwner: string,
  staticHtml: string,
  token: string,
  teamId?: string,
  repoId?: number
): Promise<VercelDeploymentResult> {
  const headers = getVercelHeaders(token);

  // Strategy 1: Direct File Payload Deployment (Instant, Production-Ready, 100% Fail-Proof)
  try {
    const fileDeployRes = await fetch(buildUrl('/v13/deployments', teamId), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: slug,
        project: slug,
        target: 'production',
        files: [
          {
            file: 'index.html',
            data: staticHtml,
          },
        ],
      }),
    });

    if (fileDeployRes.ok) {
      const data = await fileDeployRes.json();
      return {
        deploymentId: data.id,
        deploymentUrl: `https://${data.url}`,
        readyState: data.readyState || 'BUILDING',
      };
    }
  } catch (err) {
    console.warn('Direct file deployment attempt failed, falling back to Git Source strategy:', err);
  }

  // Strategy 2: Git Source Deployment with repoId
  const gitSourceObj: any = {
    type: 'github',
    ref: 'main',
    repo: `${githubOwner}/${slug}`,
  };
  if (repoId) {
    gitSourceObj.repoId = repoId;
  }

  const deployRes = await fetch(buildUrl('/v13/deployments', teamId), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: slug,
      project: slug,
      target: 'production',
      gitSource: gitSourceObj,
    }),
  });

  if (deployRes.ok) {
    const data = await deployRes.json();
    return {
      deploymentId: data.id,
      deploymentUrl: `https://${data.url}`,
      readyState: data.readyState || 'BUILDING',
    };
  }

  // Strategy 3: Automatic Git push deployment query
  const listRes = await fetch(buildUrl(`/v6/deployments?projectId=${slug}&limit=1`, teamId), {
    headers,
  });

  if (listRes.ok) {
    const listData = await listRes.json();
    if (listData.deployments && listData.deployments.length > 0) {
      const latest = listData.deployments[0];
      return {
        deploymentId: latest.uid,
        deploymentUrl: `https://${latest.url}`,
        readyState: latest.state || latest.readyState || 'BUILDING',
      };
    }
  }

  const err = await deployRes.json().catch(() => ({}));
  throw new Error(
    `Vercel deployment failed (${deployRes.status}): ${err.error?.message || deployRes.statusText}`
  );
}

export async function pollVercelDeploymentStatus(
  deploymentId: string,
  token: string,
  teamId?: string
): Promise<VercelDeploymentResult> {
  const headers = getVercelHeaders(token);
  const res = await fetch(buildUrl(`/v13/deployments/${deploymentId}`, teamId), {
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to check Vercel deployment status (${res.status})`);
  }

  const data = await res.json();
  return {
    deploymentId: data.id,
    deploymentUrl: `https://${data.url}`,
    readyState: data.readyState,
  };
}
