// GET /api/github/repos
// Mengambil daftar repo dari akun GitHub kamu.
// GITHUB_TOKEN opsional — tanpa token tetap bisa untuk repo publik,
// tapi rate limit cuma 60 request/jam per IP (dengan token: 5000/jam).

export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return Response.json(
      { error: "GITHUB_USERNAME belum diset di environment variables." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // cache 5 menit di edge supaya nggak selalu hit rate limit
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return Response.json(
        { error: `GitHub API error ${res.status}`, detail: body },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Ambil field yang relevan saja untuk dashboard
    const repos = data.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      updatedAt: r.updated_at,
      openIssues: r.open_issues_count,
      archived: r.archived,
      defaultBranch: r.default_branch,
    }));

    return Response.json({ repos, username });
  } catch (err) {
    return Response.json(
      { error: "Gagal mengambil data dari GitHub", detail: String(err) },
      { status: 500 }
    );
  }
}
