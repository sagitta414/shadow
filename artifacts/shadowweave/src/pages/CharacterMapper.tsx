import { useState, useRef, useCallback, useEffect } from "react";

interface CharacterMapperProps {
  onBack: () => void;
}

type NodeType = "victim" | "captor" | "family" | "police" | "other";

interface MapNode {
  id: string;
  x: number;
  y: number;
  name: string;
  type: NodeType;
  notes?: string;
}

interface MapEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  color: string;
}

const NODE_COLORS: Record<NodeType, { fill: string; stroke: string; text: string; label: string }> = {
  victim:  { fill: "rgba(139,0,0,0.35)",   stroke: "#8B0000", text: "#FF8888", label: "Victim" },
  captor:  { fill: "rgba(30,15,60,0.5)",   stroke: "#4a2080", text: "#C8A8FF", label: "Captor" },
  family:  { fill: "rgba(0,60,100,0.4)",   stroke: "#1a6090", text: "#80C0FF", label: "Family" },
  police:  { fill: "rgba(20,50,20,0.4)",   stroke: "#2a7a2a", text: "#80CC80", label: "Police" },
  other:   { fill: "rgba(80,60,0,0.4)",    stroke: "#B8860B", text: "#D4AF37", label: "Other" },
};

const EDGE_COLORS = [
  { label: "Hates",           color: "#cc2222" },
  { label: "Loves",           color: "#cc44aa" },
  { label: "Fears",           color: "#884400" },
  { label: "Trusts",          color: "#228822" },
  { label: "Blackmails",      color: "#aa00aa" },
  { label: "Owes Money",      color: "#aaaa00" },
  { label: "Protects",        color: "#2266cc" },
  { label: "Manipulates",     color: "#884488" },
  { label: "Secretly Loves",  color: "#ff6699" },
  { label: "Suspects",        color: "#886644" },
];

const NODE_R = 40;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CharacterMapper({ onBack }: CharacterMapperProps) {
  const [nodes, setNodes] = useState<MapNode[]>([
    { id: "n1", x: 260, y: 220, name: "The Victim", type: "victim" },
    { id: "n2", x: 560, y: 220, name: "The Captor", type: "captor" },
  ]);
  const [edges, setEdges] = useState<MapEdge[]>([
    { id: "e1", from: "n1", to: "n2", label: "Hates", color: "#cc2222" },
  ]);

  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [addModal, setAddModal] = useState(false);
  const [edgeModal, setEdgeModal] = useState<{ fromId: string; toId: string } | null>(null);
  const [editEdge, setEditEdge] = useState<MapEdge | null>(null);
  const [newChar, setNewChar] = useState({ name: "", type: "other" as NodeType, notes: "" });
  const [edgeLabel, setEdgeLabel] = useState("Hates");
  const [edgeColor, setEdgeColor] = useState("#cc2222");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getNodeCenter = (id: string) => {
    const n = nodes.find((n) => n.id === id);
    return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
  };

  const getSVGPoint = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleSVGMouseMove = (e: React.MouseEvent) => {
    const pt = getSVGPoint(e);
    setMousePos(pt);
    if (dragging) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragging.id
            ? { ...n, x: pt.x - dragging.ox, y: pt.y - dragging.oy }
            : n
        )
      );
    }
  };

  const handleSVGMouseUp = () => {
    setDragging(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (edgeStart) {
      if (edgeStart !== id) {
        setEdgeModal({ fromId: edgeStart, toId: id });
        setEdgeLabel("Hates");
        setEdgeColor("#cc2222");
      }
      setEdgeStart(null);
      return;
    }
    const pt = getSVGPoint(e);
    const node = nodes.find((n) => n.id === id)!;
    setDragging({ id, ox: pt.x - node.x, oy: pt.y - node.y });
    setSelectedNode(id);
  };

  const handleEdgeClick = (edge: MapEdge) => {
    setEditEdge(edge);
    setEdgeLabel(edge.label);
    setEdgeColor(edge.color);
  };

  const handleSVGClick = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === "svg") {
      setSelectedNode(null);
      setEdgeStart(null);
    }
  };

  function addCharacter() {
    if (!newChar.name.trim()) return;
    const rect = svgRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 400;
    const cy = rect ? rect.height / 2 : 300;
    const spread = 120;
    setNodes((prev) => [...prev, {
      id: uid(),
      x: cx + (Math.random() - 0.5) * spread,
      y: cy + (Math.random() - 0.5) * spread,
      name: newChar.name,
      type: newChar.type,
      notes: newChar.notes,
    }]);
    setNewChar({ name: "", type: "other", notes: "" });
    setAddModal(false);
  }

  function confirmEdge() {
    if (!edgeModal) return;
    setEdges((prev) => [...prev, {
      id: uid(),
      from: edgeModal.fromId,
      to: edgeModal.toId,
      label: edgeLabel,
      color: edgeColor,
    }]);
    setEdgeModal(null);
  }

  function saveEditEdge() {
    if (!editEdge) return;
    setEdges((prev) => prev.map((e) => e.id === editEdge.id ? { ...e, label: edgeLabel, color: edgeColor } : e));
    setEditEdge(null);
  }

  function deleteNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setSelectedNode(null);
  }

  function deleteEdge(id: string) {
    setEdges((prev) => prev.filter((e) => e.id !== id));
    setEditEdge(null);
  }

  function exportMap() {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shadowweave_map_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  const modalStyle: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 300,
    background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
  };
  const modalCard: React.CSSProperties = {
    background: "rgba(4,0,10,0.97)", border: "1px solid rgba(184,134,11,0.3)",
    borderRadius: "18px", padding: "2rem", width: "100%", maxWidth: "440px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", padding: "0.7rem 1rem", color: "#F0F0FF",
    fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge" style={{ background: "rgba(45,27,105,0.2)", borderColor: "rgba(45,27,105,0.4)", color: "#9060E0", marginBottom: "0.5rem" }}>
            04 — Relationship Mapper
          </span>
          <h1 className="font-cinzel" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: "#D4AF37", fontWeight: 700, marginTop: "0.5rem" }}>
            Character Relationship Map
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setAddModal(true)}
            style={{ background: "rgba(139,0,0,0.2)", border: "1px solid rgba(139,0,0,0.45)", borderRadius: "8px", padding: "0.55rem 1.1rem", color: "#FF8888", fontFamily: "'Cinzel', serif", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,0,0,0.4)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,0,0,0.2)")}
          >+ Add Character</button>
          {edgeStart ? (
            <button onClick={() => setEdgeStart(null)} style={{ background: "rgba(184,134,11,0.25)", border: "1px solid rgba(184,134,11,0.5)", borderRadius: "8px", padding: "0.55rem 1.1rem", color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "1px", animation: "progressGlow 1s ease-in-out infinite" }}>
              Click a target… (Cancel)
            </button>
          ) : (
            <button
              onClick={exportMap}
              style={{ background: "rgba(45,27,105,0.2)", border: "1px solid rgba(45,27,105,0.4)", borderRadius: "8px", padding: "0.55rem 1.1rem", color: "#9060E0", fontFamily: "'Cinzel', serif", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(45,27,105,0.4)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(45,27,105,0.2)")}
            >Export Map</button>
          )}
          <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.55rem 1rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.4)")}
          >← Back</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Types:</span>
        {(Object.entries(NODE_COLORS) as [NodeType, typeof NODE_COLORS[NodeType]][]).map(([type, c]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: c.stroke, opacity: 0.9 }} />
            <span style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.45)", fontFamily: "'Montserrat', sans-serif" }}>{c.label}</span>
          </div>
        ))}
        <span style={{ marginLeft: "1rem", fontSize: "0.65rem", color: "rgba(200,200,220,0.25)", fontFamily: "'Montserrat', sans-serif" }}>
          Drag nodes to move · Click node then "Draw Connection" to link · Click edge to edit
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        style={{ flex: 1, minHeight: "520px", position: "relative", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", overflow: "hidden" }}
      >
        <svg
          ref={svgRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: edgeStart ? "crosshair" : "default" }}
          onMouseMove={handleSVGMouseMove}
          onMouseUp={handleSVGMouseUp}
          onClick={handleSVGClick}
        >
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(200,200,220,0.35)" />
            </marker>
            {EDGE_COLORS.map((ec) => (
              <marker key={ec.color} id={`arrow-${ec.color.replace("#","")}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={ec.color} opacity="0.8" />
              </marker>
            ))}
          </defs>

          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Edges */}
          {edges.map((edge) => {
            const from = getNodeCenter(edge.from);
            const to = getNodeCenter(edge.to);
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / len;
            const uy = dy / len;
            const sx = from.x + ux * (NODE_R + 2);
            const sy = from.y + uy * (NODE_R + 2);
            const ex = to.x - ux * (NODE_R + 12);
            const ey = to.y - uy * (NODE_R + 12);
            const mid = { x: mx - uy * 30, y: my + ux * 30 };
            const markerId = `arrow-${edge.color.replace("#","")}`;
            return (
              <g key={edge.id} style={{ cursor: "pointer" }} onClick={() => handleEdgeClick(edge)}>
                <path
                  d={`M ${sx} ${sy} Q ${mid.x} ${mid.y} ${ex} ${ey}`}
                  fill="none"
                  stroke={edge.color}
                  strokeWidth="2"
                  strokeOpacity="0.7"
                  markerEnd={`url(#${markerId})`}
                />
                <path
                  d={`M ${sx} ${sy} Q ${mid.x} ${mid.y} ${ex} ${ey}`}
                  fill="none"
                  stroke={edge.color}
                  strokeWidth="14"
                  strokeOpacity="0"
                />
                <text
                  x={mid.x}
                  y={mid.y - 8}
                  textAnchor="middle"
                  fill={edge.color}
                  fontSize="11"
                  fontFamily="'Montserrat', sans-serif"
                  opacity="0.9"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Live edge while drawing */}
          {edgeStart && (() => {
            const from = getNodeCenter(edgeStart);
            return (
              <line
                x1={from.x} y1={from.y}
                x2={mousePos.x} y2={mousePos.y}
                stroke="rgba(184,134,11,0.5)"
                strokeWidth="1.5"
                strokeDasharray="6,4"
                style={{ pointerEvents: "none" }}
              />
            );
          })()}

          {/* Nodes */}
          {nodes.map((node) => {
            const c = NODE_COLORS[node.type];
            const isSelected = selectedNode === node.id;
            const isEdgeStart = edgeStart === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: dragging?.id === node.id ? "grabbing" : "grab" }}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              >
                {/* Glow ring when selected/edge start */}
                {(isSelected || isEdgeStart) && (
                  <circle r={NODE_R + 8} fill="none" stroke={isEdgeStart ? "#B8860B" : c.stroke} strokeWidth="2" opacity="0.5" strokeDasharray={isEdgeStart ? "6,4" : "none"} />
                )}
                {/* Node body */}
                <circle
                  r={NODE_R}
                  fill={c.fill}
                  stroke={c.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ filter: isSelected ? `drop-shadow(0 0 12px ${c.stroke})` : `drop-shadow(0 4px 8px rgba(0,0,0,0.5))` }}
                />
                {/* Name */}
                <text
                  textAnchor="middle"
                  dy="-4"
                  fill={c.text}
                  fontSize={node.name.length > 12 ? "9" : "11"}
                  fontFamily="'Cinzel', serif"
                  fontWeight="700"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {node.name.length > 14 ? node.name.slice(0, 13) + "…" : node.name}
                </text>
                {/* Type label */}
                <text
                  textAnchor="middle"
                  dy="12"
                  fill={c.stroke}
                  fontSize="8"
                  fontFamily="'Montserrat', sans-serif"
                  opacity="0.7"
                  style={{ pointerEvents: "none", userSelect: "none", textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  {node.type}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Node action panel (shows when node selected) */}
        {selectedNodeData && (
          <div
            style={{
              position: "absolute", top: "1rem", right: "1rem",
              background: "rgba(4,0,10,0.95)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px",
              padding: "1.25rem", minWidth: "180px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#B8860B", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              {selectedNodeData.name}
            </div>
            <div style={{ fontSize: "0.75rem", color: NODE_COLORS[selectedNodeData.type].text, fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem" }}>
              {NODE_COLORS[selectedNodeData.type].label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <button
                onClick={() => setEdgeStart(selectedNodeData.id)}
                style={{ background: "rgba(184,134,11,0.12)", border: "1px solid rgba(184,134,11,0.3)", borderRadius: "7px", padding: "0.45rem 0.75rem", color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,134,11,0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(184,134,11,0.12)")}
              >Draw Connection</button>
              <button
                onClick={() => deleteNode(selectedNodeData.id)}
                style={{ background: "rgba(139,0,0,0.12)", border: "1px solid rgba(139,0,0,0.3)", borderRadius: "7px", padding: "0.45rem 0.75rem", color: "#FF6666", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", textAlign: "left" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,0,0,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,0,0,0.12)")}
              >Delete Node</button>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {nodes.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", pointerEvents: "none" }}>
            <div style={{ fontSize: "3rem", opacity: 0.2 }}>◎</div>
            <p style={{ color: "rgba(200,200,220,0.25)", fontFamily: "'Cinzel', serif", fontSize: "0.9rem", letterSpacing: "2px" }}>Add characters to begin mapping</p>
          </div>
        )}
      </div>

      {/* Add Character Modal */}
      {addModal && (
        <div style={modalStyle} onClick={(e) => { if (e.target === e.currentTarget) setAddModal(false); }}>
          <div style={modalCard}>
            <h2 className="font-cinzel" style={{ color: "#D4AF37", fontSize: "1.1rem", marginBottom: "1.5rem", letterSpacing: "2px" }}>Add Character</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Name</label>
                <input value={newChar.name} onChange={(e) => setNewChar((p) => ({ ...p, name: e.target.value }))} placeholder="Character name" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Role</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  {(Object.entries(NODE_COLORS) as [NodeType, typeof NODE_COLORS[NodeType]][]).map(([type, c]) => (
                    <button
                      key={type}
                      onClick={() => setNewChar((p) => ({ ...p, type }))}
                      style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: `1px solid ${newChar.type === type ? c.stroke : "rgba(255,255,255,0.07)"}`, background: newChar.type === type ? c.fill : "transparent", color: newChar.type === type ? c.text : "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: "0.7rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1px" }}>Cancel</button>
                <button onClick={addCharacter} style={{ flex: 2, padding: "0.7rem", background: "rgba(139,0,0,0.25)", border: "1px solid rgba(139,0,0,0.5)", borderRadius: "8px", color: "#FF8888", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1px" }}>Add to Map</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {edgeModal && (
        <div style={modalStyle} onClick={(e) => { if (e.target === e.currentTarget) setEdgeModal(null); }}>
          <div style={modalCard}>
            <h2 className="font-cinzel" style={{ color: "#D4AF37", fontSize: "1.1rem", marginBottom: "0.5rem", letterSpacing: "2px" }}>Define Relationship</h2>
            <p style={{ fontSize: "0.8rem", color: "rgba(200,200,220,0.4)", marginBottom: "1.5rem", fontFamily: "'Montserrat', sans-serif" }}>
              {nodes.find(n=>n.id===edgeModal.fromId)?.name} → {nodes.find(n=>n.id===edgeModal.toId)?.name}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "1.25rem" }}>
              {EDGE_COLORS.map((ec) => (
                <button
                  key={ec.color}
                  onClick={() => { setEdgeLabel(ec.label); setEdgeColor(ec.color); }}
                  style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: `1px solid ${edgeLabel === ec.label ? ec.color : "rgba(255,255,255,0.07)"}`, background: edgeLabel === ec.label ? `${ec.color}22` : "transparent", color: edgeLabel === ec.label ? ec.color : "rgba(200,200,220,0.5)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s" }}
                >
                  {ec.label}
                </button>
              ))}
            </div>
            <input
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
              placeholder="Custom label…"
              style={{ ...inputStyle, marginBottom: "1rem" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setEdgeModal(null)} style={{ flex: 1, padding: "0.7rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1px" }}>Cancel</button>
              <button onClick={confirmEdge} style={{ flex: 2, padding: "0.7rem", background: `${edgeColor}22`, border: `1px solid ${edgeColor}88`, borderRadius: "8px", color: edgeColor, fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1px" }}>Connect</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Edge Modal */}
      {editEdge && (
        <div style={modalStyle} onClick={(e) => { if (e.target === e.currentTarget) setEditEdge(null); }}>
          <div style={modalCard}>
            <h2 className="font-cinzel" style={{ color: "#D4AF37", fontSize: "1.1rem", marginBottom: "1.5rem", letterSpacing: "2px" }}>Edit Relationship</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "1.25rem" }}>
              {EDGE_COLORS.map((ec) => (
                <button
                  key={ec.color}
                  onClick={() => { setEdgeLabel(ec.label); setEdgeColor(ec.color); }}
                  style={{ padding: "0.5rem 0.6rem", borderRadius: "8px", border: `1px solid ${edgeLabel === ec.label ? ec.color : "rgba(255,255,255,0.07)"}`, background: edgeLabel === ec.label ? `${ec.color}22` : "transparent", color: edgeLabel === ec.label ? ec.color : "rgba(200,200,220,0.5)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.15s" }}
                >
                  {ec.label}
                </button>
              ))}
            </div>
            <input
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
              style={{ ...inputStyle, marginBottom: "1rem" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => deleteEdge(editEdge.id)} style={{ flex: 1, padding: "0.7rem", background: "rgba(139,0,0,0.1)", border: "1px solid rgba(139,0,0,0.3)", borderRadius: "8px", color: "#FF6666", fontFamily: "'Cinzel', serif", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "1px" }}>Delete</button>
              <button onClick={() => setEditEdge(null)} style={{ flex: 1, padding: "0.7rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "1px" }}>Cancel</button>
              <button onClick={saveEditEdge} style={{ flex: 2, padding: "0.7rem", background: `${edgeColor}22`, border: `1px solid ${edgeColor}88`, borderRadius: "8px", color: edgeColor, fontFamily: "'Cinzel', serif", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "1px" }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
