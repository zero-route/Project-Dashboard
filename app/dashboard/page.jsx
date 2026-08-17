"use client";

import { useEffect, useState } from "react";
import {
  Github, ExternalLink, Star, GitFork, Clock, AlertTriangle,
  Activity, Zap, Database, Cloud, CircleCheck,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip,
} from "recharts";

const PIE_COLORS = ["#c084fc", "#5b8def", "#4dd6c4", "#ff8a5b", "#f472b6", "#facc15"];

// data dekoratif buat grafik gelombang (bukan dari API, murni visual)
const wave = [12, 19, 14, 26, 22, 30, 24, 34, 28, 38, 32, 41].map((v, i) => ({ x: i, y: v }));

export default function DashboardPage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="layout">
      <Sidebar tab={tab} setTab={setTab} />
      <main className="main">
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
    <aside className="sidebar">
      <div className="brand" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "0 8px" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#5b8def,#c084fc)" }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#e7e9f3" }}>Pantau</span>
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
  return <div style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 16, padding: 18, color: "#e7e9f3", ...style }}>{children}</div>;
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "#e7e9f3" }}>{title}</h1>
      {sub && <p style={{ fontSize: 12.5, color: "#7d8199", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function StatusBadge({ ok, textOk = "Terhubung", textFail = "Belum diset" }) {
  return (
    <span style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: ok ? "#4dd6c4" : "#7d8199", flexShrink: 0 }}>
      <CircleCheck size={12} /> {ok ? textOk : textFail}
    </span>
  );
}

function GradientCard({ label, value, sub, from, to }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${from}, ${to})`,
      borderRadius: 18, padding: "20px 22px", color: "#fff",
      minHeight: 110, display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function DonutCard({ title, data, centerLabel, centerValue }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{title}</div>
      {total === 0 ? (
        <div style={{ fontSize: 12, color: "#7d8199", padding: "30px 0", textAlign: "center" }}>Belum ada data</div>
      ) : (
        <div style={{ position: "relative" }}>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={3}>
                {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#181c30", border: "1px solid #2a2f4a", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{centerValue}</div>
            <div style={{ fontSize: 10, color: "#7d8199" }}>{centerLabel}</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10, justifyContent: "center" }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#a7abc2" }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: PIE_COLORS[i % PIE_COLORS.length] }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </Card>
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

  // Donut 1: distribusi request per Worker Cloudflare (data asli)
  const workerData = (cf?.workers || [])
    .filter(w => w.requests != null)
    .map(w => ({ name: w.scriptName, value: w.requests }));

  // Donut 2: bahasa pemrograman repo GitHub (data asli)
  const langCount = {};
  (gh?.repos || []).forEach(r => {
    if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
  });
  const langData = Object.entries(langCount).map(([name, value]) => ({ name, value }));

  // Donut 3: status koneksi 4 layanan (data asli)
  const connected = [gh?.repos, vc?.configured, sb?.configured, cf?.configured].filter(Boolean).length;
  const statusData = [
    { name: "Terhubung", value: connected },
    { name: "Belum diset", value: 4 - connected },
  ];

  return (
    <div>
      <SectionTitle title="Ringkasan Monitoring" sub="Status seluruh layanan yang dipantau" />

      <div className="grid-2 hero-2col" style={{ marginBottom: 14 }}>
        <GradientCard label="Total Repo GitHub" value={gh?.repos?.length ?? "-"} sub="dari akun zero-route" from="#c084fc" to="#7c5cf0" />
        <GradientCard label="Status Web Vercel" value={vc?.configured ? (vc.status ?? "Live") : "-"} sub="DeadmanSwitcha" from="#5b8def" to="#38c6d9" />
      </div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Aktivitas 7 Hari Terakhir</div>
        <div style={{ fontSize: 11, color: "#7d8199", marginBottom: 8 }}>Ilustrasi tren (belum tersambung ke data historis asli)</div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={wave}>
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8def" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#5b8def" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="y" stroke="#5b8def" fill="url(#waveGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid-3" style={{ marginBottom: 14 }}>
        <DonutCard
          title="Request per Worker (Cloudflare)"
          data={workerData}
          centerValue={workerData.reduce((s, d) => s + d.value, 0)}
          centerLabel="requests"
        />
        <DonutCard
          title="Bahasa Repo (GitHub)"
          data={langData}
          centerValue={gh?.repos?.length ?? 0}
          centerLabel="repo"
        />
        <DonutCard
          title="Status Koneksi API"
          data={statusData}
          centerValue={`${connected}/4`}
          centerLabel="terhubung"
        />
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Detail Status Koneksi</div>
        <DbRow icon={Github} name="GitHub API" ok={!!gh?.repos} detail={gh?.error || "Data repo publik"} />
        <DbRow icon={Zap} name="Vercel API" ok={!!vc?.configured} detail={vc?.message || vc?.status || ""} />
        <DbRow icon={Database} name="Supabase" ok={!!sb?.configured} detail={sb?.message || sb?.note || ""} />
        <DbRow icon={Cloud} name="Cloudflare" ok={!!cf?.configured} detail={cf?.message || `${cf?.workers?.length ?? 0} worker terdaftar`} />
      </Card>
    </div>
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
      <SectionTitle title="Project GitHub" sub="Data langsung dari GitHub API" />
      {error && (
        <div style={{ display: "flex", gap: 8, background: "#2a1620", border: "1px solid #4a1e2f", color: "#ff8a9b", padding: 12, borderRadius: 10, fontSize: 12.5, marginBottom: 14 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {!repos && !error && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat data repo...</p>}
      <div style={{ display: "grid", gap: 10 }}>
        {repos?.map((r) => (
          <Card key={r.name} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#1a1e33", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Github size={16} color="#8b8fa8" />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
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
      <div className="grid-2" style={{ marginBottom: 14 }}>
        <GradientCard label="Status" value={vc?.configured ? (vc.status ?? "Live") : "-"} sub="deployment terbaru" from="#4dd6c4" to="#2aa198" />
        <GradientCard label="Domain" value={vc?.url ? "Aktif" : "-"} sub={vc?.url || ""} from="#ff8a5b" to="#f4527a" />
      </div>
      <Card>
        {!vc && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat...</p>}
        {vc && !vc.configured && <div style={{ fontSize: 13, color: "#7d8199" }}>{vc.message}</div>}
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

  const workerData = (cf?.workers || [])
    .filter(w => w.requests != null)
    .map(w => ({ name: w.scriptName, value: w.requests }));

  return (
    <div>
      <SectionTitle title="Database" sub="Supabase & Cloudflare Workers" />

      <div className="grid-3" style={{ marginBottom: 14 }}>
        <DonutCard
          title="Request per Worker"
          data={workerData}
          centerValue={workerData.reduce((s, d) => s + d.value, 0)}
          centerLabel="requests"
        />
      </div>

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
            <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "#7d8199", flexWrap: "wrap" }}>
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
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2338", fontSize: 12.5, gap: 10 }}>
      <span style={{ color: "#7d8199" }}>{label}</span>
      <span style={{ fontWeight: 600, color: good ? "#4dd6c4" : "#e7e9f3", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
    </div>
  );
}