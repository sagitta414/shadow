import { useState } from "react";
import Homepage from "./pages/Homepage";
import CharacterParameters from "./pages/CharacterParameters";
import StoryEditor from "./pages/StoryEditor";
import CaptorHomepage from "./pages/CaptorHomepage";
import CaptorConfig from "./pages/CaptorConfig";
import CaptorSummary from "./pages/CaptorSummary";
import ScenarioGenerator from "./pages/ScenarioGenerator";

type Page =
  | "home"
  | "character-params"
  | "story-editor"
  | "captor-home"
  | "captor-config"
  | "captor-summary"
  | "scenario-generator";

function BackgroundEffects() {
  return (
    <div className="void-bg">
      <div className="void-layer" />
      <div
        className="void-orb"
        style={{
          width: "600px",
          height: "600px",
          top: "10%",
          left: "-10%",
          background: "radial-gradient(circle, rgba(139,0,0,0.18) 0%, transparent 70%)",
          "--dur": "28s",
          "--delay": "0s",
        } as React.CSSProperties}
      />
      <div
        className="void-orb"
        style={{
          width: "500px",
          height: "500px",
          top: "50%",
          right: "-5%",
          background: "radial-gradient(circle, rgba(45,27,105,0.2) 0%, transparent 70%)",
          "--dur": "22s",
          "--delay": "-8s",
        } as React.CSSProperties}
      />
      <div
        className="void-orb"
        style={{
          width: "400px",
          height: "400px",
          bottom: "5%",
          left: "30%",
          background: "radial-gradient(circle, rgba(61,10,74,0.15) 0%, transparent 70%)",
          "--dur": "35s",
          "--delay": "-15s",
        } as React.CSSProperties}
      />
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [captorAnswers, setCaptorAnswers] = useState<Record<number, string>>({});

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#C8C8D8" }}>
      <BackgroundEffects />

      {page === "home" && (
        <Homepage
          onEnter={() => navigate("character-params")}
          onCaptorPortal={() => navigate("captor-home")}
          onScenarioGenerator={() => navigate("scenario-generator")}
        />
      )}

      {page === "character-params" && (
        <CharacterParameters
          onBack={() => navigate("home")}
          onProceed={() => navigate("story-editor")}
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
    </div>
  );
}
