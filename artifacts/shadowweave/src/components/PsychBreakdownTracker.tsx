import { useRef, useEffect } from "react";

export interface BreakdownEvent {
  resistanceDelta: number;
  fearDelta: number;
  defianceDelta: number;
  complianceDelta: number;
  event: string;
  round: number;
}

export interface BreakdownState {
  resistance: number;
  fear: number;
  defiance: number;
  compliance: number;
}

interface Props {
  state: BreakdownState;
  log: BreakdownEvent[];
  heroineName: string;
  heroineColor?: string;
  loading?: boolean;
}

function resistLabel(v: number) {
  if (v >= 85) return "IRON WILL";
  if (v >= 65) return "HOLDING";
  if (v >= 45) return "STRAINING";
  if (v >= 25) return "FALTERING";
  if (v >= 10) return "BREAKING";
  return "BROKEN";
}
function fearLabel(v: number) {
  if (v <= 15)  return "CONTROLLED";
  if (v <= 35)  return "TENSE";
  if (v <= 55)  return "AFRAID";
  if (v <= 75)  return "TERRIFIED";
  if (v <= 90)  return "PANICKING";
  return "SHATTERED";
}
function defianceLabel(v: number) {
  if (v >= 80) return "DEFIANT";
  if (v >= 55) return "PUSHING BACK";
  if (v >= 35) return "FADING";
  if (v >= 15) return "CRUMBLING";
  return "SILENT";
}
function complianceLabel(v: number) {
  if (v <= 10) return "NONE";
  if (v <= 30) return "STIRRING";
  if (v <= 55) return "BENDING";
  if (v <= 75) return "CAPITULATING";
  return "BROKEN IN";
}

function resistColor(v: number) {
  if (v >= 65) return "#6EE7B7";
  if (v >= 40) return "#FCD34D";
  if (v >= 20) return "#F97316";
  return "#EF4444";
}
function fearColor(v: number) {
  if (v <= 20) return "#6EE7B7";
  if (v <= 45) return "#FCD34D";
  if (v <= 70) return "#F97316";
  return "#EF4444";
}
function defianceColor(v: number) {
  if (v >= 60) return "#A78BFA";
  if (v >= 35) return "#C084FC";
  if (v >= 15) return "#9333EA";
  return "#6D28D9";
}
function complianceColor(v: number) {
  if (v <= 15) return "rgba(200,195,215,0.3)";
  if (v <= 40) return "#F472B6";
  if (v <= 65) return "#EC4899";
  return "#BE185D";
}

function MiniBar({ value, max = 100, color, label, sublabel }: { value: number; max?: number; color: string; label: string; sublabel: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.28rem" }}>
        <span style={{ fontSize: "0.44rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2px", color: "rgba(200,195,215,0.3)", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: "0.52rem", fontFamily: "'Cinzel',serif", color, fontWeight: 700, transition: "color 1s ease" }}>{sublabel}</span>
      </div>
      <div style={{ height: "7px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: "4px", background: `linear-gradient(90deg, ${color}55, ${color})`, transition: "width 1.1s cubic-bezier(0.23,1,0.32,1), background 1s ease", boxShadow: `0 0 10px ${color}55`, position: "relative" }}>
          {pct > 5 && <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "3px", background: color, borderRadius: "0 4px 4px 0", boxShadow: `0 0 8px ${color}` }} />}
        </div>
      </div>
      <div style={{ textAlign: "right", marginTop: "0.18rem" }}>
        <span style={{ fontSize: "0.5rem", fontFamily: "'Cinzel',serif", color, fontWeight: 700, transition: "color 1s ease" }}>{value}</span>
      </div>
    </div>
  );
}

function MiniSparkline({ log, color }: { log: BreakdownEvent[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || log.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pts: [number, number][] = [];
    let resistance = 100;
    pts.push([0, resistance]);
    for (const e of log) {
      resistance = Math.max(0, resistance + e.resistanceDelta);
      pts.push([e.round, resistance]);
    }
    const maxRound = pts[pts.length - 1][0] || 1;

    ctx.beginPath();
    pts.forEach(([r, v], i) => {
      const x = (r / maxRound) * (w - 8) + 4;
      const y = h - 4 - ((v / 100) * (h - 8));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, `${color}88`);
    grad.addColorStop(1, color);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const last = pts[pts.length - 1];
    const lx = (last[0] / maxRound) * (w - 8) + 4;
    const ly = h - 4 - ((last[1] / 100) * (h - 8));
    ctx.beginPath();
    ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [log, color]);

  if (log.length < 2) return null;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "2px", color: "rgba(200,195,215,0.2)", textTransform: "uppercase", marginBottom: "0.3rem" }}>RESISTANCE ARC</div>
      <canvas ref={canvasRef} width={200} height={36} style={{ width: "100%", height: "36px", display: "block" }} />
    </div>
  );
}

export default function PsychBreakdownTracker({ state, log, heroineName, heroineColor = "#A855F7", loading }: Props) {
  const last = log[log.length - 1];

  return (
    <div style={{ background: "rgba(4,0,12,0.92)", border: `1px solid ${heroineColor}18`, borderRadius: "14px", padding: "1rem 1.1rem", position: "relative", overflow: "hidden" }}>
      <style>{`@keyframes bkt-pulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }`}</style>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: `linear-gradient(90deg, transparent, ${heroineColor}88, transparent)` }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
        <div>
          <div style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2.5px", color: "rgba(200,195,215,0.25)", textTransform: "uppercase" }}>PSYCHOLOGICAL STATE</div>
          <div style={{ fontSize: "0.7rem", fontFamily: "'Cinzel',serif", color: heroineColor, fontWeight: 700, marginTop: "0.1rem" }}>{heroineName}</div>
        </div>
        {loading && (
          <span style={{ fontSize: "0.4rem", fontFamily: "'Courier New',monospace", color: heroineColor, letterSpacing: "1px", animation: "bkt-pulse 1.2s infinite" }}>EVALUATING…</span>
        )}
        {!loading && log.length > 0 && (
          <span style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", color: "rgba(200,195,215,0.2)", letterSpacing: "1px" }}>ROUND {log[log.length - 1].round}</span>
        )}
      </div>

      {/* Bars */}
      <MiniBar value={state.resistance}  color={resistColor(state.resistance)}   label="RESISTANCE" sublabel={resistLabel(state.resistance)}   />
      <MiniBar value={state.fear}        color={fearColor(state.fear)}            label="FEAR"       sublabel={fearLabel(state.fear)}             />
      <MiniBar value={state.defiance}    color={defianceColor(state.defiance)}    label="DEFIANCE"   sublabel={defianceLabel(state.defiance)}     />
      <MiniBar value={state.compliance}  color={complianceColor(state.compliance)} label="COMPLIANCE" sublabel={complianceLabel(state.compliance)}  />

      {/* Sparkline */}
      <MiniSparkline log={log} color={resistColor(state.resistance)} />

      {/* Last event */}
      {last && (
        <div style={{ padding: "0.5rem 0.65rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px" }}>
          <div style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1.5px", color: "rgba(200,195,215,0.2)", textTransform: "uppercase", marginBottom: "0.25rem" }}>LAST BREACH</div>
          <div style={{ fontSize: "0.65rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,215,0.5)", lineHeight: 1.4 }}>{last.event}</div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
            {last.resistanceDelta !== 0 && <span style={{ fontSize: "0.5rem", fontFamily: "'Montserrat',sans-serif", color: "#EF4444", fontWeight: 700 }}>R {last.resistanceDelta}</span>}
            {last.fearDelta !== 0       && <span style={{ fontSize: "0.5rem", fontFamily: "'Montserrat',sans-serif", color: "#F97316", fontWeight: 700 }}>F +{last.fearDelta}</span>}
            {last.defianceDelta !== 0   && <span style={{ fontSize: "0.5rem", fontFamily: "'Montserrat',sans-serif", color: "#A78BFA", fontWeight: 700 }}>D {last.defianceDelta}</span>}
            {last.complianceDelta !== 0 && <span style={{ fontSize: "0.5rem", fontFamily: "'Montserrat',sans-serif", color: "#F472B6", fontWeight: 700 }}>C +{last.complianceDelta}</span>}
          </div>
        </div>
      )}

      {log.length === 0 && (
        <div style={{ fontSize: "0.6rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,215,0.18)", textAlign: "center", padding: "0.5rem 0" }}>Begin the exchange to track her state</div>
      )}
    </div>
  );
}
