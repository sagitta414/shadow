export interface QuestionOption {
  value: string;
  title: string;
  desc: string;
}

export interface Question {
  id: number;
  label: string;
  title: string;
  description: string;
  options: QuestionOption[];
  followupKey: string;
}

export const questions: Question[] = [
  {
    id: 1,
    label: "QUESTION 1",
    title: "What is your character's age range?",
    description: "Age shapes perspective, experience, and the psychological complexity of your character's journey.",
    followupKey: "age",
    options: [
      { value: "18-21", title: "18–21 Years Old", desc: "Young adult, just starting out, discovering independence" },
      { value: "22-25", title: "22–25 Years Old", desc: "Early career stage, establishing identity and relationships" },
      { value: "26-30", title: "26–30 Years Old", desc: "Late twenties, navigating adult responsibilities" },
      { value: "31-35", title: "31–35 Years Old", desc: "Early thirties, settled but facing new challenges" },
      { value: "36-40", title: "36–40 Years Old", desc: "Approaching mid-life, reflection and reassessment" },
      { value: "41+", title: "41+ Years Old", desc: "Mature adult, wealth of experience, complex history" },
    ],
  },
  {
    id: 2,
    label: "QUESTION 2",
    title: "What is their physical appearance?",
    description: "Physical traits affect how others perceive your character and how they see themselves.",
    followupKey: "physical",
    options: [
      { value: "athletic", title: "Athletic & Fit", desc: "Toned, active lifestyle, physical capabilities are notable" },
      { value: "average", title: "Average Build", desc: "Neither notably fit nor unfit, blends into crowds easily" },
      { value: "slender", title: "Slender & Lean", desc: "Thin or petite, may appear fragile but has hidden strengths" },
      { value: "curvy", title: "Curvy & Full-Figured", desc: "Voluptuous body type, may attract unwanted attention" },
      { value: "muscular", title: "Muscular & Powerful", desc: "Imposing physical presence, strength is evident" },
    ],
  },
  {
    id: 3,
    label: "QUESTION 3",
    title: "What is their professional background?",
    description: "Career and education shape how your character thinks, what resources they have, and their social standing.",
    followupKey: "profession",
    options: [
      { value: "student", title: "Student/Academic", desc: "Still in education, intellectual but inexperienced" },
      { value: "professional", title: "Corporate Professional", desc: "Office environment, structured life, career-focused" },
      { value: "creative", title: "Creative Professional", desc: "Artist, writer, musician — unconventional lifestyle" },
      { value: "service", title: "Service Industry", desc: "Hospitality, retail, healthcare — people-oriented work" },
      { value: "unemployed", title: "Unemployed/Struggling", desc: "Financial stress, uncertain future, vulnerable position" },
    ],
  },
  {
    id: 4,
    label: "QUESTION 4",
    title: "What is their living situation?",
    description: "Where and how someone lives reveals economic status, safety level, and social connections.",
    followupKey: "living",
    options: [
      { value: "alone-apartment", title: "Lives Alone — Apartment", desc: "Independent, urban, limited nearby support network" },
      { value: "shared-roommates", title: "Shared Housing with Roommates", desc: "Others in the building, some social safety net" },
      { value: "family-home", title: "Lives with Family", desc: "Parents or relatives, complex family dynamics" },
      { value: "isolated-rural", title: "Isolated Rural Location", desc: "Far from neighbors, minimal outside contact" },
      { value: "own-property", title: "Owns Their Property", desc: "Financial stability, established roots in community" },
    ],
  },
  {
    id: 5,
    label: "QUESTION 5",
    title: "What is their family background?",
    description: "Family history shapes attachment style, trauma responses, and emotional vulnerabilities.",
    followupKey: "family",
    options: [
      { value: "stable-loving", title: "Stable & Loving", desc: "Supportive family unit, positive childhood experiences" },
      { value: "complicated-mixed", title: "Complicated but Present", desc: "Functional but with underlying issues and tensions" },
      { value: "strained-conflict", title: "Strained & Conflict-Ridden", desc: "Frequent arguments, unresolved tensions, emotional issues" },
      { value: "broken-absent", title: "Broken or Absent", desc: "No contact, estranged, orphaned, or completely out of picture" },
    ],
  },
  {
    id: 6,
    label: "QUESTION 6",
    title: "What is their social and relationship history?",
    description: "Social experiences reveal attachment styles, trust issues, and interpersonal skills.",
    followupKey: "social",
    options: [
      { value: "social-butterfly", title: "Social Butterfly", desc: "Extensive social circle, enjoys being around people, very social" },
      { value: "close-friends", title: "Small Close Circle", desc: "Few deep friendships, values quality over quantity" },
      { value: "loner-introvert", title: "Loner/Introvert", desc: "Prefers solitude, limited social interaction, independent" },
      { value: "socially-anxious", title: "Socially Anxious", desc: "Wants connection but struggles with social situations" },
    ],
  },
  {
    id: 7,
    label: "QUESTION 7",
    title: "What are their core personality traits?",
    description: "Psychological makeup determines how they'll respond to challenges and stress.",
    followupKey: "personality",
    options: [
      { value: "optimistic-resilient", title: "Optimistic & Resilient", desc: "Generally positive outlook, bounces back from setbacks" },
      { value: "cautious-analytical", title: "Cautious & Analytical", desc: "Thinks through decisions, risk-averse, logical approach" },
      { value: "sensitive-empathetic", title: "Sensitive & Empathetic", desc: "Deeply feels emotions, attuned to others' feelings" },
      { value: "ambitious-driven", title: "Ambitious & Driven", desc: "Goal-oriented, competitive, high achiever" },
      { value: "complex-contradictory", title: "Complex & Contradictory", desc: "Multiple conflicting traits, hard to categorize" },
    ],
  },
];

export interface FollowupField {
  type: "textarea" | "input";
  title: string;
  placeholder: string;
}

export interface FollowupData {
  [key: string]: FollowupField[];
}

export const followupsData: Record<string, Record<string, FollowupField[]>> = {
  age: {
    "18-21": [
      { type: "textarea", title: "How does being young affect their confidence?", placeholder: "Are they confident despite their age? Do they feel underestimated? How do they handle being the youngest in most situations?" },
      { type: "textarea", title: "What major life transitions are they experiencing?", placeholder: "Moving out, first serious job, college independence, legal adulthood, etc. How are they handling these changes?" },
      { type: "textarea", title: "How do older people perceive them?", placeholder: "Do they get treated like a kid? Taken seriously? Underestimated? Do they try to act older than they are?" },
    ],
    "22-25": [
      { type: "textarea", title: "How are they navigating early adulthood?", placeholder: "Career establishment, financial independence, adult relationships. Are they thriving or struggling?" },
      { type: "textarea", title: "What pressures are they facing?", placeholder: "Career expectations, family pressure, financial stress, relationship milestones, social comparisons." },
      { type: "textarea", title: "How has their perspective changed since 18?", placeholder: "What have they learned? What illusions have been shattered? What wisdom have they gained?" },
    ],
    "26-30": [
      { type: "textarea", title: "How do they feel about entering their late 20s?", placeholder: "Are they established? Still figuring things out? Feeling pressure to have life together?" },
      { type: "textarea", title: "What life experiences have shaped them most?", placeholder: "Career changes, serious relationships, major moves, failures, successes." },
      { type: "textarea", title: "How do they balance youth and maturity?", placeholder: "Do they still feel young? Are they embracing adult responsibilities?" },
    ],
    "31-35": [
      { type: "textarea", title: "How do they view their life progress?", placeholder: "Are they where they expected to be? What regrets or accomplishments define this period?" },
      { type: "textarea", title: "What major life decisions are they facing?", placeholder: "Marriage, children, career changes, home ownership. How are they approaching these milestones?" },
      { type: "textarea", title: "How has their identity evolved?", placeholder: "What have they learned about their true self? What parts of their younger self have they outgrown?" },
    ],
    "36-40": [
      { type: "textarea", title: "How are they handling approaching mid-life?", placeholder: "Are they experiencing a crisis or renaissance? What reflections or changes are they making?" },
      { type: "textarea", title: "What wisdom have they accumulated?", placeholder: "What life lessons would they share with their younger self? What hard-won insights guide them?" },
      { type: "textarea", title: "How do they define themselves at this stage?", placeholder: "Beyond career and relationships, what truly matters? What legacy are they building?" },
    ],
    "41+": [
      { type: "textarea", title: "How has life experience shaped their worldview?", placeholder: "What major events, triumphs, and tragedies have molded their perspective?" },
      { type: "textarea", title: "What are their proudest accomplishments and biggest regrets?", placeholder: "What would they change if they could? What achievements define their life story?" },
      { type: "textarea", title: "How do they view their future?", placeholder: "Are they planning new chapters? Reflecting on the past? What goals drive them now?" },
    ],
  },
  physical: {
    athletic: [
      { type: "textarea", title: "What sports or activities keep them fit?", placeholder: "Gym, running, yoga, team sports, martial arts. How seriously do they take their fitness?" },
      { type: "textarea", title: "How does their fitness affect their confidence?", placeholder: "Are they proud of their physique? Does it make them feel capable or insecure?" },
      { type: "textarea", title: "Any injuries or physical limitations?", placeholder: "Past injuries, chronic issues, physical weaknesses. How do these affect their activities?" },
      { type: "input", title: "Height and specific build details", placeholder: "e.g., 5'8\" lean runner's build, 6'2\" muscular football frame..." },
    ],
    average: [
      { type: "textarea", title: "How do they feel about being average-looking?", placeholder: "Are they content with blending in? Wish they stood out more?" },
      { type: "textarea", title: "Do they want to change their appearance?", placeholder: "Consider fitness changes, style updates. What would they change if they could?" },
      { type: "textarea", title: "What are their most attractive features?", placeholder: "Eyes, smile, hair, hands, voice. What do others compliment them on?" },
      { type: "input", title: "Height and body type specifics", placeholder: "e.g., 5'6\" medium build, 6'0\" average proportions..." },
    ],
    slender: [
      { type: "textarea", title: "Are they naturally thin or do they work to stay slim?", placeholder: "Fast metabolism, careful diet. How do they maintain their weight?" },
      { type: "textarea", title: "How does their size affect how people treat them?", placeholder: "Do they seem delicate or vulnerable? Are they underestimated?" },
      { type: "textarea", title: "Any health or strength concerns?", placeholder: "Fragility, lack of physical strength, health issues. How do these impact daily life?" },
      { type: "input", title: "Height and build details", placeholder: "e.g., 5'2\" petite delicate, 5'9\" lanky slender..." },
    ],
    curvy: [
      { type: "textarea", title: "How do they feel about their curves?", placeholder: "Body confidence, struggles with weight, societal pressure. How do they present themselves?" },
      { type: "textarea", title: "How do others react to their appearance?", placeholder: "Attention, discrimination, compliments, criticism. How has this shaped their self-image?" },
      { type: "textarea", title: "Physical capabilities and limitations?", placeholder: "Strength, stamina, mobility, health issues. How does their body type affect daily activities?" },
      { type: "input", title: "Height and specific proportions", placeholder: "e.g., 5'7\" hourglass figure, 5'4\" pear-shaped..." },
    ],
    muscular: [
      { type: "textarea", title: "How did they get so muscular?", placeholder: "Bodybuilding, manual labor, genetics, sports. Is it lifestyle or necessity?" },
      { type: "textarea", title: "How does their strength affect their personality?", placeholder: "Are they confident or intimidating? Do they rely on physical strength?" },
      { type: "textarea", title: "Any downsides to being so muscular?", placeholder: "Intimidation, stereotypes, health issues, flexibility problems." },
      { type: "input", title: "Height and build specifics", placeholder: "e.g., 5'10\" powerlifter build, 6'4\" bodybuilder..." },
    ],
  },
  profession: {
    student: [
      { type: "textarea", title: "What are they studying and why?", placeholder: "Field of study, passion vs. practicality, family pressure vs. personal choice." },
      { type: "textarea", title: "How do they fund their lifestyle?", placeholder: "Scholarships, loans, parental support, part-time work. Financial stress level?" },
    ],
    professional: [
      { type: "textarea", title: "What is their specific role and industry?", placeholder: "Position, company type, career trajectory. Are they satisfied or trapped?" },
      { type: "textarea", title: "How does work consume their life?", placeholder: "Work-life balance, stress levels, ambition vs. burnout." },
    ],
    creative: [
      { type: "textarea", title: "What is their creative medium?", placeholder: "Writing, painting, music, performance. Is it their passion or just a job now?" },
      { type: "textarea", title: "How do they handle financial instability?", placeholder: "Irregular income, side jobs, dependence on others. How do they cope?" },
    ],
    service: [
      { type: "textarea", title: "What specifically do they do?", placeholder: "Restaurant, retail, hospital, salon. What's their daily reality like?" },
      { type: "textarea", title: "How do they feel about their work?", placeholder: "Pride, shame, exhaustion, satisfaction. Do they see it as temporary or permanent?" },
    ],
    unemployed: [
      { type: "textarea", title: "Why are they unemployed?", placeholder: "Layoff, health issues, depression, caring for someone. What led here?" },
      { type: "textarea", title: "How does unemployment affect their self-image?", placeholder: "Shame, freedom, desperation, depression. How are they handling it emotionally?" },
    ],
  },
  living: {
    "alone-apartment": [
      { type: "textarea", title: "How long have they lived alone?", placeholder: "First time on their own? Seasoned independent? Does solitude feel freeing or lonely?" },
      { type: "textarea", title: "Describe their apartment's character", placeholder: "Location, neighborhood safety, floor level, security features. Is it truly isolated?" },
    ],
    "shared-roommates": [
      { type: "textarea", title: "What are their roommates like?", placeholder: "Friends, strangers, good relationship, tensions. Who knows their schedule?" },
      { type: "textarea", title: "How much privacy do they actually have?", placeholder: "Shared spaces, separate rooms, noise levels, boundaries." },
    ],
    "family-home": [
      { type: "textarea", title: "Which family members do they live with?", placeholder: "Parents, siblings, grandparents, extended family. What is the household dynamic?" },
      { type: "textarea", title: "How do they feel about living with family?", placeholder: "Comforting, suffocating, financially necessary, emotionally complicated." },
    ],
    "isolated-rural": [
      { type: "textarea", title: "How isolated is their location?", placeholder: "Miles from neighbors, nearest town, emergency response time. How alone are they really?" },
      { type: "textarea", title: "Why do they live so remotely?", placeholder: "Chosen isolation, family property, economic necessity, hiding from something." },
    ],
    "own-property": [
      { type: "textarea", title: "What kind of property do they own?", placeholder: "House, condo, rural land, estate. What does it say about their status?" },
      { type: "textarea", title: "Do they feel secure in their home?", placeholder: "Security measures, comfort level, attachment to the space." },
    ],
  },
  family: {
    "stable-loving": [
      { type: "textarea", title: "How does this stability influence their expectations?", placeholder: "Do they take safety for granted? Are they naive about danger? Trusting of strangers?" },
    ],
    "complicated-mixed": [
      { type: "textarea", title: "What are the main complications?", placeholder: "Alcoholism, financial stress, divorce, mental illness, communication issues." },
    ],
    "strained-conflict": [
      { type: "textarea", title: "What is the source of the conflict?", placeholder: "Old wounds, incompatible values, addiction, abuse, controlling behavior." },
      { type: "textarea", title: "How has this shaped their coping mechanisms?", placeholder: "Do they placate, fight back, withdraw? How do they handle conflict as an adult?" },
    ],
    "broken-absent": [
      { type: "textarea", title: "What happened to their family?", placeholder: "Death, abandonment, abuse, estrangement. When did it happen and how?" },
      { type: "textarea", title: "Who has filled the family role in their life?", placeholder: "Friends, mentors, partners, chosen family. Or do they have no one?" },
    ],
  },
  social: {
    "social-butterfly": [
      { type: "textarea", title: "Who are their closest people?", placeholder: "Best friend, romantic partner, social group leader. Who do they trust most?" },
      { type: "textarea", title: "How many people know their routine?", placeholder: "Who knows where they go, when they're home, their habits? A vulnerability." },
    ],
    "close-friends": [
      { type: "textarea", title: "Who are these few close friends?", placeholder: "Names, nature of relationships, how long they've known each other." },
      { type: "textarea", title: "How often do they check in on each other?", placeholder: "Daily texts, weekly calls, monthly meetups. Who would notice if they went missing?" },
    ],
    "loner-introvert": [
      { type: "textarea", title: "Is the solitude chosen or circumstantial?", placeholder: "Do they prefer being alone, or have they struggled to connect? Is there loneliness underneath?" },
      { type: "textarea", title: "Who would notice if they disappeared?", placeholder: "Nobody? A distant family member? An acquaintance? This affects vulnerability significantly." },
    ],
    "socially-anxious": [
      { type: "textarea", title: "What triggers their anxiety most?", placeholder: "New people, crowds, conflict, phone calls, eye contact. What is their specific fear?" },
      { type: "textarea", title: "How do they appear to others?", placeholder: "Cold, aloof, weird, quiet, nervous? How do others misread their anxiety?" },
    ],
  },
  personality: {
    "optimistic-resilient": [
      { type: "textarea", title: "What is the source of their optimism?", placeholder: "Faith, past success, supportive upbringing, denial. Is it earned or naive?" },
      { type: "textarea", title: "What would genuinely break their resilience?", placeholder: "Everyone has a breaking point. What specific situation would shatter their positive outlook?" },
    ],
    "cautious-analytical": [
      { type: "textarea", title: "What are they most cautious about?", placeholder: "Relationships, finances, physical safety, career. Where does their caution come from?" },
      { type: "textarea", title: "How does their analytical nature affect relationships?", placeholder: "Do they overthink feelings? Keep people at arm's length? Struggle to be spontaneous?" },
    ],
    "sensitive-empathetic": [
      { type: "textarea", title: "How does their sensitivity manifest under stress?", placeholder: "Do they cry easily? Absorb others' emotions? Become overwhelmed? Withdraw?" },
      { type: "textarea", title: "Has their empathy ever been used against them?", placeholder: "Manipulated, guilt-tripped, taken advantage of. How have they been exploited?" },
    ],
    "ambitious-driven": [
      { type: "textarea", title: "What are they driven toward?", placeholder: "Career goals, creative ambitions, personal achievements. What is their ultimate goal?" },
      { type: "textarea", title: "What would they sacrifice for success?", placeholder: "Relationships, ethics, health, values. Where is their line?" },
    ],
    "complex-contradictory": [
      { type: "textarea", title: "What are the main contradictions in their nature?", placeholder: "Kind but selfish, strong but terrified, confident but self-destructive. Describe the tensions." },
      { type: "textarea", title: "How do others experience their contradictions?", placeholder: "Confusing? Fascinating? Exhausting? What do people who love them struggle with most?" },
    ],
  },
};
