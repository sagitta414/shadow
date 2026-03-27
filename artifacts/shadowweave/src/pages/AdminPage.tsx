import { useState } from "react";

interface Visitor {
  email: string;
  registeredAt: number;
  visitCount: number;
  lastSeen: number;
}

interface AdminPageProps {
  onBack: () => void;
}

function fmt(ts: number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const [adminKey, setAdminKey] = useState("");
  const [keyFocused, setKeyFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visitors, setVisitors] = useState<Visitor[] | null>(null);
  const [search, setSearch] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminKey.trim()) return;
    setLoading(true);
    setError("");
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/admin/visitors`, {
        headers: { "x-admin-key": adminKey.trim() },
      });
      if (!res.ok) {
        setError("Invalid admin key. Access denied.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { count: number; visitors: Visitor[] };
      setVisitors(data.visitors);
    } catch {
      setError("Network error. Check the API server is running.");
    }
    setLoading(false);
  }

  const filtered = visitors
    ? visitors.filter((v) =>
        v.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#020008",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: visitors ? "flex-start" : "center",
        overflowY: "auto",
        padding: visitors ? "5rem 1.5rem 3rem" : "1.5rem",
      }}
    >
      <style>{`
        @keyframes shimmerSlide { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.45; transform:scale(0.6); } }
        @keyframes cardRise { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rowFadeIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* Subtle bg glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(120,0,220,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Top nav strip */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "54px", display: "flex", alignItems: "center", gap: "1rem", padding: "0 2rem", zIndex: 10, background: "rgba(4,1,10,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(168,85,247,0.12)" }}>
        <button
          onClick={onBack}
          style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "8px", color: "rgba(192,132,252,0.8)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px", padding: "0.35rem 0.85rem", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; }}
        >
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A855F7", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "4px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 50%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmerSlide 5s linear infinite" }}>
            SHADOWWEAVE — ADMIN
          </span>
        </div>
        {visitors && (
          <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "rgba(200,195,240,0.35)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px" }}>
            {visitors.length} registered visitor{visitors.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── AUTH PANEL (if not logged in) ── */}
      {!visitors && (
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "380px", animation: "cardRise 0.5s cubic-bezier(0.23,1,0.32,1) both" }}>
          <div style={{ background: "rgba(6,2,18,0.92)", backdropFilter: "blur(30px)", borderRadius: "18px", border: "1px solid rgba(168,85,247,0.25)", boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 60px rgba(168,85,247,0.06)", padding: "2.25rem 2rem" }}>
            <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.7) 40%, transparent)" }} />

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🛡</div>
              <h2 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "1.4rem", fontWeight: 900, letterSpacing: "3px", color: "#E8D5FF" }}>Admin Access</h2>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.7rem", color: "rgba(200,195,240,0.35)", fontFamily: "'Raleway', sans-serif" }}>Enter your admin key to view visitor data</p>
            </div>

            {error && (
              <div style={{ marginBottom: "1rem", padding: "0.7rem 1rem", background: "rgba(90,0,0,0.5)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", fontSize: "0.7rem", color: "#F87171", fontFamily: "'Raleway', sans-serif" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.52rem", letterSpacing: "3px", textTransform: "uppercase", color: keyFocused ? "rgba(192,132,252,0.8)" : "rgba(200,195,240,0.28)", marginBottom: "0.45rem", transition: "color 0.25s", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
                  Admin Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  onFocus={() => setKeyFocused(true)}
                  onBlur={() => setKeyFocused(false)}
                  placeholder="••••••••••••••••"
                  autoFocus
                  style={{
                    width: "100%",
                    background: keyFocused ? "rgba(168,85,247,0.06)" : "rgba(0,0,0,0.45)",
                    border: `1px solid ${keyFocused ? "rgba(168,85,247,0.5)" : "rgba(168,85,247,0.14)"}`,
                    borderRadius: "11px",
                    padding: "0.9rem 1rem",
                    color: "#E8E0FF",
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: "0.95rem",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    boxShadow: keyFocused ? "0 0 0 3px rgba(168,85,247,0.1)" : "none",
                    caretColor: "#A855F7",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "0.95rem",
                  background: loading ? "rgba(80,40,120,0.3)" : "linear-gradient(135deg, #6D28D9 0%, #9333EA 50%, #6D28D9 100%)",
                  backgroundSize: "200% auto",
                  border: "1px solid rgba(168,85,247,0.5)",
                  borderRadius: "12px",
                  color: "#F5F0FF",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  cursor: loading ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.3s",
                  animation: loading ? "none" : "shimmerSlide 3s linear infinite",
                }}
              >
                {loading ? "Verifying…" : "Access Dashboard"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── VISITOR DASHBOARD ── */}
      {visitors && (
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "860px", animation: "cardRise 0.5s cubic-bezier(0.23,1,0.32,1) both" }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
            {[
              { label: "Total Visitors", value: visitors.length.toString() },
              { label: "Returning", value: visitors.filter((v) => v.visitCount > 1).length.toString() },
              { label: "Total Visits", value: visitors.reduce((a, v) => a + v.visitCount, 0).toString() },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(6,2,18,0.85)", border: "1px solid rgba(168,85,247,0.18)", borderRadius: "14px", padding: "1.25rem 1.5rem", textAlign: "center" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "2rem", fontWeight: 900, background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.6rem", color: "rgba(200,195,240,0.35)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginTop: "0.4rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginBottom: "1.25rem" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email…"
              style={{
                width: "100%",
                background: "rgba(6,2,18,0.85)",
                border: "1px solid rgba(168,85,247,0.18)",
                borderRadius: "11px",
                padding: "0.8rem 1.1rem",
                color: "#E8E0FF",
                fontFamily: "'Raleway', sans-serif",
                fontSize: "0.88rem",
                outline: "none",
                boxSizing: "border-box",
                caretColor: "#A855F7",
                transition: "border-color 0.25s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.18)"; }}
            />
          </div>

          {/* Table */}
          <div style={{ background: "rgba(6,2,18,0.85)", border: "1px solid rgba(168,85,247,0.18)", borderRadius: "16px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.4fr 1.4fr 60px", gap: 0, padding: "0.75rem 1.5rem", borderBottom: "1px solid rgba(168,85,247,0.12)", background: "rgba(168,85,247,0.05)" }}>
              {["Email", "First Visit", "Last Seen", "Visits"].map((h) => (
                <div key={h} style={{ fontSize: "0.52rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(192,132,252,0.5)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "rgba(200,195,240,0.25)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem" }}>
                {search ? "No visitors match your search." : "No visitors yet."}
              </div>
            ) : (
              filtered.map((v, i) => (
                <div
                  key={v.email}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.4fr 1.4fr 60px",
                    gap: 0,
                    padding: "0.9rem 1.5rem",
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(168,85,247,0.07)" : "none",
                    transition: "background 0.2s",
                    animation: `rowFadeIn 0.3s ${Math.min(i * 0.04, 0.4)}s both`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(168,85,247,0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", color: "#D4C8FF", wordBreak: "break-all" }}>{v.email}</div>
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", color: "rgba(200,195,240,0.45)" }}>{fmt(v.registeredAt)}</div>
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", color: "rgba(200,195,240,0.45)" }}>{fmt(v.lastSeen)}</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", fontWeight: 700, color: v.visitCount > 1 ? "#A855F7" : "rgba(200,195,240,0.4)", textAlign: "center" }}>{v.visitCount}</div>
                </div>
              ))
            )}
          </div>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.6rem", color: "rgba(200,195,240,0.2)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px" }}>
            SHADOWWEAVE · ADMIN DASHBOARD · DATA STORED LOCALLY ON SERVER
          </p>
        </div>
      )}
    </div>
  );
}
