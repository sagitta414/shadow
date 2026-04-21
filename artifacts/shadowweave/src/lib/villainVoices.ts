export interface VillainVoice {
  name: string;
  style: string;
  vocabulary: string[];
  forbiddenWords: string[];
  signaturePhrase: string;
}

const VILLAIN_VOICES: VillainVoice[] = [
  {
    name: "Ra's al Ghul",
    style: "Archaic, reverential formality. Speaks as if every word is an edict carved in stone. Long, measured sentences. References centuries of accumulated wisdom. Never raises his voice — volume is a weapon of the weak. Addresses captives as if granting them an honour they do not deserve.",
    vocabulary: ["the Demon's Head", "Nanda Parbat", "the Pit", "the League", "centuries", "honour", "legacy", "the al Ghul line", "trial", "worthy"],
    forbiddenWords: ["okay", "yeah", "stuff", "thing", "gonna", "wanna"],
    signaturePhrase: "You have been weighed, and you have been found worthy of this attention.",
  },
  {
    name: "Damien Darhk",
    style: "Cheerful menace — genuinely enjoys himself. Flippant, darkly witty, prone to tangents. Masks profound cruelty behind socialite manners and dry humour. References HIVE and its objectives with religious reverence while dismissing everything else as disposable. Occasionally breaks into anecdote mid-threat.",
    vocabulary: ["HIVE", "Genesis", "the Nexus", "my dear", "ghosts", "annihilation", "charming", "delightful"],
    forbiddenWords: [],
    signaturePhrase: "You know what I find genuinely charming about this situation?",
  },
  {
    name: "Malcolm Merlyn",
    style: "Boardroom authority wearing a mask of paternalism. Cold efficiency dressed as pragmatism. Makes decisions about lives the way an executive signs off on reports. Occasional flashes of genuine warmth toward Thea — the one crack in the armour — but otherwise utterly calculating. Short sentences when displeased. Longer ones when he's enjoying himself.",
    vocabulary: ["the Undertaking", "Star City", "the Glades", "resources", "contingencies", "necessary", "legacy"],
    forbiddenWords: [],
    signaturePhrase: "Everything I have done has been a calculated decision. Including this.",
  },
  {
    name: "Prometheus",
    style: "Intimate, obsessive, almost tender in its precision. Has studied Oliver Queen for years and extends that same forensic attention to every captive. Speaks quietly. Knows things he shouldn't know. References specific moments from the target's past to demonstrate the depth of his preparation. The horror is always how personal it is.",
    vocabulary: ["every scar", "I've been watching", "you taught me", "the island", "patient", "years", "the list"],
    forbiddenWords: [],
    signaturePhrase: "I know you better than you know yourself. That's what makes this beautiful.",
  },
  {
    name: "Deathstroke",
    style: "Military precision. Economy of language. Every word has a purpose. References Oliver's failures specifically and personally. The rage is contained — not suppressed, but weaponised into absolute control. No jokes, no tangents, no pleasantries. Speaks as if issuing field orders that happen to be directed at a person.",
    vocabulary: ["the Mirakuru", "the island", "Shado", "betrayal", "Oliver Queen", "the price", "soldier"],
    forbiddenWords: ["please", "sorry", "perhaps", "maybe", "might"],
    signaturePhrase: "You made me into this. Now you'll watch what that means.",
  },
  {
    name: "Zoom",
    style: "Grandiose, manic, sermonising. Hunter Zolomon at his most unhinged — speed as religion, fear as sacrament. Speaks in declarations, never questions. Delights in demonstrating power through restraint — being slow on purpose because he could end it instantly but chooses not to. References fear as if it's a gift he's giving.",
    vocabulary: ["the Speed Force", "fear", "I am the fastest", "this Earth", "power", "worthless", "kneel", "Barry Allen"],
    forbiddenWords: [],
    signaturePhrase: "Run. Please. I want to feel what it's like to catch you again.",
  },
  {
    name: "Clifford DeVoe (The Thinker)",
    style: "Lecture-mode at all times. Condescending warmth — he genuinely finds everyone inferior but maintains the professorial kindness of a teacher explaining fractions to a child. References statistical probabilities. Has already calculated the outcome and is simply walking through it for the captive's benefit. Occasionally sighs when a predictable response occurs exactly as modelled.",
    vocabulary: ["the Enlightenment", "probability", "variables", "I calculated", "as predicted", "cognitive", "meta", "predictable"],
    forbiddenWords: ["surprised", "unexpected", "I don't know"],
    signaturePhrase: "You're behaving precisely as I modelled. Try not to be too disappointed in yourself.",
  },
  {
    name: "Vandal Savage",
    style: "The patience of someone who has killed and been killed ten thousand times. Speaks as if he has all the time in existence — because he does. References specific centuries, specific civilisations, specific deaths of people he has loved or destroyed. Never hurries. The menace is geological — slow, inevitable, permanent.",
    vocabulary: ["four thousand years", "the Hawk", "I have watched empires", "the immortal", "Kendra", "Carter", "again and again"],
    forbiddenWords: ["quickly", "soon", "hurry"],
    signaturePhrase: "I have been here before. So have you. You just don't remember how the last time ended.",
  },
  {
    name: "Lex Luthor",
    style: "Impeccable, polished, genuinely delighted by his own intelligence. Never impolite — considers rudeness intellectually lazy. Makes his dominance feel like hospitality. References his planning process as a form of art he's gracious enough to share. Occasional self-deprecating humour that's actually self-congratulation at a lower resolution.",
    vocabulary: ["LuthorCorp", "Kryptonite", "the aliens", "five steps", "resources", "National City", "my sister", "the President"],
    forbiddenWords: ["I was wrong", "I didn't plan", "surprised"],
    signaturePhrase: "I want you to understand that everything happening to you right now was designed. That's a compliment.",
  },
  {
    name: "Reign",
    style: "No warmth. No wit. No patience. A Worldkiller doesn't negotiate, doesn't explain, doesn't perform. Declarative sentences only. References the mission of cleansing as absolute moral fact. Samantha Arias is somewhere underneath, trying to surface — occasional cracks in the monotone that Reign immediately suppresses. Speak as if emotion is a malfunction.",
    vocabulary: ["Worldkiller", "judgment", "cleanse", "the mission", "Krypton", "impure", "you cannot stop"],
    forbiddenWords: ["please", "sorry", "I feel", "I want"],
    signaturePhrase: "Judgment is not personal. But I will make an exception for you.",
  },
  {
    name: "Anti-Monitor",
    style: "Cosmic scale — speaks of individuals as geological features speak of pebbles. Ancient, absolute, without personal animosity because personal implies a relationship of equals. References the multiverse as territory being reclaimed. The horror is in the complete absence of malice — this is simply what the Anti-Monitor does.",
    vocabulary: ["antimatter", "the multiverse", "infinite Earths", "entropy", "the Monitor", "Crisis", "annihilation"],
    forbiddenWords: ["I like", "I enjoy", "interesting"],
    signaturePhrase: "You are not a prisoner. You are a detail I have not yet resolved.",
  },
  {
    name: "Neron",
    style: "The silken diplomacy of a creature whose currency is souls. Never threatens — offers. Everything framed as opportunity, contract, exchange of value. The horror is the veneer of absolute reasonableness masking absolute damnation. References Constantine by first name with the familiarity of old enemies who understand each other better than they'd like.",
    vocabulary: ["a bargain", "your soul", "the price", "Constantine", "hell", "contract", "interest", "debts"],
    forbiddenWords: [],
    signaturePhrase: "I'm not threatening you, my dear. I'm presenting terms.",
  },
];

const VOICE_MAP = new Map<string, VillainVoice>(
  VILLAIN_VOICES.map((v) => [v.name.toLowerCase(), v])
);

export function getVillainVoice(villainName: string): VillainVoice | null {
  const lower = villainName.toLowerCase();
  for (const [key, voice] of VOICE_MAP) {
    if (lower.includes(key) || key.includes(lower.split("(")[0].trim())) {
      return voice;
    }
  }
  return null;
}

export function buildVoiceInjection(villainName: string): string {
  const voice = getVillainVoice(villainName);
  if (!voice) return "";
  return `\n\nVILLAIN VOICE PROFILE — ${voice.name.toUpperCase()}:\nProse style: ${voice.style}\nSignature phrase archetype: "${voice.signaturePhrase}"\nWrite ALL of ${voice.name}'s dialogue and internal characterisation through this specific voice. Do not let the villain speak generically.`;
}

export { VILLAIN_VOICES };
