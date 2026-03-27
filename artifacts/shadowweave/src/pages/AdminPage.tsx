import { useState, useMemo } from "react";

interface Visitor {
  email: string;
  registeredAt: number;
  visitCount: number;
  lastSeen: number;
}

interface AdminPageProps {
  onBack: () => void;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 2) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return fmtDate(ts);
}
function activityTier(v: Visitor): { label: string; color: string; bg: string } {
  if (v.visitCount >= 10) return { label: "Power User", color: "#F5D67A", bg: "rgba(245,214,122,0.12)" };
  if (v.visitCount >= 4)  return { label: "Returning",  color: "#A78BFA", bg: "rgba(167,139,250,0.12)" };
  if (v.visitCount >= 2)  return { label: "Engaged",    color: "#6EE7B7", bg: "rgba(110,231,183,0.1)" };
  return                         { label: "New",         color: "rgba(200,195,240,0.4)", bg: "rgba(255,255,255,0.04)" };
}
function isRecent(ts: number): boolean {
  return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [adminKey, setAdminKey]     = useState("");
  const [keyFocused, setKeyFocused] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [visitors, setVisitors]     = useState<Visitor[] | null>(null);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<"all" | "returning" | "new" | "recent">("all");
  const [sort, setSort]             = useState<"lastSeen" | "visits" | "registered">("lastSeen");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminKey.trim()) return;
    setLoading(true); setError("");
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/admin/visitors`, {
        headers: { "x-admin-key": adminKey.trim() },
      });
      if (!res.ok) { setError("Invalid admin key — access denied."); setLoading(false); return; }
      const data = (await res.json()) as { count: number; visitors: Visitor[] };
      setVisitors(data.visitors);
    } catch { setError("Network error — check the API server."); }
    setLoading(false);
  }

  const stats = useMemo(() => {
    if (!visitors) return null;
    const total      = visitors.length;
    const returning  = visitors.filter(v => v.visitCount > 1).length;
    const totalVisit = visitors.reduce((a, v) => a + v.visitCount, 0);
    const recentV    = visitors.filter(v => isRecent(v.lastSeen)).length;
    const avg        = total ? (totalVisit / total).toFixed(1) : "0";
    return { total, returning, totalVisit, recentV, avg };
  }, [visitors]);

  const filtered = useMemo(() => {
    if (!visitors) return [];
    let list = visitors.filter(v => v.email.toLowerCase().includes(search.toLowerCase()));
    if (filter === "returning") list = list.filter(v => v.visitCount > 1);
    if (filter === "new")       list = list.filter(v => v.visitCount === 1);
    if (filter === "recent")    list = list.filter(v => isRecent(v.lastSeen));
    if (sort === "lastSeen")   list = [...list].sort((a,b) => b.lastSeen - a.lastSeen);
    if (sort === "visits")     list = [...list].sort((a,b) => b.visitCount - a.visitCount);
    if (sort === "registered") list = [...list].sort((a,b) => b.registeredAt - a.registeredAt);
    return list;
  }, [visitors, search, filter, sort]);

  const PURPLE = "#A855F7";
  const GOLD   = "#F5D67A";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#050010", display: "flex", flexDirection: "column", overflowY: "auto" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.65)} }
        @keyframes rise    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeRow { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        .sw-row:hover { background: rgba(168,85,247,0.05) !important; }
        .sw-pill:hover { opacity:.85; }
        .sw-sort:hover { color: #C084FC !important; }
      `}</style>

      {/* ── BG GLOW ── */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 10%, rgba(100,0,200,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(168,85,247,0.06) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── TOP NAV ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", gap: "1rem", padding: "0 2rem", height: "56px", background: "rgba(5,0,16,0.9)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(168,85,247,0.1)", flexShrink: 0 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "8px", color: "rgba(192,132,252,0.75)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", padding: "0.35rem 0.85rem", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.18)"; e.currentTarget.style.color = "#C084FC"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.08)"; e.currentTarget.style.color = "rgba(192,132,252,0.75)"; }}>
          ← BACK
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: PURPLE, animation: "pulse 2.5s ease-in-out infinite", boxShadow: `0 0 8px ${PURPLE}` }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.78rem", fontWeight: 900, letterSpacing: "4px", background: `linear-gradient(135deg, ${GOLD} 0%, #E8B830 50%, ${GOLD} 100%)`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite" }}>
            SHADOWWEAVE
          </span>
          <span style={{ fontSize: "0.58rem", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "3px", color: "rgba(200,195,240,0.3)", textTransform: "uppercase" }}>/ Admin</span>
        </div>

        {stats && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6EE7B7", boxShadow: "0 0 6px #6EE7B7", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "0.6rem", fontFamily: "'Montserrat', sans-serif", color: "rgba(200,195,240,0.35)", letterSpacing: "1.5px" }}>LIVE</span>
          </div>
        )}
      </div>

      {/* ── LOGIN ── */}
      {!visitors && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
          <div style={{ width: "100%", maxWidth: "360px", animation: "rise 0.5s cubic-bezier(0.23,1,0.32,1) both" }}>
            {/* Card */}
            <div style={{ background: "rgba(8,2,22,0.95)", backdropFilter: "blur(32px)", borderRadius: "20px", border: "1px solid rgba(168,85,247,0.22)", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(168,85,247,0.05)", padding: "2.5rem 2rem", position: "relative", overflow: "hidden" }}>
              {/* Top shimmer line */}
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.8) 40%, rgba(245,214,122,0.4) 60%, transparent)" }} />
              {/* Bottom glow */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ width: "52px", height: "52px", margin: "0 auto 1rem", borderRadius: "14px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>🛡</div>
                <h2 style={{ margin: "0 0 0.4rem", fontFamily: "'Cinzel', serif", fontSize: "1.3rem", fontWeight: 900, letterSpacing: "3px", color: "#EEE8FF" }}>Admin Access</h2>
                <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(200,195,240,0.35)", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.5px" }}>Restricted — authorised personnel only</p>
              </div>

              {error && (
                <div style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "rgba(80,0,0,0.5)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontSize: "0.7rem", color: "#F87171", fontFamily: "'Raleway', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.5rem", letterSpacing: "2.5px", textTransform: "uppercase", color: keyFocused ? "rgba(192,132,252,0.75)" : "rgba(200,195,240,0.25)", marginBottom: "0.5rem", transition: "color 0.25s", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
                    Admin Key
                  </label>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={e => setAdminKey(e.target.value)}
                    onFocus={() => setKeyFocused(true)}
                    onBlur={() => setKeyFocused(false)}
                    placeholder="Enter admin key"
                    autoFocus
                    style={{ width: "100%", background: keyFocused ? "rgba(168,85,247,0.07)" : "rgba(0,0,0,0.4)", border: `1px solid ${keyFocused ? "rgba(168,85,247,0.5)" : "rgba(168,85,247,0.14)"}`, borderRadius: "12px", padding: "0.9rem 1rem", color: "#EEE", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", transition: "all 0.25s", boxSizing: "border-box", boxShadow: keyFocused ? "0 0 0 3px rgba(168,85,247,0.1)" : "none", caretColor: PURPLE }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !adminKey.trim()}
                  style={{ padding: "0.95rem", background: loading || !adminKey.trim() ? "rgba(80,40,120,0.25)" : "linear-gradient(135deg, #5B21B6 0%, #8B5CF6 50%, #5B21B6 100%)", backgroundSize: "200% auto", border: `1px solid ${adminKey.trim() && !loading ? "rgba(168,85,247,0.55)" : "rgba(168,85,247,0.15)"}`, borderRadius: "12px", color: adminKey.trim() && !loading ? "#F5F0FF" : "rgba(200,195,240,0.3)", fontFamily: "'Cinzel', serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "3px", cursor: loading || !adminKey.trim() ? "not-allowed" : "pointer", textTransform: "uppercase", transition: "all 0.3s", animation: adminKey.trim() && !loading ? "shimmer 3s linear infinite" : "none" }}
                >
                  {loading ? "Verifying…" : "Access Dashboard"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {visitors && stats && (
        <div style={{ position: "relative", zIndex: 1, flex: 1, padding: "2rem", maxWidth: "1000px", width: "100%", margin: "0 auto", boxSizing: "border-box", animation: "rise 0.45s cubic-bezier(0.23,1,0.32,1) both" }}>

          {/* ── STAT CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.85rem", marginBottom: "2rem" }}>
            {[
              { label: "Total Visitors",   value: stats.total.toString(),       icon: "👥", accent: GOLD,      sub: "all time" },
              { label: "Active This Week", value: stats.recentV.toString(),     icon: "⚡", accent: "#6EE7B7", sub: "last 7 days" },
              { label: "Returning Users",  value: stats.returning.toString(),   icon: "🔁", accent: "#A78BFA", sub: `${stats.total ? Math.round(stats.returning/stats.total*100) : 0}% of total` },
              { label: "Avg Visits / User",value: stats.avg,                   icon: "📊", accent: "#F472B6", sub: `${stats.totalVisit} total visits` },
            ].map((s, i) => (
              <div key={s.label} style={{ background: "rgba(8,2,22,0.85)", border: `1px solid rgba(168,85,247,0.14)`, borderRadius: "16px", padding: "1.25rem 1.4rem", position: "relative", overflow: "hidden", animation: `rise 0.4s ${i * 0.07}s both` }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${s.accent}55, transparent)` }} />
                <div style={{ fontSize: "1.2rem", marginBottom: "0.6rem" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.9rem", fontWeight: 900, color: s.accent, lineHeight: 1, marginBottom: "0.3rem" }}>{s.value}</div>
                <div style={{ fontSize: "0.58rem", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(200,195,240,0.5)", marginBottom: "0.2rem" }}>{s.label}</div>
                <div style={{ fontSize: "0.6rem", fontFamily: "'Raleway', sans-serif", color: "rgba(200,195,240,0.25)" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ── SEARCH + FILTERS + SORT ── */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
              <span style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "rgba(200,195,240,0.3)", pointerEvents: "none" }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by email…"
                style={{ width: "100%", background: "rgba(8,2,22,0.8)", border: "1px solid rgba(168,85,247,0.16)", borderRadius: "10px", padding: "0.7rem 1rem 0.7rem 2.4rem", color: "#EEE", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", outline: "none", boxSizing: "border-box", caretColor: PURPLE, transition: "border-color 0.25s" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.42)"; }}
                onBlur={e  => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.16)"; }}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {(["all", "recent", "returning", "new"] as const).map(f => (
                <button key={f} className="sw-pill" onClick={() => setFilter(f)} style={{ padding: "0.45rem 0.85rem", borderRadius: "20px", border: `1px solid ${filter === f ? "rgba(168,85,247,0.5)" : "rgba(168,85,247,0.14)"}`, background: filter === f ? "rgba(168,85,247,0.15)" : "transparent", color: filter === f ? "#C084FC" : "rgba(200,195,240,0.4)", fontSize: "0.65rem", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.55rem", fontFamily: "'Montserrat', sans-serif", color: "rgba(200,195,240,0.25)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Sort</span>
              {(["lastSeen", "visits", "registered"] as const).map(s => (
                <button key={s} className="sw-sort" onClick={() => setSort(s)} style={{ padding: "0.4rem 0.7rem", borderRadius: "8px", border: "none", background: sort === s ? "rgba(168,85,247,0.14)" : "transparent", color: sort === s ? "#C084FC" : "rgba(200,195,240,0.3)", fontSize: "0.6rem", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", transition: "color 0.2s" }}>
                  {s === "lastSeen" ? "Recent" : s === "visits" ? "Visits" : "Joined"}
                </button>
              ))}
            </div>
          </div>

          {/* ── RESULT COUNT ── */}
          <div style={{ marginBottom: "0.65rem", fontSize: "0.58rem", fontFamily: "'Montserrat', sans-serif", color: "rgba(200,195,240,0.25)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {filtered.length} {filtered.length === 1 ? "result" : "results"}{search || filter !== "all" ? " · filtered" : ""}
          </div>

          {/* ── TABLE ── */}
          <div style={{ background: "rgba(8,2,22,0.85)", border: "1px solid rgba(168,85,247,0.13)", borderRadius: "16px", overflow: "hidden", backdropFilter: "blur(16px)" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 90px 90px", padding: "0.7rem 1.5rem", borderBottom: "1px solid rgba(168,85,247,0.1)", background: "rgba(168,85,247,0.04)" }}>
              {["Email", "Joined", "Last Active", "Visits", "Status"].map(h => (
                <div key={h} style={{ fontSize: "0.5rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(192,132,252,0.45)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>🔍</div>
                <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", color: "rgba(200,195,240,0.25)" }}>
                  {search ? "No visitors match your search." : "No visitors found."}
                </div>
              </div>
            ) : (
              filtered.map((v, i) => {
                const tier = activityTier(v);
                const recent = isRecent(v.lastSeen);
                return (
                  <div
                    key={v.email}
                    className="sw-row"
                    style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 90px 90px", padding: "0.85rem 1.5rem", borderBottom: i < filtered.length - 1 ? "1px solid rgba(168,85,247,0.06)" : "none", alignItems: "center", transition: "background 0.2s", animation: `fadeRow 0.3s ${Math.min(i * 0.03, 0.35)}s both` }}
                  >
                    {/* Email */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.2))`, border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", color: PURPLE, flexShrink: 0, fontWeight: 700 }}>
                        {v.email[0].toUpperCase()}
                      </div>
                      <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.78rem", color: "#D4C8FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.email}</span>
                    </div>

                    {/* Joined */}
                    <div>
                      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", color: "rgba(200,195,240,0.5)" }}>{fmtDate(v.registeredAt)}</div>
                    </div>

                    {/* Last active */}
                    <div>
                      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", color: recent ? "rgba(110,231,183,0.75)" : "rgba(200,195,240,0.4)" }}>{timeAgo(v.lastSeen)}</div>
                      <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.6rem", color: "rgba(200,195,240,0.22)", marginTop: "1px" }}>{fmtTime(v.lastSeen)}</div>
                    </div>

                    {/* Visit count */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "1.05rem", fontWeight: 900, color: v.visitCount > 3 ? PURPLE : "rgba(200,195,240,0.5)" }}>{v.visitCount}</span>
                      {v.visitCount > 1 && (
                        <div style={{ display: "flex", gap: "2px" }}>
                          {Array.from({ length: Math.min(v.visitCount, 5) }).map((_, j) => (
                            <div key={j} style={{ width: "3px", height: `${6 + j * 2}px`, borderRadius: "2px", background: j < Math.min(v.visitCount, 5) ? PURPLE : "rgba(168,85,247,0.15)", opacity: 0.6 + j * 0.08 }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <div>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "0.22rem 0.65rem", borderRadius: "20px", background: tier.bg, border: `1px solid ${tier.color}30`, fontSize: "0.55rem", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: tier.color, whiteSpace: "nowrap" }}>
                        {tier.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── FOOTER ── */}
          <div style={{ textAlign: "center", marginTop: "2rem", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.2))" }} />
              <span style={{ fontSize: "0.52rem", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(200,195,240,0.18)" }}>Shadowweave · Admin Dashboard</span>
              <div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, rgba(168,85,247,0.2), transparent)" }} />
            </div>
            <div style={{ fontSize: "0.55rem", fontFamily: "'Raleway', sans-serif", color: "rgba(200,195,240,0.12)" }}>Data stored locally on server · Not transmitted externally</div>
          </div>
        </div>
      )}
    </div>
  );
}
