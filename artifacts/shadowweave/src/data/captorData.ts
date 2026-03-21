export interface CaptorOption {
  value: string;
  title: string;
  desc: string;
}

export interface CaptorQuestion {
  id: number;
  label: string;
  title: string;
  description: string;
  options: CaptorOption[];
  followupKey: string;
}

export const captorQuestions: CaptorQuestion[] = [
  {
    id: 1,
    label: "CONFIG 1",
    title: "What is their operational structure?",
    description: "The organizational framework shapes their capabilities, resources, and vulnerabilities.",
    followupKey: "operational",
    options: [
      { value: "solo-operator", title: "Solo Operator", desc: "Single highly skilled individual, no support network" },
      { value: "partner-duo", title: "Partner Duo", desc: "Two-person team with complementary skills and roles" },
      { value: "small-team", title: "Small Tactical Team", desc: "3-5 person team with specialized roles" },
      { value: "organization", title: "Formal Organization", desc: "Structured hierarchy with multiple teams and resources" },
    ],
  },
  {
    id: 2,
    label: "CONFIG 2",
    title: "What drives their primary motivation?",
    description: "The core motivation determines their goals, behavior patterns, and negotiating position.",
    followupKey: "motivation",
    options: [
      { value: "financial", title: "Financial Gain", desc: "Ransom, blackmail, human trafficking for profit" },
      { value: "psychological", title: "Psychological Control", desc: "Power, dominance, breaking someone's will" },
      { value: "ideological", title: "Ideological Mission", desc: "Religious extremism, political agenda, personal crusade" },
      { value: "revenge", title: "Personal Revenge", desc: "Targeted vengeance against specific person or group" },
      { value: "pleasure", title: "Sadistic Pleasure", desc: "Enjoyment of others' suffering and fear" },
    ],
  },
  {
    id: 3,
    label: "CONFIG 3",
    title: "What is their professional background?",
    description: "Their training and experience determine their skill set, methodology, and approach.",
    followupKey: "background",
    options: [
      { value: "military", title: "Military Special Forces", desc: "Elite tactical training, combat experience, discipline" },
      { value: "law-enforcement", title: "Law Enforcement", desc: "Police tactics, investigative skills, legal knowledge" },
      { value: "intelligence", title: "Intelligence Agency", desc: "Covert operations, psychological warfare, surveillance" },
      { value: "criminal", title: "Criminal Professional", desc: "Organized crime, street smarts, ruthless efficiency" },
      { value: "amateur", title: "Skilled Amateur", desc: "Self-taught, natural talent, unpredictable methods" },
    ],
  },
  {
    id: 4,
    label: "CONFIG 4",
    title: "What equipment and resources do they have access to?",
    description: "Available resources determine their operational capability and the threat level they present.",
    followupKey: "equipment",
    options: [
      { value: "basic", title: "Basic/Improvised", desc: "Simple restraints, common tools, minimal technology" },
      { value: "standard", title: "Professional Grade", desc: "Quality restraints, specialized gear, reliable equipment" },
      { value: "advanced", title: "Advanced Tactical", desc: "Military-grade gear, specialized restraints, advanced tech" },
      { value: "cutting-edge", title: "Cutting-Edge/Experimental", desc: "Custom equipment, prototype technology, unique innovations" },
    ],
  },
  {
    id: 5,
    label: "CONFIG 5",
    title: "What is their violence threshold?",
    description: "Their willingness to use physical force determines the intensity and danger level of encounters.",
    followupKey: "violence",
    options: [
      { value: "minimal", title: "Minimal Violence", desc: "Avoids physical harm, uses psychological intimidation" },
      { value: "calculated", title: "Calculated Violence", desc: "Uses force strategically, avoids unnecessary damage" },
      { value: "pragmatic", title: "Pragmatic Violence", desc: "Uses whatever force necessary to achieve objectives" },
      { value: "excessive", title: "Excessive Violence", desc: "Enjoys using force, often more than necessary" },
      { value: "sadistic", title: "Sadistic Violence", desc: "Inflicts pain for pleasure, torture as primary method" },
    ],
  },
  {
    id: 6,
    label: "CONFIG 6",
    title: "What is their psychological approach?",
    description: "Their mental tactics and emotional manipulation methods determine their psychological warfare capabilities.",
    followupKey: "psychological",
    options: [
      { value: "intimidation", title: "Pure Intimidation", desc: "Fear-based control, threats, psychological terror" },
      { value: "manipulation", title: "Psychological Manipulation", desc: "Gaslighting, emotional manipulation, mind games" },
      { value: "conditioning", title: "Behavioral Conditioning", desc: "Systematic breaking and rebuilding of target's psyche" },
      { value: "impersonal", title: "Impersonal Professional", desc: "Treats target as object, minimal psychological tactics" },
      { value: "complex", title: "Complex Psychological Warfare", desc: "Multi-layered manipulation, advanced psychological tactics" },
    ],
  },
  {
    id: 7,
    label: "CONFIG 7",
    title: "How do they assess and manage risk?",
    description: "Their risk tolerance and mitigation strategies affect their operational security and decision-making.",
    followupKey: "risk",
    options: [
      { value: "ultra-cautious", title: "Ultra-Cautious", desc: "Extensive planning, minimal risk, multiple contingencies" },
      { value: "calculated", title: "Calculated Risk-Taker", desc: "Careful analysis, accepts necessary risks, prepared" },
      { value: "opportunistic", title: "Opportunistic", desc: "Adaptable, takes calculated chances, flexible planning" },
      { value: "reckless", title: "Reckless", desc: "High risk tolerance, improvisational, minimal planning" },
    ],
  },
  {
    id: 8,
    label: "CONFIG 8",
    title: "What is their endgame strategy?",
    description: "Their long-term objectives and exit strategy determine how the situation concludes.",
    followupKey: "endgame",
    options: [
      { value: "ransom", title: "Ransom & Release", desc: "Financial exchange, safe release, clean exit" },
      { value: "permanent", title: "Permanent Captivity", desc: "Long-term control, ongoing relationship, never releases" },
      { value: "elimination", title: "Elimination", desc: "No witnesses, clean disposal, permanent solution" },
      { value: "transformation", title: "Psychological Transformation", desc: "Complete personality alteration, new identity creation" },
      { value: "unspecified", title: "Unspecified/Open-Ended", desc: "No clear endgame, adapts as situation develops" },
    ],
  },
];

export interface CaptorFollowupField {
  type: "textarea" | "input";
  title: string;
  placeholder: string;
}

export const captorFollowupsData: Record<string, Record<string, CaptorFollowupField[]>> = {
  operational: {
    "solo-operator": [
      { type: "textarea", title: "What makes this individual so effective alone?", placeholder: "Specialized skills, physical advantages, psychological profile, experience level." },
      { type: "textarea", title: "How do they handle logistics and support alone?", placeholder: "Equipment acquisition, location management, information gathering, emergency backup." },
      { type: "textarea", title: "What are the advantages and disadvantages of operating alone?", placeholder: "Stealth, no coordination issues vs. no backup, limited capacity." },
    ],
    "partner-duo": [
      { type: "textarea", title: "How are roles divided between the partners?", placeholder: "Leader/follower, specialist/generalist, muscle/brains. What complementary skills do they bring?" },
      { type: "textarea", title: "What is their relationship dynamic?", placeholder: "Professional partnership, romantic involvement, family ties, mentor/mentee." },
      { type: "textarea", title: "How do they handle disagreements or conflicts?", placeholder: "Clear hierarchy, democratic decisions, compromise, one dominates." },
    ],
    "small-team": [
      { type: "textarea", title: "What specialized roles exist in the team?", placeholder: "Leader, scout, medic, tech specialist, muscle, interrogator." },
      { type: "textarea", title: "Who leads the team and how is leadership established?", placeholder: "Experience, charisma, tactical expertise, founder." },
      { type: "textarea", title: "What communication protocols do they use?", placeholder: "Codes, signals, encrypted channels, non-verbal cues." },
    ],
    organization: [
      { type: "textarea", title: "What is the organizational hierarchy?", placeholder: "Cell structure, traditional hierarchy, flat organization, franchise model." },
      { type: "textarea", title: "What resources and support do they have?", placeholder: "Safe houses, equipment stockpiles, intelligence network, financial backing." },
      { type: "textarea", title: "How do they maintain operational security?", placeholder: "Compartmentalization, need-to-know, loyalty enforcement, counter-intelligence." },
    ],
  },
  motivation: {
    financial: [
      { type: "input", title: "What is their specific financial goal?", placeholder: "e.g., $10 million ransom, ongoing blackmail payments, human trafficking profits..." },
      { type: "textarea", title: "How do they plan to receive and launder the money?", placeholder: "Cryptocurrency, offshore accounts, cash drops, front businesses." },
      { type: "textarea", title: "What happens if they don't get paid?", placeholder: "Kill the hostage, release them, try again, escalate threats." },
    ],
    psychological: [
      { type: "textarea", title: "What specific form of control do they crave?", placeholder: "Complete obedience, emotional dependence, fear-based submission, breaking someone's spirit." },
      { type: "textarea", title: "Why do they need this psychological control?", placeholder: "Childhood trauma, narcissistic need, power complex, past powerlessness." },
    ],
    ideological: [
      { type: "textarea", title: "What is the specific ideology or belief system?", placeholder: "Religious doctrine, political extremism, personal philosophy, cult beliefs." },
      { type: "textarea", title: "How does this mission justify their actions to themselves?", placeholder: "Greater good, divine mandate, justice, historical grievance." },
    ],
    revenge: [
      { type: "textarea", title: "What specifically are they avenging?", placeholder: "Personal loss, humiliation, betrayal, injustice, destroyed opportunity." },
      { type: "textarea", title: "Is the target the actual wrongdoer or a proxy?", placeholder: "Direct perpetrator, family member, institution, symbol." },
    ],
    pleasure: [
      { type: "textarea", title: "What specifically do they enjoy?", placeholder: "Fear responses, physical pain, psychological breakdown, helplessness, control." },
      { type: "textarea", title: "How long have they had these tendencies?", placeholder: "Childhood origins, triggered by event, gradual escalation, always present." },
    ],
  },
  background: {
    military: [
      { type: "textarea", title: "What branch and specialty?", placeholder: "Army Ranger, Navy SEAL, Special Forces, Intelligence Corps. Combat deployments?" },
      { type: "textarea", title: "Why did they leave or go rogue?", placeholder: "Discharge, trauma, corruption, ideology shift, opportunity." },
    ],
    "law-enforcement": [
      { type: "textarea", title: "What was their specific role?", placeholder: "Detective, SWAT, FBI, DEA, corrections officer." },
      { type: "textarea", title: "What gave them the inside knowledge they now exploit?", placeholder: "Investigation tactics, criminal networks, evidence handling, legal loopholes." },
    ],
    intelligence: [
      { type: "textarea", title: "Which agency and what type of work?", placeholder: "CIA, NSA, MI6, private intel firm. Field operative or analyst?" },
      { type: "textarea", title: "What drove them to go operational on their own?", placeholder: "Burned, blacklisted, ideological break, better opportunity." },
    ],
    criminal: [
      { type: "textarea", title: "What criminal world do they come from?", placeholder: "Organized crime family, street gang, human trafficking, smuggling, contract work." },
      { type: "textarea", title: "How did they rise to their current capability?", placeholder: "Worked their way up, natural talent, key mentor, specific event." },
    ],
    amateur: [
      { type: "textarea", title: "What prepared them despite lack of formal training?", placeholder: "Obsessive research, natural aptitude, specific life experience, desperation." },
      { type: "textarea", title: "Where are their knowledge gaps?", placeholder: "What don't they know that professionals would? How does this create risk?" },
    ],
  },
  equipment: {
    basic: [
      { type: "textarea", title: "What specific improvised tools do they use?", placeholder: "Hardware store items, household materials, common restraints." },
    ],
    standard: [
      { type: "textarea", title: "Where do they source professional equipment?", placeholder: "Black market, stolen, online dark web, corrupt suppliers." },
    ],
    advanced: [
      { type: "textarea", title: "What advanced equipment is central to their operations?", placeholder: "Surveillance tech, chemical agents, specialized restraints, tracking devices." },
    ],
    "cutting-edge": [
      { type: "textarea", title: "What experimental technology do they employ?", placeholder: "Prototype devices, custom-built systems, cutting-edge surveillance, unique methods." },
      { type: "textarea", title: "How did they gain access to such technology?", placeholder: "Military theft, corporate espionage, personal development, black market." },
    ],
  },
  violence: {
    minimal: [
      { type: "textarea", title: "What psychological tactics replace physical violence?", placeholder: "Specific threats, environmental control, chemical sedation, leveraging fears." },
    ],
    calculated: [
      { type: "textarea", title: "What threshold triggers physical force?", placeholder: "Resistance, escape attempt, specific behavior, scheduled escalation." },
    ],
    pragmatic: [
      { type: "textarea", title: "How do they calibrate violence to objectives?", placeholder: "Injury vs. efficiency, leaving marks, maintaining functionality, intimidation value." },
    ],
    excessive: [
      { type: "textarea", title: "What triggers their excessive response?", placeholder: "Specific triggers, escalation patterns, loss of control moments, what sets them off." },
    ],
    sadistic: [
      { type: "textarea", title: "What specific acts give them the most satisfaction?", placeholder: "Physical methods, psychological methods, duration, witness reactions." },
      { type: "textarea", title: "How do they balance pleasure with maintaining their asset?", placeholder: "Do they have limits despite sadism? What keeps them from going too far?" },
    ],
  },
  psychological: {
    intimidation: [
      { type: "textarea", title: "What are their most effective intimidation methods?", placeholder: "Specific threats, environmental design, demonstrations, unpredictability." },
    ],
    manipulation: [
      { type: "textarea", title: "What psychological vulnerabilities do they exploit?", placeholder: "Fear of abandonment, guilt, hope, attachment, specific phobias." },
    ],
    conditioning: [
      { type: "textarea", title: "What is their conditioning methodology?", placeholder: "Reward/punishment cycles, identity replacement, isolation effects, timeline." },
    ],
    impersonal: [
      { type: "textarea", title: "How does their impersonal approach affect operations?", placeholder: "Efficiency gains, victim response, risk factors of dehumanization." },
    ],
    complex: [
      { type: "textarea", title: "What specific psychological operations do they run simultaneously?", placeholder: "Multiple manipulation tracks, long-term conditioning programs, layered deceptions." },
    ],
  },
  risk: {
    "ultra-cautious": [
      { type: "textarea", title: "What are their specific risk mitigation protocols?", placeholder: "Surveillance sweeps, counter-surveillance, communication security, exit routes." },
    ],
    calculated: [
      { type: "textarea", title: "What calculated risks have they taken successfully?", placeholder: "Past operations, close calls, how they weigh risk vs. reward." },
    ],
    opportunistic: [
      { type: "textarea", title: "How do they quickly assess and exploit opportunities?", placeholder: "Decision speed, information processing, improvisation skills." },
    ],
    reckless: [
      { type: "textarea", title: "What past recklessness has almost cost them?", placeholder: "Near misses, consequences survived, why they haven't been caught yet." },
    ],
  },
  endgame: {
    ransom: [
      { type: "textarea", title: "Who are they demanding ransom from?", placeholder: "Family, employer, government, insurance. Who has the ability to pay?" },
      { type: "textarea", title: "What is their contingency if ransom is refused?", placeholder: "Escalation tactics, alternative extraction, what happens to the target." },
    ],
    permanent: [
      { type: "textarea", title: "What does 'permanent' mean to them specifically?", placeholder: "Domestic servitude, companion, trophy, controlled asset. What role do they envision?" },
      { type: "textarea", title: "How do they plan to maintain this indefinitely?", placeholder: "Location security, psychological methods, cutting off outside world." },
    ],
    elimination: [
      { type: "textarea", title: "What triggers the elimination decision?", placeholder: "Specific timeline, risk assessment, purpose fulfilled, predetermined point." },
      { type: "textarea", title: "How do they handle disposal and cover-up?", placeholder: "Methods, location, evidence elimination, establishing alibis." },
    ],
    transformation: [
      { type: "textarea", title: "What new identity do they intend to create?", placeholder: "New name, personality, beliefs, role. What is the target supposed to become?" },
      { type: "textarea", title: "What methods drive the transformation?", placeholder: "Isolation, conditioning, chemical assistance, psychological breakdown and rebuilding." },
    ],
    unspecified: [
      { type: "textarea", title: "What factors will determine how it ends?", placeholder: "Target behavior, external pressure, opportunity, evolving feelings about target." },
    ],
  },
};

export const captorDescriptions: Record<string, Record<string, string>> = {
  operational: {
    "solo-operator": "Solo Operator — Single highly skilled individual",
    "partner-duo": "Partner Duo — Two-person team with complementary skills",
    "small-team": "Small Tactical Team — 3-5 person team with specialized roles",
    organization: "Formal Organization — Structured hierarchy with multiple teams",
  },
  motivation: {
    financial: "Financial Gain — Ransom, blackmail, human trafficking for profit",
    psychological: "Psychological Control — Power, dominance, breaking someone's will",
    ideological: "Ideological Mission — Religious extremism, political agenda, personal crusade",
    revenge: "Personal Revenge — Targeted vengeance against specific person or group",
    pleasure: "Sadistic Pleasure — Enjoyment of others' suffering and fear",
  },
  background: {
    military: "Military Special Forces — Elite tactical training, combat experience",
    "law-enforcement": "Law Enforcement — Police tactics, investigative skills",
    intelligence: "Intelligence Agency — Covert operations, psychological warfare",
    criminal: "Criminal Professional — Organized crime, street smarts, ruthless efficiency",
    amateur: "Skilled Amateur — Self-taught, natural talent, unpredictable methods",
  },
  equipment: {
    basic: "Basic/Improvised — Simple restraints, common tools, minimal technology",
    standard: "Professional Grade — Quality restraints, specialized gear, reliable equipment",
    advanced: "Advanced Tactical — Military-grade gear, specialized restraints, advanced tech",
    "cutting-edge": "Cutting-Edge/Experimental — Custom equipment, prototype technology",
  },
  violence: {
    minimal: "Minimal Violence — Avoids physical harm, uses psychological intimidation",
    calculated: "Calculated Violence — Uses force strategically, avoids unnecessary damage",
    pragmatic: "Pragmatic Violence — Uses whatever force necessary to achieve objectives",
    excessive: "Excessive Violence — Enjoys using force, often more than necessary",
    sadistic: "Sadistic Violence — Inflicts pain for pleasure, torture as primary method",
  },
  psychological: {
    intimidation: "Pure Intimidation — Fear-based control, threats, psychological terror",
    manipulation: "Psychological Manipulation — Gaslighting, emotional manipulation, mind games",
    conditioning: "Behavioral Conditioning — Systematic breaking and rebuilding of target's psyche",
    impersonal: "Impersonal Professional — Treats target as object, minimal psychological tactics",
    complex: "Complex Psychological Warfare — Multi-layered manipulation, advanced psychological tactics",
  },
  risk: {
    "ultra-cautious": "Ultra-Cautious — Extensive planning, minimal risk, multiple contingencies",
    calculated: "Calculated Risk-Taker — Careful analysis, accepts necessary risks, prepared",
    opportunistic: "Opportunistic — Adaptable, takes calculated chances, flexible planning",
    reckless: "Reckless — High risk tolerance, improvisational, minimal planning",
  },
  endgame: {
    ransom: "Ransom & Release — Financial exchange, safe release, clean exit",
    permanent: "Permanent Captivity — Long-term control, ongoing relationship, never releases",
    elimination: "Elimination — No witnesses, clean disposal, permanent solution",
    transformation: "Psychological Transformation — Complete personality alteration, new identity creation",
    unspecified: "Unspecified/Open-Ended — No clear endgame, adapts as situation develops",
  },
};
