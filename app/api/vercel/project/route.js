// GET /api/vercel/project
// TODO: aktifkan setelah VERCEL_TOKEN & VERCEL_PROJECT_ID diisi di .env.local
//
// Endpoint Vercel yang relevan nanti:
// - Deployment terbaru:  GET https://api.vercel.com/v6/deployments?projectId={id}&limit=1
// - Detail deployment:   GET https://api.vercel.com/v13/deployments/{deploymentId}
// - Web Analytics:       GET https://api.vercel.com/v1/web-analytics/... (butuh plan Pro)
//
// Auth header: Authorization: Bearer ${VERCEL_TOKEN}

export async function GET() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return Response.json(
      {
        configured: false,
        message: "VERCEL_TOKEN / VERCEL_PROJECT_ID belum diset. Menampilkan data kosong.",
      },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } }
    );

    if (!res.ok) {
      const body = await res.text();
      return Response.json(
        { error: `Vercel API error ${res.status}`, detail: body },
        { status: res.status }
      );
    }

    const data = await res.json();
    const latest = data.deployments?.[0];

    return Response.json({
      configured: true,
      status: latest?.state,
      url: latest?.url,
      createdAt: latest?.createdAt,
    });
  } catch (err) {
    return Response.json(
      { error: "Gagal mengambil data dari Vercel", detail: String(err) },
      { status: 500 }
    );
  }
}
