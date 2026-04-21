import { useState, useRef } from "react";
import { saveStoryToArchive } from "../lib/archive";
import { buildVoiceInjection } from "../lib/villainVoices";
import StoryReader from "../components/StoryReader";

interface Props { onBack: () => void; }

interface CanonMoment {
  id: string;
  show: string;
  season: number;
  episode: string;
  title: string;
  what: string;
  canon: string;
  dark: string;
  villain: string;
  heroine: string;
  color: string;
}

const CANON_MOMENTS: CanonMoment[] = [
  { id: "sara-mirakuru", show: "ARROW", season: 2, episode: "S2E04", title: "SARA DOESN'T MAKE IT OUT", what: "Sara Lance's fate in the Mirakuru pit", canon: "Sara escapes the Queen's Gambit and joins the League of Assassins, eventually becoming a hero.", dark: "Sara doesn't escape. She survives the Mirakuru injection but is taken by the League — not recruited, but claimed. Ra's al Ghul keeps her for himself. This is what the 'price' looked like from the inside.", villain: "Ra's al Ghul", heroine: "Sara Lance", color: "#4ADE80" },
  { id: "laurel-undertaking", show: "ARROW", season: 1, episode: "S1E23", title: "LAUREL AND THE UNDERTAKING", what: "Malcolm Merlyn's Undertaking — Laurel's position", canon: "Laurel survives the Undertaking and eventually becomes Black Canary.", dark: "In the chaos of the Glades destruction, Malcolm Merlyn doesn't flee. He finds Laurel. He has always found her useful as leverage against Oliver. This is the night that usefulness becomes something else entirely.", villain: "Malcolm Merlyn", heroine: "Laurel Lance", color: "#4ADE80" },
  { id: "thea-darhk", show: "ARROW", season: 4, episode: "S4E09", title: "THEA IN DARHK'S HANDS", what: "Damien Darhk uses Thea as leverage against Oliver", canon: "Thea is briefly held by Darhk but is rescued. The magic interaction with her Lazarus blood creates complications.", dark: "Oliver doesn't come in time. Darhk doesn't want a quick exchange — he wants Oliver to understand what it means to lose something. Thea is kept. Darhk is fascinated by her Lazarus blood. He wants to understand what she is, and his methods of investigation are clinical and intimate.", villain: "Damien Darhk", heroine: "Thea Queen", color: "#4ADE80" },
  { id: "nyssa-league", show: "ARROW", season: 3, episode: "S3E20", title: "NYSSA'S SUBMISSION TO THE LEAGUE", what: "Nyssa's complicated relationship with Ra's al Ghul and her own authority", canon: "Nyssa defies her father repeatedly and eventually helps dismantle the League.", dark: "Ra's al Ghul decides that Nyssa's defiance has gone on long enough. He exercises the Demon's authority over his heir in a way that has never been written in League law but has always been understood. This is what it means to be the Demon's daughter.", villain: "Ra's al Ghul", heroine: "Nyssa al Ghul", color: "#4ADE80" },
  { id: "felicity-prometheus", show: "ARROW", season: 5, episode: "S5E23", title: "PROMETHEUS TAKES FELICITY", what: "Prometheus's psychological war against Oliver — using the people he loves", canon: "Prometheus captures Chase's son as leverage. Felicity works with the team to bring him down.", dark: "Prometheus's research into Oliver is forensic. He has studied everyone Oliver loves — and knows that Felicity is the one that would break him fastest. He doesn't want a hostage exchange. He wants Oliver to watch.", villain: "Prometheus", heroine: "Felicity Smoak", color: "#4ADE80" },
  { id: "iris-savitar", show: "THE FLASH", season: 3, episode: "S3E23", title: "SAVITAR TAKES IRIS", what: "Savitar's plan to kill Iris West — the Infantino Street arc", canon: "Team Flash works desperately to prevent Savitar's prophecy. They succeed, though HR Wells dies in the attempt.", dark: "The team is one second too slow. Savitar takes Iris — not to kill her yet. He wants Barry to experience the wait. The days Iris spends with Savitar before the deadline are not what Barry imagines. Savitar is, after all, Barry Allen. He knows exactly what Iris wants.", villain: "Savitar (Future Barry)", heroine: "Iris West-Allen", color: "#FCD34D" },
  { id: "caitlin-killer-frost", show: "THE FLASH", season: 3, episode: "S3E07", title: "KILLER FROST TAKES OVER", what: "Caitlin Snow's transformation into Killer Frost", canon: "Caitlin struggles to suppress Killer Frost. The dual identity causes ongoing conflict throughout Season 3.", dark: "Killer Frost doesn't stay suppressed. Caitlin loses the internal battle — and Killer Frost, finally in control, makes very different choices about what she wants. Including Savitar. Including herself. The things Caitlin would never allow, Killer Frost pursues without guilt.", villain: "Savitar", heroine: "Caitlin Snow / Killer Frost", color: "#FCD34D" },
  { id: "nora-cicada", show: "THE FLASH", season: 5, episode: "S5E11", title: "NORA AND CICADA'S DAGGER", what: "Cicada breaks Nora West-Allen's back, suppressing her speed force healing", canon: "Nora is badly injured but recovers. The team develops a method to fight Cicada.", dark: "Nora recovers. But the days she spends unable to run — the dagger's field still active, her healing suppressed — she spends in Cicada's custody. He has a daughter who was injured by a metahuman. He understands what it is to be helpless. He doesn't forgive it. But he understands it.", villain: "Cicada (Orlin Dwyer)", heroine: "Nora West-Allen", color: "#FCD34D" },
  { id: "jesse-zoom", show: "THE FLASH", season: 2, episode: "S2E22", title: "JESSE IN ZOOM'S LAIR", what: "Zoom holds Jesse Quick captive as leverage on Earth-2", canon: "Jesse is rescued. She later gains her own speed and becomes a hero.", dark: "Jesse's time in Zoom's lair is longer in this version. Hunter Zolomon is not a warden — he is a collector. He has kept Caitlin. He keeps Jesse for different reasons. Jesse's Earth-2 genius is something he wants to study. And break.", villain: "Zoom (Hunter Zolomon)", heroine: "Jesse Quick", color: "#FCD34D" },
  { id: "sara-legends-timemaster", show: "LEGENDS", season: 1, episode: "S1E03", title: "SARA AND THE TIMEMASTERS", what: "The Legends' encounter with the Timemasters — who are secretly working for Vandal Savage", canon: "The Legends escape Timemaster custody. Rip Hunter's plan is exposed as more complicated than it seemed.", dark: "Sara is separated from the group during the escape. The Timemasters who recapture her have very specific orders from Vandal Savage — she is not to be killed. She is to be kept. Savage wants Hawkgirl, but Sara is an adequate substitute for what he has planned.", villain: "Vandal Savage", heroine: "Sara Lance", color: "#FB923C" },
  { id: "kendra-savage", show: "LEGENDS", season: 1, episode: "S1E01", title: "KENDRA'S THOUSAND-YEAR HISTORY WITH SAVAGE", what: "Vandal Savage's obsession with Hawkgirl across 4,000 years", canon: "Kendra learns to control her wings and fights Savage across multiple time periods.", dark: "The Legends arrive at one of the pivot points — but not in time to stop Savage's ritual. This particular cycle ends differently. Kendra is taken. And Savage, for the first time in four thousand years, doesn't immediately kill her. He's tired of the loop. He wants something else this time.", villain: "Vandal Savage", heroine: "Kendra Saunders (Hawkgirl)", color: "#FB923C" },
  { id: "alex-deo", show: "SUPERGIRL", season: 3, episode: "S3E09", title: "ALEX AND THE WORLDKILLER DATA", what: "Alex Danvers investigating the Worldkiller program — putting herself in range of Reign", canon: "Alex's investigation helps the team understand Reign's origin and weaknesses.", dark: "Alex's investigation takes her to a DEO black site that Reign has already found. Reign is not interested in the data. She is interested in Supergirl's human sister — and what her pain would do to Kara.", villain: "Reign (Worldkiller)", heroine: "Alex Danvers", color: "#60A5FA" },
];

const CW_HEROINES = [
  "Sara Lance", "Laurel Lance", "Thea Queen", "Nyssa al Ghul", "Dinah Drake",
  "Felicity Smoak", "Iris West-Allen", "Caitlin Snow", "Jesse Quick", "Nora West-Allen",
  "Kendra Saunders", "Alex Danvers", "Zari Tarazi", "Mia Queen",
];

const REWRITE_TONES = [
  { id: "dark-explicit", label: "DARK & EXPLICIT", desc: "Fully explicit, kinky, graphic — the darkest possible version of this divergence" },
  { id: "psychological", label: "PSYCHOLOGICAL", desc: "Mind games, power dynamics, slow erosion of will — intense but not explicit" },
  { id: "bdsm-dominant", label: "DOMINANT/SUBMISSIVE", desc: "Explicit D/s dynamic — the villain exercises full authority, the heroine yields or resists" },
];

function streamRequest(endpoint: string, body: object, onChunk: (c: string) => void, signal: AbortSignal): Promise<string> {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  return fetch(`${base}${endpoint}`, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async r => {
    if (!r.ok) throw new Error(`${r.status}`);
    const reader = r.body!.getReader();
    const dec = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream: true });
      full += chunk; onChunk(full);
    }
    return full;
  });
}
function isAbort(e: unknown) { return e instanceof Error && e.name === "AbortError"; }

export default function RewriteCanonMode({ onBack }: Props) {
  const [step, setStep] = useState<"browse" | "configure" | "story">("browse");
  const [selected, setSelected] = useState<CanonMoment | null>(null);
  const [heroine, setHeroine] = useState("Sara Lance");
  const [tone, setTone] = useState("dark-explicit");
  const [customNote, setCustomNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");
  const [streaming, setStreaming] = useState("");
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    if (!selected) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setStory(""); setStreaming(""); setError("");
    const toneObj = REWRITE_TONES.find(t => t.id === tone)!;
    const voiceNote = buildVoiceInjection(selected.villain);
    try {
      const full = await streamRequest("/api/story/superhero", {
        hero: heroine,
        villain: selected.villain,
        setting: `The divergence point: ${selected.episode} — ${selected.what}`,
        stakes: "The canon is being rewritten. This is the version that stayed buried.",
        tone: toneObj.label,
        captureMethod: "The canon moment goes differently",
        restraints: "Whatever the villain chooses",
        intensity: tone === "psychological" ? "Tense — psychological, no graphic content" : "Explicit — fully graphic, dark, kinky",
        storyLength: "Epic Saga",
        details: `REWRITE THE CANON PREMISE:\n${selected.dark}\n\nSHOW / EPISODE: ${selected.show} ${selected.episode} — "${selected.title}"\nCANON OUTCOME: ${selected.canon}\nTHIS VERSION: ${selected.dark}\n\nTONE DIRECTIVE: ${toneObj.desc}\n\nIMPORTANT: Write this as if it is an alternate episode. Reference the show's specific lore, locations, and character voices. The heroine is ${heroine}. The villain is ${selected.villain}. Make this feel like it could have been a real dark-cut version of this episode.${customNote ? `\n\nADDITIONAL NOTE FROM WRITER: ${customNote}` : ""}${voiceNote}`,
      }, (c) => setStreaming(c), ctrl.signal);
      setStory(full);
      setStep("story");
      const id = saveStoryToArchive({
        title: `[REWRITE] ${selected.title} — ${heroine}`,
        universe: `CW Arrowverse — ${selected.show}`,
        tool: "Rewrite the Canon",
        characters: [heroine, selected.villain],
        chapters: [full],
      });
      setSavedId(id);
    } catch (e) {
      if (isAbort(e)) { if (streaming.trim()) { setStory(streaming); setStep("story"); } }
      else setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); setStreaming(""); abortRef.current = null; }
  }

  if (step === "story" && story) {
    const fakeStory = {
      id: savedId ?? "tmp",
      title: `[REWRITE] ${selected?.title} — ${heroine}`,
      createdAt: Date.now(),
      universe: selected?.show ?? "CW",
      tool: "Rewrite the Canon",
      characters: [heroine, selected?.villain ?? ""],
      chapters: [story],
      tags: [],
      favourite: false,
      wordCount: story.split(/\s+/).filter(Boolean).length,
    };
    return (
      <div style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
            <div style={{ background: `${selected?.color ?? "#888"}18`, border: `1px solid ${selected?.color ?? "#888"}44`, borderRadius: "6px", padding: "4px 12px", fontSize: "10px", color: selected?.color ?? "#888", letterSpacing: "2px", fontWeight: 700 }}>REWRITE</div>
            <div style={{ fontSize: "16px", fontWeight: 900, color: selected?.color ?? "#ddd", letterSpacing: "2px" }}>{selected?.title}</div>
          </div>
          <div style={{ background: "#0e0e18", border: `1px solid ${selected?.color ?? "#333"}22`, borderRadius: "8px", padding: "32px", lineHeight: 1.85, fontSize: "15px", color: "#ddd", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
            {story}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            {savedId && <button onClick={() => setReadingMode(true)} style={{ background: "#0a0a14", border: `1px solid ${selected?.color ?? "#888"}44`, color: selected?.color ?? "#888", borderRadius: "8px", padding: "12px 20px", cursor: "pointer", fontWeight: 700, letterSpacing: "1px", fontSize: "12px" }}>📖 READ</button>}
            <button onClick={() => { setStep("configure"); setStory(""); }} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "12px 20px", cursor: "pointer" }}>Rewrite Again</button>
            <button onClick={() => { setStep("browse"); setSelected(null); setStory(""); }} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "12px 20px", cursor: "pointer" }}>← Pick Another Moment</button>
            <button onClick={onBack} style={{ background: "transparent", border: "1px solid #333", color: "#555", borderRadius: "8px", padding: "12px 20px", cursor: "pointer" }}>Home</button>
          </div>
        </div>
        {readingMode && savedId && <StoryReader story={fakeStory} onClose={() => setReadingMode(false)} />}
      </div>
    );
  }

  if (step === "configure" && selected) {
    const col = selected.color;
    return (
      <div style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "28px" }}>
            <button onClick={() => setStep("browse")} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "12px", letterSpacing: "1px" }}>← MOMENTS</button>
            <div style={{ fontSize: "11px", color: "#333" }}>/</div>
            <div style={{ fontSize: "11px", color: "#777", letterSpacing: "1px" }}>{selected.title}</div>
          </div>

          {/* Moment card */}
          <div style={{ background: `linear-gradient(135deg, ${col}11, #0a0a0f)`, border: `1px solid ${col}33`, borderRadius: "12px", padding: "24px", marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ background: `${col}18`, border: `1px solid ${col}33`, borderRadius: "4px", padding: "3px 10px", fontSize: "10px", color: col, letterSpacing: "2px", fontWeight: 700 }}>{selected.show} {selected.episode}</div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: col, letterSpacing: "2px", marginBottom: "6px" }}>{selected.title}</div>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px", fontStyle: "italic" }}>Canon: {selected.canon}</div>
            <div style={{ background: "#04040c", border: `1px solid ${col}22`, borderRadius: "6px", padding: "14px", fontSize: "12px", color: "#999", lineHeight: 1.7 }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: col, marginBottom: "8px", fontWeight: 700 }}>THIS VERSION</div>
              {selected.dark}
            </div>
          </div>

          {/* Heroine */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>HEROINE</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {CW_HEROINES.map(h => (
                <button key={h} onClick={() => setHeroine(h)}
                  style={{ background: heroine === h ? `${col}18` : "#0e0e18", border: `1px solid ${heroine === h ? col : "#222"}`, color: heroine === h ? col : "#555", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: "11px", letterSpacing: "1px" }}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>REWRITE TONE</div>
            <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
              {REWRITE_TONES.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  style={{ background: tone === t.id ? `${col}12` : "#0a0a12", border: `1px solid ${tone === t.id ? col : "#1e1e2e"}`, borderRadius: "8px", padding: "12px 16px", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: tone === t.id ? col : "#666", letterSpacing: "1.5px", marginBottom: "4px" }}>{t.label}</div>
                  <div style={{ fontSize: "10px", color: "#444", lineHeight: 1.5 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom note */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "10px" }}>WRITER'S NOTE <span style={{ color: "#333", fontWeight: 400 }}>(optional)</span></div>
            <textarea
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="Add any specific direction — 'keep the restraints physical', 'end on her breaking', 'more of the villain's voice'..."
              style={{ width: "100%", background: "#0a0a12", border: "1px solid #222", borderRadius: "8px", padding: "12px 14px", color: "#ccc", fontSize: "13px", lineHeight: 1.6, resize: "vertical", minHeight: "80px", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>

          {error && <div style={{ color: "#f87171", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "12px", marginBottom: "16px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={generate} disabled={loading}
              style={{ flex: 1, background: `linear-gradient(135deg, ${col}22, ${col}33)`, border: `1px solid ${col}55`, color: col, borderRadius: "10px", padding: "16px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 900, letterSpacing: "3px", fontSize: "14px", opacity: loading ? 0.6 : 1 }}>
              {loading ? "REWRITING…" : "REWRITE THE CANON"}
            </button>
            {loading && <button onClick={() => abortRef.current?.abort()} style={{ background: "#1a0000", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: "10px", padding: "16px 20px", cursor: "pointer", fontWeight: 700 }}>STOP</button>}
            <button onClick={() => setStep("browse")} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "10px", padding: "16px 20px", cursor: "pointer" }}>←</button>
          </div>

          {loading && (
            <div style={{ marginTop: "24px", background: "#0a0a12", border: "1px solid #1a1a2a", borderRadius: "8px", padding: "24px", color: "#666", fontSize: "14px", lineHeight: 1.85, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
              {streaming}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Browse view
  const showGroups = ["ARROW", "THE FLASH", "LEGENDS", "SUPERGIRL"];
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "32px" }}>
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "10px 16px", cursor: "pointer", fontSize: "12px", letterSpacing: "1px", flexShrink: 0 }}>←</button>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#555", marginBottom: "4px" }}>SHADOWWEAVE</div>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "3px", color: "#ddd", marginBottom: "6px" }}>REWRITE THE CANON</div>
            <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.6 }}>Pick a pivotal episode moment. Choose the version that stayed buried.</div>
          </div>
        </div>

        {showGroups.map(show => {
          const moments = CANON_MOMENTS.filter(m => m.show === show || (show === "THE FLASH" && m.show === "THE FLASH"));
          if (!moments.length) return null;
          return (
            <div key={show} style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 900, letterSpacing: "4px", color: moments[0].color }}>{show}</div>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${moments[0].color}44, transparent)` }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
                {moments.map(m => (
                  <button key={m.id} onClick={() => { setSelected(m); setHeroine(m.heroine); setStep("configure"); }}
                    style={{ background: "linear-gradient(135deg, #0e0e18, #0a0a12)", border: `1px solid ${m.color}22`, borderRadius: "12px", padding: "18px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${m.color}55`; (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${m.color}11, #0a0a12)`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${m.color}22`; (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #0e0e18, #0a0a12)"; }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ background: `${m.color}18`, border: `1px solid ${m.color}33`, borderRadius: "3px", padding: "2px 8px", fontSize: "9px", color: m.color, letterSpacing: "1px", fontWeight: 700 }}>{m.episode}</div>
                      <div style={{ fontSize: "9px", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.villain}</div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: m.color, letterSpacing: "1.5px", marginBottom: "8px" }}>{m.title}</div>
                    <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.5, marginBottom: "10px" }}>{m.what}</div>
                    <div style={{ background: "#04040c", borderRadius: "6px", padding: "10px 12px" }}>
                      <div style={{ fontSize: "9px", letterSpacing: "2px", color: m.color, marginBottom: "5px", fontWeight: 700 }}>THIS VERSION</div>
                      <div style={{ fontSize: "10px", color: "#555", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{m.dark}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
