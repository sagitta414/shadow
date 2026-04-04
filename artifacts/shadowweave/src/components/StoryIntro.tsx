import { useEffect, useState } from "react";

interface Props {
  title: string;
  heroineName: string;
  heroineColor: string;
  villain: string;
  setting: string;
  universe?: string;
  onComplete: () => void;
}

export default function StoryIntro({ title, heroineName, heroineColor, villain, setting, universe, onComplete }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [0, 400, 900, 1700, 2500, 3200];
    const timers = timings.map((t, i) => setTimeout(() => setPhase(i), t));
    const done = setTimeout(onComplete, 3800);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);

  const visible = (minPhase: number) => phase >= minPhase;
  const gone    = phase >= 5;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: gone ? 0 : 1,
      transition: gone ? "opacity 0.6s ease" : "none",
      pointerEvents: "all",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes si-glow   { 0%,100%{text-shadow:0 0 30px ${heroineColor}88, 0 0 60px ${heroineColor}44;} 50%{text-shadow:0 0 60px ${heroineColor}cc, 0 0 120px ${heroineColor}66;} }
        @keyframes si-shimmer{ 0%{background-position:0% center;}100%{background-position:200% center;} }
        @keyframes si-fadeup { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
        @keyframes si-fadein { from{opacity:0;}to{opacity:1;} }
        @keyframes si-scanline{ 0%{transform:translateY(-100%);}100%{transform:translateY(100vh);} }
        @keyframes si-pulse  { 0%,100%{opacity:0.6;}50%{opacity:1;} }
        @keyframes si-expand { from{width:0;}to{width:80px;} }
      `}</style>

      {/* Ambient background glow */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 60% 40% at 50% 50%, ${heroineColor}11 0%, transparent 70%)`, transition:"opacity 1s", opacity: visible(2) ? 1 : 0 }} />

      {/* Scanline effect */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg, transparent, ${heroineColor}44, transparent)`, animation: visible(1) ? "si-scanline 2.5s linear infinite" : "none" }} />

      {/* Corner ornaments */}
      {visible(1) && (
        <>
          <div style={{ position:"absolute", top:"10%", left:"6%", width:"60px", height:"60px", borderTop:`1px solid rgba(200,168,75,0.3)`, borderLeft:`1px solid rgba(200,168,75,0.3)`, animation:"si-fadein 0.5s ease both" }} />
          <div style={{ position:"absolute", top:"10%", right:"6%", width:"60px", height:"60px", borderTop:`1px solid rgba(200,168,75,0.3)`, borderRight:`1px solid rgba(200,168,75,0.3)`, animation:"si-fadein 0.5s ease both" }} />
          <div style={{ position:"absolute", bottom:"10%", left:"6%", width:"60px", height:"60px", borderBottom:`1px solid rgba(200,168,75,0.3)`, borderLeft:`1px solid rgba(200,168,75,0.3)`, animation:"si-fadein 0.5s ease both" }} />
          <div style={{ position:"absolute", bottom:"10%", right:"6%", width:"60px", height:"60px", borderBottom:`1px solid rgba(200,168,75,0.3)`, borderRight:`1px solid rgba(200,168,75,0.3)`, animation:"si-fadein 0.5s ease both" }} />
        </>
      )}

      {/* Universe tag */}
      {universe && visible(1) && (
        <div style={{ position:"absolute", top:"12%", fontSize:"0.5rem", letterSpacing:"8px", color:"rgba(200,168,75,0.35)", fontFamily:"'Cinzel',serif", textTransform:"uppercase", animation:"si-fadein 0.6s ease both" }}>
          {universe}
        </div>
      )}

      {/* Center content */}
      <div style={{ textAlign:"center", padding:"0 2rem", maxWidth:"700px" }}>

        {/* Heroine vs Villain */}
        {visible(2) && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"1.2rem", marginBottom:"1.8rem", animation:"si-fadeup 0.55s ease both" }}>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(0.85rem,2.5vw,1.1rem)", fontWeight:900, color: heroineColor, animation:"si-glow 2.5s ease-in-out infinite" }}>
              {heroineName}
            </span>
            <span style={{ fontSize:"0.7rem", color:"rgba(200,168,75,0.4)" }}>✕</span>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(0.75rem,2vw,0.95rem)", color:"rgba(210,200,240,0.65)", fontWeight:700 }}>
              {villain}
            </span>
          </div>
        )}

        {/* Main title */}
        {visible(1) && (
          <h1 style={{
            margin:"0 0 1.6rem",
            fontFamily:"'Cinzel',serif",
            fontSize:"clamp(1.4rem,5vw,2.8rem)",
            fontWeight:900,
            letterSpacing:"0.06em",
            lineHeight:1.15,
            background:"linear-gradient(135deg, #E8D08A 0%, #C8A830 30%, #FFFFFF 50%, #C8A830 70%, #E8D08A 100%)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text",
            WebkitTextFillColor:"transparent",
            backgroundClip:"text",
            animation:"si-shimmer 3s linear infinite, si-fadeup 0.6s ease both",
          }}>
            {title}
          </h1>
        )}

        {/* Divider */}
        {visible(2) && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.8rem", marginBottom:"1.4rem", animation:"si-fadein 0.5s ease both" }}>
            <div style={{ height:"1px", background:`linear-gradient(90deg, transparent, rgba(200,168,75,0.4))`, animation:"si-expand 0.6s ease both", flexShrink:0 }} />
            <span style={{ fontSize:"0.55rem", color:"rgba(200,168,75,0.5)" }}>◆</span>
            <div style={{ height:"1px", background:`linear-gradient(90deg, rgba(200,168,75,0.4), transparent)`, animation:"si-expand 0.6s ease both", flexShrink:0 }} />
          </div>
        )}

        {/* Setting */}
        {visible(3) && (
          <div style={{ fontFamily:"'Raleway',sans-serif", fontSize:"clamp(0.65rem,1.8vw,0.85rem)", color:"rgba(200,195,220,0.45)", fontStyle:"italic", letterSpacing:"1px", marginBottom:"2rem", animation:"si-fadeup 0.5s ease both" }}>
            📍 {setting}
          </div>
        )}

        {/* "The story begins" */}
        {visible(4) && (
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"6px", color:"rgba(200,168,75,0.5)", textTransform:"uppercase", animation:"si-pulse 1.2s ease-in-out infinite, si-fadein 0.5s ease both" }}>
            The story begins
          </div>
        )}
      </div>

      {/* Skip button */}
      <button
        onClick={onComplete}
        style={{ position:"absolute", bottom:"8%", right:"6%", background:"none", border:"1px solid rgba(200,168,75,0.15)", borderRadius:"20px", padding:"0.3rem 1rem", color:"rgba(200,168,75,0.25)", fontFamily:"'Cinzel',serif", fontSize:"0.45rem", letterSpacing:"3px", cursor:"pointer", textTransform:"uppercase", transition:"all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.color="rgba(200,168,75,0.6)"; e.currentTarget.style.borderColor="rgba(200,168,75,0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.color="rgba(200,168,75,0.25)"; e.currentTarget.style.borderColor="rgba(200,168,75,0.15)"; }}
      >
        Skip ▶
      </button>
    </div>
  );
}
