"use client";

import { useEffect, useState } from "react";
import { Github, ExternalLink, Star, GitFork, Clock, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [repos, setRepos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/github/repos")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRepos(data.repos);
      })
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c14", color: "#e7e9f3", fontFamily: "'Inter', system-ui, sans-serif", padding: "32px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Project GitHub</h1>
      <p style={{ fontSize: 13, color: "#7d8199", marginBottom: 20 }}>
        Data langsung dari GitHub API — atur GITHUB_USERNAME di .env.local
      </p>

      {error && (
        <div style={{ display: "flex", gap: 8, background: "#2a1620", border: "1px solid #4a1e2f", color: "#ff8a9b", padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 16 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {!repos && !error && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat data repo...</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {repos?.map((r) => (
          <div key={r.name} style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 16, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1a1e33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Github size={18} color="#8b8fa8" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#7d8199", marginTop: 2 }}>{r.description || "Tidak ada deskripsi"}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11.5, color: "#7d8199" }}>
                {r.language && <span>{r.language}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={12} /> {r.stars}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GitFork size={12} /> {r.forks}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {new Date(r.updatedAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: "#1a1e33", border: "1px solid #2a2f4a", color: "#e7e9f3", padding: "8px 12px", borderRadius: 9, fontSize: 12.5, textDecoration: "none" }}>
              Buka <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
