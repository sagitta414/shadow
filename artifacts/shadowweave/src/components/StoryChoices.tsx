interface Choice { label: string; description: string; }

interface Props {
  choices: Choice[];
  loading?: boolean;
  heroineColor: string;
  onChoose: (choice: Choice) => void;
  onSkip: () => void;
}

export default function StoryChoices({ choices, loading, heroineColor, onChoose, onSkip }: Props) {
  return (
    <div style={{ margin:"2rem 0", padding:"1.5rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"14px", borderTop:`2px solid ${heroineColor}44` }}>
      <style>{`@keyframes sc-fadein { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }`}</style>

      <div style={{ display:"flex", alignItems:"center", gap:"0.8rem", marginBottom:"1.2rem" }}>
        <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"5px", color:`${heroineColor}88`, textTransform:"uppercase" }}>
          What happens next?
        </div>
        <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.05)" }} />
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:"1rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"3px", color:"rgba(200,168,75,0.4)" }}>
          Generating choices…
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
          {choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => onChoose(choice)}
              style={{
                padding: "0.85rem 1.2rem",
                background: "rgba(255,255,255,0.02)",
                border: `1px solid rgba(255,255,255,0.07)`,
                borderLeft: `3px solid ${heroineColor}44`,
                borderRadius: "10px",
                color: "rgba(230,225,215,0.8)",
                fontFamily: "'Raleway',sans-serif",
                textAlign: "left",
                cursor: "pointer",
                animation: `sc-fadein 0.4s ease ${i * 0.1}s both`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${heroineColor}0d`;
                e.currentTarget.style.borderColor = `${heroineColor}44`;
                e.currentTarget.style.borderLeftColor = heroineColor;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.borderLeftColor = `${heroineColor}44`;
              }}
            >
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.62rem", fontWeight:700, color: heroineColor, marginBottom:"0.3rem", letterSpacing:"0.5px" }}>
                {choice.label}
              </div>
              <div style={{ fontSize:"0.58rem", color:"rgba(200,195,215,0.55)", lineHeight:1.6, fontStyle:"italic" }}>
                {choice.description}
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop:"1rem", textAlign:"right" }}>
        <button
          onClick={onSkip}
          style={{ background:"none", border:"none", color:"rgba(200,195,215,0.25)", fontFamily:"'Cinzel',serif", fontSize:"0.44rem", letterSpacing:"2px", cursor:"pointer", textTransform:"uppercase", padding:"0.3rem 0.5rem", transition:"color 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "rgba(200,195,215,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(200,195,215,0.25)"; }}
        >
          Skip choices — continue freely →
        </button>
      </div>
    </div>
  );
}
