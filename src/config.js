// Static source data and defaults config.js
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
        primary: "#6ba3d9",
        accent: "#7eb3ff",
        bg: "#0d1419",
        card: "#1a232f",
        emoji: "🧘",
        activityBoost: 1.0,
        description: "Peaceful, reflective, steady pace"
    },
    focused: {
        label: "🎯 Focused",
        primary: "#ff9d4f",
        accent: "#ffb366",
        bg: "#1a1010",
        card: "#2d1f1f",
        emoji: "🎯",
        activityBoost: 1.3,
        description: "Deep work mode, minimal distractions"
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
        label: "😰 Overwhelmed",
        primary: "#f87171",
        accent: "#fca5a5",
        bg: "#160b0b",
        card: "#2d1515",
        emoji: "😰",
        activityBoost: 0.6,
        description: "Need to simplify, take it slow"
    }
};

const MOOD_ACTIVITIES = {
    energetic: [
        { type: "focus", duration: 45, intensity: "high" },
        { type: "break", duration: 10 },
        { type: "physical", duration: 15, activity: "Walk or stretch vigorously" }
    ],
    calm: [
        { type: "focus", duration: 30, intensity: "medium" },
        { type: "break", duration: 8, activity: "Breathe, meditate" },
        { type: "reflection", duration: 10 }
    ],
    focused: [
        { type: "focus", duration: 60, intensity: "deep" },
        { type: "break", duration: 5, activity: "Quick water break" }
    ],
    tired: [
        { type: "focus", duration: 20, intensity: "light" },
        { type: "break", duration: 15, activity: "Rest, hydrate" },
        { type: "rest", duration: 20, activity: "Nap or lie down" }
    ],
    overwhelmed: [
        { type: "grounding", duration: 10, activity: "5-4-3-2-1 technique" },
        { type: "focus", duration: 15, intensity: "minimal" },
        { type: "break", duration: 20, activity: "Walk outside, breathe" }
    ]
};

// ... rest of config.js stays the same ...
const affirmationsArabic = [
    "Ana kafiya b rassi.", "Ma khasnich nkon kamla bach nkon mzyana.",
    "Kan9der ndir li 9drit lyom.", "Chwiya chwiya rah mzyana.", "Rassi kaystahal l7nan."
];
const affirmationsEnglish = [
    "You are enough as you are.", "Your worth is not based on others.",
    "You are capable of achieving your goals.", "Progress is progress, no matter how small.",
    "Be kind to yourself today."
];
const energyStops = ["🍎 Kouli fakiha", "🥜 Kouli chwiya nuts", "💧 Chrbi lma", "🌬️ Tanfos 3 dqaye9"];
const baseFocusSubjects = [
    {
        name: "🔵 Job Search", checklist: [
            "Explore Moroccan freelancing platforms and profiles",
            "See how BI/data engineers promote their skills",
            "Identify 1–2 projects to work on for portfolio",
            "Check LinkedIn/Indeed for job postings / required skills"
        ]
    },
    {
        name: "🟣 Skill Improvement", checklist: [
            "Review job description for BI/data engineer",
            "Identify 1–2 key skills to learn",
            "Small hands-on task (SQL, Python, visualization)",
            "Document what you learned"
        ]
    },
    {
        name: "🟢 Problem Solving (DSA)", checklist: [
            "Pick 1 DSA problem", "Understand problem requirements",
            "Plan brute-force solution", "Optimize solution", "Note confusion points"
        ]
    }
];
const knowledgeQuestions = [
    "Why do databases use indexes and how do they speed up queries?",
    "What’s the difference between synchronous and asynchronous programming?",
    "Explain normalization vs denormalization with examples.",
    "What is a RESTful API and how does it differ from RPC?",
    "What does Big O notation tell you about an algorithm?",
    "What’s the difference between a JOIN and a UNION in SQL?",
    "What is a cache? Give 2 real-world examples in software.",
    "What is the difference between structured, semi-structured, and unstructured data?",
    "How do you handle missing values in a dataset?",
    "What is the difference between a primary key and a foreign key in a database?",
    "What is data normalization, and why is it important?",
    "How would you detect outliers in a dataset?",
    "What is the difference between OLAP and OLTP?",
    "How would you choose KPIs for a sales dashboard?",
    "What is a star schema, and why is it used in BI?",
    "How can data visualization improve decision-making?",
    "Explain the difference between a bar chart, line chart, and heatmap — when to use each."
];
const curiosityPrompts = [
    "What would happen if humans could photosynthesize like plants?",
    "Why do some animals see colors differently than humans?",
    "How do trees “talk” to each other underground ?",
    "Pick a random tech acronym you saw today. What does it stand for and why does it matter?"
];
const reflectionQuestions = [
    "How did you feel (energy, focus, emotion)?",
    "What worked well? What would you change next time?",
    "Any blockers? How will you unblock them tomorrow?"
];
const moodMiniTasks = [
    "👀 Look away from screen for 20 seconds",
    "🧘 3 deep breaths",
    "🚰 Sip water",
    "🤸 Quick shoulder roll",
    "🙂 Smile for 10 seconds"
];

// Default app-wide config (editable in Setup)
let appConfig = {
    fasting: false,
    iftarTime: "18:30",
    suhoorTime: "05:30",
    meals: [
        { label: "Breakfast", time: "08:30", macro: "Protein + fiber + fruit" },
        { label: "Lunch", time: "13:30", macro: "Lean protein + complex carbs + veggies" },
        { label: "Dinner", time: "19:30", macro: "Balanced plate; hydrate well" }
    ],
    foodChallenges: ["2 fruits", "2 bottles water", "No refined sugar at lunch"],
    categories: {
        "🔵 Job Search": "focus",
        "🟣 Skill Improvement": "learning",
        "🟢 Problem Solving (DSA)": "focus",
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
    baseSubjectsEditable: JSON.parse(JSON.stringify(baseFocusSubjects))
};