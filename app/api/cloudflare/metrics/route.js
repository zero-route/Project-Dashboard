// GET /api/cloudflare/metrics
// TODO: aktifkan setelah CLOUDFLARE_API_TOKEN & CLOUDFLARE_ZONE_ID diisi.
//
// Cloudflare pakai GraphQL Analytics API:
// POST https://api.cloudflare.com/client/v4/graphql
// Header: Authorization: Bearer ${CLOUDFLARE_API_TOKEN}
// Body berisi query GraphQL untuk httpRequests1dGroups (request, bandwidth, cache ratio)

export async function GET() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!token || !zoneId) {
    return Response.json(
      {
        configured: false,
        message: "CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID belum diset.",
      },
      { status: 200 }
    );
  }

  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${zoneId}" }) {
          httpRequests1dGroups(limit: 1, orderBy: [date_DESC]) {
            sum { requests, bytes, cachedRequests }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    return Response.json({ configured: true, data });
  } catch (err) {
    return Response.json(
      { error: "Gagal mengambil data dari Cloudflare", detail: String(err) },
      { status: 500 }
    );
  }
}
