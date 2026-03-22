import { useState, useRef } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

interface CelebrityModeProps { onBack: () => void; }

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

// ── Actresses ────────────────────────────────────────────────────
const ACTRESSES = [
  { name: "Scarlett Johansson",   known: "Avengers, Lost in Translation" },
  { name: "Jennifer Lawrence",    known: "Hunger Games, Silver Linings Playbook" },
  { name: "Margot Robbie",        known: "Barbie, Harley Quinn, Wolf of Wall Street" },
  { name: "Gal Gadot",            known: "Wonder Woman, Fast & Furious" },
  { name: "Ana de Armas",         known: "Knives Out, No Time to Die, Blonde" },
  { name: "Zendaya",              known: "Euphoria, Dune, Spiderman" },
  { name: "Angelina Jolie",       known: "Tomb Raider, Maleficent, Mr & Mrs Smith" },
  { name: "Jennifer Lopez",       known: "Selena, Hustlers, global superstar" },
  { name: "Beyoncé",              known: "Dreamgirls, Lemonade, global icon" },
  { name: "Selena Gomez",         known: "Spring Breakers, Only Murders, pop star" },
  { name: "Ariana Grande",        known: "Victorious, Wicked, pop megastar" },
  { name: "Megan Fox",            known: "Transformers, Jennifer's Body, Midnight in the Switchgrass" },
  { name: "Emma Watson",          known: "Harry Potter, Beauty & the Beast, The Perks" },
  { name: "Emma Stone",           known: "La La Land, Poor Things, Easy A" },
  { name: "Charlize Theron",      known: "Monster, Atomic Blonde, Mad Max" },
  { name: "Halle Berry",          known: "X-Men, Die Another Day, Monster's Ball" },
  { name: "Natalie Portman",      known: "Black Swan, Star Wars, Thor" },
  { name: "Sofia Vergara",        known: "Modern Family, Griselda" },
  { name: "Priyanka Chopra",      known: "Quantico, Baywatch, Bollywood legend" },
  { name: "Blake Lively",         known: "Gossip Girl, The Shallows, A Simple Favor" },
  { name: "Olivia Wilde",         known: "House, Booksmart, Don't Worry Darling" },
  { name: "Salma Hayek",          known: "Frida, Desperado, From Dusk Till Dawn" },
  { name: "Eva Longoria",         known: "Desperate Housewives, Over Her Dead Body" },
  { name: "Jessica Alba",         known: "Dark Angel, Fantastic Four, Sin City" },
  { name: "Mila Kunis",           known: "Black Swan, That '70s Show, Friends with Benefits" },
  { name: "Monica Bellucci",      known: "Matrix Reloaded, Spectre, Malèna" },
  { name: "Penélope Cruz",        known: "Vicky Cristina Barcelona, Pirates, Volver" },
  { name: "Eva Mendes",           known: "Training Day, Ghost Rider, Hitch" },
  { name: "Kate Upton",           known: "Tower Heist, The Other Woman, supermodel" },
  { name: "Sydney Sweeney",       known: "Euphoria, White Lotus, Anyone But You" },
  { name: "Anya Taylor-Joy",      known: "The Queen's Gambit, The Menu, Last Night in Soho" },
  { name: "Florence Pugh",        known: "Midsommar, Black Widow, Little Women" },
  { name: "Keira Knightley",      known: "Pirates of the Caribbean, Atonement, Pride & Prejudice" },
  { name: "Nicole Kidman",        known: "Moulin Rouge, Eyes Wide Shut, Big Little Lies" },
  { name: "Jennifer Aniston",     known: "Friends, Horrible Bosses, The Morning Show" },
  { name: "Cameron Diaz",         known: "There's Something About Mary, Charlie's Angels, The Mask" },
  { name: "Anne Hathaway",        known: "Devil Wears Prada, Dark Knight Rises, Interstellar" },
  { name: "Sandra Bullock",       known: "Speed, Miss Congeniality, Bird Box" },
  { name: "Amanda Seyfried",      known: "Mamma Mia, Mean Girls, Jennifer's Body" },
  { name: "Vanessa Hudgens",      known: "High School Musical, Spring Breakers, Bad Boys" },
  { name: "Hilary Duff",          known: "Lizzie McGuire, A Cinderella Story, How I Met Your Father" },
  { name: "Jessica Biel",         known: "7th Heaven, Texas Chainsaw Massacre, The Sinner" },
  { name: "Nina Dobrev",          known: "The Vampire Diaries, The Final Girls, Flatliners" },
  { name: "Emilia Clarke",        known: "Game of Thrones — Daenerys, Me Before You" },
  { name: "Sophie Turner",        known: "Game of Thrones — Sansa, X-Men Apocalypse" },
  { name: "Lucy Hale",            known: "Pretty Little Liars, Katy Keene, Truth or Dare" },
  { name: "Shay Mitchell",        known: "Pretty Little Liars, You, Dollface" },
  { name: "Victoria Justice",     known: "Victorious, Zoey 101, Frame of Mind" },
  { name: "Adriana Lima",         known: "Victoria's Secret Angel, Victoria's Secret Fashion Show icon" },
  { name: "Candice Swanepoel",    known: "Victoria's Secret Angel, global supermodel" },
  { name: "Bar Refaeli",          known: "Israeli supermodel, Sports Illustrated Swimsuit" },
  { name: "Deepika Padukone",     known: "Padmaavat, Chennai Express, xXx Return of Xander Cage" },
  { name: "Katrina Kaif",         known: "Tiger Zinda Hai, Jab Tak Hai Jaan, Bollywood star" },
  { name: "Aishwarya Rai",        known: "Devdas, Jodhaa Akbar, former Miss World" },
  { name: "Kim Kardashian",       known: "KUWTK, American Horror Story, global celebrity" },
  { name: "Kendall Jenner",       known: "Keeping Up with the Kardashians, Vogue supermodel" },
  { name: "Bella Hadid",          known: "World's most beautiful woman, global supermodel" },
  { name: "Gigi Hadid",           known: "Victoria's Secret, global supermodel, Taylor Swift squad" },
  { name: "Miranda Kerr",         known: "Victoria's Secret, Kora Organics, SATC" },
  { name: "Cara Delevingne",      known: "Suicide Squad, Valerian, supermodel/actress" },
  { name: "Heidi Klum",           known: "Victoria's Secret, Project Runway, German supermodel" },
  { name: "Lily James",           known: "Cinderella, Mamma Mia 2, Downton Abbey, Pam & Tommy" },
  { name: "Hailee Steinfeld",     known: "True Grit, Bumblebee, Hawkeye, actress/singer" },
  { name: "Saoirse Ronan",        known: "Lady Bird, Little Women, Atonement" },
  { name: "Brie Larson",          known: "Captain Marvel, Room, Scott Pilgrim" },
  { name: "Chloe Grace Moretz",   known: "Hit-Girl, Carrie, If I Stay, Let Me In" },
  { name: "Karen Gillan",         known: "Nebula, Doctor Who, Jumanji" },
  { name: "Gemma Chan",           known: "Eternals, Crazy Rich Asians, Humans" },
  { name: "Jenna Ortega",         known: "Wednesday, Scream, You, X" },
  { name: "Dove Cameron",         known: "Descendants, Liv and Maddie, Powerpuff Girls" },
  { name: "Dua Lipa",             known: "Argylle, pop superstar, fashion icon" },
  { name: "Rihanna",              known: "Battleship, Ocean's 8, global music & fashion icon" },
  { name: "Shakira",              known: "Zootopia, global singer, World Cup 2010" },
  { name: "Taylor Swift",         known: "Amsterdam, global music megastar" },
  { name: "Camila Cabello",       known: "Cinderella, pop star" },
  { name: "Sabrina Carpenter",    known: "Girl Meets World, rising pop star" },
  { name: "Jessica Simpson",      known: "The Dukes of Hazzard, pop star" },
  { name: "Paris Hilton",         known: "The Simple Life, Stars Are Blind, businesswoman" },
  { name: "Britney Spears",       known: "Crossroads, global pop icon" },
  { name: "Pamela Anderson",      known: "Baywatch, Barb Wire, cultural icon" },
  { name: "Drew Barrymore",       known: "Charlie's Angels, Never Been Kissed, 50 First Dates" },
  { name: "Reese Witherspoon",    known: "Legally Blonde, Election, Wild, Big Little Lies" },
  { name: "Lindsay Lohan",        known: "Mean Girls, Freaky Friday, The Parent Trap" },
  { name: "Kirsten Dunst",        known: "Spider-Man's MJ, Bring It On, Melancholia" },
  { name: "Eliza Dushku",         known: "Buffy's Faith, Dollhouse, True Lies" },
  { name: "Milla Jovovich",       known: "Resident Evil, The Fifth Element, Zoolander" },
  { name: "Michelle Rodriguez",   known: "Fast & Furious, Avatar, Girlfight" },
  { name: "Rosario Dawson",       known: "Daredevil, Seven Pounds, Dopesick" },
  { name: "Zoe Saldana",          known: "Gamora, Neytiri, Uhura — three of the biggest franchises" },
  { name: "Kerry Washington",     known: "Scandal, Django Unchained, Little Fires Everywhere" },
  { name: "Lupita Nyong'o",       known: "12 Years a Slave, Black Panther, Us" },
  { name: "Viola Davis",          known: "HTGAWM, The Help, Ma Rainey's Black Bottom" },
  { name: "Taraji P. Henson",     known: "Empire, Hidden Figures, Benjamin Button" },
  { name: "Halle Bailey",         known: "The Little Mermaid, Grown-ish, Beyoncé protégé" },
  { name: "Kat Dennings",         known: "2 Broke Girls, Thor's Darcy, WandaVision" },
  { name: "Christina Hendricks",  known: "Mad Men, Good Girls, Firefly" },
  { name: "Alexandra Daddario",   known: "True Detective, Percy Jackson, Baywatch" },
  { name: "Morena Baccarin",      known: "Homeland, Firefly, Deadpool's Vanessa" },
  { name: "Olivia Munn",          known: "The Newsroom, X-Men Apocalypse, Iron Man 2" },
  { name: "Elisha Cuthbert",      known: "24, The Girl Next Door, Happy Endings" },
  { name: "Megan Good",           known: "Deception, Shazam!, Think Like a Man" },
  { name: "Eva Green",            known: "Casino Royale, Penny Dreadful, 300: Rise of an Empire" },
];

// ── Captor Archetypes ─────────────────────────────────────────────
const CAPTOR_ARCHETYPES = [
  { id: "director",   label: "The Director",      icon: "🎬", profile: "A powerful Hollywood executive who believes his industry position entitles him to anything — and anyone.", motivation: "Power", methods: ["Manipulation", "Isolation", "Coercion"] },
  { id: "billionaire",label: "The Billionaire",   icon: "💰", profile: "An ultra-wealthy collector who treats people as acquisitions. Polished, patient, and absolutely ruthless when denied.", motivation: "Collection", methods: ["Psychological", "Isolation", "Surveillance"] },
  { id: "agent",      label: "The Operative",     icon: "🕵️", profile: "A black-ops intelligence asset operating outside all oversight. Clinical, methodical, and trained to break anyone.", motivation: "Control", methods: ["Psychological", "Restraint", "Isolation"] },
  { id: "fan",        label: "The Obsessed Fan",  icon: "😈", profile: "Someone who crossed the line from admiration to obsession years ago. Knows everything about her. Has waited a very long time.", motivation: "Obsession", methods: ["Surveillance", "Psychological", "Coercion"] },
  { id: "boss",       label: "The Crime Boss",    icon: "🔫", profile: "Head of a criminal organization. Calm, calculated, and accustomed to having problems — and people — disposed of efficiently.", motivation: "Leverage", methods: ["Restraint", "Coercion", "Psychological"] },
  { id: "rival",      label: "The Rival",         icon: "🤝", profile: "Someone from the same world — industry, social circle, or career — eaten alive by jealousy and the need to watch her fall.", motivation: "Revenge", methods: ["Manipulation", "Psychological", "Coercion"] },
  { id: "custom",     label: "Custom Captor",     icon: "◈", profile: "", motivation: "", methods: [] },
];

const MOTIVATIONS = ["Obsession", "Power", "Control", "Revenge", "Ransom", "Collection", "Leverage", "Rivalry", "Desire", "Sport"];
const METHODS = ["Psychological", "Isolation", "Restraint", "Manipulation", "Coercion", "Surveillance", "Seduction", "Blackmail"];

const SETTINGS = [
  { id: "jet",        label: "Private Jet — Mid-Flight",    icon: "✈️" },
  { id: "penthouse",  label: "Luxury Penthouse Suite",      icon: "🏙️" },
  { id: "villa",      label: "Remote Isolated Villa",       icon: "🏡" },
  { id: "backlot",    label: "Studio Backlot — After Hours",icon: "🎬" },
  { id: "bunker",     label: "Underground Bunker",          icon: "🔒" },
  { id: "yacht",      label: "Superyacht at Sea",           icon: "⛵" },
  { id: "mountain",   label: "Mountain Retreat",            icon: "🏔️" },
  { id: "island",     label: "Private Island",              icon: "🏝️" },
  { id: "limo",       label: "Limousine — Moving Vehicle",  icon: "🚗" },
  { id: "hotel",      label: "5-Star Hotel Room",           icon: "🛎️" },
];

const ENCOUNTERS = [
  { id: "trap",       label: "Seduction & Trap" },
  { id: "abduction",  label: "Sudden Abduction" },
  { id: "contract",   label: "Contract Gone Wrong" },
  { id: "blackmail",  label: "Blackmail Escalation" },
  { id: "ambush",     label: "VIP Event Ambush" },
  { id: "onset",      label: "On-Set Incident" },
  { id: "online",     label: "Digital Stalker Manifests" },
  { id: "insider",    label: "Trusted Person Betrays Her" },
];

const TONES = [
  { id: "thriller",   label: "Dark Thriller" },
  { id: "power",      label: "Power Exchange" },
  { id: "psych",      label: "Psychological Pressure" },
  { id: "action",     label: "Action & Danger" },
  { id: "slow",       label: "Slow Burn" },
  { id: "explicit",   label: "Explicit & Unhinged" },
];

const LENGTHS = [
  { id: "quick",  label: "Quick Strike",  desc: "2–3 paragraphs" },
  { id: "standard",label: "Standard",    desc: "5–6 paragraphs" },
  { id: "epic",   label: "Epic",         desc: "9–10 paragraphs" },
];

type Step = 1 | 2 | 3 | 4;

interface CaptorState {
  presetId: string;
  name: string;
  profile: string;
  motivation: string;
  methods: string[];
  rules: string;
}

function defaultCaptor(): CaptorState {
  return { presetId: "", name: "", profile: "", motivation: "", methods: [], rules: "" };
}

function applyPreset(preset: typeof CAPTOR_ARCHETYPES[0]): CaptorState {
  return {
    presetId: preset.id,
    name: preset.label,
    profile: preset.profile,
    motivation: preset.motivation,
    methods: [...preset.methods],
    rules: "",
  };
}

export default function CelebrityMode({ onBack }: CelebrityModeProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<Step>(1);
  const [search, setSearch] = useState("");
  const [selectedActresses, setSelectedActresses] = useState<typeof ACTRESSES>([]);
  const [captorMode, setCaptorMode] = useState<"solo" | "team">("solo");
  const [captors, setCaptors] = useState<CaptorState[]>([defaultCaptor()]);
  const [selectedSetting, setSelectedSetting] = useState("");
  const [selectedEncounter, setSelectedEncounter] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedLength, setSelectedLength] = useState("standard");
  const [extraDetails, setExtraDetails] = useState("");
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [continueDir, setContinueDir] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const API = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";
  const filtered = ACTRESSES.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.known.toLowerCase().includes(search.toLowerCase()));

  function toggleActress(a: typeof ACTRESSES[0]) {
    setSelectedActresses(prev => prev.some(x => x.name === a.name)
      ? prev.filter(x => x.name !== a.name)
      : prev.length < 3 ? [...prev, a] : prev);
  }

  function setCaptor(idx: number, patch: Partial<CaptorState>) {
    setCaptors(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  }

  function addCaptor() {
    if (captors.length < 3) setCaptors(prev => [...prev, defaultCaptor()]);
  }

  function removeCaptor(idx: number) {
    setCaptors(prev => prev.filter((_, i) => i !== idx));
  }

  function toggleCaptorMethod(idx: number, method: string) {
    setCaptors(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      const methods = c.methods.includes(method)
        ? c.methods.filter(m => m !== method)
        : [...c.methods, method];
      return { ...c, methods };
    }));
  }

  function canProceed1() { return selectedActresses.length > 0; }
  function canProceed2() { return captors.every(c => c.name.trim()); }
  function canProceed3() { return !!selectedSetting && !!selectedEncounter && !!selectedTone; }

  async function generateStory() {
    setIsGenerating(true);
    setError("");
    setStory("");
    try {
      const captorDesc = captors.map(c => `${c.name}: ${c.profile} | Motivation: ${c.motivation} | Methods: ${c.methods.join(", ")}${c.rules ? ` | Rules: ${c.rules}` : ""}`).join(" | AND SECOND CAPTOR: ");
      const actressDesc = selectedActresses.map(a => `${a.name} (known for: ${a.known})`).join(" & ");
      const settingLabel = SETTINGS.find(s => s.id === selectedSetting)?.label ?? selectedSetting;
      const encounterLabel = ENCOUNTERS.find(e => e.id === selectedEncounter)?.label ?? selectedEncounter;
      const toneLabel = TONES.find(t => t.id === selectedTone)?.label ?? selectedTone;
      const lengthLabel = LENGTHS.find(l => l.id === selectedLength)?.label ?? selectedLength;

      const body = {
        actress: actressDesc,
        captor: captorDesc,
        captorTeam: captors.length > 1,
        setting: settingLabel,
        encounter: encounterLabel,
        tone: toneLabel,
        storyLength: lengthLabel,
        extraDetails: extraDetails.trim() || undefined,
      };

      const response = await fetch(`${API}/story/celebrity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let acc = "";
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) { acc += data.chunk; setStory(acc); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }
            if (data.done) { setChapters([acc]); setStep(4); }
            if (data.error) { setError(data.error); }
          } catch {}
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function continueStory() {
    setIsGenerating(true);
    setError("");
    const next = "";
    try {
      const captorDesc = captors.map(c => c.name).join(" & ");
      const actressDesc = selectedActresses.map(a => a.name).join(" & ");
      const body = {
        previousStory: chapters.join("\n\n---\n\n"),
        chapterNumber: chapters.length + 1,
        actress: actressDesc,
        captor: captorDesc,
        tone: TONES.find(t => t.id === selectedTone)?.label ?? "",
        continueDirection: continueDir.trim() || undefined,
      };
      const response = await fetch(`${API}/story/celebrity-continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let acc = "";
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) { acc += data.chunk; setStory(prev => prev + acc.slice(prev.length - (chapters.join("\n\n---\n\n").length))); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }
            if (data.done) { setChapters(prev => [...prev, acc]); setContinueDir(""); }
            if (data.error) setError(data.error);
          } catch {}
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setIsGenerating(false);
    }
  }

  function resetAll() {
    setStep(1); setStory(""); setChapters([]); setSelectedActresses([]);
    setCaptors([defaultCaptor()]); setSelectedSetting(""); setSelectedEncounter("");
    setSelectedTone(""); setExtraDetails(""); setError("");
  }

  const gold = "#C8A84B";
  const goldDim = "rgba(200,168,75,0.55)";
  const goldBg = "rgba(200,168,75,0.1)";
  const cardBg = "rgba(0,0,0,0.45)";
  const border = "rgba(200,168,75,0.15)";
  const borderHov = "rgba(200,168,75,0.4)";

  const btnStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, rgba(200,168,75,0.9), rgba(160,120,40,0.9))`,
    border: "none", borderRadius: "10px", padding: "0.875rem 2.5rem",
    color: "#0a0a0a", fontFamily: "'Cinzel', serif", fontSize: "0.75rem",
    fontWeight: 700, letterSpacing: "2px", cursor: "pointer",
    textTransform: "uppercase" as const, transition: "all 0.2s",
  };

  const stepLabels = ["Actress", "Captor", "Scenario", "Story"];

  return (
    <div style={{ minHeight: "100vh", padding: isMobile ? "1rem" : "2rem", fontFamily: "'Raleway', sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid rgba(200,168,75,0.2)`, borderRadius: "8px", padding: "0.5rem 1rem", color: goldDim, fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "2px", cursor: "pointer" }}>← BACK</button>
        <div>
          <div style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontFamily: "'Cinzel', serif", color: gold, fontWeight: 700, letterSpacing: "4px" }}>CELEBRITY CAPTIVE</div>
          <div style={{ fontSize: "0.6rem", color: goldDim, letterSpacing: "3px", textTransform: "uppercase" }}>Actress Archive · Captor Configuration · Scenario Engine</div>
        </div>
      </div>

      {/* Step indicator */}
      {step < 4 && (
        <div style={{ display: "flex", gap: "0", marginBottom: "2rem", background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", overflow: "hidden" }}>
          {stepLabels.map((label, i) => {
            const n = (i + 1) as Step;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} style={{ flex: 1, padding: "0.875rem", textAlign: "center", background: active ? goldBg : done ? "rgba(200,168,75,0.05)" : "transparent", borderRight: i < 3 ? `1px solid ${border}` : "none", transition: "all 0.2s", cursor: done ? "pointer" : "default" }}
                onClick={() => done && setStep(n as Step)}>
                <div style={{ fontSize: "0.55rem", color: active ? gold : done ? goldDim : "rgba(200,200,220,0.25)", letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>{`0${i + 1}`}</div>
                <div style={{ fontSize: isMobile ? "0.6rem" : "0.7rem", color: active ? gold : done ? goldDim : "rgba(200,200,220,0.25)", fontFamily: "'Cinzel', serif", marginTop: "2px" }}>{label}</div>
                {done && <div style={{ fontSize: "0.55rem", color: "rgba(200,168,75,0.4)", marginTop: "2px" }}>✓</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── STEP 1: Actress Selection ── */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: "0.6rem", color: goldDim, letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem" }}>
            Select up to 3 actresses · {ACTRESSES.length} in archive
          </div>

          {/* Selected chips */}
          {selectedActresses.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem", background: cardBg, border: `1px solid ${border}`, borderRadius: "12px", padding: "0.875rem" }}>
              <span style={{ fontSize: "0.6rem", color: goldDim, letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif", alignSelf: "center" }}>{selectedActresses.length} selected</span>
              {selectedActresses.map(a => (
                <button key={a.name} onClick={() => toggleActress(a)}
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", background: goldBg, border: `1px solid ${gold}55`, borderRadius: "20px", cursor: "pointer", color: "inherit" }}>
                  <span style={{ fontSize: "0.7rem", color: gold, fontFamily: "'Cinzel', serif" }}>{a.name}</span>
                  <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)" }}>✕</span>
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "1.25rem" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: goldDim, fontSize: "0.9rem", pointerEvents: "none" }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or known for…"
              style={{ width: "100%", background: cardBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "0.75rem 1rem 0.75rem 2.5rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.currentTarget.style.borderColor = borderHov}
              onBlur={e => e.currentTarget.style.borderColor = border}
            />
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "130px" : "175px"}, 1fr))`, gap: "0.625rem", maxHeight: "560px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: `rgba(200,168,75,0.25) transparent` }}>
            {filtered.map(actress => {
              const isSelected = selectedActresses.some(x => x.name === actress.name);
              const slug = nameToSlug(actress.name);
              return (
                <button key={actress.name} onClick={() => toggleActress(actress)}
                  style={{ background: isSelected ? "rgba(200,168,75,0.18)" : cardBg, border: `1px solid ${isSelected ? gold + "88" : border}`, borderRadius: "14px", padding: "0", overflow: "hidden", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit", boxShadow: isSelected ? `0 0 18px rgba(200,168,75,0.3)` : "none" }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = borderHov; e.currentTarget.style.background = goldBg; } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = cardBg; } }}>
                  {/* Portrait */}
                  <div style={{ width: "100%", aspectRatio: "3/4", background: "rgba(0,0,0,0.6)", overflow: "hidden", position: "relative" }}>
                    <img src={`/celebrities/${slug}.png`} alt={actress.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={e => { e.currentTarget.style.display = "none"; }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)" }} />
                    {isSelected && (
                      <div style={{ position: "absolute", top: "8px", right: "8px", width: "22px", height: "22px", background: gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#000", fontWeight: 700 }}>✓</div>
                    )}
                  </div>
                  <div style={{ padding: "0.625rem" }}>
                    <div style={{ fontSize: isMobile ? "0.65rem" : "0.7rem", fontFamily: "'Cinzel', serif", color: isSelected ? gold : "#E8E8F5", fontWeight: 600, lineHeight: 1.3, marginBottom: "0.25rem" }}>{actress.name}</div>
                    <div style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.35)", lineHeight: 1.4, fontFamily: "'Montserrat', sans-serif" }}>{actress.known.split(",")[0]}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setStep(2)} disabled={!canProceed1()} style={{ ...btnStyle, opacity: canProceed1() ? 1 : 0.35, cursor: canProceed1() ? "pointer" : "not-allowed" }}>
              Configure Captor →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Captor Configuration ── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ fontSize: "0.6rem", color: goldDim, letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            Configure who takes her — and how they operate
          </div>

          {/* Solo / Team toggle */}
          <div style={{ display: "flex", background: cardBg, border: `1px solid ${border}`, borderRadius: "10px", overflow: "hidden", width: "fit-content" }}>
            {(["solo", "team"] as const).map(m => (
              <button key={m} onClick={() => { setCaptorMode(m); if (m === "solo") setCaptors(prev => [prev[0]]); else if (captors.length === 1) addCaptor(); }}
                style={{ padding: "0.6rem 1.5rem", background: captorMode === m ? goldBg : "transparent", border: "none", borderRight: m === "solo" ? `1px solid ${border}` : "none", color: captorMode === m ? gold : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.2s" }}>
                {m === "solo" ? "Solo Captor" : "Captor Team (2–3)"}
              </button>
            ))}
          </div>

          {/* Captor slots */}
          {captors.map((captor, idx) => (
            <div key={idx} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.55rem", color: gold, letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
                  {captors.length > 1 ? `◈ Captor ${idx + 1}` : "◈ The Captor"}
                </div>
                {captors.length > 1 && <button onClick={() => removeCaptor(idx)} style={{ background: "none", border: `1px solid rgba(200,0,50,0.2)`, borderRadius: "6px", padding: "0.25rem 0.5rem", color: "rgba(200,0,50,0.5)", fontSize: "0.6rem", cursor: "pointer" }}>Remove</button>}
              </div>

              {/* Archetype selector */}
              <div>
                <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Archetype</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {CAPTOR_ARCHETYPES.map(preset => (
                    <button key={preset.id} onClick={() => {
                      if (preset.id === "custom") { setCaptor(idx, { presetId: "custom", name: "", profile: "", motivation: "", methods: [], rules: "" }); }
                      else { setCaptor(idx, applyPreset(preset)); }
                    }}
                      style={{ padding: "0.35rem 0.75rem", background: captor.presetId === preset.id ? goldBg : "rgba(0,0,0,0.4)", border: `1px solid ${captor.presetId === preset.id ? gold + "66" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: captor.presetId === preset.id ? gold : "rgba(200,200,220,0.35)", fontSize: "0.62rem", fontFamily: "'Montserrat', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
                      {preset.icon} {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Name / Alias <span style={{ color: "#FF4060" }}>*</span></label>
                <input value={captor.name} onChange={e => setCaptor(idx, { name: e.target.value })}
                  placeholder="e.g. Victor Hale, The Architect, Mr. Black…"
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: `1px solid ${border}`, borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.currentTarget.style.borderColor = borderHov}
                  onBlur={e => e.currentTarget.style.borderColor = border}
                />
              </div>

              {/* Profile (shown for custom; read-only for presets) */}
              <div>
                <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Profile</label>
                <textarea value={captor.profile} onChange={e => setCaptor(idx, { profile: e.target.value })} rows={2}
                  placeholder="Who are they? What drives them to do this?"
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: `1px solid ${border}`, borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}
                  onFocus={e => e.currentTarget.style.borderColor = borderHov}
                  onBlur={e => e.currentTarget.style.borderColor = border}
                />
              </div>

              {/* Motivation chips */}
              <div>
                <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Motivation</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {MOTIVATIONS.map(m => {
                    const sel = captor.motivation === m;
                    return <button key={m} onClick={() => setCaptor(idx, { motivation: m })}
                      style={{ padding: "0.28rem 0.65rem", background: sel ? goldBg : "rgba(0,0,0,0.4)", border: `1px solid ${sel ? gold + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: sel ? gold : "rgba(200,200,220,0.35)", fontSize: "0.62rem", fontFamily: "'Montserrat', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>{m}</button>;
                  })}
                </div>
              </div>

              {/* Methods chips */}
              <div>
                <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Methods</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {METHODS.map(m => {
                    const sel = captor.methods.includes(m);
                    return <button key={m} onClick={() => toggleCaptorMethod(idx, m)}
                      style={{ padding: "0.28rem 0.65rem", background: sel ? goldBg : "rgba(0,0,0,0.4)", border: `1px solid ${sel ? gold + "55" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: sel ? gold : "rgba(200,200,220,0.35)", fontSize: "0.62rem", fontFamily: "'Montserrat', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>{m}</button>;
                  })}
                </div>
              </div>

              {/* Rules */}
              <div>
                <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>One Rule They Won't Break</label>
                <input value={captor.rules} onChange={e => setCaptor(idx, { rules: e.target.value })}
                  placeholder="e.g. never leaves a mark, never reveals their identity, never lets her sleep…"
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: `1px solid ${border}`, borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.currentTarget.style.borderColor = borderHov}
                  onBlur={e => e.currentTarget.style.borderColor = border}
                />
              </div>
            </div>
          ))}

          {/* Add captor button (team mode) */}
          {captorMode === "team" && captors.length < 3 && (
            <button onClick={addCaptor}
              style={{ background: "transparent", border: `1px dashed ${gold}44`, borderRadius: "12px", padding: "0.875rem", color: goldDim, fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "2px", cursor: "pointer", transition: "all 0.2s" }}>
              + Add Another Captor
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} style={{ ...btnStyle, background: "rgba(0,0,0,0.4)", border: `1px solid ${border}`, color: goldDim }}>← Back</button>
            <button onClick={() => setStep(3)} disabled={!canProceed2()} style={{ ...btnStyle, opacity: canProceed2() ? 1 : 0.35, cursor: canProceed2() ? "pointer" : "not-allowed" }}>Set Scenario →</button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Scenario Setup ── */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <div style={{ fontSize: "0.6rem", color: goldDim, letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            Set the scene — where, how, and in what tone
          </div>

          {/* Setting */}
          <div>
            <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.75rem" }}>Setting <span style={{ color: "#FF4060" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "150px" : "220px"}, 1fr))`, gap: "0.5rem" }}>
              {SETTINGS.map(s => (
                <button key={s.id} onClick={() => setSelectedSetting(s.id)}
                  style={{ background: selectedSetting === s.id ? goldBg : cardBg, border: `1px solid ${selectedSetting === s.id ? gold + "66" : border}`, borderRadius: "10px", padding: "0.75rem 1rem", cursor: "pointer", textAlign: "left", color: "inherit", transition: "all 0.18s" }}>
                  <div style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>{s.icon}</div>
                  <div style={{ fontSize: "0.68rem", color: selectedSetting === s.id ? gold : "#E8E8F5", fontFamily: "'Cinzel', serif" }}>{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Encounter type */}
          <div>
            <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.75rem" }}>How It Begins <span style={{ color: "#FF4060" }}>*</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {ENCOUNTERS.map(e => (
                <button key={e.id} onClick={() => setSelectedEncounter(e.id)}
                  style={{ padding: "0.45rem 1rem", background: selectedEncounter === e.id ? goldBg : cardBg, border: `1px solid ${selectedEncounter === e.id ? gold + "66" : border}`, borderRadius: "20px", color: selectedEncounter === e.id ? gold : "rgba(200,200,220,0.45)", fontSize: "0.68rem", fontFamily: "'Montserrat', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.75rem" }}>Tone <span style={{ color: "#FF4060" }}>*</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {TONES.map(t => (
                <button key={t.id} onClick={() => setSelectedTone(t.id)}
                  style={{ padding: "0.45rem 1rem", background: selectedTone === t.id ? goldBg : cardBg, border: `1px solid ${selectedTone === t.id ? gold + "66" : border}`, borderRadius: "20px", color: selectedTone === t.id ? gold : "rgba(200,200,220,0.45)", fontSize: "0.68rem", fontFamily: "'Montserrat', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.75rem" }}>Story Length</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {LENGTHS.map(l => (
                <button key={l.id} onClick={() => setSelectedLength(l.id)}
                  style={{ padding: "0.6rem 1.25rem", background: selectedLength === l.id ? goldBg : cardBg, border: `1px solid ${selectedLength === l.id ? gold + "66" : border}`, borderRadius: "10px", color: "inherit", cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}>
                  <div style={{ fontSize: "0.68rem", color: selectedLength === l.id ? gold : "#E8E8F5", fontFamily: "'Cinzel', serif" }}>{l.label}</div>
                  <div style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Montserrat', sans-serif", marginTop: "2px" }}>{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Extra details */}
          <div>
            <label style={{ fontSize: "0.58rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Additional Details</label>
            <textarea value={extraDetails} onChange={e => setExtraDetails(e.target.value)} rows={3}
              placeholder="Any specific elements you want in the story — details, power dynamics, specific moments…"
              style={{ width: "100%", background: cardBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }}
              onFocus={e => e.currentTarget.style.borderColor = borderHov}
              onBlur={e => e.currentTarget.style.borderColor = border}
            />
          </div>

          {/* Summary card */}
          <div style={{ background: "rgba(200,168,75,0.05)", border: `1px solid ${border}`, borderRadius: "12px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ fontSize: "0.55rem", color: goldDim, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.25rem" }}>Story Setup</div>
            {selectedActresses.map(a => <div key={a.name} style={{ fontSize: "0.75rem", color: gold, fontFamily: "'Cinzel', serif" }}>◈ {a.name}</div>)}
            {captors.map((c, i) => <div key={i} style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Montserrat', sans-serif" }}>⬦ {c.name || "Unnamed captor"}</div>)}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} style={{ ...btnStyle, background: "rgba(0,0,0,0.4)", border: `1px solid ${border}`, color: goldDim }}>← Back</button>
            <button onClick={() => { setStep(4); generateStory(); }} disabled={!canProceed3()} style={{ ...btnStyle, opacity: canProceed3() ? 1 : 0.35, cursor: canProceed3() ? "pointer" : "not-allowed" }}>Generate Story →</button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Story Display ── */}
      {step === 4 && (
        <div>
          {/* Title bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.55rem", color: goldDim, letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>
                {selectedActresses.map(a => a.name).join(" & ")} · {captors.map(c => c.name).join(" & ")}
              </div>
              <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Cinzel', serif" }}>
                {SETTINGS.find(s => s.id === selectedSetting)?.label} · {TONES.find(t => t.id === selectedTone)?.label}
              </div>
            </div>
            <button onClick={resetAll} style={{ ...btnStyle, background: "rgba(0,0,0,0.4)", border: `1px solid ${border}`, color: goldDim, padding: "0.5rem 1rem", fontSize: "0.6rem" }}>New Session</button>
          </div>

          {/* Story */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "16px", padding: isMobile ? "1.25rem" : "2rem", minHeight: "300px", lineHeight: 1.9, fontFamily: "'Raleway', sans-serif", fontSize: isMobile ? "0.9rem" : "1rem", color: "#D8D8E8", whiteSpace: "pre-wrap", marginBottom: "1.5rem" }}>
            {isGenerating && !story && (
              <div style={{ color: goldDim, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "3px", textAlign: "center", paddingTop: "3rem" }}>
                <div style={{ marginBottom: "1rem" }}>◈ COMPOSING</div>
                <div style={{ fontSize: "0.55rem", color: "rgba(200,168,75,0.3)" }}>THE STORY IS BEING WRITTEN…</div>
              </div>
            )}
            {chapters.map((ch, i) => (
              <div key={i}>
                {chapters.length > 1 && <div style={{ fontSize: "0.6rem", color: goldDim, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.75rem", marginTop: i > 0 ? "2rem" : 0 }}>— CHAPTER {i + 1} —</div>}
                <div>{ch}</div>
                {i < chapters.length - 1 && <div style={{ borderTop: `1px solid ${border}`, margin: "2rem 0" }} />}
              </div>
            ))}
            {isGenerating && story && chapters.length === 0 && <div>{story}</div>}
            {error && <div style={{ color: "#FF6060", fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem" }}>Error: {error}</div>}
            <div ref={bottomRef} />
          </div>

          {/* Continue controls */}
          {!isGenerating && chapters.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input value={continueDir} onChange={e => setContinueDir(e.target.value)}
                placeholder="Steer the next chapter… or leave blank to escalate naturally"
                style={{ width: "100%", background: cardBg, border: `1px solid ${border}`, borderRadius: "10px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.currentTarget.style.borderColor = borderHov}
                onBlur={e => e.currentTarget.style.borderColor = border}
              />
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button onClick={continueStory} style={{ ...btnStyle }}>Continue Story →</button>
                <button onClick={resetAll} style={{ ...btnStyle, background: "rgba(0,0,0,0.4)", border: `1px solid ${border}`, color: goldDim }}>New Session</button>
              </div>
            </div>
          )}
          {isGenerating && <div style={{ color: goldDim, fontFamily: "'Montserrat', sans-serif", fontSize: "0.7rem", letterSpacing: "2px", textAlign: "center" }}>◈ writing…</div>}
        </div>
      )}
    </div>
  );
}
