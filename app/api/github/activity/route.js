// GET /api/github/activity
// Menghitung jumlah aktivitas publik GitHub (push, commit, dll) per hari
// selama 14 hari terakhir — dipakai untuk grafik Live Activity di Ringkasan.
// Data ini SELALU asli (bukan random), walau nilainya kecil/nol di hari sepi.

export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return Response.json({ error: "GITHUB_USERNAME belum diset." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        next: { revalidate: 120 },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return Response.json({ error: `GitHub API error ${res.status}`, detail: body }, { status: res.status });
    }

    const events = await res.json();

    // siapkan 14 slot hari, dari 13 hari lalu sampai hari ini
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({ date: d, count: 0 });
    }

    events.forEach((e) => {
      const t = new Date(e.created_at);
      t.setHours(0, 0, 0, 0);
      const idx = days.findIndex((d) => d.date.getTime() === t.getTime());
      if (idx >= 0) days[idx].count++;
    });

    const points = days.map((d, i) => ({
      x: i,
      y: d.count,
      date: d.date.toISOString().slice(0, 10),
    }));

    return Response.json({ configured: true, points });
  } catch (err) {
    return Response.json({ error: "Gagal mengambil aktivitas GitHub", detail: String(err) }, { status: 500 });
  }
}