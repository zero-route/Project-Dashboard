import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.VERCEL_TOKEN || process.env.MONITOR_VERCEL_TOKEN;

  if (!token) {
    return NextResponse.json({
      configured: false,
      message: "VERCEL_TOKEN / MONITOR_VERCEL_TOKEN belum diset.",
    });
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch daftar project
    const resProjects = await fetch("https://api.vercel.com/v9/projects", {
      headers,
      next: { revalidate: 60 },
    });

    if (!resProjects.ok) throw new Error(`Vercel API Error ${resProjects.status}`);
    const dataProjects = await resProjects.json();

    // Fetch deployment & riwayat max 5 untuk tiap project
    const projectsWithDeployments = await Promise.all(
      (dataProjects.projects || []).map(async (p) => {
        try {
          const resDep = await fetch(
            `https://api.vercel.com/v6/deployments?projectId=${p.id}&limit=5`,
            { headers, next: { revalidate: 60 } }
          );
          const dataDep = await resDep.json();

          const deployments = (dataDep.deployments || []).map((d) => ({
            id: d.uid,
            state: d.state,
            url: d.url ? `https://${d.url}` : null,
            createdAt: d.createdAt,
            commitMessage: d.meta?.githubCommitMessage || d.meta?.commitMessage || "Manual deployment / CLI",
            branch: d.meta?.githubCommitRef || "main",
          }));

          return {
            id: p.id,
            name: p.name,
            framework: p.framework || "nextjs",
            updatedAt: p.updatedAt,
            url: p.targets?.production?.url ? `https://${p.targets.production.url}` : null,
            status: p.targets?.production?.readyState || "READY",
            deployments,
          };
        } catch {
          return {
            id: p.id,
            name: p.name,
            framework: p.framework || "nextjs",
            updatedAt: p.updatedAt,
            url: p.targets?.production?.url ? `https://${p.targets.production.url}` : null,
            status: p.targets?.production?.readyState || "READY",
            deployments: [],
          };
        }
      })
    );

    return NextResponse.json({
      configured: true,
      projects: projectsWithDeployments,
    });
  } catch (err) {
    return NextResponse.json({ configured: false, message: String(err) });
  }
}
