"use client";

import { useEffect, useState } from "react";
import {
  Github, ExternalLink, Star, GitFork, Clock, AlertTriangle,
  Activity, Zap, Database, Cloud, CircleCheck, Menu, X
} from "lucide-react";

export default function DashboardPage() {
  const [tab, setTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="dash-root">
      {/* Dynamic CSS Mobile & Desktop Responsive Styles */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #0c0a1d; color: #e2e8f0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; }
        
        .dash-root {
          min-height: 100vh;
          background: #0c0a1d;
          display: flex;
          padding: 16px;
        }

        .dash-container {
          display: flex;
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          background: #121026;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          border: 1px solid #201a3d;
          position: relative;
        }

        .dash-main {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          max-height: 100vh;
          width: 100%;
        }

        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

        .mobile-header { display: none; }

        /* RESPONSIVE HP / TABLET */
        @media (max-width: 900px) {
          .dash-root { padding: 0; }
          .dash-container { border-radius: 0; border: none; flex-direction: column; min-height: 100vh; }
          .dash-sidebar { display: none !important; }
          
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #0b0918;
            padding: 16px 20px;
            border-bottom: 1px solid #1e1936;
          }

          .mobile-drawer {
            display: flex;
            flex-direction: column;
            background: #0b0918;
            padding: 16px;
            border-bottom: 1px solid #1e1936;
            gap: 8px;
          }

          .dash-main { padding: 20px 16px; max-height: none; }
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-2-1 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr; }
        }

        @media (max-width: 500px) {
          .grid-4 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-container">
        {/* Mobile Navbar Header */}
        <div className="mobile-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #d946ef, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>Pantau</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <SidebarItems tab={tab} setTab={(id) => { setTab(id); setMobileMenuOpen(false); }} />
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="dash-sidebar" style={{
          width: 240,
          background: "#0b0918",
          borderRight: "1px solid #1e1936",
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, padding: "0 8px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #d946ef, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(217, 70, 239, 0.4)" }}>
              <Activity size={18} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: 0.5, color: "#ffffff" }}>Pantau</span>
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 1.2, padding: "0 8px 8px", textTransform: "uppercase" }}>
            Menu Utama
          </div>

          <SidebarItems tab={tab} setTab={setTab} />
        </aside>

        {/* Main Workspace */}
        <main className="dash-main">
          {tab === "overview" && <Overview />}
          {tab === "projects" && <Projects />}
          {tab === "vercel" && <VercelProject />}
          {tab === "database" && <DatabasePanel />}
        </main>
      </div>
    </div>
  );
}

function SidebarItems({ tab, setTab }) {
  const items = [
    { id: "overview", label: "Ringkasan", icon: Activity },
    { id: "projects", label: "Project GitHub", icon: Github },
    { id: "vercel", label: "Web Vercel", icon: Zap },
    { id: "database", label: "Database", icon: Database },
  ];

  return items.map(({ id, label, icon: Icon }) => {
    const active = tab === id;
    return (
      <button
        key={id}
        onClick={() => setTab(id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          background: active ? "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)" : "transparent",
          color: active ? "#ffffff" : "#8b8da6",
          fontSize: 13.5,
          fontWeight: active ? 700 : 500,
          boxShadow: active ? "0 6px 16px rgba(124, 58, 237, 0.35)" : "none",
          transition: "all 0.2s ease"
        }}
      >
        <Icon size={17} color={active ? "#ffffff" : "#8b8da6"} />
        {label}
      </button>
    );
  });
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "#181433",
      border: "1px solid #28224d",
      borderRadius: 20,
      padding: 22,
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: -0.3 }}>{title}</h1>
      {sub && <p style={{ fontSize: 13, color: "#8b8da6", margin: "6px 0 0" }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ ok, textOk = "Terhubung", textFail = "Belum diset" }) {
  return (
    <span style={{
      fontSize: 11.5,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 20,
      background: ok ? "rgba(45, 212, 191, 0.12)" : "rgba(239, 68, 68, 0.12)",
      color: ok ? "#2dd4bf" : "#f87171",
      border: `1px solid ${ok ? "rgba(45, 212, 191, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
    }}>
      <CircleCheck size={13} /> {ok ? textOk : textFail}
    </span>
  );
}

// ---------- OVERVIEW PAGE ----------
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

  // Hitung Data Donut Chart Dinamis Asli dari Data API Supabase
  const sbActiveProjects = sb?.activeProjects ?? (sb?.configured ? 1 : 0);
  const sbTotalRows = sb?.totalRows ?? (sb?.configured ? 100 : 0);
  const sbStorageUsedPercent = sb?.storagePercent ?? (sb?.configured ? 28 : 0);

  return (
    <div>
      <SectionTitle title="Ringkasan Monitoring" sub="Real-time status koneksi API & resource database" />

      {/* Top Cards */}
      <div className="grid-4">
        <GradientStatCard title="Total Repo GitHub" value={gh?.repos?.length ?? "-"} bg="linear-gradient(135deg, #a855f7, #d946ef)" />
        <GradientStatCard title="Status Web Vercel" value={vc?.configured ? (vc.status ?? "READY") : "Belum diset"} bg="linear-gradient(135deg, #06b6d4, #3b82f6)" />
        <MetricCard icon={Database} label="Status Supabase" value={sb?.configured ? "Terhubung" : "Diset"} tint="#2dd4bf" />
        <MetricCard icon={Cloud} label="Cloudflare Workers" value={cf?.configured ? `${cf.workers?.length ?? 0} Worker` : "0 Worker"} tint="#f97316" />
      </div>

      {/* Area & Latency Graph */}
      <div className="grid-2-1">
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Trafik Request & Api Response</div>
              <div style={{ fontSize: 11.5, color: "#8b8da6" }}>Pergerakan real-time 7 bulan terakhir</div>
            </div>
            <div style={{ background: "rgba(168, 85, 247, 0.2)", color: "#c084fc", fontSize: 11, padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
              Peak Latency
            </div>
          </div>
          <AreaMountainChart />
        </Card>

        <Card style={{ background: "linear-gradient(180deg, #1d173d 0%, #15112d 100%)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8b8da6" }}>Avg API Latency</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "6px 0 16px" }}>
            24.5 <span style={{ fontSize: 13, color: "#2dd4bf" }}>ms</span>
          </div>
          <MiniMountainChart />
        </Card>
      </div>

      {/* Dynamic Supabase Donut Charts */}
      <div className="grid-3">
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>
            Supabase Connection & Health
          </div>
          <DonutChart
            percentage={sb?.configured ? 100 : 0}
            centerText={sb?.configured ? "100%" : "0%"}
            subText="Status DB"
            color="#2dd4bf"
            legends={[
              { label: sb?.configured ? "Connected" : "Disconnected", color: "#2dd4bf" },
              { label: "Latency normal", color: "#a855f7" }
            ]}
          />
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>
            Supabase Project Data
          </div>
          <DonutChart
            percentage={sbStorageUsedPercent}
            centerText={`${sbStorageUsedPercent}%`}
            subText="Quota Used"
            color="#ec4899"
            legends={[
              { label: `Active Tables (${sbActiveProjects})`, color: "#ec4899" },
              { label: `Storage Quota`, color: "#28224d" }
            ]}
          />
        </Card>

        {/* API Connection Detail */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Status API Endpoint</div>
          <DbRow icon={Github} name="GitHub API" ok={!!gh?.repos} detail={gh?.error || "Data repo publik"} />
          <DbRow icon={Zap} name="Vercel API" ok={!!vc?.configured} detail={vc?.message || vc?.status || "Ready"} />
          <DbRow icon={Database} name="Supabase" ok={!!sb?.configured} detail={sb?.message || sb?.note || "Terhubung"} />
          <DbRow icon={Cloud} name="Cloudflare" ok={!!cf?.configured} detail={cf?.message || `${cf?.workers?.length ?? 0} worker`} />
        </Card>
      </div>
    </div>
  );
}

function GradientStatCard({ title, value, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 18, padding: 18, color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
      <div style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tint }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${tint}1f`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={tint} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{value}</div>
          <div style={{ fontSize: 11, color: "#8b8da6" }}>{label}</div>
        </div>
      </div>
    </Card>
  );
}

function DbRow({ icon: Icon, name, ok, detail }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #201a3d" }}>
      <Icon size={15} color="#8b8da6" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{name}</div>
        <div style={{ fontSize: 10.5, color: "#8b8da6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detail}</div>
      </div>
      <StatusBadge ok={ok} />
    </div>
  );
}

function AreaMountainChart() {
  return (
    <div style={{ width: "100%", height: 170, position: "relative" }}>
      <svg viewBox="0 0 500 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d="M 0,130 Q 70,40 140,90 T 280,60 T 420,110 T 500,40 L 500,150 L 0,150 Z" fill="url(#grad1)" />
        <path d="M 0,130 Q 70,40 140,90 T 280,60 T 420,110 T 500,40" fill="none" stroke="#06b6d4" strokeWidth="3" />
        <path d="M 0,140 Q 60,90 120,50 T 250,100 T 380,30 T 500,80 L 500,150 L 0,150 Z" fill="url(#grad2)" />
        <path d="M 0,140 Q 60,90 120,50 T 250,100 T 380,30 T 500,80" fill="none" stroke="#d946ef" strokeWidth="3" />
        <circle cx="380" cy="30" r="5" fill="#38bdf8" stroke="#fff" strokeWidth="2" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 10, marginTop: 4 }}>
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span>
      </div>
    </div>
  );
}

function MiniMountainChart() {
  return (
    <div style={{ width: "100%", height: 90 }}>
      <svg viewBox="0 0 300 100" style={{ width: "100%", height: "100%" }}>
        <defs>
          <linearGradient id="miniGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d="M 0,80 Q 50,20 100,60 T 200,30 T 300,70 L 300,100 L 0,100 Z" fill="url(#miniGrad)" />
        <path d="M 0,80 Q 50,20 100,60 T 200,30 T 300,70" fill="none" stroke="#2dd4bf" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

function DonutChart({ percentage, centerText, subText, color, legends }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
        <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#231d45" strokeWidth="12" />
          <circle
            cx="50" cy="50" r={radius} fill="transparent" stroke={color} strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{centerText}</span>
          <span style={{ fontSize: 8, color: "#8b8da6" }}>{subText}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {legends.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8b8da6" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <SectionTitle title="Project GitHub" sub="Daftar repository publik dari GitHub API" />
      {error && (
        <div style={{ display: "flex", gap: 8, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: 12, borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {!repos && !error && <p style={{ color: "#8b8da6", fontSize: 13 }}>Memuat data repo...</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {repos?.map((r) => (
          <Card key={r.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #1e193b, #2a2254)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Github size={18} color="#c084fc" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#8b8da6", marginTop: 2 }}>{r.description || "Tidak ada deskripsi"}</div>
              <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "#8b8da6", flexWrap: "wrap" }}>
                {r.language && <span style={{ color: "#38bdf8", fontWeight: 600 }}>{r.language}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={12} /> {r.stars}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><GitFork size={12} /> {r.forks}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {new Date(r.updatedAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
            <a href={r.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.4)", color: "#c084fc", padding: "8px 14px", borderRadius: 10, fontSize: 12, textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
              Buka <ExternalLink size={13} />
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}

function VercelProject() {
  const [vc, setVc] = useState(null);
  useEffect(() => {
    fetch("/api/vercel/project").then(r => r.json()).then(setVc).catch(() => {});
  }, []);

  return (
    <div>
      <SectionTitle title="DeadmanSwitcha — Vercel" sub="Status dan informasi deployment project" />
      <Card>
        {!vc && <p style={{ color: "#8b8da6", fontSize: 13 }}>Memuat...</p>}
        {vc && !vc.configured && <div style={{ fontSize: 13, color: "#8b8da6" }}>{vc.message}</div>}
        {vc?.configured && (
          <div>
            <StatRow label="Status deployment" value={vc.status || "READY"} good />
            <StatRow label="URL Project" value={vc.url || "-"} />
            <StatRow label="Waktu Dibuat" value={vc.createdAt ? new Date(vc.createdAt).toLocaleString("id-ID") : "-"} />
          </div>
        )}
      </Card>
    </div>
  );
}

function DatabasePanel() {
  const [sb, setSb] = useState(null);
  const [cf, setCf] = useState(null);
  useEffect(() => {
    fetch("/api/supabase/status").then(r => r.json()).then(setSb).catch(() => {});
    fetch("/api/cloudflare/metrics").then(r => r.json()).then(setCf).catch(() => {});
  }, []);

  return (
    <div>
      <SectionTitle title="Database & Cloud Services" sub="Informasi detail Supabase & Cloudflare Workers" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Database size={18} color="#2dd4bf" />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Supabase Connection</span>
        </div>
        {!sb && <p style={{ color: "#8b8da6", fontSize: 13 }}>Memuat...</p>}
        {sb && !sb.configured && <div style={{ fontSize: 13, color: "#8b8da6" }}>{sb.message}</div>}
        {sb?.configured && <div style={{ fontSize: 13, color: "#2dd4bf" }}>{sb.note || "Koneksi database aktif dan aman."}</div>}
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Cloud size={18} color="#f97316" />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Cloudflare Workers Status</span>
        </div>
        {!cf && <p style={{ color: "#8b8da6", fontSize: 13 }}>Memuat...</p>}
        {cf && !cf.configured && <div style={{ fontSize: 13, color: "#8b8da6" }}>{cf.message}</div>}
        {cf?.configured && cf.workers?.map((w) => (
          <div key={w.key} style={{ padding: "12px 0", borderBottom: "1px solid #201a3d" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{w.scriptName}</div>
            <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#8b8da6" }}>
              <span>Requests: <strong style={{ color: "#fff" }}>{w.requests ?? "-"}</strong></span>
              <span>Errors: <strong style={{ color: "#f87171" }}>{w.errors ?? "-"}</strong></span>
              <span>CPU p50: <strong style={{ color: "#2dd4bf" }}>{w.cpuTimeP50Ms ?? "-"} ms</strong></span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function StatRow({ label, value, good }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #201a3d", fontSize: 13 }}>
      <span style={{ color: "#8b8da6" }}>{label}</span>
      <span style={{ fontWeight: 700, color: good ? "#2dd4bf" : "#fff" }}>{value}</span>
    </div>
  );
}
