import { SiteData, DeploymentLogEntry } from '@/types/site';
import { generateStaticHtml } from '@/lib/generator';
import { createOrGetGitHubRepo, commitFileToGitHub } from './github';
import {
  createOrGetVercelProject,
  addDomainToVercelProject,
  triggerVercelDeployment,
  pollVercelDeploymentStatus,
} from './vercel';
import { createOrUpdateCloudflareCname } from './cloudflare';
import { saveSite } from '@/lib/storage';

export interface PipelineResult {
  success: boolean;
  liveUrl?: string;
  site: SiteData;
  error?: string;
}

export async function executeDeploymentPipeline(site: SiteData): Promise<PipelineResult> {
  const logs: DeploymentLogEntry[] = [];
  const log = (
    step: DeploymentLogEntry['step'],
    status: DeploymentLogEntry['status'],
    message: string,
    details?: any
  ) => {
    logs.push({
      step,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  };

  const updatedSite: SiteData = {
    ...site,
    status: 'deploying',
    deploymentLogs: logs,
    lastError: undefined,
  };
  await saveSite(updatedSite);

  try {
    // 0. Generate static HTML bundle
    log('general', 'in_progress', 'Compiling pure zero-dependency static HTML bundle...');
    const staticHtml = generateStaticHtml(site);
    log('general', 'success', `Generated self-contained index.html (${Buffer.byteLength(staticHtml)} bytes).`);

    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;
    const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;

    // Check if running in live mode or simulated mode
    const hasLiveCredentials = Boolean(
      githubToken && githubOwner && vercelToken && cloudflareToken && cloudflareZoneId
    );

    if (!hasLiveCredentials) {
      log(
        'general',
        'in_progress',
        '⚡ Running in Development Preview Mode (Missing one or more live API tokens: GITHUB_TOKEN, VERCEL_TOKEN, CLOUDFLARE_API_TOKEN).'
      );

      // Simulate GitHub
      log('github', 'in_progress', `[PREVIEW] Simulating GitHub repo creation: ${site.slug}`);
      await new Promise((r) => setTimeout(r, 600));
      log('github', 'success', `[PREVIEW] Created repository ${githubOwner || 'owner'}/${site.slug} & committed index.html`);

      // Simulate Vercel
      log('vercel', 'in_progress', `[PREVIEW] Simulating Vercel project creation & custom domain linking: ${site.slug}.dominal.in`);
      await new Promise((r) => setTimeout(r, 700));
      log('vercel', 'success', `[PREVIEW] Linked Vercel project ${site.slug} -> target cname.vercel-dns.com`);

      // Simulate Cloudflare
      log('cloudflare', 'in_progress', `[PREVIEW] Simulating Cloudflare DNS CNAME record: ${site.slug}.dominal.in (Proxy: OFF)`);
      await new Promise((r) => setTimeout(r, 500));
      log('cloudflare', 'success', `[PREVIEW] Created DNS record: ${site.slug}.dominal.in -> cname.vercel-dns.com (DNS Only)`);

      // Simulate Polling
      log('poll', 'in_progress', `[PREVIEW] Verifying deployment health check...`);
      await new Promise((r) => setTimeout(r, 800));
      log('poll', 'success', `[PREVIEW] Deployment is verified live at https://${site.slug}.dominal.in`);

      const liveUrl = `https://${site.slug}.dominal.in`;
      updatedSite.status = 'live';
      updatedSite.liveUrl = liveUrl;
      updatedSite.lastDeployedAt = new Date().toISOString();
      updatedSite.deploymentLogs = logs;
      await saveSite(updatedSite);

      return {
        success: true,
        liveUrl,
        site: updatedSite,
      };
    }

    // --- STEP 1: GITHUB API ---
    log('github', 'in_progress', `Connecting to GitHub to create/fetch repository "${site.slug}"...`);
    const repoResult = await createOrGetGitHubRepo(githubOwner!, site.slug, githubToken!);
    updatedSite.githubRepoUrl = repoResult.repoUrl;
    log(
      'github',
      'success',
      `Repository ready: ${repoResult.repoUrl} (${repoResult.isNew ? 'New' : 'Reused'})`
    );

    log('github', 'in_progress', 'Committing index.html via GitHub Contents API...');
    const commitResult = await commitFileToGitHub(
      githubOwner!,
      site.slug,
      'index.html',
      staticHtml,
      `Publish update from Linkal Website Builder [${new Date().toISOString()}]`,
      githubToken!
    );
    log('github', 'success', `Pushed index.html (commit: ${commitResult.commitSha.slice(0, 7)})`);

    // --- STEP 2: VERCEL API ---
    log('vercel', 'in_progress', `Connecting to Vercel to create/fetch project "${site.slug}"...`);
    const vercelProject = await createOrGetVercelProject(
      site.slug,
      githubOwner!,
      vercelToken!,
      vercelTeamId
    );
    updatedSite.vercelProjectId = vercelProject.projectId;
    log(
      'vercel',
      'success',
      `Vercel project linked: ${vercelProject.projectName} (${vercelProject.isNew ? 'New' : 'Reused'})`
    );

    const customDomain = `${site.slug}.dominal.in`;
    log('vercel', 'in_progress', `Attaching custom domain "${customDomain}" to Vercel project...`);
    const domainResult = await addDomainToVercelProject(
      site.slug,
      customDomain,
      vercelToken!,
      vercelTeamId
    );
    log('vercel', 'success', `Custom domain "${customDomain}" attached. CNAME target: ${domainResult.cnameTarget}`);

    log('vercel', 'in_progress', 'Triggering production deployment on Vercel...');
    const deployment = await triggerVercelDeployment(
      site.slug,
      githubOwner!,
      vercelToken!,
      vercelTeamId
    );
    updatedSite.vercelDeploymentId = deployment.deploymentId;
    log('vercel', 'success', `Deployment initiated: ${deployment.deploymentId} (${deployment.readyState})`);

    // --- STEP 3: CLOUDFLARE API ---
    log(
      'cloudflare',
      'in_progress',
      `Configuring Cloudflare DNS: ${customDomain} -> ${domainResult.cnameTarget} (Proxy OFF)...`
    );
    const dnsResult = await createOrUpdateCloudflareCname(
      site.slug,
      domainResult.cnameTarget,
      cloudflareToken!,
      cloudflareZoneId!
    );
    updatedSite.cloudflareDnsId = dnsResult.recordId;
    log(
      'cloudflare',
      'success',
      `Cloudflare CNAME active: ${dnsResult.name} -> ${dnsResult.content} (Proxy: ${dnsResult.proxied ? 'ON' : 'OFF / Grey Cloud'})`
    );

    // --- STEP 4: POLL DEPLOYMENT STATUS ---
    log('poll', 'in_progress', 'Polling Vercel deployment status until live...');
    let isLive = false;
    let attempts = 0;
    const maxAttempts = 15; // 15 * 2s = 30 seconds

    while (attempts < maxAttempts && !isLive) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const status = await pollVercelDeploymentStatus(
          deployment.deploymentId,
          vercelToken!,
          vercelTeamId
        );
        if (status.readyState === 'READY') {
          isLive = true;
          log('poll', 'success', `Vercel deployment is READY! Live at https://${customDomain}`);
        } else if (status.readyState === 'ERROR' || status.readyState === 'CANCELED') {
          throw new Error(`Vercel deployment failed with status: ${status.readyState}`);
        } else {
          log('poll', 'in_progress', `Waiting for build... state: ${status.readyState} (attempt ${attempts}/${maxAttempts})`);
        }
      } catch (err: any) {
        if (attempts >= maxAttempts) throw err;
      }
    }

    const liveUrl = `https://${customDomain}`;
    updatedSite.status = isLive ? 'live' : 'published';
    updatedSite.liveUrl = liveUrl;
    updatedSite.lastDeployedAt = new Date().toISOString();
    updatedSite.deploymentLogs = logs;
    await saveSite(updatedSite);

    return {
      success: true,
      liveUrl,
      site: updatedSite,
    };
  } catch (error: any) {
    const errorMsg = error.message || 'Unknown pipeline failure';
    log('general', 'failed', `Deployment failed: ${errorMsg}`);
    
    updatedSite.status = 'failed';
    updatedSite.lastError = errorMsg;
    updatedSite.deploymentLogs = logs;
    await saveSite(updatedSite);

    return {
      success: false,
      error: errorMsg,
      site: updatedSite,
    };
  }
}
