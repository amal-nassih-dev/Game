// ===============================
// Helpers utils.js
// ===============================

function setProgress() {
    document.getElementById("progress").innerText =
        `Step ${Math.min(stepIndex, 26)} / 26`;
}

function clearUI() {
    document.getElementById("text").innerHTML = "";
    document.getElementById("subtext").innerHTML = "";
    document.getElementById("timer").innerHTML = "";
    document.getElementById("dice").innerHTML = "";

    const res = document.getElementById("result");
    if (res) {
        res.style.display = "none";
        res.innerHTML = "";
    }

    document.getElementById("checklist").innerHTML = "";
    document.getElementById("buttons").innerHTML = "";
}

function formatMinSec(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function addNote(entry) {
    notes.push({
        ts: new Date().toISOString(),
        step: stepIndex,
        ...entry
    });
}

function randomCuriosity() {
    return curiosityPrompts[
        Math.floor(Math.random() * curiosityPrompts.length)
    ];
}

function randomMoodMini() {
    return moodMiniTasks[
        Math.floor(Math.random() * moodMiniTasks.length)
    ];
}

function randomKnowledgeQuestion() {
    return knowledgeQuestions[
        Math.floor(Math.random() * knowledgeQuestions.length)
    ];
}

function timeStrToDate(t) {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
}

function nowHHMM() {
    const d = new Date();
    return d.toTimeString().slice(0, 5);
}

function isBeforeIftar() {
    if (!appConfig.fasting) return false;

    const [h, m] = appConfig.iftarTime.split(":").map(Number);
    const iftar = new Date();
    iftar.setHours(h, m, 0, 0);

    return new Date() < iftar;
}

function categoryFor(name) {
    return appConfig.categories[name] ||
        (name.includes("Quran") ? "faith" : "focus");
}

function categoryClass(cat) {
    return ({
        morning: "cat-morning",
        afternoon: "cat-afternoon",
        night: "cat-night",
        faith: "cat-faith",
        focus: "cat-focus",
        health: "cat-health",
        learning: "cat-learning"
    })[cat] || "cat-focus";
}

function minutesUntil(dateA, dateB) {
    return Math.round((dateA - dateB) / 60000);
}
function isFutureWithinWindow(tDate, now, windowMin) {
    const diffMin = minutesUntil(tDate, now);
    return diffMin >= 0 && diffMin <= windowMin;
}
function nextUpcomingMeal() {
    const now = new Date();
    // filter to meals not done and time in future (consider fasting)
    const eligible = appConfig.meals
        .filter((m, idx) => {
            if (mealStatus[idx]?.done) return false;
            const t = timeStrToDate(m.time);
            if (appConfig.fasting && isBeforeIftar()) {
                const iftar = timeStrToDate(appConfig.iftarTime);
                if (t < iftar) return false;
            }
            return t > now;
        })
        .sort((a, b) => timeStrToDate(a.time) - timeStrToDate(b.time));
    if (!eligible.length) return null;
    const m = eligible[0];
    const t = timeStrToDate(m.time);
    const mins = minutesUntil(t, now);
    return { label: m.label, time: m.time, inMin: mins };
}

// Show chips only for meals within future window and not done
function upcomingMealChips() {
    if (!appConfig.showMealChipsInFocus) return "";
    const now = new Date();
    const windowMin = appConfig.mealChipWindowMinutes || 20;
    const chips = appConfig.meals
        .map((m, idx) => ({ m, idx }))
        .filter(({ m, idx }) => {
            if (mealStatus[idx]?.done) return false;
            if (appConfig.fasting && isBeforeIftar()) {
                const t = timeStrToDate(m.time);
                const iftar = timeStrToDate(appConfig.iftarTime);
                if (t < iftar) return false;
            }
            const t = timeStrToDate(m.time);
            return isFutureWithinWindow(t, now, windowMin);
        })
        .map(({ m }) => `<span class="pill">${m.label} ${m.time}</span>`);
    return chips.join(" ");
}

// Friendly “upcoming meals” line
function upcomingMealsText() {
    const nxt = nextUpcomingMeal();
    if (!nxt) return "";
    return `Next meal: ${nxt.label} at ${nxt.time} (in ${nxt.inMin} min)`;
}



// ===============================
// Fasting-aware energy
// ===============================

function randomEnergy() {
    if (appConfig.fasting && isBeforeIftar()) {
        const alt = [
            "🌬️ Guided breathing 2 min",
            "🧘 Posture reset + shoulder rolls",
            "🚶 2–5 minutes slow walk",
            "👀 20s eye break + distant focus"
        ];
        return alt[Math.floor(Math.random() * alt.length)];
    }

    return energyStops[
        Math.floor(Math.random() * energyStops.length)
    ];
}
