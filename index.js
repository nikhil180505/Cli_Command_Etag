const dns = require('dns').promises
const args = process.argv;

clientCache = {
  "viasocket.com": {
    etag: '"abc123"',
    headers: {},
    cachedAt: 1700000000000
  }
}

if(!process.argv[2]){
    console.log('Please provide the domain.')
    console.log('Usage: node index.js <domain>')
    process.exit(1)
}
console.log('Domain Recived:',process.argv[2]);

async function resolveIPV4(domain){
    try{
    const records = await dns.resolve4(domain);
    return records;
    }catch(err){
        console.log('There is an error ');
        console.log('Reason',err.code);
        return [];
    }
}

// return resolveIPV4(process.argv[2]);

(async () => {
  const ips = await resolveIPV4(process.argv[2]);
// console.log(ips)
  console.log("\nIPv4 Addresses:");
  for (const ip of ips) {
    console.log(" -", ip);
    
  const info = await getIPInfo(ip);
  
  console.log('Owner :',info.org);
  console.log('       Location :',info.city ,'  ',info.country);
  console.log(clasifyIp(info));
  const headers = await inspectHTTP(process.argv[2]);
  console.log('\n\nInspect Data :',headers)
  };

})();

async function getIPInfo(ip){
  const res = await fetch(`https://ipinfo.io/${ip}/json`);
  const data = await res.json();
  return data;
}

function clasifyIp(info){
  const org = info.org;
  if (org.includes("Cloudflare")) return "CDN (Cloudflare)";
  if (org.includes("Akamai")) return "CDN (Akamai)";
  if (org.includes("Fastly")) return "CDN (Fastly)";
  if (org.includes("Google")) return "Google Edge";
  if (org.includes("Amazon")) return "AWS / Cloud";

  return "Unknow Origin"
}

async function inspectHTTP(domain) {try{

  const cacheEntry = clientCache[domain];
  const requestHeaders = {};

  // Send ETag if we have it
  if (cacheEntry?.etag) {
    requestHeaders["If-None-Match"] = cacheEntry.etag;
  }

  const start = process.hrtime.bigint();

  const response = await fetch(`https://${domain}`, {
    method: "HEAD",
    headers: requestHeaders,
    redirect: "manual"
  });

  const end = process.hrtime.bigint();
  const timeTakenMs = Number(end - start) / 1e6;

  // 304 → serve from cache
  if (response.status === 304 && cacheEntry) {
    return {
      source: "CLIENT_CACHE",
      status: 304,
      timeTakenMs: timeTakenMs.toFixed(2),
      headers: cacheEntry.headers,
      etag: cacheEntry.etag
    };
  }

  // 200 → store new cache
  const headers = Object.fromEntries(response.headers.entries());
  const etag = response.headers.get("etag");

  clientCache[domain] = {
    etag,
    headers,
    cachedAt: Date.now()
  };

  return {
    source: "NETWORK",
    status: response.status,
    timeTakenMs: timeTakenMs.toFixed(2),
    headers,
    etag
  };
}catch(err){
console.log('There is some error ',err);
return [];
}
}
