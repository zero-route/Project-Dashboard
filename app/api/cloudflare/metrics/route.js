// GET /api/cloudflare/metrics
// Mengambil metrik 3 Workers: requests, error rate, CPU time — via
// Cloudflare GraphQL Analytics API, difilter per scriptName (bukan per zone,
// karena project-project ini adalah Workers, bukan domain custom).
//
// Env var yang dibutuhkan:
// - CLOUDFLARE_API_TOKEN
// - CLOUDFLARE_ACCOUNT_ID
// - CLOUDFLARE_WORKER_DEADMANSWITCH
// - CLOUDFLARE_WORKER_GEMINI
// - CLOUDFLARE_WORKER_YTMUSIC

const WORKER_ENV_KEYS = {
  deadmanswitch: "CLOUDFLARE_WORKER_DEADMANSWITCH",
  gemini: "CLOUDFLARE_WORKER_GEMINI",
  ytmusic: "CLOUDFLARE_WORKER_YTMUSIC",
};

export async function GET() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  const workers = Object.entries(WORKER_ENV_KEYS)
    .map(([key, envName]) => ({ key, scriptName: process.env[envName] }))
    .filter((w) => w.scriptName);

  if (!token || !accountId || workers.length === 0) {
    return Response.json(
      {
        configured: false,
        message:
          "CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID / nama worker belum lengkap diset.",
      },
      { status: 200 }
    );
  }

  // Query GraphQL: workersInvocationsAdaptive, per script, 24 jam terakhir
  const query = `
    query GetWorkerMetrics($accountTag: String!, $scriptName: String!, $since: Time!, $until: Time!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          workersInvocationsAdaptive(
            limit: 1
            filter: { scriptName: $scriptName, datetime_geq: $since, datetime_leq: $until }
          ) {
            sum {
              requests
              errors
              subrequests
            }
            quantiles {
              cpuTimeP50
              cpuTimeP99
            }
          }
        }
      }
    }
  `;

  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const until = now.toISOString();

  try {
    const results = await Promise.all(
      workers.map(async ({ key, scriptName }) => {
        const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { accountTag: accountId, scriptName, since, until },
          }),
        });

        const json = await res.json();
        const data = json?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.[0];

        return {
          key,
          scriptName,
          requests: data?.sum?.requests ?? null,
          errors: data?.sum?.errors ?? null,
          cpuTimeP50Ms: data?.quantiles?.cpuTimeP50 ?? null,
          cpuTimeP99Ms: data?.quantiles?.cpuTimeP99 ?? null,
          errorsResponse: json.errors ?? null,
        };
      })
    );

    return Response.json({ configured: true, since, until, workers: results });
  } catch (err) {
    return Response.json(
      { error: "Gagal mengambil data dari Cloudflare", detail: String(err) },
      { status: 500 }
    );
  }
}