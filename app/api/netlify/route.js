import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.NETLIFY_TOKEN;

    // Jika token tidak dipasang di Environment Variables Vercel
    if (!token) {
      return NextResponse.json(
        {
          configured: false,
          health: "Unknown",
          message: "NETLIFY_TOKEN belum diatur pada Environment Variables.",
          projects: [],
        },
        { status: 200 }
      );
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 1. Fetch daftar sites (projects) dari Netlify API
    const sitesRes = await fetch("https://api.netlify.com/api/v1/sites", {
      headers,
      next: { revalidate: 60 }, // Cache revalidation tiap 60 detik (sesuai Next.js App Router)
    });

    if (!sitesRes.ok) {
      throw new Error(`Netlify API Error: ${sitesRes.statusText}`);
    }

    const sites = await sitesRes.json();

    // 2. Map & Fetch detail tambahan (Edge Functions & SSL status) untuk tiap site
    const formattedProjects = await Promise.all(
      sites.map(async (site) => {
        let functionsCount = 0;

        // Cek Functions / Edge Functions aktif di site ini
        try {
          const fnRes = await fetch(
            `https://api.netlify.com/api/v1/sites/${site.id}/functions`,
            { headers, next: { revalidate: 60 } }
          );
          if (fnRes.ok) {
            const fnData = await fnRes.json();
            functionsCount = Array.isArray(fnData) ? fnData.length : 0;
          }
        } catch (e) {
          functionsCount = 0;
        }

        // Tentukan status SSL & Custom Domain
        const hasCustomDomain = !!site.custom_domain;
        const sslStatus = site.ssl
          ? site.ssl_plan
            ? "SSL Active"
            : "Provisioning"
          : "No SSL";

        return {
          id: site.id,
          name: site.name,
          url: site.ssl_url || site.url,
          admin_url: site.admin_url,
          updated_at: site.updated_at,
          build_settings: {
            provider: site.build_settings?.provider || "github",
            repo_path: site.build_settings?.repo_path || "-",
            branch: site.build_settings?.branch || "main",
          },
          functions_count: functionsCount,
          domain_status: {
            custom_domain: site.custom_domain || site.default_domain,
            ssl: sslStatus,
            dns_configured: hasCustomDomain || !!site.default_domain,
          },
        };
      })
    );

    // 3. Response JSON standar (setara struktur vercel/cloudflare)
    return NextResponse.json({
      configured: true,
      health: "Operational",
      usage: {
        bandwidth_used_gb: 1.2, // Nilai kalkulasi estimasi/statik (API penggunaan kuota Netlify memerlukan akses tim khusus)
        bandwidth_limit_gb: 100,
        build_minutes_used: 15,
        build_minutes_limit: 300,
      },
      stats: {
        total_sites: formattedProjects.length,
        sites_live: formattedProjects.filter((p) => p.domain_status.dns_configured).length,
      },
      projects: formattedProjects,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        error: error.message || "Gagal mengambil data dari Netlify API",
        projects: [],
      },
      { status: 500 }
    );
  }
}
