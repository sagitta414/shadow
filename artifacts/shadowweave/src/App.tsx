import { useState, useEffect, lazy, Suspense } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ThemeSwitcher from "./components/ThemeSwitcher";
import AchievementToastManager from "./components/AchievementToast";
import SessionTimer from "./components/SessionTimer";
import NightmareOverlay from "./components/NightmareOverlay";
import PlotTwistInjector from "./components/PlotTwistInjector";
import WelcomeCard from "./components/WelcomeCard";
import AiProviderBadge from "./components/AiProviderBadge";
import { recordStoryDay } from "./lib/streak";
import { recordModeVisit } from "./lib/recentModes";
import { DirectorProvider } from "./contexts/DirectorContext";
import DirectorPanel from "./components/DirectorPanel";
import { directorStore } from "./lib/directorStore";

// ── Lazy-loaded pages (each becomes its own JS chunk) ────────────────────────
const Login                = lazy(() => import("./pages/Login"));
const AdminPage            = lazy(() => import("./pages/AdminPage"));
const Homepage             = lazy(() => import("./pages/Homepage"));
const IntroSequence        = lazy(() => import("./pages/IntroSequence"));
const CharacterParameters  = lazy(() => import("./pages/CharacterParameters"));
const StoryEditor          = lazy(() => import("./pages/StoryEditor"));
const CaptorHomepage       = lazy(() => import("./pages/CaptorHomepage"));
const CaptorConfig         = lazy(() => import("./pages/CaptorConfig"));
const CaptorSummary        = lazy(() => import("./pages/CaptorSummary"));
const ScenarioGenerator    = lazy(() => import("./pages/ScenarioGenerator"));
const InteractiveStory     = lazy(() => import("./pages/InteractiveStory"));
const CharacterMapper      = lazy(() => import("./pages/CharacterMapper"));
const SoundingBoard        = lazy(() => import("./pages/SoundingBoard"));
const CaptorLogic          = lazy(() => import("./pages/CaptorLogic"));
const SuperheroMode        = lazy(() => import("./pages/SuperheroMode"));
const InterrogationRoom    = lazy(() => import("./pages/InterrogationRoom"));
const CelebrityMode        = lazy(() => import("./pages/CelebrityMode"));
const StoryArchive         = lazy(() => import("./pages/StoryArchive"));
const DailyScenarioPage    = lazy(() => import("./pages/DailyScenarioPage"));
const DailyChronicle       = lazy(() => import("./pages/DailyChronicle"));
const MindBreakMode        = lazy(() => import("./pages/MindBreakMode"));
const DualCaptureMode      = lazy(() => import("./pages/DualCaptureMode"));
const RescueGoneWrongMode  = lazy(() => import("./pages/RescueGoneWrongMode"));
const PowerDrainMode       = lazy(() => import("./pages/PowerDrainMode"));
const MassCaptureMode      = lazy(() => import("./pages/MassCaptureMode"));
const CorruptionArcMode    = lazy(() => import("./pages/CorruptionArcMode"));
const HeroAuctionMode      = lazy(() => import("./pages/HeroAuctionMode"));
const TrophyDisplayMode    = lazy(() => import("./pages/TrophyDisplayMode"));
const ObedienceTrainingMode= lazy(() => import("./pages/ObedienceTrainingMode"));
const ShowcaseMode         = lazy(() => import("./pages/ShowcaseMode"));
const PublicPropertyMode   = lazy(() => import("./pages/PublicPropertyMode"));
const BettingPoolMode      = lazy(() => import("./pages/BettingPoolMode"));
const VillainTeamUpMode    = lazy(() => import("./pages/VillainTeamUpMode"));
const ChainOfCustodyMode   = lazy(() => import("./pages/ChainOfCustodyMode"));
const LongGameMode         = lazy(() => import("./pages/LongGameMode"));
const DarkMirrorMode       = lazy(() => import("./pages/DarkMirrorMode"));
const ArenaMode            = lazy(() => import("./pages/ArenaMode"));
const TheHandlerMode       = lazy(() => import("./pages/TheHandlerMode"));
const TimeLoopMode         = lazy(() => import("./pages/TimeLoopMode"));
const DreamSequenceMode    = lazy(() => import("./pages/DreamSequenceMode"));
const DirectorMode         = lazy(() => import("./pages/DirectorMode"));
const EscapeAttemptMode    = lazy(() => import("./pages/EscapeAttemptMode"));
const NegotiationRoomMode  = lazy(() => import("./pages/NegotiationRoomMode"));
const FactionMode          = lazy(() => import("./pages/FactionMode"));
const SlowBurnMode         = lazy(() => import("./pages/SlowBurnMode"));
const ConfinedSpaceMode    = lazy(() => import("./pages/ConfinedSpaceMode"));
const VillainInterrogation = lazy(() => import("./pages/VillainInterrogation"));
const CivilianCapture      = lazy(() => import("./pages/CivilianCapture"));
const HeroineImageGen      = lazy(() => import("./pages/HeroineImageGen"));
const SequelGenerator      = lazy(() => import("./pages/SequelGenerator"));
const StoryContinuation    = lazy(() => import("./pages/StoryContinuation"));
const BountyBoard          = lazy(() => import("./pages/BountyBoard"));
const HeroineLore          = lazy(() => import("./pages/HeroineLore"));
const ArrowverseMode       = lazy(() => import("./pages/ArrowverseMode"));
const StoryTimeline        = lazy(() => import("./pages/StoryTimeline"));
const RewriteCanonMode     = lazy(() => import("./pages/RewriteCanonMode"));
const SeasonArcMode        = lazy(() => import("./pages/SeasonArcMode"));
const DarkDossier          = lazy(() => import("./pages/DarkDossier"));
const CWSpecialistHub      = lazy(() => import("./pages/CWSpecialistHub"));
const GenericHub           = lazy(() => import("./pages/GenericHub"));
const CampaignMode         = lazy(() => import("./pages/CampaignMode"));
const VillainHub           = lazy(() => import("./pages/VillainHub"));
const ResearchFacilityMode = lazy(() => import("./pages/ResearchFacilityMode"));
const GladiatorProtocolMode= lazy(() => import("./pages/GladiatorProtocolMode"));
const TheWitnessMode       = lazy(() => import("./pages/TheWitnessMode"));
const SleeperProtocolMode  = lazy(() => import("./pages/SleeperProtocolMode"));
const AuctionBlockMode     = lazy(() => import("./pages/AuctionBlockMode"));
const StoryArcs            = lazy(() => import("./pages/StoryArcs"));
const HeroineDossier       = lazy(() => import("./pages/HeroineDossier"));
const VillainBuilder       = lazy(() => import("./pages/VillainBuilder"));
const RelationshipMap      = lazy(() => import("./pages/RelationshipMap"));
const AchievementsPage     = lazy(() => import("./pages/AchievementsPage"));
const VaultPage            = lazy(() => import("./pages/VaultPage"));

function PageLoader() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#020008", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid rgba(168,85,247,0.15)", borderTop: "2px solid #A855F7", animation: "spin 0.9s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "4px", color: "rgba(168,85,247,0.45)" }}>LOADING</div>
    </div>
  );
}

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
  | "time-loop"
  | "dream-sequence"
  | "sequel-generator"
  | "story-continuation"
  | "achievements"
  | "vault"
  | "director-mode"
  | "escape-attempt"
  | "negotiation-room"
  | "faction-mode"
  | "slow-burn"
  | "confined-space"
  | "villain-interrogation"
  | "civilian-capture"
  | "heroine-image-gen"
  | "bounty-board"
  | "heroine-lore"
  | "arrowverse-mode"
  | "story-timeline"
  | "rewrite-canon"
  | "season-arc"
  | "dark-dossier"
  | "cw-specialist"
  | "psych-dark"
  | "spectacle-hub"
  | "captivity-hub"
  | "campaign-mode"
  | "villain-hub"
  | "research-facility"
  | "gladiator-protocol"
  | "the-witness"
  | "sleeper-protocol"
  | "auction-block"
  | "admin";

const STORY_MODE_PAGES = new Set<Page>([
  "superhero-mode","celebrity-mode","daily-scenario","character-params",
  "story-editor","interactive-story","captor-home","captor-config",
  "captor-summary","captor-logic","interrogation-room","mind-break",
  "dual-capture","rescue-gone-wrong","power-drain","mass-capture",
  "corruption-arc","hero-auction","trophy-display","obedience-training",
  "showcase","public-property","betting-pool","villain-team-up",
  "chain-of-custody","long-game","dark-mirror","arena-mode","the-handler",
  "time-loop","dream-sequence","sequel-generator","story-continuation",
  "director-mode","escape-attempt","negotiation-room","faction-mode",
  "slow-burn","confined-space","villain-interrogation","civilian-capture",
  "arrowverse-mode","research-facility","gladiator-protocol","the-witness",
  "sleeper-protocol","auction-block","villain-hub",
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
  const [continuationStoryId, setContinuationStoryId] = useState<string | null>(null);
  const [hubSource, setHubSource] = useState<Page | null>(null);
  const [dailyPlay, setDailyPlay] = useState<{
    dateKey: string;
    scenario: { heroine: { name: string; color: string; power: string }; villain: string; setting: string; title: string };
    mode: "start" | "continue" | "redo";
  } | null>(null);

  useEffect(() => {
    const orig = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
      if (url.includes("/api/story/") && init?.method === "POST" && init.body) {
        try {
          const body = JSON.parse(init.body as string);
          body._safeMode = directorStore.safeMode;
          body._directorNote = directorStore.directorNote;
          init = { ...init, body: JSON.stringify(body) };
        } catch {}
      }
      return orig(input, init);
    };
    return () => { window.fetch = orig; };
  }, []);

  function navigate(p: Page) {
    if (p === "home") setHubSource(null);
    recordModeVisit(p);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function backFromMode() { const src = hubSource; setHubSource(null); navigate(src ?? "home"); }
  function enterFromHub(hub: Page, dest: Page) { setHubSource(hub); navigate(dest); }

  const bgColor = theme.vars["--t-bg"] ?? "#000000";
  const textColor = theme.vars["--t-text"] ?? "#C8C8D8";

  return (
    <div style={{ minHeight: "100vh", background: bgColor, color: textColor, transition: "background 0.6s ease, color 0.6s ease" }}>
      {page === "login" && (
        <Login
          onAdmin={() => navigate("admin")}
          onEnter={() => {
            const played = sessionStorage.getItem("sw_intro_played");
            if (!played) {
              sessionStorage.setItem("sw_intro_played", "1");
              navigate("intro");
            } else {
              navigate("home");
            }
          }}
        />
      )}

      {page === "admin" && (
        <AdminPage onBack={() => navigate("login")} />
      )}

      {page === "intro" && (
        <IntroSequence onComplete={() => navigate("home")} />
      )}

      {page !== "login" && page !== "admin" && (
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
          {STORY_MODE_PAGES.has(page) && <DirectorPanel />}
          <AiProviderBadge />
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
          onCelebrityMode={() => navigate("celebrity-mode")}
          onStoryArchive={() => navigate("story-archive")}
          onDailyScenario={() => navigate("daily-scenario")}
          onDailyChronicle={() => navigate("daily-chronicle")}
          onRescueGoneWrong={() => navigate("rescue-gone-wrong")}
          onPowerDrain={() => navigate("power-drain")}
          onTheHandler={() => navigate("the-handler")}
          onSurpriseMe={() => { setSurpriseActive(true); setReimaginHero(null); navigate("superhero-mode"); }}
          onStoryArcs={() => navigate("story-arcs")}
          onHeroineDossier={() => navigate("heroine-dossier")}
          onVillainBuilder={() => navigate("villain-builder")}
          onRelationshipMap={() => navigate("relationship-map")}
          onAchievements={() => navigate("achievements")}
          onVault={() => navigate("vault")}
          onTimeLoop={() => navigate("time-loop")}
          onStoryContinuation={() => navigate("story-continuation")}
          onDirectorMode={() => navigate("director-mode")}
          onEscapeAttempt={() => navigate("escape-attempt")}
          onHeroineImageGen={() => navigate("heroine-image-gen")}
          onVillainInterrogation={() => navigate("villain-interrogation")}
          onCivilianCapture={() => navigate("civilian-capture")}
          onBountyBoard={() => navigate("bounty-board")}
          onHeroineLore={() => navigate("heroine-lore")}
          onStoryTimeline={() => navigate("story-timeline")}
          onDarkDossier={() => navigate("dark-dossier")}
          onCWSpecialist={() => navigate("cw-specialist")}
          onPsychDark={() => navigate("psych-dark")}
          onSpectacleHub={() => navigate("spectacle-hub")}
          onCaptivityHub={() => navigate("captivity-hub")}
          onCampaignMode={() => navigate("campaign-mode")}
          onVillainHub={() => navigate("villain-hub")}
          onResearchFacility={() => navigate("research-facility")}
          onGladiatorProtocol={() => navigate("gladiator-protocol")}
          onTheWitness={() => navigate("the-witness")}
          onSleeperProtocol={() => navigate("sleeper-protocol")}
          onAuctionBlock={() => navigate("auction-block")}
        />
      )}

      {page === "story-archive" && (
        <StoryArchive
          onBack={() => navigate("home")}
          onRemix={(heroName) => { setReimaginHero(heroName); setSurpriseActive(false); navigate("superhero-mode"); }}
          onContinue={(storyId) => { setContinuationStoryId(storyId); navigate("story-continuation"); }}
        />
      )}

      {page === "daily-scenario" && (
        <DailyScenarioPage
          onBack={() => { setDailyPlay(null); navigate("home"); }}
          onChronicle={() => { setDailyPlay(null); navigate("daily-chronicle"); }}
          dateKey={dailyPlay?.dateKey}
          scenarioOverride={dailyPlay?.scenario}
          forceGenerate={dailyPlay?.mode === "start" || dailyPlay?.mode === "redo"}
        />
      )}

      {page === "daily-chronicle" && (
        <DailyChronicle
          onBack={() => navigate("daily-scenario")}
          onPlayDate={(dateKey, scenario, mode) => {
            setDailyPlay({ dateKey, scenario, mode });
            navigate("daily-scenario");
          }}
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
        <SuperheroMode
          onBack={() => { setSurpriseActive(false); setReimaginHero(null); navigate("home"); }}
          surprise={surpriseActive}
          reimagineHero={reimagineHero}
          onSurpriseUsed={() => setSurpriseActive(false)}
          onReimagineDone={() => setReimaginHero(null)}
        />
      )}

      {page === "interrogation-room" && (
        <InterrogationRoom onBack={backFromMode} />
      )}

      {page === "celebrity-mode" && (
        <CelebrityMode onBack={() => navigate("home")} />
      )}

      {page === "mind-break" && (
        <MindBreakMode onBack={backFromMode} />
      )}

      {page === "dual-capture" && (
        <DualCaptureMode onBack={backFromMode} />
      )}

      {page === "rescue-gone-wrong" && (
        <RescueGoneWrongMode onBack={() => navigate("home")} />
      )}

      {page === "power-drain" && (
        <PowerDrainMode onBack={() => navigate("home")} />
      )}

      {page === "mass-capture" && (
        <MassCaptureMode onBack={backFromMode} />
      )}

      {page === "corruption-arc" && (
        <CorruptionArcMode onBack={backFromMode} />
      )}

      {page === "hero-auction" && (
        <HeroAuctionMode onBack={backFromMode} />
      )}

      {page === "trophy-display" && (
        <TrophyDisplayMode onBack={backFromMode} />
      )}

      {page === "obedience-training" && (
        <ObedienceTrainingMode onBack={backFromMode} />
      )}

      {page === "showcase" && (
        <ShowcaseMode onBack={backFromMode} />
      )}

      {page === "public-property" && (
        <PublicPropertyMode onBack={backFromMode} />
      )}

      {page === "betting-pool" && (
        <BettingPoolMode onBack={backFromMode} />
      )}

      {page === "villain-team-up" && (
        <VillainTeamUpMode onBack={backFromMode} />
      )}

      {page === "chain-of-custody" && (
        <ChainOfCustodyMode onBack={backFromMode} />
      )}

      {page === "long-game" && (
        <LongGameMode onBack={backFromMode} />
      )}

      {page === "dark-mirror" && (
        <DarkMirrorMode onBack={backFromMode} />
      )}

      {page === "arena-mode" && (
        <ArenaMode onBack={backFromMode} />
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

      {page === "time-loop" && (
        <TimeLoopMode onBack={() => navigate("home")} />
      )}

      {page === "dream-sequence" && (
        <DreamSequenceMode onBack={backFromMode} />
      )}

      {page === "sequel-generator" && (
        <SequelGenerator onBack={backFromMode} />
      )}

      {page === "story-continuation" && (
        <StoryContinuation
          onBack={() => { setContinuationStoryId(null); navigate("home"); }}
          initialStoryId={continuationStoryId ?? undefined}
        />
      )}

      {page === "achievements" && (
        <AchievementsPage onBack={() => navigate("home")} />
      )}

      {page === "vault" && (
        <VaultPage onBack={() => navigate("home")} />
      )}

      {page === "director-mode" && (
        <DirectorMode onBack={() => navigate("home")} />
      )}
      {page === "escape-attempt" && (
        <EscapeAttemptMode onBack={() => navigate("home")} />
      )}
      {page === "negotiation-room" && (
        <NegotiationRoomMode onBack={backFromMode} />
      )}
      {page === "faction-mode" && (
        <FactionMode onBack={backFromMode} />
      )}

      {page === "slow-burn" && (
        <SlowBurnMode />
      )}

      {page === "confined-space" && (
        <ConfinedSpaceMode />
      )}

      {page === "villain-interrogation" && (
        <VillainInterrogation onBack={() => navigate("home")} />
      )}

      {page === "civilian-capture" && (
        <CivilianCapture onBack={() => navigate("home")} />
      )}

      {page === "heroine-image-gen" && (
        <HeroineImageGen onBack={() => navigate("home")} />
      )}

      {page === "bounty-board" && (
        <BountyBoard onBack={() => navigate("home")} />
      )}

      {page === "heroine-lore" && (
        <HeroineLore onBack={() => navigate("home")} />
      )}

      {page === "arrowverse-mode" && (
        <ArrowverseMode onBack={() => navigate("home")} onContinue={(id) => { setContinuationStoryId(id); navigate("story-continuation"); }} />
      )}

      {page === "story-timeline" && (
        <StoryTimeline onBack={() => navigate("home")} onContinue={(id) => { setContinuationStoryId(id); navigate("story-continuation"); }} />
      )}

      {page === "rewrite-canon" && (
        <RewriteCanonMode onBack={() => navigate("home")} onContinue={(id) => { setContinuationStoryId(id); navigate("story-continuation"); }} />
      )}

      {page === "season-arc" && (
        <SeasonArcMode onBack={() => navigate("home")} onContinue={(id) => { setContinuationStoryId(id); navigate("story-continuation"); }} />
      )}

      {page === "dark-dossier" && (
        <DarkDossier onBack={() => navigate("home")} onContinue={(id) => { setContinuationStoryId(id); navigate("story-continuation"); }} />
      )}

      {page === "cw-specialist" && (
        <CWSpecialistHub onBack={() => navigate("home")} onContinue={(id) => { setContinuationStoryId(id); navigate("story-continuation"); }} />
      )}

      {page === "psych-dark" && (
        <GenericHub
          title="PSYCH DARK" icon="🧠" accent="#C084FC"
          subtitle="PSYCHOLOGICAL WARFARE · 6 MODES"
          tagline="Six modes of psychological pressure. From interrogation to nightmare — the mind is the real battlefield."
          onBack={() => navigate("home")}
          onSelectMode={(id) => enterFromHub("psych-dark", id as Page)}
          modes={[
            { icon: "🔦", title: "INTERROGATION ROOM", badge: "Psych · High Tension", desc: "Bright lights, tight restraints. The villain breaks her spirit one question at a time — or tries to.", color: "#F87171", r: 248, g: 113, b: 113, pageId: "interrogation-room" },
            { icon: "🌀", title: "MIND BREAK", badge: "5 Phases · Deep Psych", desc: "Five-phase descent into psychological submission. Her will fractures layer by layer until nothing remains.", color: "#C084FC", r: 192, g: 132, b: 252, pageId: "mind-break" },
            { icon: "🪞", title: "DARK MIRROR", badge: "Duality · Psych", desc: "Face to face with her own darkness. Is the villain truly the opposite — or simply what she'd become?", color: "#E879F9", r: 232, g: 121, b: 249, pageId: "dark-mirror" },
            { icon: "◈", title: "DREAM SEQUENCE", badge: "5 Depths · Nightmare", desc: "Five depths of nightmare. The villain reaches her where she feels safest — in sleep — and remakes her.", color: "#A78BFA", r: 167, g: 139, b: 250, pageId: "dream-sequence" },
            { icon: "🤝", title: "NEGOTIATION ROOM", badge: "Psych · Turn-Based Chat", desc: "No restraints. Just words. The villain wants something — and he's very good at getting it. You play her.", color: "#38BDF8", r: 56, g: 189, b: 248, pageId: "negotiation-room" },
            { icon: "🔒", title: "CONFINED SPACE", badge: "One Room · One Night", desc: "Locked in a single room with nowhere to go. Pure psychological pressure — the drama lives entirely between them.", color: "#0EA5E9", r: 14, g: 165, b: 233, pageId: "confined-space" },
          ]}
        />
      )}

      {page === "spectacle-hub" && (
        <GenericHub
          title="POWER & SPECTACLE" icon="🏛" accent="#FCA311"
          subtitle="DISPLAY · DOMINANCE · AUDIENCE · 9 MODES"
          tagline="Nine modes built around power made visible — auctions, arenas, displays, gladiator combat, wagers. Victory as performance."
          onBack={() => navigate("home")}
          onSelectMode={(id) => enterFromHub("spectacle-hub", id as Page)}
          modes={[
            { icon: "⚖", title: "HERO AUCTION", badge: "Bid · Live Auction", desc: "The highest bidder gets everything. Rising stakes, live bids, one inevitable outcome on the auction block.", color: "#FCA311", r: 252, g: 163, b: 17, pageId: "hero-auction" },
            { icon: "🔨", title: "THE AUCTION BLOCK", badge: "Multi-Heroine · Full Event", desc: "Three to five heroines auctioned in a single evening. Choose the lots, choose the bidders. The auctioneer narrates everything.", color: "#FCA311", r: 252, g: 163, b: 17, pageId: "auction-block" },
            { icon: "👁", title: "TROPHY DISPLAY", badge: "Display · Public", desc: "Victory displayed for all to see. The heroine becomes the centerpiece of the villain's prized collection.", color: "#EF4444", r: 239, g: 68, b: 68, pageId: "trophy-display" },
            { icon: "🎭", title: "THE SHOWCASE", badge: "Staged · Audience", desc: "Staged for an audience. Every movement choreographed, every reaction studied and savored by the crowd.", color: "#E879F9", r: 232, g: 121, b: 249, pageId: "showcase" },
            { icon: "🏛", title: "ARENA MODE", badge: "Combat · Versus", desc: "Combat as spectacle. The villain pits the heroine against impossible odds while a crowd watches and bets.", color: "#EF4444", r: 239, g: 68, b: 68, pageId: "arena-mode" },
            { icon: "⚔️", title: "GLADIATOR PROTOCOL", badge: "Two Heroines · Both Perspectives", desc: "Two captured heroines forced to compete. The AI writes both perspectives alternating paragraph by paragraph. Stakes are real. The designer watches.", color: "#EF4444", r: 239, g: 68, b: 68, pageId: "gladiator-protocol" },
            { icon: "🎲", title: "BETTING POOL", badge: "Wager · Live Odds", desc: "Her fate decided by strangers placing bets in real time. Live odds, rising wagers, one winner takes all.", color: "#34D399", r: 52, g: 211, b: 153, pageId: "betting-pool" },
            { icon: "🔓", title: "PUBLIC PROPERTY", badge: "Exposed · Open Access", desc: "Exposed, available, owned. The villain strips away every boundary while the world watches and does nothing.", color: "#FBBF24", r: 251, g: 191, b: 36, pageId: "public-property" },
            { icon: "🤝", title: "VILLAIN TEAM-UP", badge: "Duo Villain · Conflict", desc: "Two villains, one objective. The heroine faces double the cunning and not a shred of mercy between them.", color: "#F87171", r: 248, g: 113, b: 113, pageId: "villain-team-up" },
          ]}
        />
      )}

      {page === "campaign-mode" && (
        <CampaignMode onBack={() => navigate("home")} />
      )}

      {page === "villain-hub" && (
        <VillainHub onBack={() => navigate("home")} />
      )}

      {page === "research-facility" && (
        <ResearchFacilityMode onBack={backFromMode} />
      )}

      {page === "gladiator-protocol" && (
        <GladiatorProtocolMode onBack={backFromMode} />
      )}

      {page === "the-witness" && (
        <TheWitnessMode onBack={backFromMode} />
      )}

      {page === "sleeper-protocol" && (
        <SleeperProtocolMode onBack={backFromMode} />
      )}

      {page === "auction-block" && (
        <AuctionBlockMode onBack={backFromMode} />
      )}

      {page === "captivity-hub" && (
        <GenericHub
          title="CAPTIVITY ARCS" icon="⛓" accent="#34D399"
          subtitle="LONG-FORM · ARC MODES · 11 MODES"
          tagline="Eleven modes for long-form captivity — conditioning, erosion, transfer, sleeper protocols, psychological observation, and the slow collapse of resistance."
          onBack={() => navigate("home")}
          onSelectMode={(id) => enterFromHub("captivity-hub", id as Page)}
          modes={[
            { icon: "🌑", title: "CORRUPTION ARC", badge: "7 Chapters · Arc", desc: "Seven chapters. One slow-burn transformation from defiance to devotion the heroine never saw coming.", color: "#F472B6", r: 244, g: 114, b: 182, pageId: "corruption-arc" },
            { icon: "📋", title: "OBEDIENCE TRAINING", badge: "Session · Tracked", desc: "Structured sessions, tracked progress. The villain reshapes behavior with clinical precision and patience.", color: "#2DD4BF", r: 45, g: 212, b: 191, pageId: "obedience-training" },
            { icon: "⏳", title: "THE LONG GAME", badge: "Long Burn · Chapters", desc: "Months of slow manipulation. No rush, no force — just patience, proximity, and inevitability.", color: "#C084FC", r: 168, g: 85, b: 247, pageId: "long-game" },
            { icon: "🔗", title: "CHAIN OF CUSTODY", badge: "Transfer · Multi-Arc", desc: "Passed between captors. Each handler leaves their mark before the transfer. None leave empty-handed.", color: "#60A5FA", r: 96, g: 165, b: 250, pageId: "chain-of-custody" },
            { icon: "🕯️", title: "SLOW BURN", badge: "Day by Day · Captivity", desc: "Each chapter is a new day. Track weeks of captivity in intimate increments — no action, just the slow erosion of will.", color: "#7C3AED", r: 124, g: 58, b: 237, pageId: "slow-burn" },
            { icon: "🕵", title: "SLEEPER PROTOCOL", badge: "Dual Track · Public/Private", desc: "Conditioned and returned undetected. The story alternates between her normal life and her activated self. Her team has no idea.", color: "#34D399", r: 52, g: 211, b: 153, pageId: "sleeper-protocol" },
            { icon: "👁", title: "THE WITNESS", badge: "Pure Psychology · Observer POV", desc: "She cannot intervene. She can only watch. Written entirely from the witness's perspective — her helplessness, her horror, what watching someone she knows breaks in her.", color: "#A78BFA", r: 167, g: 139, b: 250, pageId: "the-witness" },
            { icon: "⛓", title: "DUAL CAPTURE", badge: "Duo · Shared Cell", desc: "Two heroines, one cell. Shared captivity breeds desperation — and bonds neither expected.", color: "#34D399", r: 52, g: 211, b: 153, pageId: "dual-capture" },
            { icon: "🗡", title: "MASS CAPTURE", badge: "Group · 3–5 Heroines", desc: "Three to five heroines swept up in one operation. The villain's greatest conquest — delivered all at once.", color: "#F87171", r: 248, g: 113, b: 113, pageId: "mass-capture" },
            { icon: "⚔️", title: "FACTION WAR", badge: "5 Factions · Dark Alliance", desc: "Avengers vs HYDRA. Justice League vs Gotham Rogues. The Guild vs the Sith. Pick two factions and write the conflict.", color: "#C8A830", r: 200, g: 168, b: 75, pageId: "faction-mode" },
            { icon: "⟴", title: "SEQUEL GENERATOR", badge: "Archive · New Chapter", desc: "A story from your archive earns a new chapter. The villain returns, wiser and far more prepared than before.", color: "#F59E0B", r: 245, g: 158, b: 11, pageId: "sequel-generator" },
          ]}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DirectorProvider>
        <Suspense fallback={<PageLoader />}>
          <AppInner />
        </Suspense>
      </DirectorProvider>
    </ThemeProvider>
  );
}
