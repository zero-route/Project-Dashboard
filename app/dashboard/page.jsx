"use client";

import { useEffect, useState } from "react";
import {
  Github, ExternalLink, Star, GitFork, Clock, AlertTriangle,
  Activity, Zap, Database, Cloud, Users, CircleCheck,
} from "lucide-react";

export default function DashboardPage() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c14", color: "#e7e9f3", fontFamily: "'Inter', system-ui, sans-serif", display: "flex" }}>
      <Sidebar tab={tab} setTab={setTab} />
      <main style={{ flex: 1, padding: "28px 20px", maxWidth: 1100 }}>
        {tab === "overview" && <Overview />}
        {tab === "projects" && <Projects />}
        {tab === "vercel" && <VercelProject />}
        {tab === "database" && <DatabasePanel />}
      </main>
    </div>
  );
}

function Sidebar({ tab, setTab }) {
  const items = [
    { id: "overview", label: "Ringkasan", icon: Activity },
    { id: "projects", label: "Project GitHub", icon: Github },
    { id: "vercel", label: "Web Vercel", icon: Zap },
    { id: "database", label: "Database", icon: Database },
  ];
  return (
    <aside style={{ width: 210, background: "#0e1120", borderRight: "1px solid #1c2033", padding: "24px 14px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "0 8px" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#5b8def,#c084fc)" }} />
        <span style={{ fontWeight: 700, fontSize: 14 }}>Pantau</span>
      </div>
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setTab(id)}
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
            background: tab === id ? "#1a1e33" : "transparent",
            color: tab === id ? "#fff" : "#8b8fa8", fontSize: 13, fontWeight: 500,
          }}>
          <Icon size={16} /> {label}
        </button>
      ))}
    </aside>
  );
}

function Card({ children, style }) {
  return <div style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 16, padding: 18, ...style }}>{children}</div>;
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 12.5, color: "#7d8199", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ ok, textOk = "Terhubung", textFail = "Belum diset" }) {
  return (
    <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: ok ? "#4dd6c4" : "#7d8199" }}>
      <CircleCheck size={12} /> {ok ? textOk : textFail}
    </span>
  );
}

// ---------- OVERVIEW ----------
function Overview() {
  const [gh, setGh] = useState(null);
  const [vc, setVc] = useState(null);
  const [sb, setSb] = useState(null);
  const [cf, setCf] = useState(null);

  useEffect(() => {
    fetch("/api/github/repos").then(r => r.json()).then(setGh).catch(() => {});
    fetch("/api/vercel/project").then(r => r.json()).then(setVc).catch(() => {});
    fetch("/api/supabase/status").then(r => r.json()).then(setSb).catch(() => {});
    fetch("/api/cloudflare/metrics").then(r => r.json()).then(setCf).catch(() => {});
  }, []);

  return (
    <div>
      <SectionTitle title="Ringkasan Monitoring" sub="Status koneksi tiap layanan" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
        <MetricCard icon={Github} label="Total Repo GitHub" value={gh?.repos?.length ?? "-"} tint="#5b8def" />
        <MetricCard icon={Zap} label="Status Web Vercel" value={vc?.configured ? (vc.status ?? "Live") : "Belum diset"} tint="#c084fc" />
        <MetricCard icon={Database} label="Supabase" value={sb?.configured ? "Terhubung" : "Belum diset"} tint="#4dd6c4" />
        <MetricCard icon={Cloud} label="Cloudflare Workers" value={cf?.configured ? `${cf.workers?.length ?? 0} worker` : "Belum diset"} tint="#ff8a5b" />
      </div>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Status Koneksi API</div>
        <DbRow icon={Github} name="GitHub API" ok={!!gh?.repos} detail={gh?.error || "Data repo publik"} />
        <DbRow icon={Zap} name="Vercel API" ok={!!vc?.configured} detail={vc?.message || vc?.status || ""} />
        <DbRow icon={Database} name="Supabase" ok={!!sb?.configured} detail={sb?.message || sb?.note || ""} />
        <DbRow icon={Cloud} name="Cloudflare" ok={!!cf?.configured} detail={cf?.message || `${cf?.workers?.length ?? 0} worker terdaftar`} />
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tint }) {
  return (
    <Card>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${tint}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={tint} />
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, marginTop: 10 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#7d8199", marginTop: 2 }}>{label}</div>
    </Card>
  );
}

function DbRow({ icon: Icon, name, ok, detail }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #1e2338" }}>
      <Icon size={15} color="#7d8199" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 11, color: "#7d8199", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detail}</div>
      </div>
      <StatusBadge ok={ok} />
    </div>
  );
}

// ---------- GITHUB PROJECTS ----------
function Projects() {
  const [repos, setRepos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/github/repos")
      .then((res) => res.json())
      .then((data) => { if (data.error) setError(data.error); else setRepos(data.repos); })
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div>
      <SectionTitle title="Project GitHub" sub="Data langsung dari GitHub API — atur GITHUB_USERNAME di env" />
      {error && (
        <div style={{ display: "flex", gap: 8, background: "#2a1620", border: "1px solid #4a1e2f", color: "#ff8a9b", padding: 12, borderRadius: 10, fontSize: 12.5, marginBottom: 14 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {!repos && !error && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat data repo...</p>}
      <div style={{ display: "grid", gap: 10 }}>
        {repos?.map((r) => (
          <Card key={r.name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1a1e33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Github size={16} color="#8b8fa8" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: "#7d8199", marginTop: 2 }}>{r.description || "Tidak ada deskripsi"}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: "#7d8199", flexWrap: "wrap" }}>
                {r.language && <span>{r.language}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={11} /> {r.stars}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><GitFork size={11} /> {r.forks}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {new Date(r.updatedAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "#1a1e33", border: "1px solid #2a2f4a", color: "#e7e9f3", padding: "7px 10px", borderRadius: 8, fontSize: 12, textDecoration: "none", flexShrink: 0 }}>
              Buka <ExternalLink size={12} />
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------- VERCEL ----------
function VercelProject() {
  const [vc, setVc] = useState(null);
  useEffect(() => {
    fetch("/api/vercel/project").then(r => r.json()).then(setVc).catch(() => {});
  }, []);

  return (
    <div>
      <SectionTitle title="DeadmanSwitcha — Vercel" sub="Status deployment project" />
      <Card>
        {!vc && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat...</p>}
        {vc && !vc.configured && (
          <div style={{ fontSize: 13, color: "#7d8199" }}>{vc.message}</div>
        )}
        {vc?.configured && (
          <>
            <StatRow label="Status deployment" value={vc.status || "-"} good />
            <StatRow label="URL" value={vc.url || "-"} />
            <StatRow label="Dibuat" value={vc.createdAt ? new Date(vc.createdAt).toLocaleString("id-ID") : "-"} />
          </>
        )}
      </Card>
    </div>
  );
}

// ---------- DATABASE ----------
function DatabasePanel() {
  const [sb, setSb] = useState(null);
  const [cf, setCf] = useState(null);
  useEffect(() => {
    fetch("/api/supabase/status").then(r => r.json()).then(setSb).catch(() => {});
    fetch("/api/cloudflare/metrics").then(r => r.json()).then(setCf).catch(() => {});
  }, []);

  return (
    <div>
      <SectionTitle title="Database" sub="Supabase & Cloudflare Workers" />
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Database size={16} color="#4dd6c4" /> <span style={{ fontWeight: 600, fontSize: 13.5 }}>Supabase</span>
        </div>
        {!sb && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat...</p>}
        {sb && !sb.configured && <div style={{ fontSize: 13, color: "#7d8199" }}>{sb.message}</div>}
        {sb?.configured && <div style={{ fontSize: 13, color: "#7d8199" }}>{sb.note}</div>}
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Cloud size={16} color="#ff8a5b" /> <span style={{ fontWeight: 600, fontSize: 13.5 }}>Cloudflare Workers</span>
        </div>
        {!cf && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat...</p>}
        {cf && !cf.configured && <div style={{ fontSize: 13, color: "#7d8199" }}>{cf.message}</div>}
        {cf?.configured && cf.workers?.map((w) => (
          <div key={w.key} style={{ padding: "10px 0", borderBottom: "1px solid #1e2338" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{w.scriptName}</div>
            <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "#7d8199" }}>
              <span>Requests: {w.requests ?? "-"}</span>
              <span>Errors: {w.errors ?? "-"}</span>
              <span>CPU p50: {w.cpuTimeP50Ms ?? "-"} ms</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function StatRow({ label, value, good }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2338", fontSize: 12.5 }}>
      <span style={{ color: "#7d8199" }}>{label}</span>
      <span style={{ fontWeight: 600, color: good ? "#4dd6c4" : "#e7e9f3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
    </div>
  );
}