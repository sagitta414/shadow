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
  {
    key: "victim_awareness",
    label: "Victim's Knowledge of the Why",
    icon: "🪞",
    description: "Does the victim understand the reason they were taken?",
    options: [
      { value: "knew_from_start",  label: "Known — Victim understood immediately why this happened" },
      { value: "gradually_revealed", label: "Revealed — Truth emerges slowly, deliberately or by accident" },
      { value: "disinformation",   label: "Deceived — Given a false reason that serves the captor" },
      { value: "never_told",       label: "Denied — No explanation, left in deliberate ignorance" },
      { value: "self_constructed", label: "Self-Constructed — Victim invented their own explanation to survive" },
    ],
  },
  {
    key: "prior_relationship",
    label: "Captor–Victim Prior Connection",
    icon: "🔗",
    description: "What, if any, relationship existed before this began?",
    options: [
      { value: "strangers",        label: "Strangers — No prior contact; victim was selected at a distance" },
      { value: "acquaintances",    label: "Acquaintances — Known to each other by circumstance or community" },
      { value: "trusted_betrayal", label: "Intimate Betrayal — Someone the victim trusted completely" },
      { value: "professional",     label: "Professional — Work, authority, or institutional connection" },
      { value: "unseen_obsession", label: "Unseen Contact — Stalking or one-sided fixation the victim was unaware of" },
    ],
  },
  {
    key: "victim_profile",
    label: "Victim's Resilience Profile",
    icon: "🫀",
    description: "What psychological and emotional resources does the victim bring into this?",
    options: [
      { value: "trained",        label: "Trained — Military, law enforcement, or survival preparation" },
      { value: "trauma_survivor", label: "Survivor — Has endured previous hardship; has a coping framework" },
      { value: "sheltered",      label: "Sheltered — No template for this; every moment is unprecedented" },
      { value: "fragile",        label: "Fragile — Pre-existing vulnerabilities the captor may be aware of" },
      { value: "calculating",    label: "Calculating — Composed, strategic, already mapping the situation" },
    ],
  },
  {
    key: "outside_world",
    label: "Outside World's Awareness",
    icon: "🌐",
    description: "What does the world outside know about this situation?",
    options: [
      { value: "active_search",   label: "Hot Search — Authorities actively looking; pressure building" },
      { value: "cold_case",       label: "Fading Search — Reported missing but leads dried up" },
      { value: "no_one_knows",    label: "Total Silence — No one knows they are gone" },
      { value: "covered_up",      label: "Covered Up — Captor planted false information to misdirect" },
      { value: "suspect_nearby",  label: "Suspected — One person suspects but has not acted yet" },
    ],
  },
  {
    key: "captor_state",
    label: "Captor's Current Emotional State",
    icon: "🜏",
    description: "What is happening inside the captor right now, beneath the surface?",
    options: [
      { value: "in_control",   label: "In Control — Calm, executing the plan without emotional noise" },
      { value: "conflicted",   label: "Conflicted — Beginning to feel something they did not anticipate" },
      { value: "deteriorating", label: "Deteriorating — Stress or doubt is producing visible cracks" },
      { value: "escalating",   label: "Escalating — Growing darker or more obsessive as time passes" },
      { value: "satisfied",    label: "Satisfied — Content; the situation is unfolding exactly as desired" },
    ],
  },
  {
    key: "story_pivot",
    label: "Narrative Turning Point",
    icon: "⚖️",
    description: "What event or revelation anchors the story's critical shift?",
    options: [
      { value: "external_breach",   label: "External Intrusion — Something from outside disrupts the situation" },
      { value: "captor_slip",       label: "Captor's Mistake — An error creates real opportunity for the victim" },
      { value: "victim_action",     label: "Victim's Move — The victim does something that shifts the dynamic" },
      { value: "revelation",        label: "Revelation — A secret surfaces that changes everything" },
      { value: "unexpected_ally",   label: "Unexpected Help — A third party appears and complicates everything" },
      { value: "internal_collapse", label: "Internal Break — Either the captor or victim reaches a psychological limit" },
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

  // Victim Awareness
  const awarenessQs: string[] = [];
  if (answers.victim_awareness === "knew_from_start") {
    awarenessQs.push("How does knowing the reason change the victim's strategy — does understanding the 'why' give them any leverage?");
    awarenessQs.push("Does the clarity of knowing make acceptance easier, or does full comprehension make everything worse?");
    awarenessQs.push("Is the captor's motive something the victim believes they can address or negotiate — or is it beyond logic?");
  } else if (answers.victim_awareness === "gradually_revealed") {
    awarenessQs.push("What piece of information arrives first — and how does it reframe everything the victim believed up to that point?");
    awarenessQs.push("Does each revelation feel like something the captor intended to release, or do some truths slip out accidentally?");
    awarenessQs.push("At what point does the victim stop wanting to know more — when does knowledge become more dangerous than ignorance?");
  } else if (answers.victim_awareness === "disinformation") {
    awarenessQs.push("What false reason has the victim been given, and how deeply have they accepted it as real?");
    awarenessQs.push("What is the captor's strategic purpose in the deception — does it keep the victim compliant, confused, or emotionally manipulable?");
    awarenessQs.push("When the lie begins to crack, what specific detail is the first thing that does not add up — and what does the victim do with that?");
  } else if (answers.victim_awareness === "never_told") {
    awarenessQs.push("How does having no explanation shape the victim's inner narrative — what story do they tell themselves to make sense of this?");
    awarenessQs.push("Is the silence a deliberate weapon the captor uses — and if so, what does withholding the 'why' accomplish for them?");
    awarenessQs.push("Does the absence of a reason make the situation feel more random and hopeless, or does it leave room for theories that give false hope?");
  } else if (answers.victim_awareness === "self_constructed") {
    awarenessQs.push("What explanation has the victim built for themselves — and how does it shape their behavior and their relationship with the captor?");
    awarenessQs.push("Is the victim's constructed narrative closer to the truth or further from it — and which outcome is more dangerous for them?");
    awarenessQs.push("What happens psychologically if and when the invented explanation is shattered by actual fact?");
  }
  if (awarenessQs.length) groups.push({ category: "Victim's Knowledge", icon: "🪞", questions: awarenessQs });

  // Prior Relationship
  const relationshipQs: string[] = [];
  if (answers.prior_relationship === "strangers") {
    relationshipQs.push("How did the captor select this specific victim from the outside — what made them the target rather than someone else?");
    relationshipQs.push("Does the absence of any prior connection make the captor more or less human to the victim — a random force or a deliberate one?");
    relationshipQs.push("Is there any moment where the victim's lack of history with the captor becomes an advantage — no assumed understanding, no projected relationship?");
  } else if (answers.prior_relationship === "acquaintances") {
    relationshipQs.push("What specific aspect of their prior connection does the captor weaponize — familiarity, shared knowledge, mutual contacts?");
    relationshipQs.push("Does the victim search their memory of this person for warning signs they missed — and do they find them?");
    relationshipQs.push("How does the shared history complicate the victim's ability to fully hate or fear the captor — are there memories that create unwanted ambivalence?");
  } else if (answers.prior_relationship === "trusted_betrayal") {
    relationshipQs.push("What specific act of trust did the victim extend that made this betrayal possible — what door did they open?");
    relationshipQs.push("How does the captor use their prior knowledge of the victim — their fears, routines, relationships, and weaknesses?");
    relationshipQs.push("Is there a version of the captor the victim still mourns — the person they believed existed before this — and does that grief make things harder?");
  } else if (answers.prior_relationship === "professional") {
    relationshipQs.push("What did the professional relationship allow the captor to learn or access that a stranger could never have known?");
    relationshipQs.push("Has the power asymmetry of their original dynamic been replicated, inverted, or irrelevant in this new context?");
    relationshipQs.push("Does the victim feel a residual reflex toward the captor's former role — deference, professionalism, protocol — that they now have to consciously override?");
  } else if (answers.prior_relationship === "unseen_obsession") {
    relationshipQs.push("How long was the captor watching or tracking before acting — and what finally triggered the transition from observation to action?");
    relationshipQs.push("Does the captor speak or behave as though they know the victim intimately — and how does that false familiarity feel to the victim?");
    relationshipQs.push("Looking back through what the captor knows, are there moments from the victim's ordinary life that now feel contaminated — observed, catalogued, violated?");
  }
  if (relationshipQs.length) groups.push({ category: "Prior Relationship", icon: "🔗", questions: relationshipQs });

  // Victim Profile
  const profileQs: string[] = [];
  if (answers.victim_profile === "trained") {
    profileQs.push("What specific skills or protocols is the victim drawing on — SERE training, interrogation resistance, threat assessment — and how well do they hold up here?");
    profileQs.push("Is the captor aware the victim has training — and if so, have they prepared countermeasures or do they underestimate what that training means?");
    profileQs.push("Where does the training fail? What aspect of this situation falls completely outside what the victim was prepared for?");
  } else if (answers.victim_profile === "trauma_survivor") {
    profileQs.push("What previous experience shaped the victim's resilience — and does this situation echo it in ways that feel disturbingly familiar?");
    profileQs.push("Is the prior trauma a source of quiet strength, or does this situation rip open wounds that had only barely healed?");
    profileQs.push("What coping mechanism has the victim used before — and does it work here, or does this situation demand something they do not yet have?");
  } else if (answers.victim_profile === "sheltered") {
    profileQs.push("What is the hardest single truth about captivity that the victim has had to accept — and how long did the denial last?");
    profileQs.push("Where does untested courage come from in a person who has never needed it — what does the victim surprise themselves by doing or enduring?");
    profileQs.push("Is inexperience a form of protection, in some ways — no trained expectations, no anticipated failure modes, no pre-built dread?");
  } else if (answers.victim_profile === "fragile") {
    profileQs.push("What specific vulnerability is the captor aware of and targeting — a past trauma, a phobia, a relationship, an identity?");
    profileQs.push("Is there something in the victim's fragility that actually protects them — a threshold they hit earlier that others would push through into worse territory?");
    profileQs.push("What does the victim hold onto — an image, a belief, a person — that the captor has not yet found and destroyed?");
  } else if (answers.victim_profile === "calculating") {
    profileQs.push("What has the victim already mapped about their captor in the time they have had — what intelligence have they quietly gathered?");
    profileQs.push("Where does calculation break down? What emotion, fear, or physical reality keeps overriding the victim's strategic thinking?");
    profileQs.push("Is the captor aware the victim is calculating — and if so, how do they account for it or try to disrupt it?");
  }
  if (profileQs.length) groups.push({ category: "Victim's Inner Resources", icon: "🫀", questions: profileQs });

  // Outside World
  const outsideQs: string[] = [];
  if (answers.outside_world === "active_search") {
    outsideQs.push("Does the victim know a search is underway — and does hope become its own form of torture when rescue doesn't come?");
    outsideQs.push("Is the active search a threat the captor is genuinely worried about — does it change their timeline or their behavior?");
    outsideQs.push("What would the victim sacrifice right now to send a single signal to the outside world — and do they have anything to sacrifice?");
  } else if (answers.outside_world === "cold_case") {
    outsideQs.push("At what point did the victim stop believing rescue was coming — and what did that moment feel like?");
    outsideQs.push("Does the captor know the search has faded — and how does that knowledge change their confidence or their behavior toward the victim?");
    outsideQs.push("Who specifically gave up, and who specifically has not — is there one person still looking that the victim holds onto?");
  } else if (answers.outside_world === "no_one_knows") {
    outsideQs.push("How did the captor arrange for the victim to simply vanish — what was covered, disposed of, or carefully left ambiguous?");
    outsideQs.push("What does it do to a person's sense of self when the world has no idea they are missing — when they are an absence that hasn't been noticed?");
    outsideQs.push("Is there a single person who would eventually notice — and how long does the victim estimate before they do?");
  } else if (answers.outside_world === "covered_up") {
    outsideQs.push("What false narrative has the captor planted — where is the victim supposed to be, and does anyone believe it fully?");
    outsideQs.push("Is the cover story starting to fray at the edges — and is there any chance someone is noticing the inconsistencies?");
    outsideQs.push("Does the victim know what lie is being told about them — and does that knowledge make them feel further from rescue or give them information to work with?");
  } else if (answers.outside_world === "suspect_nearby") {
    outsideQs.push("Who is the one person who suspects — and what has made them suspicious when everyone else believes the cover story?");
    outsideQs.push("What is stopping this person from acting — doubt, fear, authority, or something the captor has done to neutralize them?");
    outsideQs.push("Does the victim know this person exists — and if not, what would it mean to them to know they haven't been entirely forgotten?");
  }
  if (outsideQs.length) groups.push({ category: "Outside World", icon: "🌐", questions: outsideQs });

  // Captor's Emotional State
  const captorStateQs: string[] = [];
  if (answers.captor_state === "in_control") {
    captorStateQs.push("What does the captor's composure cost them — is the control real, or is something being suppressed that will eventually surface?");
    captorStateQs.push("Is there anything the victim has done that has come closest to disturbing that calm — what almost cracked it?");
    captorStateQs.push("Does the captor's control feel mechanical and cold, or is there something deliberate and even pleasurable in it — and which is more threatening?");
  } else if (answers.captor_state === "conflicted") {
    captorStateQs.push("What specifically has made the captor begin to feel something they did not plan for — what did the victim do, say, or become that they weren't prepared for?");
    captorStateQs.push("Is the captor's conflict something the victim has noticed and could exploit — or is it still fully hidden?");
    captorStateQs.push("What would the captor do if they acted on their conflict — what is the best case scenario the victim could hope for, and the worst?");
  } else if (answers.captor_state === "deteriorating") {
    captorStateQs.push("What external or internal pressure is cracking the captor — time running out, a threat from outside, something the victim did, or doubt about their own choices?");
    captorStateQs.push("Is a deteriorating captor more or less dangerous to the victim — does instability mean opportunity or escalation?");
    captorStateQs.push("What does the captor do to try to recenter or regain their sense of control — and does it work?");
  } else if (answers.captor_state === "escalating") {
    captorStateQs.push("What is driving the escalation — appetite growing, frustration with the victim's resistance, or an external timeline creating pressure?");
    captorStateQs.push("Are there still boundaries the escalating captor has not crossed — and are those limits shrinking?");
    captorStateQs.push("Does the victim see the escalation coming before each incident, or is it arriving without warning — and which is more destabilizing?");
  } else if (answers.captor_state === "satisfied") {
    captorStateQs.push("What exactly is the captor satisfied with — the victim's behavior, the situation's progress, or simply that they have proven something to themselves?");
    captorStateQs.push("Is the satisfaction sustainable, or does it contain the seed of its own end — what would disrupt it?");
    captorStateQs.push("How does the victim relate to a captor who seems content — does it feel safer or more final?");
  }
  if (captorStateQs.length) groups.push({ category: "Captor's Inner State", icon: "🜏", questions: captorStateQs });

  // Narrative Pivot
  const pivotQs: string[] = [];
  if (answers.story_pivot === "external_breach") {
    pivotQs.push("What is the nature of the intrusion — a person, an event, a discovery — and does it help the victim, threaten both of them, or make everything worse?");
    pivotQs.push("How does the captor respond to the breach — do they tighten control, panic, or make a decision they cannot undo?");
    pivotQs.push("Does the external intrusion give the victim a window — and how narrow is it, and what does using it cost them?");
  } else if (answers.story_pivot === "captor_slip") {
    pivotQs.push("What is the nature of the mistake — a lapse in surveillance, an unlocked door, a piece of information accidentally shared, a moment of emotional vulnerability?");
    pivotQs.push("Does the victim recognize the opportunity in real time, or only realize it afterward — and does that delay matter?");
    pivotQs.push("What is the cost of acting on the captor's mistake — what does the victim risk if they are caught trying?");
  } else if (answers.story_pivot === "victim_action") {
    pivotQs.push("What does the victim do — a deliberate act of defiance, an appeal that lands differently than expected, a deception, a physical attempt?");
    pivotQs.push("Was it planned, or did the victim act on instinct — and do they believe it was the right choice in the moment after?");
    pivotQs.push("How does the captor respond — and does the victim's action make their situation measurably better, measurably worse, or simply different?");
  } else if (answers.story_pivot === "revelation") {
    pivotQs.push("What is revealed — about the captor's identity, their true motive, their past, or something about the victim themselves they did not know?");
    pivotQs.push("Who learns the revelation first — and does knowing it give them power, or remove a protection they didn't know they had?");
    pivotQs.push("Is the revelation something both parties now have to live with together — and what does shared knowledge do to the dynamic between them?");
  } else if (answers.story_pivot === "unexpected_ally") {
    pivotQs.push("Who is the third party — someone sent to help, someone stumbling in accidentally, or someone with their own agenda that happens to intersect with the victim's survival?");
    pivotQs.push("Can the victim trust this person — and what would the cost of misplaced trust be in this situation?");
    pivotQs.push("How does the captor react to this new variable — do they absorb it, escalate, or does it expose a vulnerability they didn't have before?");
  } else if (answers.story_pivot === "internal_collapse") {
    pivotQs.push("Who breaks first — the captor or the victim — and what does 'breaking' actually look like for each of them in this specific situation?");
    pivotQs.push("Is the collapse the end of something, or the beginning — does it close a chapter or tear one open?");
    pivotQs.push("What survives the collapse — in the person who broke, and in the person who watched it happen?");
  }
  if (pivotQs.length) groups.push({ category: "Narrative Turning Point", icon: "⚖️", questions: pivotQs });

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
    victim_awareness: { knew_from_start: "full knowledge of the reason from the start", gradually_revealed: "a truth that emerged gradually", disinformation: "a deliberately planted false explanation", never_told: "total ignorance of the reason", self_constructed: "a self-constructed explanation" },
    prior_relationship: { strangers: "no prior connection", acquaintances: "a prior acquaintance", trusted_betrayal: "intimate betrayal of trust", professional: "a professional relationship", unseen_obsession: "a one-sided fixation the victim was unaware of" },
    victim_profile: { trained: "a trained, prepared background", trauma_survivor: "a trauma-survivor's resilience", sheltered: "no prior hardship or framework", fragile: "pre-existing psychological vulnerability", calculating: "a composed, strategic mindset" },
    outside_world: { active_search: "an active search underway", cold_case: "a search that has already faded", no_one_knows: "total silence — no one knows", covered_up: "a deliberate cover story planted by the captor", suspect_nearby: "one person who suspects but has not yet acted" },
    captor_state: { in_control: "complete composure and control", conflicted: "emerging internal conflict", deteriorating: "visible deterioration and cracks", escalating: "a darkening, escalating intensity", satisfied: "contentment with how things are unfolding" },
    story_pivot: { external_breach: "an external intrusion that disrupts the situation", captor_slip: "a captor's mistake that creates opportunity", victim_action: "an action taken by the victim that shifts the dynamic", revelation: "a revelation that changes everything", unexpected_ally: "an unexpected third party entering the situation", internal_collapse: "an internal psychological breaking point" },
  };
  const get = (k: string) => labels[k]?.[answers[k]] ?? "unknown";
  return `A captor motivated by ${get("motive")}, operating from ${get("setting")} over the course of ${get("duration")}. They bring ${get("background")}, maintaining control through ${get("control")}. Violence threshold: ${get("violence")}. Psychological approach: ${get("psychology")}. Endgame: ${get("endgame")}. The victim has ${get("victim_awareness")}, and their relationship prior to this was ${get("prior_relationship")}. The victim brings ${get("victim_profile")}. The outside world: ${get("outside_world")}. The captor's current state: ${get("captor_state")}. The story's defining turning point: ${get("story_pivot")}.`;
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
        <p style={{ color: "rgba(200,200,220,0.55)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
          Configure all 14 parameters of your scenario. Each selection generates 3 targeted narrative questions — up to 42 in total.
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
