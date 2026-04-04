import { useState, useEffect, useMemo } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const ADMIN_KEY_CORRECT = "shadow-admin-2026";
const ADMIN_EMAIL_CORRECT = "jefflynch107@gmail.com";

const PURPLE = "#A855F7";
const GOLD   = "#F5D67A";
const GREEN  = "#6EE7B7";
const PINK   = "#F472B6";
const BLUE   = "#60A5FA";
const RED    = "#F87171";

interface Visitor { email: string; registeredAt: number; visitCount: number; lastSeen: number; }
interface SwEvent { id: string; timestamp: number; type: string; path: string; ip: string; sessionId: string; heroine?: string; villain?: string; setting?: string; durationMs?: number; }
interface Stats { total: number; today: number; thisWeek: number; sessions: number; images: number; topMode: { type: string; count: number } | null; modeCounts: Record<string, number>; hourBuckets: number[]; topHeroines: [string, number][]; topVillains: [string, number][]; }

function fmtDate(ts: number) { return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtTime(ts: number) { return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function timeAgo(ts: number) {
  const d = Date.now() - ts, m = Math.floor(d / 60000);
  if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24); return `${dy}d ago`;
}
function prettyType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function typeColor(t: string): string {
  if (t.includes("image") || t.includes("heroine_image")) return BLUE;
  if (t.includes("debrief")) return RED;
  if (t.includes("start") || t.includes("slow_burn") || t.includes("confined")) return GOLD;
  if (t.includes("choices")) return GREEN;
  if (t.includes("dossier") || t.includes("villain_memory")) return PINK;
  return PURPLE;
}
function typeIcon(t: string): string {
  if (t.includes("image")) return "🎨";
  if (t.includes("debrief")) return "📂";
  if (t.includes("slow_burn")) return "🔥";
  if (t.includes("confined")) return "🚪";
  if (t.includes("choices")) return "⟁";
  if (t.includes("dossier")) return "📋";
  if (t.includes("villain_memory")) return "🧠";
  if (t.includes("daily")) return "📅";
  if (t.includes("faction")) return "⚔";
  if (t.includes("arena")) return "🏟";
  if (t.includes("interrogation")) return "💡";
  if (t.includes("director")) return "🎬";
  return "◆";
}

interface AdminPageProps { onBack: () => void; }

export default function AdminPage({ onBack }: AdminPageProps) {
  const [email, setEmail]       = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const [tab, setTab] = useState<"overview" | "events" | "visitors">("overview");

  const [stats, setStats]       = useState<Stats | null>(null);
  const [events, setEvents]     = useState<SwEvent[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [evtFilter, setEvtFilter] = useState("all");
  const [evtSearch, setEvtSearch] = useState("");
  const [vSearch, setVSearch]   = useState("");
  const [polling, setPolling]   = useState(false);

  const [emailFocus, setEmailFocus] = useState(false);
  const [keyFocus, setKeyFocus]     = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (email.toLowerCase().trim() !== ADMIN_EMAIL_CORRECT) { setError("Unauthorized email address."); return; }
    if (adminKey.trim() !== ADMIN_KEY_CORRECT) { setError("Invalid admin key."); return; }
    setLoading(true); setError("");
    try {
      const headers = { "x-admin-key": adminKey.trim(), "x-admin-email": email.trim() };
      const [statsRes, eventsRes, visitorsRes] = await Promise.all([
        fetch(`${BASE}/api/admin/stats`, { headers }),
        fetch(`${BASE}/api/admin/events?limit=200`, { headers }),
        fetch(`${BASE}/api/admin/visitors`, { headers }),
      ]);
      if (!statsRes.ok) { setError("Server rejected the request. Check the API server."); setLoading(false); return; }
      const [s, ev, vis] = await Promise.all([statsRes.json(), eventsRes.json(), visitorsRes.json()]);
      setStats(s); setEvents(ev.events ?? []); setVisitors(vis.visitors ?? []);
      setAuthed(true);
    } catch { setError("Network error — make sure the API server is running."); }
    setLoading(false);
  }

  async function refreshData() {
    if (!authed) return;
    setPolling(true);
    try {
      const headers = { "x-admin-key": adminKey.trim(), "x-admin-email": email.trim() };
      const [s, ev] = await Promise.all([
        fetch(`${BASE}/api/admin/stats`, { headers }).then(r => r.json()),
        fetch(`${BASE}/api/admin/events?limit=200`, { headers }).then(r => r.json()),
      ]);
      setStats(s); setEvents(ev.events ?? []);
    } catch {}
    setPolling(false);
  }

  useEffect(() => {
    if (!authed) return;
    const iv = setInterval(refreshData, 15000);
    return () => clearInterval(iv);
  }, [authed]);

  const filteredEvents = useMemo(() => {
    let list = events;
    if (evtFilter !== "all") list = list.filter(e => e.type === evtFilter);
    if (evtSearch.trim()) {
      const q = evtSearch.toLowerCase();
      list = list.filter(e => (e.heroine ?? "").toLowerCase().includes(q) || (e.villain ?? "").toLowerCase().includes(q) || e.type.includes(q) || e.sessionId.includes(q));
    }
    return list;
  }, [events, evtFilter, evtSearch]);

  const filteredVisitors = useMemo(() => {
    if (!vSearch.trim()) return visitors;
    return visitors.filter(v => v.email.toLowerCase().includes(vSearch.toLowerCase()));
  }, [visitors, vSearch]);

  const sortedModes = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.modeCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [stats]);

  const maxMode = sortedModes[0]?.[1] ?? 1;
  const maxHour = stats ? Math.max(...stats.hourBuckets, 1) : 1;

  const eventTypes = useMemo(() => ["all", ...Array.from(new Set(events.map(e => e.type)))], [events]);

  if (!authed) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#050010", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <style>{`
          @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
          @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.65)} }
          @keyframes rise    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes scan    { 0%{top:0} 100%{top:100%} }
        `}</style>
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 10%, rgba(100,0,200,0.14) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(168,85,247,0.07) 0%, transparent 50%)", pointerEvents: "none" }} />

        <div style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", gap: "1rem", padding: "0 2rem", height: "56px", background: "rgba(5,0,16,0.9)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(168,85,247,0.1)" }}>
          <button onClick={onBack} style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "8px", color: "rgba(192,132,252,0.75)", fontFamily: "'Cinzel',serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", padding: "0.35rem 0.85rem", cursor: "pointer" }}>← BACK</button>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.78rem", fontWeight: 900, letterSpacing: "4px", background: `linear-gradient(135deg, ${GOLD} 0%, #E8B830 50%, ${GOLD} 100%)`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite" }}>SHADOWWEAVE</span>
          <span style={{ fontSize: "0.55rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "3px", color: "rgba(200,195,240,0.3)" }}>/ COMMAND CENTER</span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
          <div style={{ width: "100%", maxWidth: "400px", animation: "rise 0.5s cubic-bezier(0.23,1,0.32,1) both" }}>
            <div style={{ background: "rgba(8,2,22,0.95)", backdropFilter: "blur(32px)", borderRadius: "20px", border: "1px solid rgba(168,85,247,0.22)", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(168,85,247,0.05)", padding: "2.5rem 2rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: `linear-gradient(90deg, transparent, ${PURPLE}99, ${GOLD}66, transparent)` }} />

              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ width: "56px", height: "56px", margin: "0 auto 1rem", borderRadius: "14px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>🛡</div>
                <h2 style={{ margin: "0 0 0.4rem", fontFamily: "'Cinzel',serif", fontSize: "1.3rem", fontWeight: 900, letterSpacing: "3px", color: "#EEE8FF" }}>Command Center</h2>
                <p style={{ margin: 0, fontSize: "0.65rem", color: "rgba(200,195,240,0.35)", fontFamily: "'Raleway',sans-serif", letterSpacing: "0.5px" }}>Restricted — authorised personnel only</p>
              </div>

              {error && (
                <div style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "rgba(80,0,0,0.5)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "0.7rem", color: RED, fontFamily: "'Raleway',sans-serif" }}>⚠ {error}</div>
              )}

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.5rem", letterSpacing: "2.5px", color: emailFocus ? "rgba(192,132,252,0.75)" : "rgba(200,195,240,0.25)", marginBottom: "0.5rem", transition: "color 0.25s", fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>ADMIN EMAIL</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)} placeholder="your@email.com" autoFocus style={{ width: "100%", background: emailFocus ? "rgba(168,85,247,0.07)" : "rgba(0,0,0,0.4)", border: `1px solid ${emailFocus ? "rgba(168,85,247,0.5)" : "rgba(168,85,247,0.14)"}`, borderRadius: "12px", padding: "0.9rem 1rem", color: "#EEE", fontFamily: "'Raleway',sans-serif", fontSize: "0.85rem", outline: "none", transition: "all 0.25s", boxSizing: "border-box", caretColor: PURPLE }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.5rem", letterSpacing: "2.5px", color: keyFocus ? "rgba(192,132,252,0.75)" : "rgba(200,195,240,0.25)", marginBottom: "0.5rem", transition: "color 0.25s", fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>ADMIN KEY</label>
                  <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} onFocus={() => setKeyFocus(true)} onBlur={() => setKeyFocus(false)} placeholder="Enter admin key" style={{ width: "100%", background: keyFocus ? "rgba(168,85,247,0.07)" : "rgba(0,0,0,0.4)", border: `1px solid ${keyFocus ? "rgba(168,85,247,0.5)" : "rgba(168,85,247,0.14)"}`, borderRadius: "12px", padding: "0.9rem 1rem", color: "#EEE", fontFamily: "'Raleway',sans-serif", fontSize: "0.85rem", outline: "none", transition: "all 0.25s", boxSizing: "border-box", caretColor: PURPLE }} />
                </div>
                <button type="submit" disabled={loading || !email.trim() || !adminKey.trim()} style={{ padding: "0.95rem", background: "linear-gradient(135deg, #5B21B6, #8B5CF6, #5B21B6)", backgroundSize: "200% auto", border: "1px solid rgba(168,85,247,0.55)", borderRadius: "12px", color: "#F5F0FF", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "3px", cursor: "pointer", animation: "shimmer 3s linear infinite" }}>
                  {loading ? "VERIFYING…" : "ACCESS COMMAND CENTER"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#050010", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.6)} }
        @keyframes rise    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeRow { from{opacity:0;transform:translateX(-5px)} to{opacity:1;transform:translateX(0)} }
        @keyframes ticker  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .sw-tab:hover { opacity: 1 !important; }
        .sw-row:hover { background: rgba(168,85,247,0.05) !important; }
        .sw-evt:hover { background: rgba(168,85,247,0.04) !important; }
        .sw-refresh:hover { opacity: 1 !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.25); border-radius: 2px; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 15% 10%, rgba(80,0,180,0.14) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(168,85,247,0.07) 0%, transparent 50%)", pointerEvents: "none" }} />

      {/* TOP NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", gap: "1rem", padding: "0 1.5rem", height: "56px", background: "rgba(5,0,16,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(168,85,247,0.1)", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "8px", color: "rgba(192,132,252,0.75)", fontFamily: "'Cinzel',serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1.5px", padding: "0.3rem 0.75rem", cursor: "pointer" }}>← EXIT</button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: PURPLE, animation: "pulse 2.5s ease-in-out infinite", boxShadow: `0 0 8px ${PURPLE}` }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "3px", background: `linear-gradient(135deg, ${GOLD}, #E8B830, ${GOLD})`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite" }}>SHADOWWEAVE</span>
          <span style={{ fontSize: "0.52rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "3px", color: "rgba(200,195,240,0.25)" }}>/ COMMAND CENTER</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.25rem", marginLeft: "1.5rem" }}>
          {(["overview", "events", "visitors"] as const).map(t => (
            <button key={t} className="sw-tab" onClick={() => setTab(t)} style={{ padding: "0.3rem 0.9rem", borderRadius: "8px", border: `1px solid ${tab === t ? "rgba(168,85,247,0.4)" : "transparent"}`, background: tab === t ? "rgba(168,85,247,0.14)" : "transparent", color: tab === t ? "#C084FC" : "rgba(200,195,240,0.35)", fontFamily: "'Montserrat',sans-serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", opacity: tab === t ? 1 : 0.7, transition: "all 0.2s" }}>
              {t === "overview" ? "⬡ Overview" : t === "events" ? "◈ Interactions" : "◉ Users"}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button className="sw-refresh" onClick={refreshData} disabled={polling} style={{ background: "none", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "6px", color: "rgba(200,195,240,0.3)", fontSize: "0.6rem", fontFamily: "'Montserrat',sans-serif", padding: "0.25rem 0.6rem", cursor: "pointer", opacity: 0.6, transition: "opacity 0.2s", letterSpacing: "1px" }}>
            {polling ? "…" : "↻ REFRESH"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}`, animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "0.55rem", fontFamily: "'Montserrat',sans-serif", color: "rgba(200,195,240,0.3)", letterSpacing: "1.5px" }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, padding: "1.5rem", maxWidth: "1200px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* ══ OVERVIEW TAB ══ */}
        {tab === "overview" && stats && (
          <div style={{ animation: "rise 0.4s cubic-bezier(0.23,1,0.32,1) both" }}>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {[
                { label: "Total Events",    value: stats.total.toLocaleString(),  icon: "◆", accent: GOLD,   sub: "all time" },
                { label: "Today",           value: stats.today.toLocaleString(),  icon: "⚡", accent: GREEN,  sub: "last 24 hours" },
                { label: "This Week",       value: stats.thisWeek.toLocaleString(), icon: "📅", accent: PURPLE, sub: "last 7 days" },
                { label: "Unique Sessions", value: stats.sessions.toLocaleString(), icon: "◉", accent: BLUE,   sub: "by fingerprint" },
                { label: "Images Generated",value: stats.images.toLocaleString(), icon: "🎨", accent: PINK,   sub: "lustify-sdxl" },
              ].map((s, i) => (
                <div key={s.label} style={{ background: "rgba(8,2,22,0.85)", border: `1px solid rgba(168,85,247,0.13)`, borderRadius: "14px", padding: "1.1rem 1.2rem", position: "relative", overflow: "hidden", animation: `rise 0.4s ${i * 0.06}s both` }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${s.accent}55, transparent)` }} />
                  <div style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.7rem", fontWeight: 900, color: s.accent, lineHeight: 1, marginBottom: "0.25rem" }}>{s.value}</div>
                  <div style={{ fontSize: "0.52rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(200,195,240,0.45)", marginBottom: "0.15rem" }}>{s.label}</div>
                  <div style={{ fontSize: "0.55rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.22)" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>

              {/* Mode Usage */}
              <div style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "14px", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.55rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2.5px", color: "rgba(192,132,252,0.5)", textTransform: "uppercase", marginBottom: "1rem" }}>Mode Usage</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {sortedModes.map(([type, count]) => (
                    <div key={type}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.6rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.55)" }}>{typeIcon(type)} {prettyType(type)}</span>
                        <span style={{ fontSize: "0.6rem", fontFamily: "'Cinzel',serif", color: typeColor(type), fontWeight: 700 }}>{count}</span>
                      </div>
                      <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.05)" }}>
                        <div style={{ height: "100%", borderRadius: "2px", width: `${(count / maxMode) * 100}%`, background: `linear-gradient(90deg, ${typeColor(type)}88, ${typeColor(type)})`, transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)" }} />
                      </div>
                    </div>
                  ))}
                  {sortedModes.length === 0 && <div style={{ fontSize: "0.7rem", color: "rgba(200,195,240,0.2)", fontFamily: "'Raleway',sans-serif" }}>No data yet. Start generating stories.</div>}
                </div>
              </div>

              {/* Hourly Heatmap */}
              <div style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "14px", padding: "1.25rem" }}>
                <div style={{ fontSize: "0.55rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2.5px", color: "rgba(192,132,252,0.5)", textTransform: "uppercase", marginBottom: "1rem" }}>Activity by Hour (This Week)</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "80px" }}>
                  {stats.hourBuckets.map((count, h) => (
                    <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                        <div title={`${h}:00 — ${count} events`} style={{ width: "100%", borderRadius: "2px 2px 0 0", background: count > 0 ? `rgba(168,85,247,${0.15 + (count / maxHour) * 0.7})` : "rgba(255,255,255,0.03)", height: `${Math.max((count / maxHour) * 100, count > 0 ? 5 : 0)}%`, transition: "height 0.6s ease", cursor: "default" }} />
                      </div>
                      {(h % 6 === 0) && <div style={{ fontSize: "0.38rem", color: "rgba(200,195,240,0.2)", fontFamily: "'Montserrat',sans-serif" }}>{h}h</div>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.55rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.25)" }}>Peak: {stats.hourBuckets.indexOf(Math.max(...stats.hourBuckets))}:00</span>
                  <span style={{ fontSize: "0.55rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.25)" }}>{Math.max(...stats.hourBuckets)} max/hour</span>
                </div>
              </div>

              {/* Top Heroines + Villains */}
              <div style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "14px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div>
                  <div style={{ fontSize: "0.52rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2px", color: "rgba(192,132,252,0.45)", textTransform: "uppercase", marginBottom: "0.65rem" }}>Top Heroines</div>
                  {stats.topHeroines.slice(0, 5).map(([name, count]) => (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.2rem 0", borderBottom: "1px solid rgba(168,85,247,0.05)" }}>
                      <span style={{ fontSize: "0.65rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.6)" }}>{name}</span>
                      <span style={{ fontSize: "0.62rem", fontFamily: "'Cinzel',serif", color: GOLD, fontWeight: 700 }}>{count}</span>
                    </div>
                  ))}
                  {stats.topHeroines.length === 0 && <div style={{ fontSize: "0.6rem", color: "rgba(200,195,240,0.2)", fontFamily: "'Raleway',sans-serif" }}>No data yet</div>}
                </div>
                <div>
                  <div style={{ fontSize: "0.52rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2px", color: "rgba(192,132,252,0.45)", textTransform: "uppercase", marginBottom: "0.65rem" }}>Top Villains</div>
                  {stats.topVillains.slice(0, 5).map(([name, count]) => (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.2rem 0", borderBottom: "1px solid rgba(168,85,247,0.05)" }}>
                      <span style={{ fontSize: "0.65rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.6)" }}>{name}</span>
                      <span style={{ fontSize: "0.62rem", fontFamily: "'Cinzel',serif", color: RED, fontWeight: 700 }}>{count}</span>
                    </div>
                  ))}
                  {stats.topVillains.length === 0 && <div style={{ fontSize: "0.6rem", color: "rgba(200,195,240,0.2)", fontFamily: "'Raleway',sans-serif" }}>No data yet</div>}
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "14px", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.55rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2.5px", color: "rgba(192,132,252,0.5)", textTransform: "uppercase" }}>Live Feed — Recent Interactions</div>
                <div style={{ fontSize: "0.55rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.2)" }}>{events.length} total interactions logged</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {events.slice(0, 12).map((e, i) => {
                  const c = typeColor(e.type);
                  return (
                    <div key={e.id} className="sw-evt" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.012)", border: "1px solid rgba(168,85,247,0.05)", transition: "background 0.2s", animation: `ticker 0.3s ${i * 0.04}s both` }}>
                      <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>{typeIcon(e.type)}</span>
                      <span style={{ padding: "0.12rem 0.5rem", borderRadius: "6px", background: `${c}15`, border: `1px solid ${c}30`, fontSize: "0.5rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "1px", color: c, whiteSpace: "nowrap", flexShrink: 0 }}>{prettyType(e.type)}</span>
                      <span style={{ fontSize: "0.65rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.55)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {[e.heroine, e.villain, e.setting].filter(Boolean).join(" · ") || e.path}
                      </span>
                      <span style={{ fontSize: "0.55rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.22)", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(e.timestamp)}</span>
                      <span style={{ fontSize: "0.45rem", fontFamily: "'Courier New',monospace", color: "rgba(200,195,240,0.12)", flexShrink: 0 }}>#{e.sessionId.slice(0, 6)}</span>
                    </div>
                  );
                })}
                {events.length === 0 && (
                  <div style={{ padding: "2rem", textAlign: "center", color: "rgba(200,195,240,0.2)", fontFamily: "'Raleway',sans-serif", fontSize: "0.75rem" }}>No interactions recorded yet. Start using the app to see data here.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ EVENTS TAB ══ */}
        {tab === "events" && (
          <div style={{ animation: "rise 0.4s cubic-bezier(0.23,1,0.32,1) both" }}>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                <span style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: "rgba(200,195,240,0.3)", pointerEvents: "none" }}>🔍</span>
                <input type="text" value={evtSearch} onChange={e => setEvtSearch(e.target.value)} placeholder="Search heroine, villain, session…" style={{ width: "100%", background: "rgba(8,2,22,0.8)", border: "1px solid rgba(168,85,247,0.16)", borderRadius: "10px", padding: "0.65rem 1rem 0.65rem 2.3rem", color: "#EEE", fontFamily: "'Raleway',sans-serif", fontSize: "0.8rem", outline: "none", boxSizing: "border-box", caretColor: PURPLE }} />
              </div>
              <select value={evtFilter} onChange={e => setEvtFilter(e.target.value)} style={{ background: "rgba(8,2,22,0.8)", border: "1px solid rgba(168,85,247,0.16)", borderRadius: "10px", padding: "0.65rem 1rem", color: "rgba(200,195,240,0.7)", fontFamily: "'Raleway',sans-serif", fontSize: "0.75rem", outline: "none", cursor: "pointer" }}>
                {eventTypes.map(t => <option key={t} value={t} style={{ background: "#0a0020" }}>{t === "all" ? "All Types" : prettyType(t)}</option>)}
              </select>
              <div style={{ fontSize: "0.55rem", fontFamily: "'Montserrat',sans-serif", color: "rgba(200,195,240,0.25)", letterSpacing: "1.5px" }}>{filteredEvents.length} EVENTS</div>
            </div>

            {/* Events Table */}
            <div style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr 100px 80px", padding: "0.6rem 1.25rem", borderBottom: "1px solid rgba(168,85,247,0.1)", background: "rgba(168,85,247,0.04)" }}>
                {["Time", "Type", "Heroine", "Villain / Setting", "Session", ""].map(h => (
                  <div key={h} style={{ fontSize: "0.48rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(192,132,252,0.4)", fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>{h}</div>
                ))}
              </div>

              {filteredEvents.length === 0 ? (
                <div style={{ padding: "4rem", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.25 }}>◈</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", color: "rgba(200,195,240,0.22)" }}>No interactions recorded yet.</div>
                </div>
              ) : (
                filteredEvents.slice(0, 150).map((e, i) => {
                  const c = typeColor(e.type);
                  return (
                    <div key={e.id} className="sw-row" style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr 1fr 100px 80px", padding: "0.65rem 1.25rem", borderBottom: i < filteredEvents.length - 1 ? "1px solid rgba(168,85,247,0.05)" : "none", alignItems: "center", transition: "background 0.2s", animation: `fadeRow 0.25s ${Math.min(i * 0.02, 0.4)}s both` }}>
                      <div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.62rem", color: "rgba(200,195,240,0.4)" }}>{timeAgo(e.timestamp)}</div>
                        <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.5rem", color: "rgba(200,195,240,0.18)" }}>{fmtTime(e.timestamp)}</div>
                      </div>
                      <div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.15rem 0.55rem", borderRadius: "6px", background: `${c}15`, border: `1px solid ${c}25`, fontSize: "0.5rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "1px", color: c }}>
                          {typeIcon(e.type)} {prettyType(e.type)}
                        </span>
                      </div>
                      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.68rem", color: "rgba(200,195,240,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.heroine || "—"}</div>
                      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.68rem", color: "rgba(200,195,240,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[e.villain, e.setting].filter(Boolean).join(" / ") || "—"}</div>
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.52rem", color: "rgba(200,195,240,0.18)" }}>{e.sessionId.slice(0, 10)}…</div>
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.5rem", color: "rgba(200,195,240,0.15)" }}>{e.ip.slice(0, 12)}</div>
                    </div>
                  );
                })
              )}
            </div>
            {filteredEvents.length > 150 && (
              <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.6rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,240,0.2)" }}>Showing 150 of {filteredEvents.length} — use filters to narrow down</div>
            )}
          </div>
        )}

        {/* ══ VISITORS TAB ══ */}
        {tab === "visitors" && (
          <div style={{ animation: "rise 0.4s cubic-bezier(0.23,1,0.32,1) both" }}>

            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { label: "Total Users",    value: visitors.length.toString(),                                          accent: GOLD },
                { label: "Active (7d)",    value: visitors.filter(v => Date.now() - v.lastSeen < 604800000).length.toString(), accent: GREEN },
                { label: "Returning",      value: visitors.filter(v => v.visitCount > 1).length.toString(),            accent: PURPLE },
                { label: "Total Sessions", value: visitors.reduce((a, v) => a + v.visitCount, 0).toString(),           accent: PINK },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "14px", padding: "1rem 1.2rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${s.accent}44, transparent)` }} />
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.6rem", fontWeight: 900, color: s.accent }}>{s.value}</div>
                  <div style={{ fontSize: "0.52rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2px", color: "rgba(200,195,240,0.4)", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <input type="text" value={vSearch} onChange={e => setVSearch(e.target.value)} placeholder="🔍  Search email…" style={{ background: "rgba(8,2,22,0.8)", border: "1px solid rgba(168,85,247,0.16)", borderRadius: "10px", padding: "0.65rem 1rem", color: "#EEE", fontFamily: "'Raleway',sans-serif", fontSize: "0.8rem", outline: "none", width: "280px", caretColor: PURPLE }} />
            </div>

            <div style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 90px 100px", padding: "0.6rem 1.5rem", borderBottom: "1px solid rgba(168,85,247,0.1)", background: "rgba(168,85,247,0.04)" }}>
                {["Email", "Joined", "Last Active", "Visits", "Status"].map(h => (
                  <div key={h} style={{ fontSize: "0.48rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(192,132,252,0.4)", fontFamily: "'Montserrat',sans-serif", fontWeight: 700 }}>{h}</div>
                ))}
              </div>
              {filteredVisitors.length === 0 ? (
                <div style={{ padding: "4rem", textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", color: "rgba(200,195,240,0.22)" }}>No users yet.</div>
              ) : (
                [...filteredVisitors].sort((a, b) => b.lastSeen - a.lastSeen).map((v, i) => {
                  const tier = v.visitCount >= 10 ? { label: "Power User", color: GOLD } : v.visitCount >= 4 ? { label: "Returning", color: PURPLE } : v.visitCount >= 2 ? { label: "Engaged", color: GREEN } : { label: "New", color: "rgba(200,195,240,0.35)" };
                  const recent = Date.now() - v.lastSeen < 604800000;
                  return (
                    <div key={v.email} className="sw-row" style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 90px 100px", padding: "0.8rem 1.5rem", borderBottom: i < filteredVisitors.length - 1 ? "1px solid rgba(168,85,247,0.05)" : "none", alignItems: "center", transition: "background 0.2s", animation: `fadeRow 0.25s ${Math.min(i * 0.025, 0.4)}s both` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontFamily: "'Cinzel',serif", color: PURPLE, fontWeight: 700, flexShrink: 0 }}>{v.email[0].toUpperCase()}</div>
                        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.75rem", color: "#D4C8FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.email}</span>
                      </div>
                      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.68rem", color: "rgba(200,195,240,0.4)" }}>{fmtDate(v.registeredAt)}</div>
                      <div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.68rem", color: recent ? "rgba(110,231,183,0.75)" : "rgba(200,195,240,0.38)" }}>{timeAgo(v.lastSeen)}</div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.56rem", color: "rgba(200,195,240,0.18)" }}>{fmtTime(v.lastSeen)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", fontWeight: 900, color: v.visitCount > 3 ? PURPLE : "rgba(200,195,240,0.45)" }}>{v.visitCount}</span>
                        <div style={{ display: "flex", gap: "1.5px" }}>
                          {Array.from({ length: Math.min(v.visitCount, 5) }).map((_, j) => (
                            <div key={j} style={{ width: "3px", height: `${5 + j * 2}px`, borderRadius: "2px", background: PURPLE, opacity: 0.4 + j * 0.12 }} />
                          ))}
                        </div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "0.18rem 0.55rem", borderRadius: "20px", background: `${tier.color}18`, border: `1px solid ${tier.color}30`, fontSize: "0.5rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: tier.color }}>{tier.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.4rem" }}>
            <div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.2))" }} />
            <span style={{ fontSize: "0.48rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(200,195,240,0.15)" }}>Shadowweave · Command Center · {email}</span>
            <div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, rgba(168,85,247,0.2), transparent)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
