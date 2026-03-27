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
import IntroSequence from "./pages/IntroSequence";
import StoryArchive from "./pages/StoryArchive";
import DailyScenarioPage from "./pages/DailyScenarioPage";
import DailyChronicle from "./pages/DailyChronicle";
import MindBreakMode from "./pages/MindBreakMode";
import DualCaptureMode from "./pages/DualCaptureMode";
import RescueGoneWrongMode from "./pages/RescueGoneWrongMode";
import PowerDrainMode from "./pages/PowerDrainMode";
import MassCaptureMode from "./pages/MassCaptureMode";
import CorruptionArcMode from "./pages/CorruptionArcMode";
import HeroAuctionMode from "./pages/HeroAuctionMode";
import TrophyDisplayMode from "./pages/TrophyDisplayMode";
import ObedienceTrainingMode from "./pages/ObedienceTrainingMode";
import ShowcaseMode from "./pages/ShowcaseMode";
import PublicPropertyMode from "./pages/PublicPropertyMode";
import BettingPoolMode from "./pages/BettingPoolMode";
import VillainTeamUpMode from "./pages/VillainTeamUpMode";
import ChainOfCustodyMode from "./pages/ChainOfCustodyMode";
import LongGameMode from "./pages/LongGameMode";
import DarkMirrorMode from "./pages/DarkMirrorMode";
import ArenaMode from "./pages/ArenaMode";
import TheHandlerMode from "./pages/TheHandlerMode";
import StoryArcs from "./pages/StoryArcs";
import HeroineDossier from "./pages/HeroineDossier";
import VillainBuilder from "./pages/VillainBuilder";
import RelationshipMap from "./pages/RelationshipMap";
import AchievementsPage from "./pages/AchievementsPage";
import AchievementToastManager from "./components/AchievementToast";
import SessionTimer from "./components/SessionTimer";
import NightmareOverlay from "./components/NightmareOverlay";
import PlotTwistInjector from "./components/PlotTwistInjector";
import WelcomeCard from "./components/WelcomeCard";
import { recordStoryDay } from "./lib/streak";

type Page =
  | "login"
  | "intro"
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
  | "celebrity-mode"
  | "story-archive"
  | "daily-scenario"
  | "daily-chronicle"
  | "mind-break"
  | "dual-capture"
  | "rescue-gone-wrong"
  | "power-drain"
  | "mass-capture"
  | "corruption-arc"
  | "story-arcs"
  | "heroine-dossier"
  | "villain-builder"
  | "relationship-map"
  | "hero-auction"
  | "trophy-display"
  | "obedience-training"
  | "showcase"
  | "public-property"
  | "betting-pool"
  | "villain-team-up"
  | "chain-of-custody"
  | "long-game"
  | "dark-mirror"
  | "arena-mode"
  | "the-handler"
  | "achievements";

const STORY_MODE_PAGES = new Set<Page>([
  "superhero-mode","celebrity-mode","daily-scenario","character-params",
  "story-editor","interactive-story","captor-home","captor-config",
  "captor-summary","captor-logic","interrogation-room","mind-break",
  "dual-capture","rescue-gone-wrong","power-drain","mass-capture",
  "corruption-arc","hero-auction","trophy-display","obedience-training",
  "showcase","public-property","betting-pool","villain-team-up",
  "chain-of-custody","long-game","dark-mirror","arena-mode","the-handler",
]);

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
  const [surpriseActive, setSurpriseActive] = useState(false);
  const [reimagineHero, setReimaginHero] = useState<string | null>(null);

  function navigate(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const bgColor = theme.vars["--t-bg"] ?? "#000000";
  const textColor = theme.vars["--t-text"] ?? "#C8C8D8";

  return (
    <div style={{ minHeight: "100vh", background: bgColor, color: textColor, transition: "background 0.6s ease, color 0.6s ease" }}>
      {page === "login" && (
        <Login onEnter={() => {
          const played = sessionStorage.getItem("sw_intro_played");
          if (!played) {
            sessionStorage.setItem("sw_intro_played", "1");
            navigate("intro");
          } else {
            navigate("home");
          }
        }} />
      )}

      {page === "intro" && (
        <IntroSequence onComplete={() => navigate("home")} />
      )}

      {page !== "login" && (
        <>
          <BackgroundEffects />
          <GlitchOverlay />
          <CandlelightOverlay />
          <NightmareOverlay />
          <WelcomeCard />
          <ThemeSwitcher />
          <AchievementToastManager />
          {STORY_MODE_PAGES.has(page) && <SessionTimer key={page} pageKey={page} />}
          {STORY_MODE_PAGES.has(page) && <PlotTwistInjector />}
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
          onStoryArchive={() => navigate("story-archive")}
          onDailyScenario={() => navigate("daily-scenario")}
          onDailyChronicle={() => navigate("daily-chronicle")}
          onMindBreak={() => navigate("mind-break")}
          onDualCapture={() => navigate("dual-capture")}
          onRescueGoneWrong={() => navigate("rescue-gone-wrong")}
          onPowerDrain={() => navigate("power-drain")}
          onMassCapture={() => navigate("mass-capture")}
          onCorruptionArc={() => navigate("corruption-arc")}
          onHeroAuction={() => navigate("hero-auction")}
          onTrophyDisplay={() => navigate("trophy-display")}
          onObedienceTraining={() => navigate("obedience-training")}
          onShowcase={() => navigate("showcase")}
          onPublicProperty={() => navigate("public-property")}
          onBettingPool={() => navigate("betting-pool")}
          onVillainTeamUp={() => navigate("villain-team-up")}
          onChainOfCustody={() => navigate("chain-of-custody")}
          onLongGame={() => navigate("long-game")}
          onDarkMirror={() => navigate("dark-mirror")}
          onArenaMode={() => navigate("arena-mode")}
          onTheHandler={() => navigate("the-handler")}
          onSurpriseMe={() => { setSurpriseActive(true); setReimaginHero(null); navigate("superhero-mode"); }}
          onStoryArcs={() => navigate("story-arcs")}
          onHeroineDossier={() => navigate("heroine-dossier")}
          onVillainBuilder={() => navigate("villain-builder")}
          onRelationshipMap={() => navigate("relationship-map")}
          onAchievements={() => navigate("achievements")}
        />
      )}

      {page === "story-archive" && (
        <StoryArchive
          onBack={() => navigate("home")}
          onRemix={(heroName) => { setReimaginHero(heroName); setSurpriseActive(false); navigate("superhero-mode"); }}
        />
      )}

      {page === "daily-scenario" && (
        <DailyScenarioPage
          onBack={() => navigate("home")}
          onChronicle={() => navigate("daily-chronicle")}
        />
      )}

      {page === "daily-chronicle" && (
        <DailyChronicle onBack={() => navigate("daily-scenario")} />
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
        <SuperheroMode
          onBack={() => { setSurpriseActive(false); setReimaginHero(null); navigate("home"); }}
          surprise={surpriseActive}
          reimagineHero={reimagineHero}
          onSurpriseUsed={() => setSurpriseActive(false)}
          onReimagineDone={() => setReimaginHero(null)}
        />
      )}

      {page === "interrogation-room" && (
        <InterrogationRoom onBack={() => navigate("home")} />
      )}

      {page === "celebrity-mode" && (
        <CelebrityMode onBack={() => navigate("home")} />
      )}

      {page === "mind-break" && (
        <MindBreakMode onBack={() => navigate("home")} />
      )}

      {page === "dual-capture" && (
        <DualCaptureMode onBack={() => navigate("home")} />
      )}

      {page === "rescue-gone-wrong" && (
        <RescueGoneWrongMode onBack={() => navigate("home")} />
      )}

      {page === "power-drain" && (
        <PowerDrainMode onBack={() => navigate("home")} />
      )}

      {page === "mass-capture" && (
        <MassCaptureMode onBack={() => navigate("home")} />
      )}

      {page === "corruption-arc" && (
        <CorruptionArcMode onBack={() => navigate("home")} />
      )}

      {page === "hero-auction" && (
        <HeroAuctionMode onBack={() => navigate("home")} />
      )}

      {page === "trophy-display" && (
        <TrophyDisplayMode onBack={() => navigate("home")} />
      )}

      {page === "obedience-training" && (
        <ObedienceTrainingMode onBack={() => navigate("home")} />
      )}

      {page === "showcase" && (
        <ShowcaseMode onBack={() => navigate("home")} />
      )}

      {page === "public-property" && (
        <PublicPropertyMode onBack={() => navigate("home")} />
      )}

      {page === "betting-pool" && (
        <BettingPoolMode onBack={() => navigate("home")} />
      )}

      {page === "villain-team-up" && (
        <VillainTeamUpMode onBack={() => navigate("home")} />
      )}

      {page === "chain-of-custody" && (
        <ChainOfCustodyMode onBack={() => navigate("home")} />
      )}

      {page === "long-game" && (
        <LongGameMode onBack={() => navigate("home")} />
      )}

      {page === "dark-mirror" && (
        <DarkMirrorMode onBack={() => navigate("home")} />
      )}

      {page === "arena-mode" && (
        <ArenaMode onBack={() => navigate("home")} />
      )}

      {page === "the-handler" && (
        <TheHandlerMode onBack={() => navigate("home")} />
      )}

      {page === "story-arcs" && (
        <StoryArcs onBack={() => navigate("home")} />
      )}

      {page === "heroine-dossier" && (
        <HeroineDossier onBack={() => navigate("home")} />
      )}

      {page === "villain-builder" && (
        <VillainBuilder onBack={() => navigate("home")} />
      )}

      {page === "relationship-map" && (
        <RelationshipMap onBack={() => navigate("home")} />
      )}

      {page === "achievements" && (
        <AchievementsPage onBack={() => navigate("home")} />
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
