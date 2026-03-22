import { useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Login from "./pages/Login";
import Homepage from "./pages/Homepage";
import CharacterParameters from "./pages/CharacterParameters";
import StoryEditor from "./pages/StoryEditor";
import CaptorHomepage from "./pages/CaptorHomepage";
import CaptorConfig from "./pages/CaptorConfig";
import CaptorSummary from "./pages/CaptorSummary";
import ScenarioGenerator from "./pages/ScenarioGenerator";
import InteractiveStory from "./pages/InteractiveStory";
import CharacterMapper from "./pages/CharacterMapper";
import SoundingBoard from "./pages/SoundingBoard";
import CaptorLogic from "./pages/CaptorLogic";
import SuperheroMode from "./pages/SuperheroMode";
import InterrogationRoom from "./pages/InterrogationRoom";
import CelebrityMode from "./pages/CelebrityMode";

type Page =
  | "login"
  | "home"
  | "character-params"
  | "story-editor"
  | "interactive-story"
  | "captor-home"
  | "captor-config"
  | "captor-summary"
  | "scenario-generator"
  | "character-mapper"
  | "sounding-board"
  | "captor-logic"
  | "superhero-mode"
  | "interrogation-room"
  | "celebrity-mode";

function BackgroundEffects() {
  const { theme } = useTheme();
  const orb1 = theme.vars["--t-orb1"] ?? "rgba(139,0,0,0.18)";
  const orb2 = theme.vars["--t-orb2"] ?? "rgba(45,27,105,0.2)";

  return (
    <div className="void-bg">
      <div className="void-layer" />
      <div
        className="void-orb"
        style={{
          width: "600px", height: "600px",
          top: "10%", left: "-10%",
          background: `radial-gradient(circle, ${orb1} 0%, transparent 70%)`,
          "--dur": "28s", "--delay": "0s",
        } as React.CSSProperties}
      />
      <div
        className="void-orb"
        style={{
          width: "500px", height: "500px",
          top: "50%", right: "-5%",
          background: `radial-gradient(circle, ${orb2} 0%, transparent 70%)`,
          "--dur": "22s", "--delay": "-8s",
        } as React.CSSProperties}
      />
      <div
        className="void-orb"
        style={{
          width: "400px", height: "400px",
          bottom: "5%", left: "30%",
          background: `radial-gradient(circle, ${orb1} 0%, transparent 70%)`,
          "--dur": "35s", "--delay": "-15s",
        } as React.CSSProperties}
      />
    </div>
  );
}

function GlitchOverlay() {
  const { theme } = useTheme();
  if (theme.name !== "glitch") return null;
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 500,
      backgroundImage: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,255,65,0.015) 2px,
        rgba(0,255,65,0.015) 4px
      )`,
      animation: "glitchScan 8s linear infinite",
    }} />
  );
}

function CandlelightOverlay() {
  const { theme } = useTheme();
  if (theme.name !== "candlelight") return null;
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 500,
      background: "radial-gradient(ellipse at 50% 100%, rgba(150,60,0,0.12) 0%, transparent 70%)",
      animation: "candleFlicker 3s ease-in-out infinite",
    }} />
  );
}

function AppInner() {
  const { theme } = useTheme();
  const [page, setPage] = useState<Page>("login");
  const [captorAnswers, setCaptorAnswers] = useState<Record<number, string>>({});
  const [characterAnswers, setCharacterAnswers] = useState<Record<number, string>>({});

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const bgColor = theme.vars["--t-bg"] ?? "#000000";
  const textColor = theme.vars["--t-text"] ?? "#C8C8D8";

  return (
    <div style={{ minHeight: "100vh", background: bgColor, color: textColor, transition: "background 0.6s ease, color 0.6s ease" }}>
      {page === "login" && (
        <Login onEnter={() => navigate("home")} />
      )}

      {page !== "login" && (
        <>
          <BackgroundEffects />
          <GlitchOverlay />
          <CandlelightOverlay />
          <ThemeSwitcher />
        </>
      )}

      {page === "home" && (
        <Homepage
          onEnter={() => navigate("character-params")}
          onCaptorPortal={() => navigate("captor-home")}
          onScenarioGenerator={() => navigate("scenario-generator")}
          onCharacterMapper={() => navigate("character-mapper")}
          onSoundingBoard={() => navigate("sounding-board")}
          onCaptorLogic={() => navigate("captor-logic")}
          onSuperheroMode={() => navigate("superhero-mode")}
          onInterrogationRoom={() => navigate("interrogation-room")}
          onCelebrityMode={() => navigate("celebrity-mode")}
        />
      )}

      {page === "character-params" && (
        <CharacterParameters
          onBack={() => navigate("home")}
          onProceed={(answers) => {
            setCharacterAnswers(answers);
            navigate("interactive-story");
          }}
        />
      )}

      {page === "interactive-story" && (
        <InteractiveStory
          characterAnswers={characterAnswers}
          onBack={() => navigate("character-params")}
        />
      )}

      {page === "story-editor" && (
        <StoryEditor onBack={() => navigate("home")} />
      )}

      {page === "captor-home" && (
        <CaptorHomepage
          onEnter={() => navigate("captor-config")}
          onBack={() => navigate("home")}
        />
      )}

      {page === "captor-config" && (
        <CaptorConfig
          onBack={() => navigate("captor-home")}
          onProceed={(answers) => {
            setCaptorAnswers(answers);
            navigate("captor-summary");
          }}
        />
      )}

      {page === "captor-summary" && (
        <CaptorSummary
          answers={captorAnswers}
          onReset={() => {
            setCaptorAnswers({});
            navigate("captor-config");
          }}
          onBack={() => navigate("captor-home")}
        />
      )}

      {page === "scenario-generator" && (
        <ScenarioGenerator onBack={() => navigate("home")} />
      )}

      {page === "character-mapper" && (
        <CharacterMapper onBack={() => navigate("home")} />
      )}

      {page === "sounding-board" && (
        <SoundingBoard onBack={() => navigate("home")} />
      )}

      {page === "captor-logic" && (
        <CaptorLogic onBack={() => navigate("home")} />
      )}

      {page === "superhero-mode" && (
        <SuperheroMode onBack={() => navigate("home")} />
      )}

      {page === "interrogation-room" && (
        <InterrogationRoom onBack={() => navigate("home")} />
      )}

      {page === "celebrity-mode" && (
        <CelebrityMode onBack={() => navigate("home")} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
