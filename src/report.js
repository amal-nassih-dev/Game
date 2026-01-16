// src/report.js
function buildTxtSummary() {
  const lines = [];
  const now = new Date();
  const sep = s => { lines.push(s); };
  const rule = (c = 32) => lines.push("".padEnd(c, "="));

  // Header
  sep("The New Journey — Daily Summary");
  sep(`Date: ${now.toLocaleString()}`);
  rule(50);

  // Profile
  if (dayMeta?.userProfile) {
    sep("PROFILE");
    sep(`- Name: ${dayMeta.userProfile.name || "-"}`);
    sep(`- Energy (self-report): ${dayMeta.userProfile.energy ?? "-"}`);
    sep(`- Focus Hours (planned): ${dayMeta.focusHours ?? "-"}`);
    sep("");
  }

  // Audio settings
  sep("AUDIO SETTINGS");
  sep(`- Notifications: ${appConfig?.sound?.notifications ? "On" : "Off"}`);
  sep(`- Pre-end beep: ${appConfig?.sound?.preEndSeconds ?? 120}s`);
  sep(`- Volume: ${(appConfig?.sound?.volume ?? 0.5)}`);
  sep(`- BG Audio: ${appConfig?.bgAudio?.enabled ? `On (mode=${appConfig?.bgAudio?.mode || "none"}, vol=${appConfig?.bgAudio?.volume ?? 0.35})` : "Off"}`);
  sep("");

  // Fasting & Meals
  sep("FASTING & MEALS");
  sep(`- Fasting today: ${appConfig?.fasting ? "Yes" : "No"}`);
  if (appConfig?.fasting) {
    sep(`- Iftar: ${appConfig.iftarTime || "-"}`);
    sep(`- Suhoor: ${appConfig.suhoorTime || "-"}`);
  }
  if (Array.isArray(appConfig?.meals) && appConfig.meals.length) {
    sep("");
    sep("Meals (with completion):");
    sep("+----------------------+----------+----------+");
    sep("| Meal                 | Time     | Done     |");
    sep("+----------------------+----------+----------+");
    appConfig.meals.forEach((m, i) => {
      const done = mealStatus?.[i]?.done ? "Yes" : "No";
      const pad = (s, w) => (String(s).padEnd(w, " "));
      sep(`| ${pad(m.label, 20)} | ${pad(m.time, 8)} | ${pad(done, 8)} |`);
    });
    sep("+----------------------+----------+----------+");
  }
  sep("");

  // Mood & Body
  if (dayMeta?.mood && MOOD_THEMES?.[dayMeta.mood]) {
    const mood = MOOD_THEMES[dayMeta.mood];
    const boostPct = Math.round((mood.activityBoost - 1) * 100);
    sep("MOOD");
    sep(`- ${mood.label}`);
    sep(`- Adjustment: ${boostPct >= 0 ? "+" : ""}${boostPct}% (${mood.activityBoost.toFixed(2)}x)`);
    sep(`- ${mood.description}`);
    sep("");
  }
  if (dayMeta?.bodyCondition && BODY_CONDITIONS?.[dayMeta.bodyCondition]) {
    const b = BODY_CONDITIONS[dayMeta.bodyCondition];
    const bAdjPct = Math.round((b.focusMultiplier - 1) * 100);
    sep("BODY CONDITION");
    sep(`- ${b.label}`);
    sep(`- Focus multiplier: ${b.focusMultiplier}x (${bAdjPct >= 0 ? "+" : ""}${bAdjPct}%)`);
    sep(`- ${b.note}`);
    sep("");
  }

  // Planning
  if (dayMeta?.planning) {
    sep("PLANNING");
    if (dayMeta.planning.commitments) sep(`• Commitments:\n${indentBlock(dayMeta.planning.commitments)}`);
    if (dayMeta.planning.restPlan) sep(`• Rest & breaks:\n${indentBlock(dayMeta.planning.restPlan)}`);
    if (dayMeta.planning.topOutcomes) sep(`• Top 3 outcomes:\n${indentBlock(dayMeta.planning.topOutcomes)}`);
    sep("");
  }

  // Subjects
  const base = Array.isArray(appConfig?.baseSubjectsEditable) ? appConfig.baseSubjectsEditable : [];
  const custom = Array.isArray(dayMeta?.customSubjects) ? dayMeta.customSubjects : [];
  if (base.length || custom.length) {
    sep("FOCUS SUBJECTS");
    if (base.length) {
      sep("- Main subjects:");
      base.forEach(s => sep(`  • ${s.name} — ${(s.checklist || []).length} items`));
    }
    if (custom.length) {
      sep("- Custom subjects:");
      custom.forEach(s => sep(`  • ${s.name} — ${(s.checklist || []).length} items`));
    }
    sep("");
  }

  // Dice allocation
  if (dayMeta?.dice && Object.keys(dayMeta.dice).length) {
    sep("ALLOCATION (DICE)");
    sep("+---------------------------+-------+");
    sep("| Subject                   | %     |");
    sep("+---------------------------+-------+");
    Object.entries(dayMeta.dice).forEach(([k, v]) => {
      const name = (k || "").slice(0, 25).padEnd(25, " ");
      const pct = String(v).padStart(3, " ");
      sep(`| ${name} | ${pct}% |`);
    });
    sep("+---------------------------+-------+");
    sep("");
  }

  // Waves overview
  if (waves && (waves.morning?.length || waves.afternoon?.length || waves.night?.length)) {
    sep("WAVES OVERVIEW (PLANNED MINUTES)");
    ["morning", "afternoon", "night"].forEach(w => {
      const arr = waves[w] || [];
      if (!arr.length) return;
      const total = arr.reduce((a, b) => a + (b.minutes || 0), 0);
      sep(`- ${capitalize(w)}: ${total} min, ${arr.length} session(s)`);
    });
    sep("");
  }

  // Sessions and KPIs
  let kpi = { planned: 0, actual: 0, completed: 0, skipped: 0 };
  if (Array.isArray(sessionLogs) && sessionLogs.length) {
    kpi.planned = sessionLogs.reduce((a, s) => a + (s.plannedMinutes || 0), 0);
    kpi.actual = sessionLogs.reduce((a, s) => a + (s.actualSeconds || 0) / 60, 0);
    kpi.completed = sessionLogs.filter(s => s.status === "completed").length;
    kpi.skipped = sessionLogs.filter(s => s.status !== "completed").length;

    sep("FOCUS SESSIONS");
    sep(`- Planned total: ${Math.round(kpi.planned)} min`);
    sep(`- Actual total: ${kpi.actual.toFixed(1)} min`);
    const rate = kpi.planned > 0 ? Math.round((kpi.actual / kpi.planned) * 100) : 0;
    sep(`- Completion rate: ${rate}%`);
    sep(`- Sessions: completed ${kpi.completed}, skipped ${kpi.skipped}`);
    sep("");
    sep("+----------------------------------+----------+----------+-----------+");
    sep("| Session                          | Planned  | Actual   | Status    |");
    sep("+----------------------------------+----------+----------+-----------+");
    sessionLogs.forEach(s => {
      const name = (s.name || "").slice(0, 30).padEnd(30, " ");
      const p = String(s.plannedMinutes || 0).toString().padStart(4, " ");
      const a = s.actualSeconds ? (s.actualSeconds / 60).toFixed(1).toString().padStart(6, " ") : "  0.0";
      const st = (s.status || "-").padEnd(9, " ");
      sep(`| ${name} | ${p} min | ${a} m | ${st} |`);
      if (s.notes) sep(`  Notes: ${s.notes}`);
      if (Array.isArray(s.questions) && s.questions.length) {
        sep(`  Qs/Todos: ${s.questions.join(" | ")}`);
      }
      if (Array.isArray(s.carriedOver) && s.carriedOver.length) {
        sep(`  Carried-over: ${s.carriedOver.join(" | ")}`);
      }
    });
    sep("+----------------------------------+----------+----------+-----------+");
    sep("");
  }

  // Notes grouped
  if (Array.isArray(notes) && notes.length) {
    sep("NOTES");
    const groups = notes.reduce((acc, n) => {
      acc[n.type] = acc[n.type] || [];
      acc[n.type].push(n);
      return acc;
    }, {});
    Object.keys(groups).forEach(k => {
      sep(`- ${k.toUpperCase()} (${groups[k].length})`);
      groups[k].forEach(n => {
        const t = typeof n.content === "string" ? n.content :
                  (n.content ? JSON.stringify(n.content) : "");
        if (n.title) sep(`  • ${n.title}`);
        if (t) sep(indentBlock(t));
      });
      sep("");
    });
  }

  sep("End of report");
  return lines.join("\n");
}

function buildSessionsCsv() {
  if (!Array.isArray(sessionLogs) || !sessionLogs.length) return "";
  const header = ["id","name","plannedMinutes","actualMinutes","status"].join(",");
  const rows = sessionLogs.map(s => {
    const actual = (s.actualSeconds || 0) / 60;
    return [s.id, JSON.stringify(s.name || ""), s.plannedMinutes || 0, actual.toFixed(2), s.status || ""].join(",");
  });
  return [header, ...rows].join("\n");
}

function showDownload() {
  clearUI();
  setProgress();
  const her = dayMeta?.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
  const textEl = document.getElementById("text");
  if (textEl) textEl.innerHTML = `🌙 Bravo! Nhark kaml b wa3i${her}. Tsb7i 3la khir 🌙`;
  const subEl = document.getElementById("subtext");
  if (subEl) subEl.innerHTML = "Download your daily report.";

  // TXT
  const content = buildTxtSummary() || "";
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `journey-report-${new Date().toISOString().slice(0, 10)}.txt`;
  a.innerText = "⬇️ Download report (.txt)";
  a.className = "pill";
  a.style.display = "inline-block";
  a.style.margin = "8px auto";
  a.style.textAlign = "center";

  const res = document.getElementById("result");
  if (res) {
    res.style.display = "block";
    res.appendChild(a);

    // CSV
    const csv = buildSessionsCsv();
    if (csv) {
      const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const csvUrl = URL.createObjectURL(csvBlob);
      const a2 = document.createElement("a");
      a2.href = csvUrl;
      a2.download = `journey-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
      a2.innerText = "⬇️ Download sessions (.csv)";
      a2.className = "pill";
      a2.style.display = "inline-block";
      a2.style.margin = "8px auto";
      a2.style.textAlign = "center";
      res.appendChild(document.createElement("br"));
      res.appendChild(a2);
      setTimeout(() => URL.revokeObjectURL(csvUrl), 30000);
    }
  }

  try { a.click(); } catch (e) {}
  setTimeout(() => URL.revokeObjectURL(url), 30000);

  const btns = document.getElementById("buttons");
  if (btns) {
    btns.appendChild(
      button("Restart", () => {
        restartDay(true);
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

// expose
window.buildTxtSummary = buildTxtSummary;
window.showDownload = showDownload;