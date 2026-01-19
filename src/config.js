// Static source data and defaults config.js
// ===============================
// MOOD THEMES AND ACTIVITIES (define first)
// ===============================
const MOOD_THEMES = {
    energetic: {
        label: "⚡ Energetic",
        primary: "#4f83ff",
        accent: "#58d3ff",
        bg: "#0b1220",
        card: "#1e2a44",
        emoji: "⚡",
        activityBoost: 1.2,
        description: "High energy, ready to tackle challenges"
    },
    calm: {
        label: "🧘 Calm",
        emoji: "🧘",
        /* Brand (very low saturation) */
        primary: "#8DA7A8",   // muted sage-teal
        accent: "#E3BFA7",    // soft peach (less pink)
        /* Surfaces */
        bg: "#F2EEEC",        // warm off-white
        card: "#E6E1DE",      // subtle elevation
        /* Text */
        text: "#3F3A36",      // warm charcoal
        muted: "#7A736E",
        /* Semantics (CALM STYLE) */
        success: "#8FB5A3",   // desaturated green
        warn: "#D6B58C",      // sand / clay
        danger: "#E6C6B8",    // very light peach
        activityBoost: 1.0,
        description: "Balanced, regulated, steady and present"
    },
    focused: {
        label: "🎯 Focused",
        emoji: "🎯",
        primary: "#F4A261",   // warm amber
        accent: "#FFD6A5",    // soft highlight
        bg: "#121212",        // near-black
        card: "#1E1E1E",      // IDE-like surface
        activityBoost: 1.25,
        description: "Deep attention, clarity, execution mode"
    },
    tired: {
        label: "😴 Tired",
        primary: "#a78bfa",
        accent: "#c4b5fd",
        bg: "#0f0d1a",
        card: "#1f1d3a",
        emoji: "😴",
        activityBoost: 0.7,
        description: "Low energy, need gentle breaks"
    },
    overwhelmed: {
        label: "🌧 Overwhelmed",
        emoji: "🌧",
        primary: "#C77D8A",   // muted rose
        accent: "#E6A6B0",    // soft reassurance
        bg: "#140F12",        // cocoon-like dark
        card: "#24171C",      // safe surface
        activityBoost: 0.55,
        description: "High load — simplify, ground, and slow down"
    }
};

const MOOD_ACTIVITIES = {
    energetic: [
        { type: "break", duration: 8, activities: ["🚶 Quick energetic walk (5 min)", "💪 Push-ups or jumping jacks", "🎵 Dance to 1 song"] },
        { type: "pause", duration: 5, activities: ["💧 Drink water + stretch", "🌬️ Power breathing (4-4-4)", "👀 Look away + eye circles"] },
        { type: "transition", activities: ["Ready for more? Let's go! 🔥", "Energy high — next session coming up!", "Keep that momentum! 💨"] }
    ],
    calm: [
        {
            type: "break",
            duration: 12,
            activities: [
                "🧘 5-minute breathing or meditation",
                "📖 Read 2–3 calm pages",
                "🍵 Tea + silence (no phone)"
            ]
        },
        {
            type: "pause",
            duration: 6,
            activities: [
                "🌬 Slow breathing (4-6)",
                "🌿 Look at something natural",
                "✋ Gentle hand & neck release"
            ]
        }
    ],
    focused: [
        {
            type: "break",
            duration: 6,
            activities: [
                "🚶 Short walk or stand",
                "💧 Water + posture reset",
                "📝 Write down loose thoughts"
            ]
        },
        {
            type: "pause",
            duration: 3,
            activities: [
                "👀 20-20-20 eye rule",
                "🔄 Neck / wrist rotation",
                "🌬 One deep breath"
            ]
        }
    ],
    tired: [
        { type: "break", duration: 20, activities: ["🛏️ Lie down for 5 min", "🥛 Drink water + light snack", "🌬️ Slow breathing + gentle stretching"] },
        { type: "pause", duration: 10, activities: ["👀 Close eyes briefly", "💆 Neck + shoulder release", "Sip water slowly"] },
        { type: "transition", activities: ["Short session next, you can do this 💪", "Gentle pace ahead. Rest when needed.", "Energy building... keep going 🌱"] }
    ],
    overwhelmed: [
        {
            type: "break",
            duration: 15,
            activities: [
                "🚶 Slow walk (outside if possible)",
                "🫁 5-4-3-2-1 grounding",
                "💧 Sit + hydrate quietly"
            ]
        },
        {
            type: "pause",
            duration: 8,
            activities: [
                "🫁 Box breathing (4-4-4-4)",
                "🎧 Calming sound or silence",
                "✍️ Write one worry, stop"
            ]
        }
    ]
};

const BODY_CONDITION_ACTIVITIES = {
    healthy: {
        breakActivities: ["🚶 Walk", "💪 Stretch", "🌬️ Breathe", "💧 Hydrate"],
        avoidActivities: [],
        note: "Standard pace. No restrictions."
    },
    tiredBody: {
        breakActivities: ["🧘 Sit and rest", "💧 Hydrate well", "👀 Eyes closed 2 min", "🧘 Gentle neck rolls"],
        avoidActivities: ["Running", "Heavy lifting"],
        note: "Rest more, move gently."
    },
    headache: {
        breakActivities: ["👀 Dark room 3 min", "💧 Hydrate slowly", "🧘 Neck release", "🌬️ Calm breathing"],
        avoidActivities: ["Bright screens (reduce brightness)", "Loud sounds"],
        note: "Dim light, quiet, hydrate."
    },
    coldFlu: {
        breakActivities: ["🛏️ Rest 10 min", "🍵 Warm drink", "💧 Hydrate", "👃 Gentle breathing"],
        avoidActivities: ["Physical exertion", "Cold air"],
        note: "Prioritize rest. Short sessions."
    },
    soreMuscles: {
        breakActivities: ["🧘 Gentle stretch", "🫖 Heat (warm towel)", "💆 Self-massage", "👀 Posture check"],
        avoidActivities: ["Intense cardio", "Heavy lifting"],
        note: "Stretch, warm compress, rest."
    },
    injured: {
        breakActivities: ["🛏️ Rest", "💧 Hydrate", "🧘 Breathing only", "👀 Mind work (no movement)"],
        avoidActivities: ["Any physical activity"],
        note: "Complete rest. Focus on recovery."
    }
};

const BODY_CONDITIONS = {
    healthy: {
        label: "Healthy / fine",
        focusMultiplier: 1.0,
        note: "No changes needed."
    },
    tiredBody: {
        label: "Tired / heavy legs",
        focusMultiplier: 0.8,
        note: "Shorter focus blocks, more breaks recommended"
    },
    headache: {
        label: "Headache / light sensitivity",
        focusMultiplier: 0.6,
        note: "Prefer short low-cognitive tasks and gentle breaks"
    },
    coldFlu: {
        label: "Cold / flu symptoms",
        focusMultiplier: 0.5,
        note: "Prioritize rest, reduce intensity and duration"
    },
    soreMuscles: {
        label: "Sore muscles / pain",
        focusMultiplier: 0.7,
        note: "Avoid heavy physical tasks; include gentle stretching"
    },
    injured: {
        label: "Injured / recovering",
        focusMultiplier: 0.5,
        note: "Keep sessions very short and restorative"
    }
};

// ===============================
// AFFIRMATIONS (mood-based)
// ===============================
const AFFIRMATIONS = {
    energetic: {
        arabic: [
            "لديك هذه الطاقة! استخدمها بحكمة! 🔥",
            "وجّه هذه القوة نحو أهدافك! ⚡",
            "زخمك لا يمكن إيقافه! 💪",
            "أنت أقوى من الأمس! 🚀",
        ],
        english: [
            "You've got this energy! Use it wisely! 🔥",
            "Channel this power into your goals! ⚡",
            "Your momentum is unstoppable! 💪",
            "You are stronger than yesterday! 🚀"
        ]
    },
    calm: {
        arabic: [
            "أنا هادئ، وكل شيء يسير في وقته المناسب",
            "أنفاسي ثابتة، وقلبي مطمئن",
            "التقدم الهادئ يصنع نتائج عظيمة",
            "السلام الداخلي مصدر قوتي"
        ],
        english: [
            "I am calm, and everything unfolds in its right time.",
            "My breath is steady, my mind is at ease.",
            "Slow and steady progress creates lasting results.",
            "My inner peace is my strength."
        ]
    },
    focused: {
        arabic: [
            "ذهني صافٍ، وتركيزي كامل على هذه المهمة",
            "أُنجز شيئًا واحدًا بإتقان",
            "كل دقيقة من التركيز تقرّبني من هدفي",
            "أستبعد المشتتات، وأُرحّب بالوضوح"
        ],
        english: [
            "My mind is clear, and my focus is on this task.",
            "I do one thing, and I do it well.",
            "Each focused minute brings me closer to my goal.",
            "I release distractions and welcome clarity."
        ]
    },
    tired: {
        arabic: [
            "الخطوات الصغيرة ما زالت تقودك إلى الأمام. 💤",
            "الراحة جزء من الرحلة. 🌙",
            "لا تحتاج إلى الكمال، بل إلى التقدّم فقط. 🌱",
            "كن لطيفًا مع نفسك اليوم. 💚"
        ],
        english: [
            "Small steps still move forward. 💤",
            "Rest is part of the journey. 🌙",
            "You don't need perfection, just progress. 🌱",
            "Be gentle with yourself today. 💚"
        ]
    },
    overwhelmed: {
        arabic: [
            "أنا في أمان الآن، ويمكنني أن أتحرك خطوة واحدة فقط",
            "هذا الشعور مؤقت، وسيمرّ",
            "لا أحتاج إلى حل كل شيء الآن",
            "أنفاسي تعيدني إلى الحاضر"
        ],
        english: [
            "I am safe right now, and I only need to take one small step.",
            "This feeling is temporary, and it will pass.",
            "I do not need to solve everything right now.",
            "My breath brings me back to the present moment."
        ]
    }
};

// ===============================
// ENERGY STOPS (mood + body-based)
// ===============================
const ENERGY_STOPS = {
    energetic: [
        "🍎 Grab a fruit + stay hydrated",
        "💪 Quick 10 push-ups or squats",
        "💧 Drink water + electrolyte boost",
        "🎵 Blast 1 energizing song",
        "🚶 Power walk 2 minutes"
    ],
    calm: [
        "🍵 Herbal tea + quiet moment",
        "💧 Sip water slowly + breathe",
        "📖 Read something inspiring (2 min)",
        "🧘 Gentle stretch + meditation",
        "🪴 Look at a plant or nature view"
    ],
    focused: [
        "💧 Quick water break",
        "🫐 Handful of berries (quick energy)",
        "👀 20-20-20 rule (eyes rest)",
        "📝 Jot down 1 idea before returning",
        "🍋 Lemon water for clarity"
    ],
    tired: [
        "🛏️ Lie down 2 minutes (no phone)",
        "🥛 Warm milk or light snack",
        "💧 Hydrate well + slow breathing",
        "🧘 Gentle neck/shoulder release",
        "👁️ Close eyes 3 minutes"
    ],
    overwhelmed: [
        "🌬️ Box breathing (4-4-4-4) x3",
        "🚶 Walk outside if possible",
        "💧 Hydrate + sit quietly",
        "🧘 Ground yourself (5-4-3-2-1 sense check)",
        "🕊️ Affirmation: 'I am safe. I can handle this.'"
    ]
};

// ===============================
// BODY CONDITION-SPECIFIC STOPS
// ===============================
const BODY_STOPS = {
    healthy: [
        "🚶 Quick walk",
        "💧 Hydrate",
        "🧘 Stretch",
        "🍎 Fruit or snack"
    ],
    tiredBody: [
        "🛏️ Sit or lie down 3 min",
        "💧 Hydrate generously",
        "🧘 Gentle stretch only",
        "🥛 Light snack for energy"
    ],
    headache: [
        "👀 Dark room 2 min",
        "💧 Hydrate slowly + carefully",
        "🧘 Neck release gently",
        "🌬️ Calm, slow breathing"
    ],
    coldFlu: [
        "🛏️ Rest 5 min minimum",
        "🍵 Warm tea or broth",
        "💧 Hydrate well",
        "🤧 Take care of yourself"
    ],
    soreMuscles: [
        "🧘 Gentle stretch only",
        "🌡️ Warm compress if possible",
        "💆 Light self-massage",
        "💧 Hydrate well"
    ],
    injured: [
        "🛏️ Complete rest",
        "💧 Hydrate",
        "🧘 Breathing exercises only",
        "🕯️ Mental rest time"
    ]
};

// Helper function to pick affirmation by mood
function getAffirmationByMood(lang = "english") {
    const mood = dayMeta.mood || "calm";
    const affirmations = AFFIRMATIONS[mood]?.[lang] || AFFIRMATIONS.calm[lang];
    return affirmations[Math.floor(Math.random() * affirmations.length)];
}

// Helper function to pick energy stop by mood + body
function getEnergyStopByMoodAndBody() {
    const mood = dayMeta.mood || "calm";
    const body = dayMeta.bodyCondition || "healthy";
    if (body !== "healthy") {
        const bodyStops = BODY_STOPS[body] || BODY_STOPS.healthy;
        return bodyStops[Math.floor(Math.random() * bodyStops.length)];
    }
    const moodStops = ENERGY_STOPS[mood] || ENERGY_STOPS.calm;
    return moodStops[Math.floor(Math.random() * moodStops.length)];
}

// Keep old references for backward compatibility
const affirmationsArabic = AFFIRMATIONS.calm.arabic;
const affirmationsEnglish = AFFIRMATIONS.calm.english;
const energyStops = ENERGY_STOPS.calm;

// Base focus subjects
const baseFocusSubjects = [
    {
        name: "Python", checklist: [
            "Go through 2 courses ",
            "Practice them locally in Jupyter Notebook",
            "See 2 to 3 python interview questions and try to answer them "
        ]
    },
    {
        name: "SQL", checklist: [
            "Go through the documentation and finish anything related to creating table till queries ",
            "Make sure to practice that locally without needing to look at the code",
            "See 1 to 2 SQL interview questions and try to answer them "
        ]
    },
    {
        name: "Job Search", checklist: [
            "Get a list on what is wrong in CV use ChatGPT to help you with that and also search online",
            "Send my CV to Amal at least",
            "do a quick search on linkedIn for the job section and note down what they are asking for and add that as a note to this",
        ]
    },
    {
        name: "🟢 Problem Solving (DSA)", checklist: [
            "Go through 2 problems on LeetCode about Prefix Sum",
            "Have dftar just for the patterns, write the pattern name in uppercase then try to see and understand that, and then explain it"
        ]
    }
];

// Prompts / questions
const curiosityPrompts = [
    "Why are default arguments in Python evaluated only once?",
    "What actually happens under the hood when you use `with`?",
    "Why is `is` sometimes different from `==`?",
    "What does Python do when it can’t find a variable name?",
    "Why are generators more memory-efficient than lists?",
    "What happens if you modify a list while iterating over it?",
    "Why is recursion limited in Python, and what enforces that limit?",
    "What does it mean that everything in Python is an object?",
    "Why does `len()` feel O(1) for lists?",
    "What really happens when you import a module?"
];

const knowledgeQuestions = [
    "What trade-offs does immutability introduce?",
    "When is caching harmful instead of helpful?",
    "What makes a function pure, and why does it matter?",
    "How does a hash table resolve collisions?",
    "What problem does eventual consistency solve?",
    "Why is tail recursion not optimized in Python?",
    "When would you prefer composition over inheritance?",
    "How do CPU caches affect algorithm performance?",
    "What guarantees does ACID actually provide?",
    "Why is lock-free programming difficult?"
];

const reflectionQuestions = [
    "What concept felt confusing at first but became clearer?",
    "What slowed you down today?",
    "What assumption did you make that might be wrong?",
    "What did you learn that surprised you?",
    "What would future-you thank you for today?"
];

const moodMiniTasks = [
    "👂 Listen to a sound around you",
    "🧍 Stand up and stretch your back",
    "🌬️ Slow exhale for 5 seconds",
    "👣 Walk for 1 minute",
    "💧 Take one mindful sip of water"
];

// Default app-wide config (editable in Setup)
let appConfig = {
    fasting: false,
    iftarTime: "18:30",
    suhoorTime: "05:30",
    meals: [
        { label: "Breakfast", time: "08:30", macro: "" },
        { label: "Lunch", time: "13:30", macro: "" },
        { label: "Dinner", time: "19:30", macro: "" }
    ],
    foodChallenges: ["2 fruits", "2 bottles water", "No refined sugar", "No fried food"],
    categories: {
        "🔵 Self-learn": "focus",
        "🟣 Skill Improvement": "learning",
        "🟢 Problem Solving (DSA)": "learning",
        "📖 Quran memorization": "faith",
        "📖 Quran reading + Adkar Sabah": "faith"
    },
    sound: {
        notifications: true,
        preEndSeconds: 120,
        volume: 0.5
    },
    bgAudio: {
        enabled: true,
        mode: "none",
        volume: 0.35,
        playlists: { light: [], hype: [], jazz: [], podcast: [] }
    },
    showMealChipsInFocus: true,
    mealChipWindowMinutes: 20,
    baseSubjectsEditable: JSON.parse(JSON.stringify(baseFocusSubjects))
};

// Day parts configuration (for dice/waves distribution)
appConfig.dayParts = {
    morning: { start: "06:00", end: "12:00", quotaPct: 0.40, maxMinutes: 180 },
    afternoon: { start: "12:00", end: "18:00", quotaPct: 0.40, maxMinutes: 180 },
    night: { start: "18:00", end: "23:59", quotaPct: 0.20, maxMinutes: 120 }
};

// ===============================
// ADAPTIVE ACTIVITIES
// ===============================
const ADAPTIVE_ACTIVITIES = {
    grounding: {
        id: "grounding",
        cooldown: 120, // minutes
        byMood: {
            energetic: "🧍 Stand still + breathe deeply (1 min)",
            calm: "🧘‍♀️ Sit silently, notice breath (2 min)",
            focused: "👁️ Close eyes, count 5 breaths",
            tired: "🛏️ Sit or lie down, soften body",
            overwhelmed: "🫁 5-4-3-2-1 grounding exercise"
        }
    },
    hydration: {
        id: "hydration",
        cooldown: 90,
        byMood: {
            energetic: "💧 Drink water standing up",
            calm: "🍵 Sip water slowly",
            focused: "💧 Quick hydration break",
            tired: "🥛 Warm drink or water",
            overwhelmed: "💧 Drink water + breathe"
        }
    },
    morningAudio: {
        id: "morningAudio",
        cooldown: 240,
        byMood: {
            energetic: "🎧 Uplifting nasheed or instrumental",
            calm: "🎧 Nature sounds or Quran recitation",
            focused: "🎧 Low-volume ambient focus audio",
            tired: "🎧 Soft calming audio (no lyrics)",
            overwhelmed: "🎧 Grounding audio / brown noise"
        }
    },
    creative: {
        id: "creative",
        cooldown: 360,
        byMood: {
            energetic: "✏️ Sketch anything for 3 minutes",
            calm: "🎨 Draw something peaceful",
            focused: "📝 Write 5 lines about one idea",
            tired: "🖍️ Doodle freely (no goal)",
            overwhelmed: "📝 Write what’s heavy, then stop"
        }
    },
    learningLight: {
        id: "learningLight",
        cooldown: 360,
        byMood: {
            energetic: "🎥 Watch 5 min of a documentary",
            calm: "📖 Read 2 pages of something meaningful",
            focused: "📘 Learn one small concept",
            tired: "🎧 Listen instead of reading",
            overwhelmed: "📖 Read a single paragraph only"
        }
    }
};

// Activity history (cooldowns)
let activityHistory = JSON.parse(localStorage.getItem("activityHistory") || "{}");

function markActivityDone(id) {
    activityHistory[id] = Date.now();
    localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
}

function canDoActivity(id) {
    const act = Object.values(ADAPTIVE_ACTIVITIES).find(a => a.id === id);
    if (!act) return true;
    const last = activityHistory[id];
    if (!last) return true;
    return (Date.now() - last) > act.cooldown * 60000;
}

function getAdaptiveActivity(type) {
    const mood = dayMeta.mood || "calm";
    const act = ADAPTIVE_ACTIVITIES[type];
    if (!act || !canDoActivity(act.id)) return null;
    return act.byMood[mood] || act.byMood.calm;
}

function getRandomCuriosityPrompt() {
    return curiosityPrompts[
        Math.floor(Math.random() * curiosityPrompts.length)
    ];
}