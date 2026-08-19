// GET /api/github/repos
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
    // 1. Jika ada GITHUB_TOKEN, gunakan endpoint '/user/repos' agar repo Private juga ikut ketarik.
    // 2. per_page dinaikkan ke 100 agar semua repo terambil tanpa terpotong.
    const endpoint = token
      ? `https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner`
      : `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;

    const res = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 300 }, // Cache 5 menit
    });

    if (!res.ok) {
      const body = await res.text();
      return Response.json(
        { error: `GitHub API error ${res.status}`, detail: body },
        { status: res.status }
      );
    }

    const data = await res.json();

    const repos = data.map((r) => {
      const pagesUrl = r.has_pages ? `https://${username}.github.io/${r.name}/` : null;
      const liveUrl = r.homepage?.trim() || pagesUrl || null;

      return {
        name: r.name,
        description: r.description,
        url: r.html_url,
        liveUrl,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        updatedAt: r.updated_at,
        openIssues: r.open_issues_count,
        archived: r.archived,
        defaultBranch: r.default_branch,
        isPrivate: r.private,
      };
    });

    return Response.json({ repos, username });
  } catch (err) {
    return Response.json(
      { error: "Gagal mengambil data dari GitHub", detail: String(err) },
      { status: 500 }
    );
  }
}
