// GET /api/cloudflare/timeseries
// Ambil jumlah request per jam (24 jam terakhir) untuk 1 Worker tertentu —
// dipakai buat grafik bukit di Ringkasan supaya datanya asli, bukan random.
// Default: Worker DeadmanSwitcha (CLOUDFLARE_WORKER_DEADMANSWITCH).

export async function GET() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const scriptName = process.env.CLOUDFLARE_WORKER_DEADMANSWITCH;

  if (!token || !accountId || !scriptName) {
    return Response.json({ configured: false, message: "Env Cloudflare belum lengkap." }, { status: 200 });
  }

  const query = `
    query GetWorkerTimeseries($accountTag: String!, $scriptName: String!, $since: Time!, $until: Time!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          workersInvocationsAdaptive(
            limit: 24
            filter: { scriptName: $scriptName, datetime_geq: $since, datetime_leq: $until }
            orderBy: [datetimeHour_ASC]
          ) {
            dimensions { datetimeHour }
            sum { requests }
          }
        }
      }
    }
  `;

  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const until = now.toISOString();

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { accountTag: accountId, scriptName, since, until } }),
    });
    const json = await res.json();
    const rows = json?.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive ?? [];

    const points = rows.map((r, i) => ({ x: i, y: r.sum?.requests ?? 0, hour: r.dimensions?.datetimeHour }));

    return Response.json({ configured: true, scriptName, points });
  } catch (err) {
    return Response.json({ error: "Gagal mengambil timeseries Cloudflare", detail: String(err) }, { status: 500 });
  }
}