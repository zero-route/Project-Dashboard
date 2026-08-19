"use client";

import { useEffect, useState, useRef } from "react";
import {
  Github, ExternalLink, Star, GitFork, Clock, AlertTriangle,
  Activity, Zap, Database, Cloud, CircleCheck, Menu, Music2, Bot,
  Globe, Radio, Copy, Search, SkipBack, SkipForward, Pause, Play, ChevronDown,
  Send, Sparkles,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";

const PIE_COLORS = ["#c084fc", "#5b8def", "#4dd6c4", "#ff8a5b", "#f472b6", "#facc15"];

const GEMINI_CHAT_API = "https://dashboard-chat-bot.iostream911.workers.dev/";

const YT_SEARCH_API = "https://yt-music-portofolio.iostream911.workers.dev/";

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function useMusicPlayer() {
  const [view, setView] = useState("closed"); // closed | search | now-playing | mini
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (window.YT && window.YT.Player) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  const waitForYT = (fn) => {
    if (window.YT && window.YT.Player) fn();
    else setTimeout(() => waitForYT(fn), 200);
  };

  const ensurePlayer = (videoId) => {
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
      return;
    }
    playerRef.current = new window.YT.Player("yt-hidden-player", {
      height: "0",
      width: "0",
      videoId,
      playerVars: { autoplay: 1, controls: 0, disablekb: 1 },
      events: {
        onReady: (e) => e.target.playVideo(),
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(playerRef.current.getDuration());
          }
          if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          if (e.data === window.YT.PlayerState.ENDED) handleNextRef.current();
        },
      },
    });
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) setCurrentTime(playerRef.current.getCurrentTime());
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const search = async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${YT_SEARCH_API}?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.error) setError(json.error);
      setResults(json.items || []);
    } catch (e) {
      setError("Gagal mencari lagu");
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (track, list = results) => {
    setQueue(list);
    setCurrentIndex(list.findIndex((t) => t.id.videoId === track.id.videoId));
    setView("now-playing");
    setCurrentTime(0);
    waitForYT(() => ensurePlayer(track.id.videoId));
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const seek = (time) => {
    playerRef.current?.seekTo(time, true);
    setCurrentTime(time);
  };

  const handleNext = () => {
    if (queue.length === 0) return;
    const next = (currentIndex + 1) % queue.length;
    setCurrentIndex(next);
    ensurePlayer(queue[next].id.videoId);
    setCurrentTime(0);
  };
  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  const handlePrev = () => {
    if (queue.length === 0) return;
    const prev = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prev);
    ensurePlayer(queue[prev].id.videoId);
    setCurrentTime(0);
  };

  return {
    view, setView, query, results, loading, error, search, playTrack,
    togglePlay, seek, handleNext, handlePrev, isPlaying, currentTime, duration,
    currentTrack: currentIndex >= 0 ? queue[currentIndex] : null,
    openSearch: () => setView("search"),
    closePlayer: () => setView("closed"),
    minimize: () => setView("mini"),
  };
}

function MusicPlayerUI({ music }) {
  const { view, query, results, loading, error, search, playTrack, togglePlay,
    seek, handleNext, handlePrev, isPlaying, currentTime, duration,
    currentTrack, setView, closePlayer, minimize } = music;

  const thumb = currentTrack?.snippet?.thumbnails?.medium?.url || currentTrack?.snippet?.thumbnails?.default?.url;

  return (
    <>
      <div id="yt-hidden-player" style={{ position: "fixed", width: 0, height: 0, overflow: "hidden", top: -9999 }} />

      {/* POPUP CARD SEARCH */}
      {view === "search" && (
        <div 
          onClick={closePlayer}
          style={{ 
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", 
            zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: "100%", maxWidth: 420, maxHeight: "80vh", background: "#0a0c14", 
              border: "1px solid #1e2338", borderRadius: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", 
              display: "flex", flexDirection: "column", overflow: "hidden" 
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 18px", borderBottom: "1px solid #1e2338" }}>
              <button onClick={closePlayer} style={{ background: "none", border: "none", color: "#e7e9f3", cursor: "pointer", display: "flex" }}>
                <ChevronDown size={22} />
              </button>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#12162a", border: "1px solid #1e2338", borderRadius: 12, padding: "8px 12px" }}>
                <Search size={16} color="#7d8199" />
                <input
                  autoFocus value={query} onChange={(e) => search(e.target.value)}
                  placeholder="Cari lagu atau artis..."
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e7e9f3", fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", maxHeight: "60vh" }}>
              {loading && <p style={{ color: "#7d8199", fontSize: 13, textAlign: "center", marginTop: 20 }}>Mencari...</p>}
              {error && <p style={{ color: "#ff8a9b", fontSize: 13, textAlign: "center", marginTop: 20 }}>{error}</p>}
              {!loading && !error && results.length === 0 && query && (
                <p style={{ color: "#7d8199", fontSize: 13, textAlign: "center", marginTop: 20 }}>Tidak ditemukan</p>
              )}
              {results.map((item) => (
                <button key={item.id.videoId} onClick={() => playTrack(item)}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "none", border: "none", padding: "10px 4px", cursor: "pointer", textAlign: "left" }}>
                  <img src={item.snippet.thumbnails.default.url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e7e9f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.snippet.title}</div>
                    <div style={{ fontSize: 11.5, color: "#7d8199" }}>{item.snippet.channelTitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POPUP CARD NOW PLAYING */}
      {view === "now-playing" && currentTrack && (
        <div 
          onClick={minimize}
          style={{ 
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", 
            zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: "100%", maxWidth: 380, background: "linear-gradient(180deg, #16224a, #0a0c14)", 
              border: "1px solid #1e2338", borderRadius: 28, boxShadow: "0 25px 60px rgba(0,0,0,0.7)", 
              display: "flex", flexDirection: "column", padding: "20px 22px", overflow: "hidden" 
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button onClick={minimize} style={{ background: "none", border: "none", color: "#e7e9f3", cursor: "pointer", display: "flex" }}>
                <ChevronDown size={22} />
              </button>
              <span style={{ fontSize: 10.5, color: "#7d8199", fontWeight: 700, letterSpacing: 0.8 }}>SEDANG DIPUTAR</span>
              <div style={{ width: 22 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, margin: "10px 0 20px" }}>
              <div style={{
                width: 170, height: 170, borderRadius: "50%",
                background: "radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0a0a0a 60%, #000 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
                animation: isPlaying ? "spinVinyl 6s linear infinite" : "none",
                position: "relative", border: "5px solid #111", flexShrink: 0
              }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "repeating-radial-gradient(circle, transparent 0, transparent 5px, rgba(255,255,255,0.03) 6px)" }} />
                <img src={thumb} alt="" style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: "2px solid #222" }} />
                <div style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: "#0a0c14" }} />
              </div>

              <div style={{ textAlign: "center", maxWidth: "100%" }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#e7e9f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTrack.snippet.title}</div>
                <div style={{ fontSize: 12, color: "#7d8199", marginTop: 3 }}>{currentTrack.snippet.channelTitle}</div>
              </div>
            </div>

            <div>
              <input type="range" min={0} max={duration || 0} value={currentTime} onChange={(e) => seek(Number(e.target.value))} style={{ width: "100%", accentColor: "#5b8def", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#7d8199", marginTop: 2 }}>
                <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 14 }}>
                <button onClick={handlePrev} style={{ background: "none", border: "none", color: "#e7e9f3", cursor: "pointer" }}>
                  <SkipBack size={22} fill="#e7e9f3" />
                </button>
                <button onClick={togglePlay} style={{ width: 50, height: 50, borderRadius: "50%", background: "#e7e9f3", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {isPlaying ? <Pause size={22} color="#0a0c14" fill="#0a0c14" /> : <Play size={22} color="#0a0c14" fill="#0a0c14" style={{ marginLeft: 2 }} />}
                </button>
                <button onClick={handleNext} style={{ background: "none", border: "none", color: "#e7e9f3", cursor: "pointer" }}>
                  <SkipForward size={22} fill="#e7e9f3" />
                </button>
              </div>
            </div>
            <style>{`@keyframes spinVinyl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}

      {/* MINI PLAYER (TIDAK DIUBAH) */}
      {view === "mini" && currentTrack && (
        <div onClick={() => setView("now-playing")} style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 150, background: "#12162a", borderTop: "1px solid #1e2338", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer" }}>
          <img src={thumb} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", animation: isPlaying ? "spinVinyl 4s linear infinite" : "none", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e7e9f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTrack.snippet.title}</div>
            <div style={{ fontSize: 11, color: "#7d8199", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTrack.snippet.channelTitle}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} style={{ background: "none", border: "none", color: "#e7e9f3" }}><SkipBack size={18} fill="#e7e9f3" /></button>
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={{ background: "none", border: "none", color: "#e7e9f3" }}>
            {isPlaying ? <Pause size={22} fill="#e7e9f3" /> : <Play size={22} fill="#e7e9f3" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNext(); }} style={{ background: "none", border: "none", color: "#e7e9f3" }}><SkipForward size={18} fill="#e7e9f3" /></button>
        </div>
      )}
    </>
  );
}

 function useChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: "Hai, aku Astrea. perlu check apa di dashboard ini?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(GEMINI_CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const json = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: json.reply || "Maaf, aku tidak bisa merespons sekarang." }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "model", text: "Maaf, koneksi ke server sedang bermasalah." }]);
    } finally {
      setLoading(false);
    }
  };

  return { open, setOpen, messages, input, setInput, send, loading, scrollRef };
}

function ChatBotUI({ chat }) {
  const { open, setOpen, messages, input, setInput, send, loading, scrollRef } = chat;
  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
        zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420, height: "min(600px, 82vh)", background: "#0a0c14",
          border: "1px solid #1e2338", borderRadius: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid #1e2338" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#5b8def,#c084fc)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#e7e9f3" }}>Astrea</div>
            <div style={{ fontSize: 10.5, color: "#7d8199" }}>AI Assistant Portofolio</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#e7e9f3", cursor: "pointer", display: "flex" }}>
            <ChevronDown size={22} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: "9px 13px", borderRadius: 16,
                borderBottomRightRadius: m.role === "user" ? 4 : 16,
                borderBottomLeftRadius: m.role === "user" ? 16 : 4,
                background: m.role === "user" ? "linear-gradient(135deg,#5b8def,#7c5cf0)" : "#12162a",
                border: m.role === "user" ? "none" : "1px solid #1e2338",
                color: "#e7e9f3", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap",
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "9px 13px", borderRadius: 16, background: "#12162a", border: "1px solid #1e2338", color: "#7d8199", fontSize: 13 }}>
                Astrea sedang mengetik...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderTop: "1px solid #1e2338" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Tulis pesan..."
            style={{ flex: 1, background: "#12162a", border: "1px solid #1e2338", borderRadius: 12, padding: "10px 14px", color: "#e7e9f3", fontSize: 13, outline: "none" }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              width: 38, height: 38, borderRadius: 12, border: "none",
              background: input.trim() ? "linear-gradient(135deg,#5b8def,#c084fc)" : "#1a1e33",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default", flexShrink: 0,
            }}
          >
            <Send size={16} color={input.trim() ? "#fff" : "#7d8199"} />
          </button>
        </div>
      </div>
    </div>
  );
}

 export default function DashboardPage() {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const music = useMusicPlayer();
  const chat = useChatBot();

  return (
    <div className="layout">
      <Sidebar open={sidebarOpen} tab={tab} setTab={setTab} />
      <main className="main" style={{ paddingBottom: music.view === "mini" ? 70 : 0 }}>
        <div className="topbar">
          <button className="toggle-btn" onClick={() => setSidebarOpen(o => !o)}>
            <Menu size={18} />
          </button>
        </div>
        {tab === "overview" && <Overview onOpenMusic={music.openSearch} onOpenChat={() => chat.setOpen(true)} />}
        {tab === "projects" && <Projects />}
        {tab === "vercel" && <VercelProject />}
        {tab === "database" && <DatabasePanel />}
      </main>
      <MusicPlayerUI music={music} />
      <ChatBotUI chat={chat} />
    </div>
  );
}

function Sidebar({ open, tab, setTab }) {
  const items = [
    { id: "overview", label: "Ringkasan", icon: Activity },
    { id: "projects", label: "Project GitHub", icon: Github },
    { id: "vercel", label: "Project Vercel", icon: Zap },
    { id: "database", label: "Database", icon: Database },
  ];
  return (
    <aside className={`sidebar ${open ? "" : "closed"}`}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "0 8px" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#5b8def,#c084fc)", flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#e7e9f3" }}>Project Monitoring</span>
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

function GradientCard({ label, value, sub, from, to, style }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${from}, ${to})`,
      borderRadius: 18, padding: "20px 22px", color: "#fff",
      minHeight: 110, display: "flex", flexDirection: "column", justifyContent: "center", ...style,
    }}>
      <div style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function IconStatCard({ icon: Icon, label, tint, note }) {
  return (
    <div style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1, height: "100%" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${tint}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={tint} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e7e9f3" }}>{label}</div>
      {note && <div style={{ fontSize: 10.5, color: "#7d8199" }}>{note}</div>}
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
            <div style={{ fontSize: 16, fontWeight: 700 }}>{centerValue}</div>
            <div style={{ fontSize: 10, color: "#7d8199" }}>{centerLabel}</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10, justifyContent: "center" }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#a7abc2" }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: PIE_COLORS[i % PIE_COLORS.length] }} />
            {d.name}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- Jam realtime ----------
function useClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ---------- Grafik bukit: data asli aktivitas GitHub harian (14 hari) ----------
function useActivityWave() {
  const [data, setData] = useState(
    Array.from({ length: 14 }, (_, i) => ({ x: i, y: Math.round(20 + Math.random() * 60) }))
  );
  const [source, setSource] = useState("random");

  useEffect(() => {
    fetch("/api/github/activity")
      .then((r) => r.json())
      .then((json) => {
        const points = json?.points || [];
        if (points.length > 0) {
          const max = Math.max(...points.map((p) => p.y), 1);
          const scaled = points.map((p) => ({ x: p.x, y: Math.round((p.y / max) * 100) }));
          setData(scaled);
          setSource("github");
        }
      })
      .catch(() => {});
  }, []);

  return { data, source };
}

// ---------- Ukur latency asli tiap API (client-side) ----------
function useApiLatency() {
  const [latency, setLatency] = useState({});
  useEffect(() => {
    const targets = [
      { key: "vercel", url: "/api/vercel/project" },
      { key: "supabase", url: "/api/supabase/status" },
      { key: "cloudflare", url: "/api/cloudflare/metrics" },
    ];
    targets.forEach(async ({ key, url }) => {
      const t0 = performance.now();
      try {
        await fetch(url);
      } catch (e) {}
      const ms = Math.round(performance.now() - t0);
      setLatency((prev) => ({ ...prev, [key]: ms }));
    });
  }, []);
  return latency;
}

// ---------- OVERVIEW ----------
function Overview({ onOpenMusic, onOpenChat }) {
  const [gh, setGh] = useState(null);
  const [vc, setVc] = useState(null);
  const [sb, setSb] = useState(null);
  const [cf, setCf] = useState(null);
  const now = useClock();
  const { data: wave, source: waveSource } = useActivityWave();
  const latency = useApiLatency();

  useEffect(() => {
    fetch("/api/github/repos").then(r => r.json()).then(setGh).catch(() => {});
    fetch("/api/vercel/project").then(r => r.json()).then(setVc).catch(() => {});
    fetch("/api/supabase/status").then(r => r.json()).then(setSb).catch(() => {});
    fetch("/api/cloudflare/metrics").then(r => r.json()).then(setCf).catch(() => {});
  }, []);

  const timeStr = now
    ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const dateStr = now ? now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }) : "";

  const LATENCY_CAP = 800; // ms, skala buat donut
  const latencyDonut = (label, ms) => {
    if (ms == null) return { name: label, data: [] };
    const pct = Math.min(100, Math.round((ms / LATENCY_CAP) * 100));
    return {
      name: label,
      centerValue: `${ms} ms`,
      data: [
        { name: "Respons", value: pct },
        { name: "Sisa skala", value: 100 - pct },
      ],
    };
  };
  
  function useUptimeHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem("uptime_history") || "[]");
    } catch (e) {}

    fetch("/api/vercel/project")
      .then((r) => r.json())
      .then((vc) => {
        const ok = !!vc?.configured && (vc.status || "").toLowerCase().includes("ready");
        const updated = [...stored, { time: Date.now(), ok }].slice(-30);
        try { localStorage.setItem("uptime_history", JSON.stringify(updated)); } catch (e) {}
        setHistory(updated);
      })
      .catch(() => {
        const updated = [...stored, { time: Date.now(), ok: false }].slice(-30);
        try { localStorage.setItem("uptime_history", JSON.stringify(updated)); } catch (e) {}
        setHistory(updated);
      });
  }, []);

  return history;
}

function WorldClockMini() {
  const now = useClock();
  const zones = [
    { label: "WIB", tz: "Asia/Jakarta" },
    { label: "London", tz: "Europe/London" },
    { label: "Tokyo", tz: "Asia/Tokyo" },
    { label: "New York", tz: "America/New_York" },
  ];

  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Jam Dunia</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {zones.map((z) => (
          <div key={z.tz} style={{ background: "#0e1120", border: "1px solid #1e2338", borderRadius: 10, padding: "8px 10px" }}>
            <div style={{ fontSize: 10.5, color: "#7d8199" }}>{z.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e7e9f3", marginTop: 2 }}>
              {now ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: z.tz }) : "--:--"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

  const donutSupabase = latencyDonut("Latency Supabase", latency.supabase);
  const donutVercel = latencyDonut("Latency Vercel", latency.vercel);
  const donutCloudflare = latencyDonut("Latency Cloudflare", latency.cloudflare);

  return (
    <div>
      <SectionTitle title="Ringkasan Monitoring" sub="Status seluruh layanan yang dipantau" />

      <div className="hero-grid">
        <div className="hero-clock">
          <GradientCard label="Waktu Sekarang" value={timeStr} sub={dateStr} from="#c084fc" to="#7c5cf0" style={{ height: "100%" }} />
        </div>
        <div className="hero-github">
          <GradientCard label="Total Repo GitHub" value={gh?.repos?.length ?? "-"} sub={`akun ${gh?.username ?? ""}`} from="#5b8def" to="#38c6d9" style={{ height: "100%" }} />
        </div>

        <div className="hero-icons">
  <button onClick={onOpenMusic} style={{ all: "unset", cursor: "pointer", flex: 1 }}>
    <IconStatCard icon={Music2} label="Music" tint="#f472b6" note="Cari & putar lagu" />
  </button>
  <button onClick={onOpenChat} style={{ all: "unset", cursor: "pointer", flex: 1 }}>
    <IconStatCard icon={Bot} label="Assistant" tint="#5b8def" note="Chat dengan Astrea" />
  </button>
</div>

        <div className="hero-calendar">
          <div style={{
            background: "linear-gradient(135deg, #16224a, #0e1633)",
            borderRadius: 18, padding: "18px 20px", color: "#fff", minHeight: 130,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Kalender Commit GitHub</div>
            {gh?.username ? (
              <img
                src={`https://ghchart.rshah.org/8b5cf6/${gh.username}`}
                alt={`Kalender commit ${gh.username}`}
                style={{ width: "100%", height: "auto", borderRadius: 8, background: "#0a0c14" }}
              />
            ) : (
              <div style={{ fontSize: 12, opacity: 0.7 }}>Memuat...</div>
            )}
          </div>
        </div>
        <div className="grid-2" style={{ marginBottom: 14 }}>
        <WorldClockMini />
      </div>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {waveSource === "github" ? "Aktivitas GitHub — 14 Hari Terakhir" : "Aktivitas (gagal memuat, ilustrasi sementara)"}
          </div>
          <div style={{ fontSize: 11, color: "#7d8199" }}>Skala 0–100</div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={wave}>
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8def" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#5b8def" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2338" vertical={false} />
            <XAxis dataKey="x" hide />
            <YAxis orientation="right" domain={[0, 100]} stroke="#5b5f78" fontSize={11} tickLine={false} axisLine={false} />
            <Area type="monotone" dataKey="y" stroke="#5b8def" fill="url(#waveGrad)" strokeWidth={2} isAnimationActive={true} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid-3" style={{ marginBottom: 14 }}>
        <DonutCard title={donutSupabase.name} data={donutSupabase.data} centerValue={donutSupabase.centerValue ?? "-"} centerLabel="dari Supabase" />
        <DonutCard title={donutVercel.name} data={donutVercel.data} centerValue={donutVercel.centerValue ?? "-"} centerLabel="dari Vercel" />
        <DonutCard title={donutCloudflare.name} data={donutCloudflare.data} centerValue={donutCloudflare.centerValue ?? "-"} centerLabel="dari Cloudflare" />
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

function StatRow({ label, value, good }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #1e2338" }}>
      <span style={{ fontSize: 12.5, color: "#9aa0bd" }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: good ? "#4dd6c4" : "#e7e9f3" }}>{value}</span>
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
const LANG_COLORS = {
  JavaScript: "#f0db4f",
  TypeScript: "#5b8def",
  HTML: "#ff8a5b",
  CSS: "#5be0c4",
  Python: "#facc15",
  Go: "#4dd6c4",
  C: "#c084fc",
  "C++": "#c084fc",
  Java: "#f4527a",
};
function langColor(lang) {
  return LANG_COLORS[lang] || "#8b8fa8";
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
      <SectionTitle title="Project GitHub" sub="Data langsung dari repository zero-route" />
      {error && (
        <div style={{ display: "flex", gap: 8, background: "#2a1620", border: "1px solid #4a1e2f", color: "#ff8a9b", padding: 12, borderRadius: 10, fontSize: 12.5, marginBottom: 14 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {!repos && !error && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat data repo...</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {repos?.map((r) => {
          const color = langColor(r.language);
          const isLive = !!r.liveUrl;
          return (
            <div key={r.name} style={{
              background: "#12162a", border: "1px solid #1e2338", borderRadius: 16,
              padding: "16px 18px 16px 16px", display: "flex", gap: 14, flexWrap: "wrap",
              borderLeft: `3px solid ${color}`, position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, right: 0, width: 140, height: 140,
                background: `radial-gradient(circle at top right, ${color}22, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: `${color}22`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1,
              }}>
                <Github size={17} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 160, zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#f2f3fa" }}>{r.name}</span>
                  {isLive && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, background: "#4dd6c422", color: "#4dd6c4", padding: "2px 8px", borderRadius: 20 }}>
                      LIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: "#9aa0bd", marginTop: 3 }}>{r.description || "Tidak ada deskripsi"}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 9, fontSize: 11, color: "#7d8199", flexWrap: "wrap" }}>
                  {r.language && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "#1a1e33", padding: "3px 8px", borderRadius: 20 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 4, background: color }} /> {r.language}
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={11} /> {r.stars}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><GitFork size={11} /> {r.forks}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {new Date(r.updatedAt).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
              <a
                href={isLive ? r.liveUrl : r.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 5, alignSelf: "center", zIndex: 1,
                  background: isLive ? `${color}` : "#1a1e33",
                  border: isLive ? "none" : "1px solid #2a2f4a",
                  color: isLive ? "#0a0c14" : "#e7e9f3",
                  fontWeight: isLive ? 700 : 500,
                  padding: "8px 12px", borderRadius: 9, fontSize: 12, textDecoration: "none", flexShrink: 0,
                }}
              >
                {isLive ? "Buka Web" : "Buka Repo"} <ExternalLink size={12} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PulseMonitor({ alive, label }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0e1633, #16224a)",
      border: "1px solid #22284a", borderRadius: 18, padding: "20px 22px",
      display: "flex", alignItems: "center", gap: 18, overflow: "hidden", position: "relative",
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
        background: alive ? "#4dd6c422" : "#7d819922",
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
      }}>
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `2px solid ${alive ? "#4dd6c4" : "#7d8199"}`,
          animation: alive ? "pulseRing 1.6s ease-out infinite" : "none",
        }} />
        <Radio size={20} color={alive ? "#4dd6c4" : "#7d8199"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e7e9f3" }}>
          {alive ? "Sinyal Hidup" : "Sinyal Terputus"}
        </div>
        <div style={{ fontSize: 11.5, color: "#7d8199", marginTop: 2 }}>{label}</div>
      </div>
      <svg width="120" height="40" viewBox="0 0 120 40" style={{ flexShrink: 0, opacity: alive ? 1 : 0.3 }}>
        <polyline
          points="0,20 15,20 22,6 28,34 34,20 45,20 50,12 55,28 60,20 120,20"
          fill="none" stroke="#4dd6c4" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
          style={{ animation: alive ? "ekgMove 2.4s linear infinite" : "none" }}
        />
      </svg>
      <style>{`
        @keyframes pulseRing { 0% { transform: scale(0.8); opacity: 0.9; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes ekgMove { 0% { stroke-dasharray: 0 300; } 60% { stroke-dasharray: 300 0; } 100% { stroke-dasharray: 300 0; } }
      `}</style>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, copyable }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: "1px solid #1e2338" }}>
      <Icon size={14} color="#7d8199" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10.5, color: "#7d8199" }}>{label}</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#e7e9f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </div>
      </div>
      {copyable && value && value !== "-" && (
        <button
          onClick={() => navigator.clipboard?.writeText(value)}
          style={{ background: "#1a1e33", border: "1px solid #2a2f4a", borderRadius: 8, padding: 6, color: "#9aa0bd", cursor: "pointer", flexShrink: 0 }}
        >
          <Copy size={12} />
        </button>
      )}
    </div>
  );
}

function VercelProject() {
  const [vc, setVc] = useState(null);
  useEffect(() => {
    fetch("/api/vercel/project").then(r => r.json()).then(setVc).catch(() => {});
  }, []);

  const isReady = vc?.configured && (vc.status || "").toLowerCase().includes("ready");

  return (
    <div>
      <SectionTitle title="DeadmanSwitch — Vercel" sub="Status deployment project" />

      <div style={{ marginBottom: 14 }}>
        <PulseMonitor
          alive={!!vc?.configured}
          label={vc?.configured ? `Status: ${vc.status || "-"}` : "Menunggu koneksi ke Vercel API..."}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <GradientCard
          label="Status"
          value={vc?.configured ? (vc.status ?? "Live") : "-"}
          sub="deployment terbaru"
          from={isReady ? "#4dd6c4" : "#ff8a5b"}
          to={isReady ? "#2aa198" : "#f4527a"}
        />
        <GradientCard
          label="Domain"
          value={vc?.url ? "Aktif" : "-"}
          sub={vc?.url || "Belum ada domain"}
          from="#c084fc" to="#7c5cf0"
        />
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Detail Deployment</div>
        {!vc && <p style={{ color: "#7d8199", fontSize: 13, marginTop: 10 }}>Memuat...</p>}
        {vc && !vc.configured && <div style={{ fontSize: 13, color: "#7d8199", marginTop: 10 }}>{vc.message}</div>}
        {vc?.configured && (
          <>
            <InfoRow icon={Zap} label="Status deployment" value={vc.status || "-"} />
            <InfoRow icon={Globe} label="URL" value={vc.url || "-"} copyable />
            <InfoRow icon={Clock} label="Dibuat" value={vc.createdAt ? new Date(vc.createdAt).toLocaleString("id-ID") : "-"} />
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

  const workers = cf?.workers || [];
  const totalRequests = workers.reduce((s, w) => s + (w.requests || 0), 0);
  const totalErrors = workers.reduce((s, w) => s + (w.errors || 0), 0);
  const activeWorkers = workers.filter((w) => (w.requests || 0) > 0).length;

  const barData = workers.map((w) => ({ name: w.scriptName, requests: w.requests || 0 }));

  return (
    <div>
      <SectionTitle title="Database" sub="Supabase & Cloudflare Workers" />

      {/* Stat cards ringkas */}
      <div className="grid-3" style={{ marginBottom: 14 }}>
        <MiniStat icon={Database} tint="#4dd6c4" label="Baris di tabel absen" value={sb?.configured && sb.totalRows != null ? sb.totalRows : "-"} />
        <MiniStat icon={Cloud} tint="#ff8a5b" label="Total Request (3 Worker)" value={cf?.configured ? totalRequests : "-"} />
        <MiniStat icon={AlertTriangle} tint={totalErrors > 0 ? "#f4527a" : "#4dd6c4"} label="Total Error" value={cf?.configured ? totalErrors : "-"} />
      </div>

      {/* Supabase: data asli */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Database size={16} color="#4dd6c4" /> <span style={{ fontWeight: 600, fontSize: 13.5 }}>Supabase — tabel {sb?.tableName || "absen"}</span>
        </div>
        {!sb && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat...</p>}
        {sb && !sb.configured && <div style={{ fontSize: 13, color: "#7d8199" }}>{sb.message}</div>}
        {sb?.configured && sb.error && (
          <div style={{ fontSize: 12.5, color: "#ff8a9b" }}>{sb.error} — {sb.detail}</div>
        )}
        {sb?.configured && !sb.error && (
          <>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{sb.totalRows}</div>
            <div style={{ fontSize: 11.5, color: "#7d8199", marginBottom: 14 }}>total baris tercatat</div>

            <div style={{ fontSize: 12, fontWeight: 600, color: "#9aa0bd", marginBottom: 8 }}>5 Data Terbaru</div>
            {sb.recentRows?.length === 0 && <div style={{ fontSize: 12, color: "#7d8199" }}>Belum ada data.</div>}
            <div style={{ display: "grid", gap: 8 }}>
              {sb.recentRows?.map((row, i) => (
                <div key={i} style={{ background: "#0e1120", border: "1px solid #1e2338", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                    {sb.columns?.slice(0, 4).map((col) => (
                      <span key={col} style={{ fontSize: 11, color: "#7d8199" }}>
                        <span style={{ color: "#9aa0bd" }}>{col}:</span> {String(row[col] ?? "-")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Cloudflare: bar chart + status per worker */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Cloud size={16} color="#ff8a5b" /> <span style={{ fontWeight: 600, fontSize: 13.5 }}>Cloudflare Workers</span>
          {cf?.configured && (
            <span style={{ fontSize: 11, color: "#7d8199", marginLeft: "auto" }}>{activeWorkers}/{workers.length} aktif</span>
          )}
        </div>
        {!cf && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat...</p>}
        {cf && !cf.configured && <div style={{ fontSize: 13, color: "#7d8199" }}>{cf.message}</div>}
        {cf?.configured && workers.length > 0 && (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={barData}>
              <CartesianGrid stroke="#1e2338" vertical={false} />
              <XAxis dataKey="name" stroke="#5b5f78" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#5b5f78" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#181c30", border: "1px solid #2a2f4a", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="requests" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        {cf?.configured && workers.map((w) => {
          const isActive = (w.requests || 0) > 0;
          return (
            <div key={w.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #1e2338" }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: isActive ? "#4dd6c4" : "#5b5f78", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{w.scriptName}</div>
                <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#7d8199", flexWrap: "wrap" }}>
                  <span>Requests: {w.requests ?? "-"}</span>
                  <span>Errors: {w.errors ?? "-"}</span>
                  <span>CPU p50: {w.cpuTimeP50Ms ?? "-"} ms</span>
                </div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: isActive ? "#4dd6c4" : "#7d8199", background: isActive ? "#4dd6c422" : "#1a1e33", padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>
                {isActive ? "AKTIF" : "IDLE"}
              </span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function MiniStat({ icon: Icon, tint, label, value }) {
  return (
    <Card>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${tint}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon size={15} color={tint} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#7d8199", marginTop: 2 }}>{label}</div>
    </Card>
  );
}
