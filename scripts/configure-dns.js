import { post, get } from 'axios';

async function configureDNS(projectName, domain, vercelToken, cloudflareToken) {
  if (!domain) {
    console.log('ℹ️ No custom domain specified, skipping DNS configuration');
    return;
  }

  try {
    console.log(`🔧 Configuring DNS for ${domain}...`);
    
    await post(
      `https://api.vercel.com/v9/projects/${projectName}/domains`,
      { name: domain },
      {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Added domain to Vercel: ${domain}`);

    const zone = domain.split('.').slice(-2).join('.');
    const subdomain = domain.replace(`.${zone}`, '');
    
    const zoneResponse = await get(
      `https://api.cloudflare.com/client/v4/zones?name=${zone}`,
      {
        headers: { 'Authorization': `Bearer ${cloudflareToken}` }
      }
    );
    
    const zoneId = zoneResponse.data.result[0]?.id;
    if (!zoneId) {
      throw new Error(`Could not find Cloudflare zone for: ${zone}`);
    }

    await post(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        type: 'CNAME',
        name: subdomain,
        content: 'cname.vercel-dns.com',
        ttl: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${cloudflareToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ DNS configured for: ${domain}`);
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️ Domain ${domain} already configured`);
    } else {
      console.error('❌ DNS configuration failed:', error.message);
      throw error;
    }
  }
}

const args = process.argv.slice(2);
const projectName = args[args.indexOf('--project-name') + 1];
const domain = args[args.indexOf('--domain') + 1];
const vercelToken = args[args.indexOf('--vercel-token') + 1];
const cloudflareToken = args[args.indexOf('--cloudflare-token') + 1];

configureDNS(projectName, domain, vercelToken, cloudflareToken)
  .catch(error => {
    console.error('Script failed:', error.message);
    process.exit(1);
  });