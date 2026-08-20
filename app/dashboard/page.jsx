 "use client";

import { useEffect, useState, useRef } from "react";
import {
  Github, ExternalLink, Star, GitFork, Clock, AlertTriangle,
  Activity, Zap, Database, Cloud, CircleCheck, Menu, Music2, Bot,
  Globe, Radio, Copy, Search, SkipBack, SkipForward, Pause, Play, ChevronDown,
  Send, Sparkles,
  Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets,
  X, Layers, ShieldCheck, Code2
} from "lucide-react";
import {
  AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
} from "recharts";

const GEMINI_CHAT_API = "https://dashboard-chat-bot.iostream911.workers.dev/";
const YT_SEARCH_API = "https://yt-music-portofolio.iostream911.workers.dev/";

const FIXED_LAT = -6.2088;
const FIXED_LON = 106.8456;

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function useMusicPlayer() {
  const [view, setView] = useState("closed");
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid #1e2338" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#5b8def,#c084fc)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#e7e9f3" }}>Astrea</div>
            <div style={{ fontSize: 10.5, color: "#7d8199" }}>AI Assistant</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#e7e9f3", cursor: "pointer", display: "flex" }}>
            <ChevronDown size={22} />
          </button>
        </div>

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

function Sidebar({ open, setOpen, tab, setTab }) {
  const topItems = [
    { id: "overview", label: "Ringkasan", icon: Activity },
    { id: "projects", label: "Project GitHub", icon: Github },
  ];

  const deploymentItems = [
    { id: "vercel", label: "Vercel", icon: Zap },
    { id: "netlify", label: "Netlify", icon: Layers },
  ];

  const bottomItems = [
    { id: "database", label: "Database", icon: Database },
  ];

  const handleSelectTab = (id) => {
    setTab(id);
    setOpen(false);
  };

  const renderNavButton = ({ id, label, icon: Icon }) => (
    <button
      key={id}
      onClick={() => handleSelectTab(id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: tab === id ? "rgba(91, 141, 239, 0.15)" : "transparent",
        color: tab === id ? "#5b8def" : "#8b8fa8",
        fontSize: 13,
        fontWeight: tab === id ? 600 : 500,
        width: "100%",
        transition: "all 0.2s ease",
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 180,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "260px",
          zIndex: 190,
          background: "rgba(10, 12, 20, 0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: open ? "10px 0 30px rgba(0,0,0,0.5)" : "none",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "0 8px" }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#5b8def,#c084fc)", flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#e7e9f3" }}>Project Monitoring</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {topItems.map(renderNavButton)}

          {/* Section Grouping DEPLOYMENT */}
          <div style={{ marginTop: 14, marginBottom: 4, paddingLeft: 12, fontSize: 10.5, fontWeight: 700, color: "#5b5f78", letterSpacing: 0.8 }}>
            DEPLOYMENT
          </div>
          {deploymentItems.map(renderNavButton)}

          <div style={{ marginTop: 10 }} />
          {bottomItems.map(renderNavButton)}
        </div>
      </aside>
    </>
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

function LatencyOverviewCard({ latency }) {
  const items = [
    { name: "Supabase DB", ms: latency.supabase },
    { name: "Vercel Edge", ms: latency.vercel },
    { name: "Cloudflare Workers", ms: latency.cloudflare },
  ];

  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e7e9f3" }}>API Latency & Health</span>
        <span style={{ fontSize: 10.5, color: "#7d8199" }}>Real-time Ping</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {items.map((it) => {
          const fillPercentage = Math.min(100, Math.round(((it.ms || 0) / 1000) * 100));
          const fillColor = "#4dd6c4";

          return (
            <div 
              key={it.name}
              style={{
                flex: "1 1 150px",
                minWidth: 150,
                background: "#0e1120",
                border: "1px solid #1e2338",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                <span style={{ color: "#e7e9f3", fontWeight: 600 }}>{it.name}</span>
                <span style={{ fontWeight: 700, color: fillColor, fontSize: 13 }}>
                  {it.ms ? `${it.ms} ms` : "Pinging..."}
                </span>
              </div>

              <div style={{ height: 8, width: "100%", background: "#12162a", borderRadius: 6, overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    width: `${fillPercentage || 5}%`, 
                    background: fillColor, 
                    borderRadius: 6,
                    transition: "width 0.5s ease-in-out" 
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function useClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

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
          const rawValues = points.map((p) => p.y);
          const maxVal = Math.max(...rawValues, 1);

          const scaledRaw = rawValues.map((v) => Math.min(100, Math.round((v / maxVal) * 100)));

          const smoothed = scaledRaw.map((val, idx, arr) => {
            if (idx === 0) return val;
            const prev = arr[idx - 1];
            if (idx === arr.length - 1 && val < prev) {
              return Math.round((prev * 0.7) + (val * 0.3));
            }
            return Math.round((prev + val) / 2);
          });

          const formattedData = points.map((p, i) => ({
            x: p.x,
            y: smoothed[i],
          }));

          setData(formattedData);
          setSource("github");
        }
      })
      .catch(() => {});
  }, []);

  return { data, source };
}

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

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${FIXED_LAT}&longitude=${FIXED_LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`)
      .then((r) => r.json())
      .then((json) => setWeather(json.current))
      .catch(() => setError("Gagal memuat cuaca"));
  }, []);

  return { weather, error };
}

function weatherInfo(code) {
  const map = {
    0: { label: "Cerah", icon: Sun, color: "#facc15" },
    1: { label: "Cerah Berawan", icon: Sun, color: "#facc15" },
    2: { label: "Berawan Sebagian", icon: Cloud, color: "#a7abc2" },
    3: { label: "Mendung", icon: Cloud, color: "#7d8199" },
    45: { label: "Berkabut", icon: Cloud, color: "#7d8199" },
    48: { label: "Berkabut", icon: Cloud, color: "#7d8199" },
    51: { label: "Gerimis Ringan", icon: CloudRain, color: "#5b8def" },
    53: { label: "Gerimis", icon: CloudRain, color: "#5b8def" },
    55: { label: "Gerimis Lebat", icon: CloudRain, color: "#5b8def" },
    61: { label: "Hujan Ringan", icon: CloudRain, color: "#5b8def" },
    63: { label: "Hujan", icon: CloudRain, color: "#5b8def" },
    65: { label: "Hujan Lebat", icon: CloudRain, color: "#5b8def" },
    71: { label: "Salju Ringan", icon: CloudSnow, color: "#c7d2fe" },
    73: { label: "Salju", icon: CloudSnow, color: "#c7d2fe" },
    75: { label: "Salju Lebat", icon: CloudSnow, color: "#c7d2fe" },
    80: { label: "Hujan Deras", icon: CloudRain, color: "#5b8def" },
    95: { label: "Badai Petir", icon: CloudLightning, color: "#facc15" },
  };
  return map[code] || { label: "Tidak diketahui", icon: Cloud, color: "#7d8199" };
}

function WeatherWidget() {
  const { weather, error } = useWeather();

  if (error) {
    return (
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Cuaca</div>
        <div style={{ fontSize: 12, color: "#7d8199" }}>{error}</div>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Cuaca</div>
        <div style={{ fontSize: 12, color: "#7d8199" }}>Memuat cuaca...</div>
      </Card>
    );
  }

  const info = weatherInfo(weather.weather_code);
  const Icon = info.icon;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Cuaca</div>
        <span style={{ fontSize: 10.5, color: "#7d8199" }}>{info.label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${info.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={24} color={info.color} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#e7e9f3", lineHeight: 1 }}>{Math.round(weather.temperature_2m)}°C</div>
          <div style={{ fontSize: 11, color: "#7d8199", marginTop: 3 }}>Terasa {Math.round(weather.apparent_temperature)}°C</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#0e1120", border: "1px solid #1e2338", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <Droplets size={14} color="#5b8def" />
          <div>
            <div style={{ fontSize: 10.5, color: "#7d8199" }}>Kelembapan</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e7e9f3" }}>{weather.relative_humidity_2m}%</div>
          </div>
        </div>
        <div style={{ background: "#0e1120", border: "1px solid #1e2338", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <Wind size={14} color="#4dd6c4" />
          <div>
            <div style={{ fontSize: 10.5, color: "#7d8199" }}>Angin</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e7e9f3" }}>{Math.round(weather.wind_speed_10m)} km/j</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

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
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 14 }}>
        <WorldClockMini />
        <WeatherWidget />
      </div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {waveSource === "github" ? "Aktivitas GitHub — 14 Hari Terakhir" : "Aktivitas (gagal memuat, ilustrasi sementara)"}
          </div>
          <div style={{ fontSize: 11, color: "#7d8199" }}>Skala 0–100</div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={wave} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8def" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#5b8def" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2338" vertical={false} />
            <XAxis dataKey="x" hide />
            <YAxis 
              orientation="right" 
              domain={[0, 100]} 
              ticks={[0, 25, 50, 75, 100]}
              stroke="#5b5f78" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <Area 
              type="monotone" 
              dataKey="y" 
              stroke="#5b8def" 
              fill="url(#waveGrad)" 
              strokeWidth={2.5} 
              isAnimationActive={true} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <LatencyOverviewCard latency={latency} />

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

const LANG_COLORS = {
  JSX: "#61dafb",        
  TSX: "#3178c6",        
  React: "#61dafb",
  JavaScript: "#f0db4f", 
  TypeScript: "#3178c6",
  HTML: "#ff8a5b",
  CSS: "#5be0c4",
  Python: "#facc15",
  Go: "#4dd6c4",
  "C++": "#f34b7d",
  C: "#555555",
};

function langColor(lang) {
  return LANG_COLORS[lang] || "#8b8fa8";
}

function getCustomLanguageLabel(repo) {
  if (!repo) return "Unknown";
  const lang = repo.language;
  const name = repo.name?.toLowerCase() || "";

  if (lang === "JavaScript") {
    if (name.includes("dashboard") || name.includes("react")) {
      return "JSX";
    }
  }
  if (lang === "TypeScript") {
    if (name.includes("switch") || name.includes("next") || name.includes("bot")) {
      return "TSX";
    }
  }

  return lang || "Unknown";
}

function Projects() {
  const [repos, setRepos] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");

  useEffect(() => {
    fetch("/api/github/repos")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRepos(data.repos);
      })
      .catch((err) => setError(String(err)));
  }, []);

  const languages = ["All", ...new Set(repos?.map((r) => getCustomLanguageLabel(r)).filter(Boolean) || [])];

  const filteredRepos = repos
    ?.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLang = selectedLang === "All" || getCustomLanguageLabel(r) === selectedLang;
      return matchesSearch && matchesLang;
    })
    ?.sort((a, b) => {
      const aPinned = a.isPinned || !!a.liveUrl;
      const bPinned = b.isPinned || !!b.liveUrl;
      return bPinned - aPinned;
    });

  const totalStars = repos?.reduce((acc, r) => acc + (r.stars || 0), 0) || 0;
  const totalForks = repos?.reduce((acc, r) => acc + (r.forks || 0), 0) || 0;
  const totalLive = repos?.filter((r) => !!r.liveUrl).length || 0;

  return (
    <div>
      <SectionTitle title="Project GitHub" sub="Repository publik & live project zero-route" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}>
        <div style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <Github size={18} color="#5b8def" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e7e9f3", lineHeight: 1.1 }}>{repos?.length || 0}</div>
            <div style={{ fontSize: 10, color: "#7d8199", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Total Repos</div>
          </div>
        </div>

        <div style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <Globe size={18} color="#4dd6c4" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e7e9f3", lineHeight: 1.1 }}>{totalLive}</div>
            <div style={{ fontSize: 10, color: "#7d8199", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Live Web</div>
          </div>
        </div>

        <div style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <Star size={18} color="#facc15" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e7e9f3", lineHeight: 1.1 }}>{totalStars}</div>
            <div style={{ fontSize: 10, color: "#7d8199", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Total Stars</div>
          </div>
        </div>

        <div style={{ background: "#12162a", border: "1px solid #1e2338", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <GitFork size={18} color="#c084fc" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e7e9f3", lineHeight: 1.1 }}>{totalForks}</div>
            <div style={{ fontSize: 10, color: "#7d8199", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Total Forks</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#12162a", border: "1px solid #1e2338", borderRadius: 10, padding: "7px 10px" }}>
          <Search size={14} color="#7d8199" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Cari project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e7e9f3", fontSize: 12.5 }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              style={{
                background: selectedLang === lang ? "#5b8def" : "#12162a",
                border: "1px solid",
                borderColor: selectedLang === lang ? "#5b8def" : "#1e2338",
                color: selectedLang === lang ? "#fff" : "#8b8fa8",
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 11.5,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ display: "flex", gap: 8, background: "#2a1620", border: "1px solid #4a1e2f", color: "#ff8a9b", padding: 12, borderRadius: 10, fontSize: 12.5, marginBottom: 14 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {!repos && !error && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat data repo...</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {filteredRepos?.map((r) => {
          const displayLang = getCustomLanguageLabel(r);
          const color = langColor(displayLang);
          const isLive = !!r.liveUrl;
          const isPinned = r.isPinned || isLive;

          return (
            <div
              key={r.name}
              style={{
                background: "#12162a",
                border: isPinned ? "1px solid #2e3859" : "1px solid #1e2338",
                borderRadius: 14,
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 100,
                  height: 100,
                  background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              <div>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Github size={15} color={color} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "#f2f3fa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {isPinned && (
                      <span style={{ fontSize: 9, fontWeight: 700, background: "#c084fc22", color: "#c084fc", padding: "2px 5px", borderRadius: 4, border: "1px solid #c084fc44" }}>
                        PINNED
                      </span>
                    )}
                    {isLive && (
                      <span style={{ fontSize: 9, fontWeight: 700, background: "#4dd6c422", color: "#4dd6c4", padding: "2px 5px", borderRadius: 4, border: "1px solid #4dd6c444" }}>
                        LIVE
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: 11.5, color: "#8b8fa8", margin: "0 0 10px 0", lineHeight: 1.35, minHeight: 30, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {r.description || "Tidak ada deskripsi tersedia."}
                </p>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "#7d8199", marginBottom: 10, paddingTop: 8, borderTop: "1px solid #1a1e33" }}>
                  {displayLang ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                      {displayLang}
                    </span>
                  ) : <span />}

                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Star size={10} /> {r.stars}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><GitFork size={10} /> {r.forks}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      background: "#1a1e33",
                      border: "1px solid #2a2f4a",
                      color: "#e7e9f3",
                      padding: "6px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Repo <ExternalLink size={10} />
                  </a>

                  {isLive ? (
                    <a
                      href={r.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        background: color,
                        border: "none",
                        color: "#0a0c14",
                        padding: "6px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Live Demo <ExternalLink size={10} />
                    </a>
                  ) : r.isPrivate ? (
                    <button
                      disabled
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        background: "#f34b7d",
                        border: "none",
                        color: "#0a0c14",
                        padding: "6px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "not-allowed",
                      }}
                    >
                      Repo Private
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        background: "#12162a",
                        border: "1px solid #1a1e33",
                        color: "#5b5f78",
                        padding: "6px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        cursor: "not-allowed",
                      }}
                    >
                      No Demo
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VercelProject() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    fetch("/api/vercel/project")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const toggleExpand = (id) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const projects = data?.projects || [];
  const readyCount = projects.filter((p) => p.status === "READY").length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "READY" && p.status === "READY") ||
      (filter === "Live" && !!p.url);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <SectionTitle title="Vercel" sub="Monitoring deployment, status domain, & usage" />

      <div
        style={{
          background: "#12162a",
          border: "1px solid #1e2338",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 10, height: 10 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#4dd6c4",
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                opacity: 0.75,
              }}
            />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4dd6c4" }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#e7e9f3" }}>
            Vercel System Health: Normal
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#7d8199" }}>All Edge & Serverless Regions Operational</span>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e7e9f3" }}>Hobby Plan Usage</span>
          <span style={{ fontSize: 10.5, color: "#7d8199", background: "#1a1e33", padding: "2px 8px", borderRadius: 6 }}>
            Bulan Ini
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7d8199", marginBottom: 4 }}>
              <span>Bandwidth (100 GB)</span>
              <span style={{ color: "#4dd6c4", fontWeight: 600 }}>~1.2 GB (1%)</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#1a1e33", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: "1.2%", height: "100%", background: "#4dd6c4" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7d8199", marginBottom: 4 }}>
              <span>Serverless Execution</span>
              <span style={{ color: "#5b8def", fontWeight: 600 }}>~5 jam / 100 jam</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#1a1e33", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: "5%", height: "100%", background: "#5b8def" }} />
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat icon={Zap} tint="#5b8def" label="Total Project" value={data?.configured ? projects.length : "-"} />
        <MiniStat icon={CircleCheck} tint="#4dd6c4" label="Status Live" value={data?.configured ? readyCount : "-"} />
        <MiniStat icon={Globe} tint="#c084fc" label="Domain Aktif" value={data?.configured ? projects.filter((p) => !!p.url).length : "-"} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#12162a", border: "1px solid #1e2338", borderRadius: 10, padding: "7px 10px" }}>
          <Search size={14} color="#7d8199" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Cari project Vercel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e7e9f3", fontSize: 12.5 }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["All", "READY", "Live"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#5b8def" : "#12162a",
                border: "1px solid",
                borderColor: filter === f ? "#5b8def" : "#1e2338",
                color: filter === f ? "#fff" : "#8b8fa8",
                borderRadius: 8,
                padding: "4px 12px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f === "READY" ? "Status Ready" : f === "Live" ? "Domain Live" : "Semua Project"}
            </button>
          ))}
        </div>
      </div>

      {!data && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat data Vercel...</p>}
      {data && !data.configured && (
        <Card><p style={{ color: "#ff8a9b", fontSize: 13, margin: 0 }}>{data.message}</p></Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, alignItems: "start" }}>
        {filteredProjects.map((p) => {
          const isReady = p.status === "READY";
          const isExpanded = !!expandedProjects[p.id];
          const latestDeploy = p.deployments?.[0];

          return (
            <div
              key={p.id}
              style={{
                background: "#12162a",
                border: "1px solid #1e2338",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 120,
                  height: 120,
                  background: `radial-gradient(circle at top right, #5b8def22, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#5b8def18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Zap size={16} color="#5b8def" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#f2f3fa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, background: "#c084fc22", color: "#c084fc", padding: "2px 6px", borderRadius: 4, border: "1px solid #c084fc44" }}>
                      PROD
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: isReady ? "#4dd6c422" : "#ff8a9b22",
                        color: isReady ? "#4dd6c4" : "#ff8a9b",
                        border: `1px solid ${isReady ? "#4dd6c444" : "#ff8a9b44"}`,
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: "#8b8fa8", marginBottom: 6 }}>
                  Framework: <span style={{ color: "#4dd6c4", fontWeight: 700 }}>{p.framework.toUpperCase()}</span>
                </div>

                {latestDeploy && (
                  <div style={{ background: "#0e1120", border: "1px solid #1a1e33", borderRadius: 8, padding: "8px 10px", marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: "#7d8199", marginBottom: 2 }}>Commit Terakhir:</div>
                    <div style={{ fontSize: 11, color: "#e7e9f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {latestDeploy.commitMessage}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "#7d8199", marginBottom: 10, paddingTop: 8, borderTop: "1px solid #1a1e33" }}>
                  <span>Updated: {new Date(p.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                  <span>Branch: <strong style={{ color: "#a7abc2" }}>{latestDeploy?.branch || "main"}</strong></span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        background: "#5b8def",
                        color: "#fff",
                        padding: "7px 10px",
                        borderRadius: 8,
                        fontSize: 11.5,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Kunjungi Web <ExternalLink size={12} />
                    </a>
                  ) : (
                    <button disabled style={{ flex: 1, background: "#1a1e33", border: "none", color: "#5b5f78", padding: "7px 10px", borderRadius: 8, fontSize: 11.5 }}>
                      No Domain
                    </button>
                  )}

                  <button
                    onClick={() => toggleExpand(p.id)}
                    style={{
                      background: "#1a1e33",
                      border: "1px solid #2a2f4a",
                      color: "#e7e9f3",
                      padding: "7px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    History <ChevronDown size={14} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  maxHeight: isExpanded ? "400px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  marginTop: isExpanded ? 4 : 0,
                  paddingTop: isExpanded ? 10 : 0,
                  borderTop: isExpanded ? "1px solid #1e2338" : "1px solid transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7d8199", letterSpacing: 0.5 }}>
                  5 DEPLOYMENT TERAKHIR
                </div>

                {p.deployments?.length === 0 ? (
                  <div style={{ fontSize: 11, color: "#7d8199" }}>Belum ada riwayat deployment.</div>
                ) : (
                  p.deployments?.map((d) => (
                    <div key={d.id} style={{ background: "#0e1120", border: "1px solid #1e2338", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: d.state === "READY" ? "#4dd6c4" : "#ff8a9b" }}>
                          {d.state}
                        </span>
                        <span style={{ fontSize: 9.5, color: "#7d8199" }}>
                          {new Date(d.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#e7e9f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.commitMessage}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function NetlifyProject() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    fetch("/api/netlify")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const toggleExpand = (id) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const projects = data?.projects || [];
  const liveCount = projects.filter((p) => p.domain_status?.dns_configured).length;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Live" && p.domain_status?.dns_configured);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <SectionTitle title="Netlify" sub="Monitoring deployment, edge functions, & propagasi domain SSL" />

      {/* Health Banner */}
      <div
        style={{
          background: "#12162a",
          border: "1px solid #1e2338",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", width: 10, height: 10 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#4dd6c4",
                animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                opacity: 0.75,
              }}
            />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4dd6c4" }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#e7e9f3" }}>
            Netlify System Health: {data?.health || "Operational"}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#7d8199" }}>All Global CDN & Edge Functions Active</span>
      </div>

      {/* Usage Bar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e7e9f3" }}>Free Tier Usage</span>
          <span style={{ fontSize: 10.5, color: "#7d8199", background: "#1a1e33", padding: "2px 8px", borderRadius: 6 }}>
            Bulan Ini
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7d8199", marginBottom: 4 }}>
              <span>Bandwidth ({data?.usage?.bandwidth_limit_gb || 100} GB)</span>
              <span style={{ color: "#4dd6c4", fontWeight: 600 }}>~{data?.usage?.bandwidth_used_gb || 1.2} GB</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#1a1e33", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${((data?.usage?.bandwidth_used_gb || 1.2) / (data?.usage?.bandwidth_limit_gb || 100)) * 100}%`, height: "100%", background: "#4dd6c4" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#7d8199", marginBottom: 4 }}>
              <span>Build Minutes ({data?.usage?.build_minutes_limit || 300} min)</span>
              <span style={{ color: "#5b8def", fontWeight: 600 }}>{data?.usage?.build_minutes_used || 15} min</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "#1a1e33", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${((data?.usage?.build_minutes_used || 15) / (data?.usage?.build_minutes_limit || 300)) * 100}%`, height: "100%", background: "#5b8def" }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Mini Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat icon={Layers} tint="#00c7b7" label="Total Sites" value={data ? projects.length : "-"} />
        <MiniStat icon={CircleCheck} tint="#4dd6c4" label="Status Live" value={data ? liveCount : "-"} />
        <MiniStat icon={Globe} tint="#c084fc" label="Domain Aktif" value={data ? liveCount : "-"} />
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#12162a", border: "1px solid #1e2338", borderRadius: 10, padding: "7px 10px" }}>
          <Search size={14} color="#7d8199" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Cari project Netlify..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e7e9f3", fontSize: 12.5 }}
          />
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Live"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#00c7b7" : "#12162a",
                border: "1px solid",
                borderColor: filter === f ? "#00c7b7" : "#1e2338",
                color: filter === f ? "#fff" : "#8b8fa8",
                borderRadius: 8,
                padding: "4px 12px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f === "Live" ? "Domain Live" : "Semua Project"}
            </button>
          ))}
        </div>
      </div>

      {!data && <p style={{ color: "#7d8199", fontSize: 13 }}>Memuat data Netlify...</p>}
      {data && data.error && (
        <Card><p style={{ color: "#ff8a9b", fontSize: 13, margin: 0 }}>{data.error}</p></Card>
      )}

      {/* Grid Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, alignItems: "start" }}>
        {filteredProjects.map((p) => {
          const isExpanded = !!expandedProjects[p.id];
          const latestDeploy = p.deployments?.[0];

          return (
            <div
              key={p.id}
              style={{
                background: "#12162a",
                border: "1px solid #1e2338",
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 120,
                  height: 120,
                  background: `radial-gradient(circle at top right, #00c7b722, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#00c7b718", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Layers size={16} color="#00c7b7" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#f2f3fa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                  </div>

                  <span style={{ fontSize: 9, fontWeight: 700, background: "#4dd6c422", color: "#4dd6c4", padding: "2px 6px", borderRadius: 4, border: "1px solid #4dd6c444" }}>
                    PUBLISHED
                  </span>
                </div>

                <div style={{ fontSize: 11, color: "#8b8fa8", marginBottom: 10 }}>
                  Branch: <span style={{ color: "#e7e9f3", fontWeight: 600 }}>{p.build_settings?.branch || "main"}</span>
                </div>

                {/* Info Edge Functions & SSL Check */}
                <div style={{ background: "#0e1120", border: "1px solid #1a1e33", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                    <span style={{ color: "#7d8199", display: "flex", alignItems: "center", gap: 5 }}>
                      <Code2 size={12} color="#5b8def" /> Edge Functions:
                    </span>
                    <span style={{ fontWeight: 700, color: "#5b8def", background: "#5b8def18", padding: "2px 6px", borderRadius: 4 }}>
                      {p.functions_count || 0} Active
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
                    <span style={{ color: "#7d8199", display: "flex", alignItems: "center", gap: 5 }}>
                      <ShieldCheck size={12} color="#4dd6c4" /> Domain & SSL:
                    </span>
                    <span style={{ fontWeight: 700, color: "#4dd6c4" }}>
                      {p.domain_status?.ssl || "Active"}
                    </span>
                  </div>

                  <div style={{ fontSize: 10.5, color: "#8b8fa8", borderTop: "1px solid #1a1e33", paddingTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.domain_status?.custom_domain || p.url}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10.5, color: "#7d8199", marginBottom: 10, paddingTop: 8, borderTop: "1px solid #1a1e33" }}>
                  <span>Updated: {p.updated_at ? new Date(p.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}</span>
                  <span>Provider: <strong style={{ color: "#a7abc2" }}>{p.build_settings?.provider?.toUpperCase() || "GITHUB"}</strong></span>
                </div>

                {/* Action Buttons: Kunjungi Web & History Toggle */}
                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      background: "#00c7b7",
                      color: "#0a0c14",
                      padding: "7px 10px",
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Kunjungi Web <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={() => toggleExpand(p.id)}
                    style={{
                      background: "#1a1e33",
                      border: "1px solid #2a2f4a",
                      color: "#e7e9f3",
                      padding: "7px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    History <ChevronDown size={14} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                  </button>
                </div>
              </div>

              {/* Log History Drawer (Slide Down + Fade In) */}
              <div
                style={{
                  maxHeight: isExpanded ? "400px" : "0px",
                  opacity: isExpanded ? 1 : 0,
                  overflow: "hidden",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  marginTop: isExpanded ? 4 : 0,
                  paddingTop: isExpanded ? 10 : 0,
                  borderTop: isExpanded ? "1px solid #1e2338" : "1px solid transparent",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7d8199", letterSpacing: 0.5 }}>
                  5 DEPLOYMENT TERAKHIR
                </div>

                {p.deployments?.length === 0 ? (
                  <div style={{ fontSize: 11, color: "#7d8199" }}>Belum ada riwayat deployment.</div>
                ) : (
                  p.deployments?.map((d) => (
                    <div key={d.id} style={{ background: "#0e1120", border: "1px solid #1e2338", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: d.state === "READY" ? "#4dd6c4" : "#ff8a9b" }}>
                          {d.state}
                        </span>
                        <span style={{ fontSize: 9.5, color: "#7d8199" }}>
                          {new Date(d.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#e7e9f3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.commitMessage}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DatabasePanel() {
  const [sb, setSb] = useState(null);
  const [cf, setCf] = useState(null);

  useEffect(() => {
    fetch("/api/supabase/status").then((r) => r.json()).then(setSb).catch(() => {});
    fetch("/api/cloudflare/metrics").then((r) => r.json()).then(setCf).catch(() => {});
  }, []);

  const workers = cf?.workers || [];
  const totalRequests = workers.reduce((s, w) => s + (w.requests || 0), 0);
  const activeWorkers = workers.filter((w) => (w.requests || 0) > 0).length;

  return (
    <div>
      <SectionTitle title="Database & Edge Services" sub="Real-time DBMS Explorer & Cloudflare Workers Gateway" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat icon={Database} tint="#3ecf8e" label="Supabase Table" value={sb?.tableName || "absen"} />
        <MiniStat icon={Activity} tint="#3ecf8e" label="Total Records" value={sb?.configured && sb.totalRows != null ? sb.totalRows : "-"} />
        <MiniStat icon={Cloud} tint="#f38020" label="Workers Active" value={cf?.configured ? `${activeWorkers}/${workers.length}` : "-"} />
        <MiniStat icon={Zap} tint="#f38020" label="Total Requests" value={cf?.configured ? totalRequests : "-"} />
      </div>

      <Card style={{ marginBottom: 18, padding: 0, overflow: "hidden", border: "1px solid #1e2338" }}>
        <div style={{ padding: "14px 18px", background: "#0e1120", borderBottom: "1px solid #1e2338", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#3ecf8e22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={16} color="#3ecf8e" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e7e9f3" }}>
                Supabase Postgres — <span style={{ color: "#3ecf8e" }}>{sb?.tableName || "public"}</span>
              </div>
              <div style={{ fontSize: 10.5, color: "#7d8199" }}>PostgreSQL Data Browser (RLS Enabled)</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: "#3ecf8e18", color: "#3ecf8e", padding: "3px 8px", borderRadius: 6, border: "1px solid #3ecf8e33" }}>
              POSTGRESQL
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, background: "#1a1e33", color: "#a7abc2", padding: "3px 8px", borderRadius: 6 }}>
              {sb?.totalRows || 0} Rows
            </span>
          </div>
        </div>

        <div style={{ padding: "14px 18px" }}>
          {!sb && <p style={{ color: "#7d8199", fontSize: 13, margin: 0 }}>Connecting to Supabase Database...</p>}
          {sb && !sb.configured && <div style={{ fontSize: 13, color: "#ff8a9b" }}>{sb.message}</div>}
          {sb?.configured && sb.error && (
            <div style={{ fontSize: 12.5, color: "#ff8a9b" }}>{sb.error} — {sb.detail}</div>
          )}

          {sb?.configured && !sb.error && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7d8199", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <span>RAW TABLE VIEWER (TOP 5 RECENT)</span>
                <span>Sorted: Newest First</span>
              </div>

              <div style={{ overflowX: "auto", border: "1px solid #1e2338", borderRadius: 10, background: "#0a0c14" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 11.5 }}>
                  <thead>
                    <tr style={{ background: "#12162a", borderBottom: "1px solid #1e2338", color: "#7d8199" }}>
                      <th style={{ padding: "8px 12px", width: 40, textAlign: "center" }}>#</th>
                      {sb.columns?.map((col) => (
                        <th key={col} style={{ padding: "8px 12px", color: "#4dd6c4", fontWeight: 700 }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sb.recentRows?.length === 0 ? (
                      <tr>
                        <td colSpan={sb.columns?.length + 1 || 1} style={{ padding: 16, textAlign: "center", color: "#7d8199" }}>
                          Table is empty.
                        </td>
                      </tr>
                    ) : (
                      sb.recentRows?.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #12162a", color: "#e7e9f3" }}>
                          <td style={{ padding: "8px 12px", color: "#5b5f78", textAlign: "center", fontWeight: 600 }}>{idx + 1}</td>
                          {sb.columns?.map((col) => {
                            const val = String(row[col] ?? "-");
                            const isBool = val === "true" || val === "false";
                            return (
                              <td key={col} style={{ padding: "8px 12px", whiteSpace: "nowrap" }}>
                                {isBool ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: val === "true" ? "#4dd6c422" : "#ff8a9b22", color: val === "true" ? "#4dd6c4" : "#ff8a9b" }}>
                                    {val.toUpperCase()}
                                  </span>
                                ) : (
                                  val
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden", border: "1px solid #1e2338" }}>
        <div style={{ padding: "14px 18px", background: "#0e1120", borderBottom: "1px solid #1e2338", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f3802022", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Cloud size={16} color="#f38020" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e7e9f3" }}>Cloudflare Workers & APIs</div>
              <div style={{ fontSize: 10.5, color: "#7d8199" }}>Serverless Edge Computing Console</div>
            </div>
          </div>

          <span style={{ fontSize: 10, fontWeight: 700, background: "#f3802018", color: "#f38020", padding: "3px 8px", borderRadius: 6, border: "1px solid #f3802033" }}>
            GLOBAL EDGE NETWORK
          </span>
        </div>

        <div style={{ padding: "16px 18px" }}>
          {!cf && <p style={{ color: "#7d8199", fontSize: 13, margin: 0 }}>Loading Edge Workers Metrics...</p>}
          {cf && !cf.configured && <div style={{ fontSize: 13, color: "#ff8a9b" }}>{cf.message}</div>}

          {cf?.configured && workers.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {workers.map((w) => {
                const isActive = (w.requests || 0) > 0;
                return (
                  <div
                    key={w.key}
                    style={{
                      background: "#0a0c14",
                      border: "1px solid #1e2338",
                      borderRadius: 12,
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#4dd6c4" : "#5b5f78", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#f2f3fa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {w.scriptName}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: isActive ? "#4dd6c422" : "#1a1e33",
                            color: isActive ? "#4dd6c4" : "#7d8199",
                          }}
                        >
                          {isActive ? "ACTIVE" : "IDLE"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 700, background: "#5b8def22", color: "#5b8def", padding: "1px 5px", borderRadius: 4 }}>
                          GET / POST
                        </span>
                        <span style={{ fontSize: 10.5, color: "#7d8199" }}>Edge Worker</span>
                      </div>
                    </div>

                    <div style={{ background: "#12162a", borderRadius: 8, padding: "8px 10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, textAlign: "center" }}>
                      <div>
                        <div style={{ fontSize: 9.5, color: "#7d8199" }}>Requests</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#e7e9f3", marginTop: 2 }}>{w.requests ?? 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9.5, color: "#7d8199" }}>Errors</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: w.errors > 0 ? "#ff8a9b" : "#4dd6c4", marginTop: 2 }}>{w.errors ?? 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9.5, color: "#7d8199" }}>CPU p50</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#c084fc", marginTop: 2 }}>{w.cpuTimeP50Ms ?? 0} ms</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

export default function DashboardPage() {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const music = useMusicPlayer();
  const chat = useChatBot();

  return (
    <div className="layout" style={{ position: "relative", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} tab={tab} setTab={setTab} />

      <main className="main" style={{ paddingBottom: music.view === "mini" ? 70 : 0 }}>
        <div className="topbar">
          <button className="toggle-btn" onClick={() => setSidebarOpen((o) => !o)}>
            <Menu size={18} />
          </button>
        </div>
        {tab === "overview" && <Overview onOpenMusic={music.openSearch} onOpenChat={() => chat.setOpen(true)} />}
        {tab === "projects" && <Projects />}
        {tab === "vercel" && <VercelProject />}
        {tab === "netlify" && <NetlifyProject />}
        {tab === "database" && <DatabasePanel />}
      </main>

      <MusicPlayerUI music={music} />
      <ChatBotUI chat={chat} />
    </div>
  );
}
