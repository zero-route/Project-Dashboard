// GET /api/vercel/project
// Mengambil seluruh daftar project dari akun Vercel kamu.

export async function GET() {
  // Cek token bawaan atau token bernama MONITOR_VERCEL_TOKEN
  const token = process.env.VERCEL_TOKEN || process.env.MONITOR_VERCEL_TOKEN;

  if (!token) {
    return Response.json(
      {
        configured: false,
        message: "VERCEL_TOKEN / MONITOR_VERCEL_TOKEN belum diset.",
      },
      { status: 200 }
    );
  }

  try {
    // Endpoint Vercel v9/projects mengambil SEMUA project di akunmu
    const res = await fetch("https://api.vercel.com/v9/projects", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 }, // Cache 1 menit
    });

    if (!res.ok) {
      const body = await res.text();
      return Response.json(
        { error: `Vercel API error ${res.status}`, detail: body },
        { status: res.status }
      );
    }

    const data = await res.json();

    const projects =
      data.projects?.map((p) => ({
        id: p.id,
        name: p.name,
        framework: p.framework || "nextjs",
        updatedAt: p.updatedAt,
        url: p.targets?.production?.url
          ? `https://${p.targets.production.url}`
          : null,
        status: p.targets?.production?.readyState || "READY",
      })) || [];

    return Response.json({
      configured: true,
      projects,
    });
  } catch (err) {
    return Response.json(
      { error: "Gagal mengambil data dari Vercel", detail: String(err) },
      { status: 500 }
    );
  }
}
