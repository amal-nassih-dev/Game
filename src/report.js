// src/report.js
function buildTxtSummary() {
    const lines = [];
    const now = new Date();

    lines.push("The New Journey – Day 1");
    lines.push(`Date: ${now.toLocaleString()}`);

    // Profile
    if (dayMeta?.userProfile) {
        lines.push("");
        lines.push("Profile");
        lines.push(`- Name: ${dayMeta.userProfile.name || "-"}`);
        lines.push(`- Energy (self-report): ${dayMeta.userProfile.energy ?? "-"}`);
        lines.push(`- Focus Hours (planned): ${dayMeta.focusHours ?? "-"}`);
    }

    // Fasting & Meals
    lines.push("");
    lines.push("Fasting & Meals");
    lines.push(`- Fasting today: ${appConfig?.fasting ? "Yes" : "No"}`);

    if (appConfig?.fasting) {
        lines.push(`- Iftar: ${appConfig.iftarTime || "-"}`);
        lines.push(`- Suhoor: ${appConfig.suhoorTime || "-"}`);
    } else if (Array.isArray(appConfig?.meals) && appConfig.meals.length) {
        lines.push("- Meals:");
        appConfig.meals.forEach(m => {
            lines.push(`• ${m.label} at ${m.time}${m.macro ? ` — ${m.macro}` : ""}`);
        });
    }

    // Mood & Body
    if (dayMeta?.mood && MOOD_THEMES?.[dayMeta.mood]) {
        lines.push("");
        lines.push("Mood & Energy");
        const mood = MOOD_THEMES[dayMeta.mood];
        const boostPct = Math.round((mood.activityBoost - 1) * 100);
        lines.push(`- Selected Mood: ${mood.label}`);
        lines.push(
            `- Activity Adjustment: ${boostPct >= 0 ? "+" : ""}${boostPct}% (${mood.activityBoost.toFixed(1)}x)`
        );
        lines.push(`- Description: ${mood.description}`);
    }

    if (dayMeta?.bodyCondition && BODY_CONDITIONS?.[dayMeta.bodyCondition]) {
        lines.push("");
        lines.push("Body Condition");
        const b = BODY_CONDITIONS[dayMeta.bodyCondition];
        const bAdjPct = Math.round((b.focusMultiplier - 1) * 100);
        lines.push(`- Condition: ${b.label}`);
        lines.push(
            `- Focus time multiplier: ${b.focusMultiplier}x (${bAdjPct >= 0 ? "+" : ""}${bAdjPct}%)`
        );
        lines.push(`- Note: ${b.note}`);
    }

    // Planning
    if (dayMeta?.planning) {
        lines.push("");
        lines.push("Planning");
        if (dayMeta.planning.commitments) {
            lines.push("• Commitments:");
            lines.push(indentBlock(dayMeta.planning.commitments));
        }
        if (dayMeta.planning.restPlan) {
            lines.push("• Rest & breaks:");
            lines.push(indentBlock(dayMeta.planning.restPlan));
        }
        if (dayMeta.planning.topOutcomes) {
            lines.push("• Top 3 outcomes:");
            lines.push(indentBlock(dayMeta.planning.topOutcomes));
        }
    }

    // Subjects
    const base = Array.isArray(appConfig?.baseSubjectsEditable) ? appConfig.baseSubjectsEditable : [];
    const custom = Array.isArray(dayMeta?.customSubjects) ? dayMeta.customSubjects : [];

    if (base.length || custom.length) {
        lines.push("");
        lines.push("Focus Subjects");

        if (base.length) {
            lines.push("- Main subjects:");
            base.forEach(s =>
                lines.push(`• ${s.name} — ${Array.isArray(s.checklist) ? s.checklist.length : 0} items`)
            );
        }

        if (custom.length) {
            lines.push("- Custom subjects:");
            custom.forEach(s =>
                lines.push(`• ${s.name} — ${Array.isArray(s.checklist) ? s.checklist.length : 0} items`)
            );
        }
    }

    // Dice
    if (dayMeta?.dice && typeof dayMeta.dice === "object" && Object.keys(dayMeta.dice).length) {
        lines.push("");
        lines.push("Focus Allocation (Dice)");
        Object.keys(dayMeta.dice).forEach(k =>
            lines.push(`- ${k}: ${dayMeta.dice[k]}%`)
        );
    }

    // Waves
    if (waves && (waves.morning?.length || waves.afternoon?.length || waves.night?.length)) {
        lines.push("");
        lines.push("Waves Overview (planned minutes)");
        ["morning", "afternoon", "night"].forEach(w => {
            const arr = waves[w] || [];
            if (!arr.length) return;
            const total = arr.reduce((a, b) => a + (b.minutes || 0), 0);
            lines.push(`- ${capitalize(w)}: ${total} min, ${arr.length} session(s)`);
        });
    }

    // Sessions
    if (Array.isArray(sessionLogs) && sessionLogs.length) {
        lines.push("");
        lines.push("Focus Sessions (Planned vs Actual)");
        sessionLogs.forEach(s => {
            const actualMin = s.actualSeconds ? (s.actualSeconds / 60).toFixed(1) : "0.0";
            lines.push(
                `- ${s.name}: planned ${s.plannedMinutes} min, actual ${actualMin} min (${s.status})`
            );
            if (s.notes) lines.push(`Notes: ${s.notes}`);
            if (Array.isArray(s.questions) && s.questions.length) {
                lines.push(`Qs/Todos: ${s.questions.join(" | ")}`);
            }
        });
    }

    lines.push("");
    return lines.join("\n");
}

function showDownload() {
    clearUI();
    setProgress();

    const her = dayMeta?.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
    const textEl = document.getElementById("text");
    if (textEl) {
        textEl.innerHTML = `🌙 Bravo! Nhark kaml b wa3i${her}. Tsb7i 3la khir 🌙`;
    }

    const subEl = document.getElementById("subtext");
    if (subEl) subEl.innerHTML = "Download your daily report.";

    const content = buildTxtSummary() || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `dark-blue-reset-day1-${new Date().toISOString().slice(0, 10)}.txt`;
    a.innerText = "⬇️ Download report (.txt)";
    a.className = "pill";
    a.style.display = "inline-block";
    a.style.margin = "8px auto";
    a.style.textAlign = "center";

    const res = document.getElementById("result");
    if (res) {
        res.style.display = "block";
        res.appendChild(a);
    }

    try { a.click(); } catch (e) {}
    setTimeout(() => URL.revokeObjectURL(url), 30000);

    const btns = document.getElementById("buttons");
    if (btns) {
        btns.appendChild(
            button("Restart", () => {
                if (typeof clearSavedState === "function") clearSavedState();
                stepIndex = 0;
                timerRemaining = 0;
                timerPaused = false;
                notes = [];
                currentAffirmationIx = 0;
                sessions = [];
                waves = { morning: [], afternoon: [], night: [] };
                runningQueue = [];
                runningIndex = -1;
                blockAccumMinutes = 0;
                activeSession = null;
                activeSessionExtra = null;
                sessionLogs = [];
                sessionIdCounter = 1;
                questionsBacklog = {};
                mealStatus = [];
                dayMeta = {
                    startTs: new Date().toISOString(),
                    userProfile: {},
                    focusHours: 4,
                    customSubjects: [],
                    dice: null
                };
                location.reload();
            }, "secondary")
        );
    }
}

// helpers
function indentBlock(text) {
    const t = String(text || "");
    if (!t) return "";
    return t.split("\n").map(l => `  ${l}`).join("\n");
}

function capitalize(s) {
    return String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
}

// expose globals
window.buildTxtSummary = buildTxtSummary;
window.showDownload = showDownload;
