import { useState } from "react";

interface ScenarioGeneratorProps {
  onBack: () => void;
}

// ─── Question Definitions ──────────────────────────

const QUESTIONS = [
  {
    key: "motive",
    label: "Primary Motive",
    icon: "🎯",
    description: "What drives the captor's actions?",
    options: [
      { value: "financial",     label: "Financial — Ransom or profit" },
      { value: "revenge",       label: "Revenge — Personal grievance" },
      { value: "control",       label: "Control — Power and domination" },
      { value: "ideological",   label: "Ideological — Making a statement" },
      { value: "obsession",     label: "Obsession — Fixation on the victim" },
      { value: "coercion",      label: "Coercion — Forcing information or action" },
    ],
  },
  {
    key: "setting",
    label: "Location & Setting",
    icon: "🏚️",
    description: "Where is the captivity taking place?",
    options: [
      { value: "rural_isolated",  label: "Rural — Isolated cabin, farmhouse, wilderness" },
      { value: "urban_apartment", label: "Urban — Apartment, warehouse, city building" },
      { value: "underground",     label: "Underground — Bunker, basement, tunnel" },
      { value: "mobile",          label: "Mobile — Vehicle, boat, constantly moving" },
      { value: "institutional",   label: "Institutional — Abandoned hospital, facility" },
      { value: "domestic",        label: "Domestic — Victim's own home or workplace" },
    ],
  },
  {
    key: "duration",
    label: "Scenario Duration",
    icon: "⏳",
    description: "How long has the captivity been ongoing?",
    options: [
      { value: "hours",   label: "Hours — The first terrifying hours" },
      { value: "days",    label: "Days — Settling into a brutal routine" },
      { value: "weeks",   label: "Weeks — Psychological patterns emerging" },
      { value: "months",  label: "Months — Deep psychological conditioning" },
    ],
  },
  {
    key: "background",
    label: "Captor's Background",
    icon: "🧩",
    description: "What is the captor's training or history?",
    options: [
      { value: "military",    label: "Military / Law Enforcement — Tactical, disciplined" },
      { value: "criminal",    label: "Career Criminal — Experienced, street-smart" },
      { value: "civilian",    label: "Ordinary Civilian — Amateur, driven by emotion" },
      { value: "organized",   label: "Organized Group — Multiple actors, chain of command" },
      { value: "academic",    label: "Academic / Medical — Clinical, knowledgeable" },
    ],
  },
  {
    key: "control",
    label: "Method of Control",
    icon: "⛓️",
    description: "How does the captor maintain dominance?",
    options: [
      { value: "restraints",    label: "Physical Restraints — Ropes, chains, cuffs" },
      { value: "technological", label: "Technological — Surveillance, electronic locks" },
      { value: "chemical",      label: "Chemical — Drugs, sedatives, gas" },
      { value: "brute_force",   label: "Brute Force — Physical dominance and presence" },
      { value: "social",        label: "Social Isolation — Cutting off all outside contact" },
    ],
  },
  {
    key: "violence",
    label: "Violence Threshold",
    icon: "🔪",
    description: "What is the captor's baseline level of violence?",
    options: [
      { value: "non_lethal",      label: "Non-lethal — Intimidation only, no physical harm" },
      { value: "calibrated_pain", label: "Calibrated — Pain as a tool, purposeful" },
      { value: "unstable",        label: "Unstable — Erratic, unpredictable outbursts" },
      { value: "lethal",          label: "Lethal — Willing and able to kill" },
    ],
  },
  {
    key: "psychology",
    label: "Psychological Profile",
    icon: "🧠",
    description: "How does the captor engage with the victim mentally?",
    options: [
      { value: "detached",       label: "Detached Professional — Cold, transactional, efficient" },
      { value: "predator",       label: "Intimate Predator — Grooming, false care, manipulation" },
      { value: "sadist",         label: "Sadist — Derives pleasure from suffering" },
      { value: "desperate",      label: "Desperate — Panicked, irrational, prone to mistakes" },
      { value: "idealist",       label: "True Believer — Convinced they are righteous" },
    ],
  },
  {
    key: "endgame",
    label: "Endgame / Exit Strategy",
    icon: "🚪",
    description: "What does the captor ultimately want to achieve?",
    options: [
      { value: "release",     label: "Release — Victim freed once demands are met" },
      { value: "permanent",   label: "Permanent — No intention of ever letting go" },
      { value: "elimination", label: "Elimination — Victim is to be killed" },
      { value: "conversion",  label: "Conversion — Breaking and reshaping the victim" },
      { value: "spectacle",   label: "Spectacle — A public reveal or broadcast event" },
    ],
  },
];

// ─── Question Generation Logic ─────────────────────

type Answers = Record<string, string>;

interface QuestionGroup {
  category: string;
  icon: string;
  questions: string[];
}

function generateGroups(answers: Answers): QuestionGroup[] {
  const groups: QuestionGroup[] = [];

  // Motive
  const motiveQs: string[] = [];
  if (answers.motive === "financial") {
    motiveQs.push("How much is the ransom, and who specifically is expected to pay it?");
    motiveQs.push("Is there a hard deadline? What happens to the victim if it is missed?");
    motiveQs.push("Does the captor have a backup plan if payment fails or is delayed?");
  } else if (answers.motive === "revenge") {
    motiveQs.push("What specific past event is the captor avenging, and does the victim know it?");
    motiveQs.push("Is the victim the direct cause of the harm, or collateral — a proxy for someone else?");
    motiveQs.push("What would constitute 'enough'? Is there an act of revenge that would satisfy the captor?");
  } else if (answers.motive === "control") {
    motiveQs.push("What is the captor trying to 'break' in the victim — their will, their identity, or their spirit?");
    motiveQs.push("What does total submission look like to the captor? What is the 'end state' they are engineering?");
    motiveQs.push("Is the control an end in itself, or is it preparation for something else?");
  } else if (answers.motive === "ideological") {
    motiveQs.push("What is the captor's ideology, and how does the victim personally symbolize the enemy?");
    motiveQs.push("Is the captor planning a public declaration, or is this a private, symbolic act of faith?");
    motiveQs.push("Does the captor believe the victim can be converted, or are they simply a sacrifice?");
  } else if (answers.motive === "obsession") {
    motiveQs.push("How long has the captor been fixated on this specific victim, and what triggered it?");
    motiveQs.push("Does the captor believe the victim belongs to them, or that they are 'saving' the victim from something?");
    motiveQs.push("What would shatter the obsession — and is the victim capable of doing it?");
  } else if (answers.motive === "coercion") {
    motiveQs.push("What information, action, or access is the captor trying to extract from the victim?");
    motiveQs.push("Is the victim the target, or are they leverage against a third party?");
    motiveQs.push("What happens once the captor gets what they want? Is there a plan beyond the coercion?");
  }
  if (motiveQs.length) groups.push({ category: "Motive & Goal", icon: "🎯", questions: motiveQs });

  // Setting
  const settingQs: string[] = [];
  if (answers.setting === "rural_isolated") {
    settingQs.push("How remote is the location? What would the victim need to survive if they escaped into the wilderness?");
    settingQs.push("Does the isolation breed false intimacy between captor and victim, or only paranoia?");
    settingQs.push("Are there any sounds, smells, or environmental details that give clues about location?");
  } else if (answers.setting === "urban_apartment") {
    settingQs.push("How much external noise penetrates the walls — traffic, neighbors, footsteps — and does it taunt the victim?");
    settingQs.push("Is there a risk that someone in the building will hear or notice something wrong?");
    settingQs.push("How does the captor manage routine things — deliveries, building staff, trash — without exposure?");
  } else if (answers.setting === "underground") {
    settingQs.push("What is the air situation — ventilation, humidity, temperature? How does the environment itself become a threat?");
    settingQs.push("How does the victim lose track of time in a place with no natural light?");
    settingQs.push("Is the captor above ground while the victim is below, creating an extreme power asymmetry?");
  } else if (answers.setting === "mobile") {
    settingQs.push("How does the victim track time and distance when constantly moving? What sensory information bleeds through?");
    settingQs.push("What is the risk of exposure at stops — fuel stations, border crossings, traffic?");
    settingQs.push("Is constant movement a tactic to prevent the victim from mapping their location?");
  } else if (answers.setting === "institutional") {
    settingQs.push("What remnants of the building's former purpose surround the victim — old equipment, signage, smells?");
    settingQs.push("Does the decayed institutional setting amplify the hopelessness, or give the victim things to use?");
    settingQs.push("Is the location known to anyone — and could someone stumble upon it accidentally?");
  } else if (answers.setting === "domestic") {
    settingQs.push("How does captivity in a familiar space distort the victim's sense of safety and reality?");
    settingQs.push("Are there people who would normally visit this space — friends, family, delivery workers?");
    settingQs.push("What has been altered or removed from the space, and does the victim notice these changes?");
  }
  if (settingQs.length) groups.push({ category: "Location & Setting", icon: "🏚️", questions: settingQs });

  // Duration
  const durationQs: string[] = [];
  if (answers.duration === "hours") {
    durationQs.push("What is the victim's psychological state in these first hours — shock, denial, raw terror?");
    durationQs.push("Is the captor still establishing control, or did they arrive with everything already planned?");
    durationQs.push("What window for escape or rescue exists in these early hours before routines are entrenched?");
  } else if (answers.duration === "days") {
    durationQs.push("What routines have already formed — feeding, sleeping, pain — and how do they structure the victim's existence?");
    durationQs.push("Has the victim begun the psychological inventory of their captor — looking for patterns, weaknesses?");
    durationQs.push("What does the victim do with hope when days pass and no one comes?");
  } else if (answers.duration === "weeks") {
    durationQs.push("What psychological shifts have occurred — has the victim begun to adapt, regress, or fracture?");
    durationQs.push("Have any strange dynamics emerged between captor and victim — dependency, bargaining, dark connection?");
    durationQs.push("Is the world outside still looking? What does the victim believe about their chances of being found?");
  } else if (answers.duration === "months") {
    durationQs.push("What version of the victim remains after months of captivity? What has been permanently altered?");
    durationQs.push("Have the power dynamics shifted at all — has the victim found leverage, or only deeper helplessness?");
    durationQs.push("What does the captor think of the victim now, compared to when this began? Has anything changed for them?");
  }
  if (durationQs.length) groups.push({ category: "Duration & Time", icon: "⏳", questions: durationQs });

  // Background
  const bgQs: string[] = [];
  if (answers.background === "military") {
    bgQs.push("How does military training shape the captor's planning — what mistakes do they not make?");
    bgQs.push("Is there a code the captor still adheres to, even in this context — and can the victim find it?");
    bgQs.push("Does the captor's discipline make them more or less human in the victim's eyes?");
  } else if (answers.background === "criminal") {
    bgQs.push("What criminal history has the captor drawn on to set this up — what have they done before?");
    bgQs.push("Does the captor have associates, suppliers, or contacts who could become variables in the victim's situation?");
    bgQs.push("How does the captor's experience calibrate their risk tolerance? What won't rattle them?");
  } else if (answers.background === "civilian") {
    bgQs.push("What mistakes is the captor making that a professional would not — and does the victim see them?");
    bgQs.push("How does the captor's emotional state leak into their actions? Where does the amateur show?");
    bgQs.push("What specific event crossed the captor from ordinary person to this — and how recent was it?");
  } else if (answers.background === "organized") {
    bgQs.push("Who is giving orders, and does the captor the victim sees have autonomy or are they following instructions?");
    bgQs.push("What happens to the victim if the captor is removed — is there a chain of command that continues?");
    bgQs.push("Is there tension or disagreement within the group about how to handle the victim?");
  } else if (answers.background === "academic") {
    bgQs.push("How does the captor's knowledge — medical, psychological, scientific — shape the precision of the captivity?");
    bgQs.push("Does the captor study the victim clinically, documenting responses, patterns, thresholds?");
    bgQs.push("Is there a detached, experimental quality to the captor's approach that the victim finds uniquely disturbing?");
  }
  if (bgQs.length) groups.push({ category: "Captor Background", icon: "🧩", questions: bgQs });

  // Control Method
  const controlQs: string[] = [];
  if (answers.control === "restraints") {
    controlQs.push("What specific restraints are used, and what physical toll do they take over time — circulation, sores, muscle?");
    controlQs.push("Are there moments when restraints are loosened — and are those moments traps or genuine opportunities?");
    controlQs.push("How does the victim relate to their own body when it is permanently bound — dissociation, rage, bargaining?");
  } else if (answers.control === "technological") {
    controlQs.push("What is the full scope of the surveillance system — is there anywhere the victim is truly unseen?");
    controlQs.push("Is there a vulnerability in the technology — a dead zone, a power dependency, a forgotten camera angle?");
    controlQs.push("How does living under constant observation change the victim's internal life — what do they hide, and how?");
  } else if (answers.control === "chemical") {
    controlQs.push("What do the substances do — sedate, disorient, cause hallucination, alter memory, create compliance?");
    controlQs.push("How does the victim distinguish real experience from chemically induced perception?");
    controlQs.push("Is there a withdrawal effect when substances are withheld — and does the captor use this as leverage?");
  } else if (answers.control === "brute_force") {
    controlQs.push("Is the captor's physical dominance constant, or do they allow brief, calculated moments of apparent safety?");
    controlQs.push("How does the victim survive the psychological weight of inhabiting a body that cannot fight back?");
    controlQs.push("Are there moments of physical exhaustion or vulnerability in the captor that the victim has catalogued?");
  } else if (answers.control === "social") {
    controlQs.push("What is the victim's subjective experience of total silence from the outside world — who do they miss first?");
    controlQs.push("Does the captor deliberately remind the victim they have been forgotten, or let the silence speak?");
    controlQs.push("How long before isolation begins to reshape the victim's sense of self and reality?");
  }
  if (controlQs.length) groups.push({ category: "Control & Method", icon: "⛓️", questions: controlQs });

  // Violence
  const violenceQs: string[] = [];
  if (answers.violence === "non_lethal") {
    violenceQs.push("What is the line the captor has drawn — and has the victim found the edge of it yet?");
    violenceQs.push("Is the restraint from violence a moral boundary, a practical one, or both — and which is more fragile?");
    violenceQs.push("How does the victim process the captor's restraint — as mercy, strategy, or something more unsettling?");
  } else if (answers.violence === "calibrated_pain") {
    violenceQs.push("What specific purpose does each act of pain serve — interrogation, punishment, training, demonstration?");
    violenceQs.push("Does the captor have medical knowledge or skill to keep the victim functional through ongoing harm?");
    violenceQs.push("How does the victim's body begin to anticipate pain — what does flinching before anything happens mean?");
  } else if (answers.violence === "unstable") {
    violenceQs.push("What are the captor's triggers — what specific words, actions, or looks invite the violence?");
    violenceQs.push("Has the victim begun to successfully map the captor's moods, or does unpredictability remain total?");
    violenceQs.push("What happens to the captor after an episode — remorse, indifference, escalation?");
  } else if (answers.violence === "lethal") {
    violenceQs.push("Is the victim's death already scheduled or certain, or is life still conditionally available?");
    violenceQs.push("How does the victim behave differently knowing that death is a real, proximate possibility?");
    violenceQs.push("Under exactly what circumstances would the captor pull the trigger — and has the victim identified them?");
  }
  if (violenceQs.length) groups.push({ category: "Violence & Threat", icon: "🔪", questions: violenceQs });

  // Psychology
  const psychQs: string[] = [];
  if (answers.psychology === "detached") {
    psychQs.push("Is there any flicker of humanity in the captor — a hesitation, a glance, something that looks like doubt?");
    psychQs.push("Can the victim appeal to the captor's logic or self-preservation instinct rather than their empathy?");
    psychQs.push("What does the captor think of the victim — as a person, a problem, an asset, or nothing at all?");
  } else if (answers.psychology === "predator") {
    psychQs.push("Does the captor genuinely believe they care for the victim — and how does that delusion manifest?");
    psychQs.push("What past relationship or trauma does the captor project onto the victim — who do they think they see?");
    psychQs.push("Can the victim use the captor's desire for connection as leverage — and how dangerous is that attempt?");
  } else if (answers.psychology === "sadist") {
    psychQs.push("What specific form of suffering satisfies the captor most — physical agony, emotional devastation, or humiliation?");
    psychQs.push("Is there a point of satiation — a moment when the captor is done — or does the appetite only grow?");
    psychQs.push("Does the victim have any power in this dynamic, or is resistance itself just another form of entertainment?");
  } else if (answers.psychology === "desperate") {
    psychQs.push("What is the source of the captor's desperation — time, external threat, crumbling plan, emotional instability?");
    psychQs.push("Can the victim sense the desperation and exploit the captor's panic to introduce mistakes?");
    psychQs.push("What does a cornered, desperate captor do when the situation shifts outside their control?");
  } else if (answers.psychology === "idealist") {
    psychQs.push("Does the captor believe they are righteous — and how does that conviction insulate them from doubt?");
    psychQs.push("Can the victim challenge the ideology directly, or does that only harden the captor's resolve?");
    psychQs.push("Is there a moment where the captor's beliefs and reality collide — and who does the victim need to be in that moment?");
  }
  if (psychQs.length) groups.push({ category: "Psychological Dynamic", icon: "🧠", questions: psychQs });

  // Endgame
  const endgameQs: string[] = [];
  if (answers.endgame === "release") {
    endgameQs.push("What are the exact conditions of release — and how does the victim know if those conditions are real?");
    endgameQs.push("Does the captor plan to release the victim with their identity intact, or altered?");
    endgameQs.push("What does the victim do with hope when release is promised but not yet delivered?");
  } else if (answers.endgame === "permanent") {
    endgameQs.push("How does the victim's psychology shift when they understand there is no intended end to this?");
    endgameQs.push("What does 'permanent' mean to the captor — what future are they envisioning?");
    endgameQs.push("Is escape the only real option, and what price does the attempt carry?");
  } else if (answers.endgame === "elimination") {
    endgameQs.push("Does the victim know their death has been decided — and what does that knowledge do to their behavior?");
    endgameQs.push("Is there anything the victim can offer that would change the calculus, or is the outcome fixed?");
    endgameQs.push("How does the captor feel about the scheduled end — clinical, reluctant, eager, conflicted?");
  } else if (answers.endgame === "conversion") {
    endgameQs.push("What does 'broken and reshaped' look like to the captor — what is the target state they are engineering?");
    endgameQs.push("Does the victim resist conversion consciously, or does resistance require no effort — yet?");
    endgameQs.push("At what point does the victim begin to wonder if some part of them has already been altered?");
  } else if (answers.endgame === "spectacle") {
    endgameQs.push("What is the audience for this spectacle — a single person, a group, the public?");
    endgameQs.push("Does the victim know they are going to be used for something public — and does that knowledge change their options?");
    endgameQs.push("What is the captor staging, and how much of it depends on the victim's performance or cooperation?");
  }
  if (endgameQs.length) groups.push({ category: "Endgame & Resolution", icon: "🚪", questions: endgameQs });

  return groups;
}

function buildSummary(answers: Answers): string {
  const labels: Record<string, Record<string, string>> = {
    motive: { financial: "financial gain", revenge: "revenge", control: "control and domination", ideological: "ideological conviction", obsession: "obsession", coercion: "coercion" },
    setting: { rural_isolated: "an isolated rural location", urban_apartment: "an urban space", underground: "an underground location", mobile: "a mobile situation", institutional: "an abandoned institutional building", domestic: "the victim's own environment" },
    duration: { hours: "hours", days: "days", weeks: "weeks", months: "months" },
    background: { military: "military or law enforcement training", criminal: "a career criminal background", civilian: "no prior criminal background", organized: "an organized group", academic: "academic or medical expertise" },
    control: { restraints: "physical restraints", technological: "technological surveillance", chemical: "chemical agents", brute_force: "brute physical force", social: "social isolation" },
    violence: { non_lethal: "non-lethal intimidation", calibrated_pain: "calibrated, purposeful pain", unstable: "unstable, unpredictable violence", lethal: "lethal intent" },
    psychology: { detached: "a detached, professional demeanor", predator: "an intimate predator dynamic", sadist: "sadistic pleasure in suffering", desperate: "desperate, erratic behavior", idealist: "ideological certainty" },
    endgame: { release: "conditional release", permanent: "permanent captivity", elimination: "elimination of the victim", conversion: "breaking and reshaping the victim", spectacle: "a public spectacle" },
  };
  const get = (k: string) => labels[k]?.[answers[k]] ?? "unknown";
  return `A captor motivated by ${get("motive")}, operating from ${get("setting")} over the course of ${get("duration")}. They bring ${get("background")}, maintaining control through ${get("control")}. Their violence threshold is ${get("violence")}, their psychological approach is ${get("psychology")}, and their endgame is ${get("endgame")}.`;
}

// ─── Select Field Component ────────────────────────

function SelectField({
  label, number, icon, description, value, options, onChange,
}: {
  label: string;
  number: number;
  icon: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(139,0,0,0.25)",
        borderRadius: "14px",
        padding: "1.25rem 1.5rem",
        backdropFilter: "blur(10px)",
        transition: "border-color 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "1rem" }}>{icon}</span>
        <label
          className="font-montserrat"
          style={{
            fontSize: "0.7rem",
            color: "#00FF41",
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {String(number).padStart(2, "0")} — {label}
        </label>
      </div>
      <p style={{ fontSize: "0.78rem", color: "rgba(200,200,220,0.4)", marginBottom: "0.75rem" }}>
        {description}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "0.8rem 2.5rem 0.8rem 1rem",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(45,27,105,0.6)",
          borderRadius: "10px",
          color: "#F0F0FF",
          fontFamily: "'Raleway', sans-serif",
          fontSize: "0.9rem",
          outline: "none",
          cursor: "pointer",
          transition: "all 0.3s ease",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23B8860B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#B8860B";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,11,0.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(45,27,105,0.6)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0A0015" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Main Component ────────────────────────────────

const DEFAULT_ANSWERS: Answers = Object.fromEntries(
  QUESTIONS.map((q) => [q.key, q.options[0].value])
);

export default function ScenarioGenerator({ onBack }: ScenarioGeneratorProps) {
  const [answers, setAnswers] = useState<Answers>({ ...DEFAULT_ANSWERS });
  const [groups,   setGroups]   = useState<ReturnType<typeof generateGroups>>([]);
  const [summary,  setSummary]  = useState("");
  const [generated, setGenerated] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [copyFlash, setCopyFlash] = useState(false);

  function setAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function setQuestionAnswer(groupIdx: number, qIdx: number, value: string) {
    const key = `${groupIdx}-${qIdx}`;
    setQuestionAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    const g = generateGroups(answers);
    const s = buildSummary(answers);
    setGroups(g);
    setSummary(s);
    setTotalCount(g.reduce((acc, gr) => acc + gr.questions.length, 0));
    setGenerated(true);
    setQuestionAnswers({});
    setTimeout(() => {
      document.getElementById("output-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleReset() {
    setAnswers({ ...DEFAULT_ANSWERS });
    setGroups([]);
    setSummary("");
    setGenerated(false);
    setTotalCount(0);
    setQuestionAnswers({});
  }

  function handleCopyAll() {
    const lines: string[] = [];
    let n = 1;
    groups.forEach((g, gi) => {
      lines.push(`── ${g.category} ──`);
      g.questions.forEach((q, qi) => {
        lines.push(`${n}. ${q}`);
        const ans = questionAnswers[`${gi}-${qi}`];
        if (ans?.trim()) lines.push(`   → ${ans.trim()}`);
        n++;
      });
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
    setCopyFlash(true);
    setTimeout(() => setCopyFlash(false), 1800);
  }

  function handleExport() {
    const lines: string[] = [`SHADOWWEAVE — SCENARIO NOTES`, ``, summary, ``];
    let n = 1;
    groups.forEach((g, gi) => {
      lines.push(`${"═".repeat(50)}`);
      lines.push(`${g.icon}  ${g.category.toUpperCase()}`);
      lines.push(`${"═".repeat(50)}`);
      g.questions.forEach((q, qi) => {
        lines.push(``);
        lines.push(`${n}. ${q}`);
        const ans = questionAnswers[`${gi}-${qi}`];
        lines.push(ans?.trim() ? `\n   ${ans.trim()}` : `   [no answer]`);
        n++;
      });
      lines.push(``);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shadowweave_scenario_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>

      {/* Header */}
      <div className="fade-in" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span className="badge" style={{ background: "rgba(0,200,80,0.1)", borderColor: "rgba(0,200,80,0.3)", color: "#00CC44", marginBottom: "1rem" }}>
          ⚡ Scenario Engine
        </span>
        <h1
          className="font-cinzel"
          style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#D4AF37", marginBottom: "0.5rem", fontWeight: 700 }}
        >
          Scenario Question Generator
        </h1>
        <p style={{ color: "rgba(200,200,220,0.55)", fontSize: "0.95rem", maxWidth: "550px", margin: "0 auto" }}>
          Configure all 8 parameters of your scenario. Each selection generates 3 targeted narrative questions — up to 24 in total.
        </p>
        <div className="divider" style={{ maxWidth: "350px", margin: "1.25rem auto 0" }}>
          <span className="divider-symbol">✦</span>
        </div>
      </div>

      {/* Question Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {QUESTIONS.map((q, i) => (
          <SelectField
            key={q.key}
            label={q.label}
            number={i + 1}
            icon={q.icon}
            description={q.description}
            value={answers[q.key]}
            options={q.options}
            onChange={(v) => setAnswer(q.key, v)}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem", flexWrap: "wrap" }}>
        <button className="enter-button" onClick={handleGenerate} style={{ fontSize: "1rem", padding: "1.1rem 2.75rem" }}>
          Generate {QUESTIONS.length * 3} Questions
        </button>
        <button className="action-button secondary" onClick={handleReset}>
          Reset All
        </button>
        <button className="action-button secondary" onClick={onBack} style={{ opacity: 0.7 }}>
          ← Portal
        </button>
      </div>

      {/* Output */}
      {generated && groups.length > 0 && (
        <div id="output-section" className="slide-in">

          {/* Scenario Summary */}
          <div
            style={{
              background: "rgba(139,0,0,0.1)",
              border: "1px solid rgba(139,0,0,0.3)",
              borderRadius: "16px",
              padding: "1.5rem 2rem",
              marginBottom: "1.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="progress-bar-gradient" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "16px 16px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div className="font-cinzel" style={{ fontSize: "0.75rem", letterSpacing: "2px", color: "#B8860B", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                  Scenario Summary
                </div>
                <p className="font-crimson" style={{ fontSize: "1.05rem", color: "#F0F0FF", lineHeight: 1.7, fontStyle: "italic" }}>
                  {summary}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div className="font-cinzel" style={{ fontSize: "2rem", color: "#D4AF37", fontWeight: 700, lineHeight: 1 }}>
                  {totalCount}
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.4)", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
                  Questions
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={handleExport}
              style={{
                background: "rgba(45,27,105,0.2)",
                border: "1px solid rgba(45,27,105,0.45)",
                borderRadius: "8px",
                padding: "0.5rem 1.25rem",
                color: "rgba(200,200,220,0.7)",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.78rem",
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(45,27,105,0.4)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(45,27,105,0.2)")}
            >
              Export Q&amp;A
            </button>
            <button
              onClick={handleCopyAll}
              style={{
                background: copyFlash ? "rgba(184,134,11,0.35)" : "rgba(184,134,11,0.12)",
                border: "1px solid rgba(184,134,11,0.35)",
                borderRadius: "8px",
                padding: "0.5rem 1.25rem",
                color: "#D4AF37",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.78rem",
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(184,134,11,0.25)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = copyFlash ? "rgba(184,134,11,0.35)" : "rgba(184,134,11,0.12)")}
            >
              {copyFlash ? "✓ Copied!" : "Copy All Q&A"}
            </button>
          </div>

          {/* Question Groups */}
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {groups.map((group, gi) => (
              <div
                key={group.category}
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(15px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {/* Group header */}
                <div
                  style={{
                    padding: "0.875rem 1.5rem",
                    background: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{group.icon}</span>
                  <span
                    className="font-cinzel"
                    style={{ fontSize: "0.85rem", color: "#B8860B", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}
                  >
                    {group.category}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.7rem",
                      color: "rgba(200,200,220,0.3)",
                      fontFamily: "'Montserrat', sans-serif",
                      letterSpacing: "1px",
                    }}
                  >
                    {group.questions.length} questions
                  </span>
                </div>

                {/* Questions */}
                <div style={{ padding: "0.75rem" }}>
                  {group.questions.map((q, qi) => {
                    const ansKey = `${gi}-${qi}`;
                    const ansVal = questionAnswers[ansKey] ?? "";
                    const hasAnswer = ansVal.trim().length > 0;
                    return (
                      <div
                        key={qi}
                        style={{
                          padding: "1rem 1rem 0.75rem",
                          borderRadius: "10px",
                          marginBottom: qi < group.questions.length - 1 ? "0.25rem" : 0,
                          borderBottom: qi < group.questions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        {/* Question row */}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                          <span
                            className="font-cinzel"
                            style={{
                              fontSize: "0.7rem",
                              color: hasAnswer ? "rgba(184,134,11,0.85)" : "rgba(184,134,11,0.45)",
                              fontWeight: 700,
                              minWidth: "20px",
                              paddingTop: "3px",
                              letterSpacing: "1px",
                              flexShrink: 0,
                              transition: "color 0.2s",
                            }}
                          >
                            {String(qi + 1).padStart(2, "0")}
                          </span>
                          <p
                            className="font-crimson"
                            style={{
                              fontSize: "1.05rem",
                              color: "#E8E8F5",
                              lineHeight: 1.65,
                              fontStyle: "italic",
                              margin: 0,
                            }}
                          >
                            {q}
                          </p>
                        </div>

                        {/* Answer textarea */}
                        <div style={{ paddingLeft: "2rem" }}>
                          <textarea
                            value={ansVal}
                            onChange={(e) => setQuestionAnswer(gi, qi, e.target.value)}
                            placeholder="Write your answer here…"
                            rows={2}
                            style={{
                              width: "100%",
                              background: hasAnswer ? "rgba(184,134,11,0.06)" : "rgba(0,0,0,0.35)",
                              border: `1px solid ${hasAnswer ? "rgba(184,134,11,0.3)" : "rgba(255,255,255,0.07)"}`,
                              borderRadius: "8px",
                              padding: "0.65rem 0.875rem",
                              color: "#D8D8F0",
                              fontFamily: "'Crimson Text', Georgia, serif",
                              fontSize: "0.95rem",
                              lineHeight: 1.6,
                              resize: "vertical",
                              outline: "none",
                              transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
                              boxSizing: "border-box",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "rgba(184,134,11,0.6)";
                              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184,134,11,0.08)";
                              e.currentTarget.style.background = "rgba(184,134,11,0.08)";
                            }}
                            onBlur={(e) => {
                              const filled = e.currentTarget.value.trim().length > 0;
                              e.currentTarget.style.borderColor = filled ? "rgba(184,134,11,0.3)" : "rgba(255,255,255,0.07)";
                              e.currentTarget.style.boxShadow = "none";
                              e.currentTarget.style.background = filled ? "rgba(184,134,11,0.06)" : "rgba(0,0,0,0.35)";
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
