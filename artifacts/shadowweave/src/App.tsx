import { useState } from "react";
import Homepage from "./pages/Homepage";
import CharacterParameters from "./pages/CharacterParameters";
import StoryEditor from "./pages/StoryEditor";
import CaptorHomepage from "./pages/CaptorHomepage";
import CaptorConfig from "./pages/CaptorConfig";
import CaptorSummary from "./pages/CaptorSummary";

type Page =
  | "home"
  | "character-params"
  | "story-editor"
  | "captor-home"
  | "captor-config"
  | "captor-summary";

function BackgroundEffects() {
  return (
    <div className="void-bg">
      <div className="void-layer" />
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [characterAnswers, setCharacterAnswers] = useState<Record<number, string>>({});
  const [captorAnswers, setCaptorAnswers] = useState<Record<number, string>>({});

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo(0, 0);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#C0C0C0" }}>
      <BackgroundEffects />

      {page === "home" && (
        <Homepage
          onEnter={() => navigate("character-params")}
          onCaptorPortal={() => navigate("captor-home")}
        />
      )}

      {page === "character-params" && (
        <CharacterParameters
          onBack={() => navigate("home")}
          onProceed={(answers) => {
            setCharacterAnswers(answers);
            navigate("story-editor");
          }}
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
    </div>
  );
}
