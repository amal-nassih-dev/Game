// Global mutable state state.js
let stepIndex = 0;
let timer = null, timerPaused = false, timerRemaining = 0;
let focusHours = 4;
let notes = [];

let dayMeta = {
    startTs: new Date().toISOString(),
    userProfile: {},
    focusHours: 4,
    customSubjects: [],
    dice: null
};

let currentAffirmationIx = 0;
let mainFlowLocked = false;

let sessions = []; // [{id,name,checklist,minutes}]
let waves = { morning: [], afternoon: [], night: [] };
let runningQueue = []; // sequence of sessions to run in a wave
let runningIndex = -1;
let blockAccumMinutes = 0;

let activeSession = null; // {id, name, startTs, plannedMinutes}
let activeSessionExtra = null; // {notesElId, qListRef, activityName}
let sessionLogs = []; // [{id,name,plannedMinutes,actualSeconds,status,notes,questions,carriedOver}]
let sessionIdCounter = 1;

// Backlogs for questions per activity
let questionsBacklog = {};

// Per-day meal completion (persisted per date)
let mealStatus = []; // [{label, time, done}]

function todayKey() { return new Date().toISOString().slice(0, 10); }

function loadMealStatus() {
    const key = mealStatus - `${todayKey()}`;
    const raw = localStorage.getItem(key);
    if (raw) {
        try { mealStatus = JSON.parse(raw) || []; } catch (e) { mealStatus = []; }
    }
    // If structure empty or meals changed, rebuild
    if (!Array.isArray(mealStatus) || mealStatus.length !== appConfig.meals.length) {
        mealStatus = appConfig.meals.map(m => ({ label: m.label, time: m.time, done: false }));
        saveMealStatus();
    }
}
function saveMealStatus() {
    const key = mealStatus - `${todayKey()}`;
    localStorage.setItem(key, JSON.stringify(mealStatus));
}
function resetMealStatusForToday() {
    mealStatus = appConfig.meals.map(m => ({ label: m.label, time: m.time, done: false }));
    saveMealStatus();
}