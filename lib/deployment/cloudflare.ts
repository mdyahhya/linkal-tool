export interface CloudflareDnsResult {
  recordId: string;
  name: string;
  content: string;
  proxied: boolean;
  isNew: boolean;
}

export async function createOrUpdateCloudflareCname(
  subdomain: string,
  target: string,
  apiToken: string,
  zoneId: string
): Promise<CloudflareDnsResult> {
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };

  const domain = 'dominal.in';
  const fullRecordName = `${subdomain}.${domain}`;

  // 1. Search for existing DNS record
  const searchRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(fullRecordName)}&type=CNAME`,
    { headers }
  );

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(
      `Cloudflare DNS search failed (${searchRes.status}): ${JSON.stringify(err.errors || searchRes.statusText)}`
    );
  }

  const searchData = await searchRes.json();
  const existingRecord = searchData.result && searchData.result.length > 0 ? searchData.result[0] : null;

  if (existingRecord) {
    // If it exists, update it to ensure target is correct and proxied: false (grey cloud)
    const updateRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existingRecord.id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          type: 'CNAME',
          name: subdomain,
          content: target,
          proxied: false, // Grey cloud (DNS only) as required
          ttl: 1, // Auto TTL
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      throw new Error(
        `Cloudflare DNS update failed (${updateRes.status}): ${JSON.stringify(err.errors || updateRes.statusText)}`
      );
    }

    const updateData = await updateRes.json();
    return {
      recordId: updateData.result.id,
      name: updateData.result.name,
      content: updateData.result.content,
      proxied: updateData.result.proxied,
      isNew: false,
    };
  }

  // 2. Create new CNAME DNS record
  const createRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'CNAME',
        name: subdomain,
        content: target,
        proxied: false, // Grey cloud (DNS only) as required
        ttl: 1, // Auto TTL
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      `Cloudflare DNS creation failed (${createRes.status}): ${JSON.stringify(err.errors || createRes.statusText)}`
    );
  }

  const createData = await createRes.json();
  return {
    recordId: createData.result.id,
    name: createData.result.name,
    content: createData.result.content,
    proxied: createData.result.proxied,
    isNew: true,
  };
}
