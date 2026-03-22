import { useState, useMemo, useRef, useEffect } from "react";
import { getArchive } from "../lib/archive";

interface Props { onBack: () => void; }

interface Node {
  id: string;
  label: string;
  type: "heroine" | "villain";
  x: number; y: number;
  count: number;
}
interface Edge {
  from: string; to: string; weight: number;
}

function forceLayout(nodes: Node[], edges: Edge[], w: number, h: number, iterations = 120): Node[] {
  const ns = nodes.map(n => ({ ...n }));
  const idx = new Map(ns.map((n, i) => [n.id, i]));

  for (let iter = 0; iter < iterations; iter++) {
    const fx = new Array(ns.length).fill(0);
    const fy = new Array(ns.length).fill(0);
    const repulsion = 8000;
    const attraction = 0.035;
    const damping = iter < 80 ? 0.92 : 0.85;

    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x;
        const dy = ns[i].y - ns[j].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
        const f = repulsion / (dist * dist);
        fx[i] += (dx / dist) * f;
        fy[i] += (dy / dist) * f;
        fx[j] -= (dx / dist) * f;
        fy[j] -= (dy / dist) * f;
      }
    }

    for (const e of edges) {
      const i = idx.get(e.from);
      const j = idx.get(e.to);
      if (i == null || j == null) continue;
      const dx = ns[j].x - ns[i].x;
      const dy = ns[j].y - ns[i].y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
      const f = attraction * dist * Math.log(e.weight + 1);
      fx[i] += (dx / dist) * f;
      fy[i] += (dy / dist) * f;
      fx[j] -= (dx / dist) * f;
      fy[j] -= (dy / dist) * f;
    }

    const padding = 80;
    for (let i = 0; i < ns.length; i++) {
      ns[i].x = Math.max(padding, Math.min(w - padding, ns[i].x + fx[i] * damping));
      ns[i].y = Math.max(padding, Math.min(h - padding, ns[i].y + fy[i] * damping));
    }
  }
  return ns;
}

export default function RelationshipMap({ onBack }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 540 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "heroine" | "villain">("all");
  const [minStories, setMinStories] = useState(1);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width || 800, h: Math.max(480, Math.min(600, r.width * 0.62)) });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { nodes, edges } = useMemo(() => {
    const archive = getArchive();
    const heroCount = new Map<string, number>();
    const villainCount = new Map<string, number>();
    const edgeCount = new Map<string, number>();

    archive.forEach(story => {
      const heroine = story.characters?.[0];
      if (!heroine) return;
      heroCount.set(heroine, (heroCount.get(heroine) ?? 0) + 1);
      story.characters.slice(1).forEach(villain => {
        if (!villain) return;
        villainCount.set(villain, (villainCount.get(villain) ?? 0) + 1);
        const key = `${heroine}|${villain}`;
        edgeCount.set(key, (edgeCount.get(key) ?? 0) + 1);
      });
    });

    const rawNodes: Node[] = [
      ...Array.from(heroCount.entries()).filter(([, c]) => c >= minStories).map(([id, count]) => ({
        id, label: id, type: "heroine" as const, x: Math.random() * dims.w, y: Math.random() * dims.h, count,
      })),
      ...Array.from(villainCount.entries()).filter(([, c]) => c >= minStories).map(([id, count]) => ({
        id, label: id, type: "villain" as const, x: Math.random() * dims.w, y: Math.random() * dims.h, count,
      })),
    ];

    const heroIds = new Set(rawNodes.filter(n => n.type === "heroine").map(n => n.id));
    const villainIds = new Set(rawNodes.filter(n => n.type === "villain").map(n => n.id));

    const rawEdges: Edge[] = Array.from(edgeCount.entries())
      .filter(([key]) => {
        const [h, v] = key.split("|");
        return heroIds.has(h) && villainIds.has(v);
      })
      .map(([key, weight]) => {
        const [from, to] = key.split("|");
        return { from, to, weight };
      });

    const laid = rawNodes.length > 0 ? forceLayout(rawNodes, rawEdges, dims.w, dims.h) : rawNodes;
    return { nodes: laid, edges: rawEdges };
  }, [dims, minStories]);

  const visibleNodes = nodes.filter(n => filterType === "all" || n.type === filterType);
  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = edges.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));

  const maxWeight = Math.max(1, ...visibleEdges.map(e => e.weight));
  const selNode = selected ? nodes.find(n => n.id === selected) : null;
  const selEdges = selected ? edges.filter(e => e.from === selected || e.to === selected) : [];

  const nodeR = (n: Node) => Math.max(18, Math.min(36, 14 + n.count * 4));

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100vh" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px", cursor: "pointer", padding: "0.5rem 0", marginBottom: "2rem" }}>
        ← BACK
      </button>

      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "7px", color: "rgba(168,85,247,0.5)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Archive Intelligence</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#E9D5FF", margin: "0 0 0.4rem", fontWeight: 700, letterSpacing: "2px" }}>Character Relationship Map</h1>
        <p style={{ color: "rgba(200,195,240,0.35)", fontSize: "0.82rem", fontFamily: "'Raleway', sans-serif" }}>
          {nodes.length} characters · {edges.length} connections across your archive
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {(["all", "heroine", "villain"] as const).map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{ padding: "0.45rem 1.1rem", borderRadius: "20px", cursor: "pointer", fontSize: "0.62rem", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", textTransform: "uppercase", background: filterType === t ? (t === "villain" ? "rgba(239,68,68,0.2)" : t === "heroine" ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.1)") : "rgba(255,255,255,0.04)", border: `1px solid ${filterType === t ? (t === "villain" ? "rgba(239,68,68,0.5)" : t === "heroine" ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.3)") : "rgba(255,255,255,0.1)"}`, color: filterType === t ? (t === "villain" ? "#FCA5A5" : t === "heroine" ? "#C084FC" : "#F0EFF8") : "rgba(200,200,220,0.5)" }}>
            {t === "all" ? "All" : t === "heroine" ? "Heroines" : "Villains"}
          </button>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.6rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", color: "rgba(200,200,220,0.4)" }}>MIN STORIES</span>
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => setMinStories(n)} style={{ padding: "0.4rem 0.75rem", borderRadius: "16px", cursor: "pointer", fontSize: "0.65rem", background: minStories === n ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${minStories === n ? "rgba(168,85,247,0.45)" : "rgba(255,255,255,0.1)"}`, color: minStories === n ? "#C084FC" : "rgba(200,200,220,0.5)" }}>{n}+</button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(168,85,247,0.8)" }} />
          <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif" }}>Heroine</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "rgba(239,68,68,0.8)" }} />
          <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif" }}>Villain</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: "24px", height: "2px", background: "linear-gradient(90deg, rgba(168,85,247,0.5), rgba(239,68,68,0.5))" }} />
          <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif" }}>Shared story</span>
        </div>
      </div>

      {/* SVG Map */}
      <div ref={containerRef} style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "20px", overflow: "hidden", position: "relative" }}>
        {nodes.length === 0 ? (
          <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(200,200,220,0.2)", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "2px", textAlign: "center" }}>
            No archived stories yet<br /><span style={{ fontSize: "0.7rem", opacity: 0.6 }}>Generate and save stories to build the map</span>
          </div>
        ) : (
          <svg width={dims.w} height={dims.h} style={{ display: "block" }}>
            <defs>
              <filter id="glow-h">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-v">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {visibleEdges.map(e => {
              const from = nodes.find(n => n.id === e.from);
              const to = nodes.find(n => n.id === e.to);
              if (!from || !to) return null;
              const isActive = hovered === e.from || hovered === e.to || selected === e.from || selected === e.to;
              const strokeW = 1 + (e.weight / maxWeight) * 3;
              return (
                <line
                  key={`${e.from}|${e.to}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isActive ? "rgba(168,85,247,0.7)" : "rgba(168,85,247,0.12)"}
                  strokeWidth={isActive ? strokeW + 1 : strokeW}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nodes */}
            {visibleNodes.map(n => {
              const isHov = hovered === n.id;
              const isSel = selected === n.id;
              const r = nodeR(n);
              const color = n.type === "heroine" ? "#A855F7" : "#EF4444";
              const glow = n.type === "heroine" ? "rgba(168,85,247,0.35)" : "rgba(239,68,68,0.35)";
              return (
                <g key={n.id} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(selected === n.id ? null : n.id)}
                >
                  {(isHov || isSel) && <circle cx={n.x} cy={n.y} r={r + 8} fill={glow} opacity={0.5} />}
                  <circle cx={n.x} cy={n.y} r={r} fill={`${color}22`} stroke={color} strokeWidth={isSel ? 2.5 : isHov ? 2 : 1.2} />
                  {n.count > 1 && (
                    <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={Math.max(9, Math.min(13, 7 + n.count * 1.5))} fontFamily="'Cinzel', serif" fontWeight="700">{n.count}</text>
                  )}
                  <text
                    x={n.x} y={n.y + r + 13}
                    textAnchor="middle" fill={isHov || isSel ? "#F0EFF8" : "rgba(200,200,220,0.65)"}
                    fontSize={isHov || isSel ? 11 : 9.5}
                    fontFamily="'Raleway', sans-serif"
                    fontWeight={isHov || isSel ? "700" : "400"}
                  >
                    {n.label.length > 16 ? n.label.slice(0, 15) + "…" : n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Selected node details */}
      {selNode && (
        <div style={{ marginTop: "1.25rem", background: "rgba(0,0,0,0.5)", border: `1px solid ${selNode.type === "heroine" ? "rgba(168,85,247,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "16px", padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: selNode.type === "heroine" ? "#C084FC" : "#FCA5A5", fontWeight: 700 }}>{selNode.label}</div>
              <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", letterSpacing: "2px", textTransform: "uppercase" }}>
                {selNode.type} · {selNode.count} {selNode.count === 1 ? "story" : "stories"}
              </div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.3)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
          </div>
          {selEdges.length > 0 && (
            <div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "3px", color: "rgba(200,200,220,0.3)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Connected to</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {selEdges.map(e => {
                  const other = e.from === selNode.id ? e.to : e.from;
                  const otherNode = nodes.find(n => n.id === other);
                  if (!otherNode) return null;
                  const c = otherNode.type === "heroine" ? "rgba(168,85,247,0.2)" : "rgba(239,68,68,0.2)";
                  const bc = otherNode.type === "heroine" ? "rgba(168,85,247,0.4)" : "rgba(239,68,68,0.4)";
                  const tc = otherNode.type === "heroine" ? "#C084FC" : "#FCA5A5";
                  return (
                    <span key={other} onClick={() => setSelected(other)} style={{ fontSize: "0.7rem", padding: "0.25rem 0.75rem", borderRadius: "12px", background: c, border: `1px solid ${bc}`, color: tc, fontFamily: "'Cinzel', serif", cursor: "pointer" }}>
                      {other} <span style={{ opacity: 0.6 }}>×{e.weight}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
