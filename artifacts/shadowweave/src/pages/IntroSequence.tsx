import { useState, useEffect, useRef, useCallback } from "react";

interface Props {
  onComplete: () => void;
}

const TITLE = "SHADOWWEAVE";
const SUBTITLE = "WHERE DARKNESS BECOMES NARRATIVE CRAFT";

export default function IntroSequence({ onComplete }: Props) {
  const [revealedLetters, setRevealedLetters] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const [exiting, setExiting] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timerRefs.current.push(t);
    return t;
  };

  const startAudio = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3);
      master.connect(ctx.destination);
      gainRef.current = master;

      [35, 70, 105].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 2 ? "triangle" : "sine";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 0.7 : i === 1 ? 0.4 : 0.18;
        osc.connect(g).connect(master);
        osc.start();
      });

      const wobble = ctx.createOscillator();
      wobble.frequency.value = 0.15;
      const wobbleGain = ctx.createGain();
      wobbleGain.gain.value = 3;
      wobble.connect(wobbleGain);
      const carrier = ctx.createOscillator();
      carrier.frequency.value = 210;
      const carrierGain = ctx.createGain();
      carrierGain.gain.value = 0.08;
      wobbleGain.connect(carrier.frequency);
      carrier.connect(carrierGain).connect(master);
      wobble.start();
      carrier.start();
    } catch {
    }
  }, []);

  const handleComplete = useCallback(() => {
    setExiting(true);
    if (gainRef.current && audioRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, audioRef.current.currentTime + 1.2);
    }
    setTimeout(() => {
      if (audioRef.current) audioRef.current.close().catch(() => {});
      onComplete();
    }, 1200);
  }, [onComplete]);

  useEffect(() => {
    addTimer(startAudio, 300);
    const letterInterval = setInterval(() => {
      setRevealedLetters((prev) => {
        if (prev >= TITLE.length) {
          clearInterval(letterInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 110);

    addTimer(() => setShowSubtitle(true), TITLE.length * 110 + 600);
    addTimer(() => setShowEnter(true), TITLE.length * 110 + 1400);
    addTimer(handleComplete, TITLE.length * 110 + 7000);

    return () => {
      clearInterval(letterInterval);
      timerRefs.current.forEach(clearTimeout);
      if (audioRef.current) audioRef.current.close().catch(() => {});
    };
  }, [startAudio, handleComplete]);

  return (
    <div
      onClick={showEnter ? handleComplete : undefined}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        cursor: showEnter ? "pointer" : "default",
        opacity: exiting ? 0 : 1,
        transition: "opacity 1.2s ease",
      }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(139,0,0,0.12) 0%, transparent 70%)",
          animation: "introPulse 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "8%",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(50,0,80,0.15) 0%, transparent 70%)",
          animation: "introPulse 6s ease-in-out infinite reverse",
        }} />
      </div>

      <div style={{ position: "relative", textAlign: "center", userSelect: "none" }}>
        <div style={{
          display: "flex",
          letterSpacing: "0.25em",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}>
          {TITLE.split("").map((letter, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                fontWeight: 700,
                color: i < revealedLetters ? "#C8A84B" : "transparent",
                textShadow: i < revealedLetters
                  ? "0 0 30px rgba(200,168,75,0.6), 0 0 60px rgba(200,168,75,0.3), 0 0 100px rgba(200,168,75,0.15)"
                  : "none",
                opacity: i < revealedLetters ? 1 : 0,
                transform: i < revealedLetters ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)",
                display: "inline-block",
                transitionDelay: `${i * 0.02}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(200,168,75,0.6), transparent)",
          width: revealedLetters >= TITLE.length ? "100%" : "0%",
          margin: "0 auto 1.5rem",
          transition: "width 1s ease 0.3s",
        }} />

        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "clamp(0.55rem, 1.5vw, 0.8rem)",
          letterSpacing: "0.35em",
          color: "rgba(200,168,75,0.65)",
          opacity: showSubtitle ? 1 : 0,
          transform: showSubtitle ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.8s ease",
          marginBottom: "3rem",
        }}>
          {SUBTITLE}
        </div>

        <div style={{
          opacity: showEnter ? 1 : 0,
          transform: showEnter ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.8s ease",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleComplete(); }}
            style={{
              padding: "0.9rem 2.5rem",
              background: "transparent",
              border: "1px solid rgba(200,168,75,0.5)",
              borderRadius: "2px",
              color: "#C8A84B",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "rgba(200,168,75,0.12)";
              (e.target as HTMLButtonElement).style.borderColor = "rgba(200,168,75,0.9)";
              (e.target as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(200,168,75,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "transparent";
              (e.target as HTMLButtonElement).style.borderColor = "rgba(200,168,75,0.5)";
              (e.target as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            Enter the Studio
          </button>
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: "2rem",
        right: "2rem",
        fontFamily: "'Cinzel', serif",
        fontSize: "0.6rem",
        letterSpacing: "0.2em",
        color: "rgba(200,168,75,0.3)",
        cursor: "pointer",
        transition: "color 0.2s",
      }}
        onClick={handleComplete}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,168,75,0.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,168,75,0.3)")}
      >
        SKIP ›
      </div>

      <style>{`
        @keyframes introPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
