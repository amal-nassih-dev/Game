// src/dice.js — allocation and session building

// Random proportional allocation that sums to 100 (integers)
function allocatePercents(subjects) {
  const w = subjects.map(() => Math.random() + 0.1);
  const sum = w.reduce((a, b) => a + b, 0);
  const raw = w.map(x => (x / sum) * 100);
  const ints = raw.map(x => Math.floor(x));
  let rem = 100 - ints.reduce((a, b) => a + b, 0);
  const frac = raw
    .map((x, i) => ({ i, f: x - ints[i] }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; k < rem; k++) {
    ints[frac[k % frac.length].i]++;
  }
  for (let i = 0; i < ints.length; i++) {
    if (ints[i] === 0) ints[i] = 1;
  }
  let total = ints.reduce((a, b) => a + b, 0);
  while (total > 100) {
    for (let i = 0; i < ints.length && total > 100; i++) {
      if (ints[i] > 1) {
        ints[i]--;
        total--;
      }
    }
  }
  return ints;
}

// Split minutes into chunks up to maxChunk; merge tiny tail instead of forcing a floor
function clampSessionMinutes(mins, { maxChunk = 50, minTailMerge = 10 } = {}) {
  const out = [];
  const total = Math.round(Number(mins) || 0);
  if (total <= 0) return out;
  if (total <= maxChunk) return [total];
  let remaining = total;
  while (remaining > maxChunk) {
    out.push(maxChunk);
    remaining -= maxChunk;
  }
  if (remaining > 0) {
    if (out.length && remaining < minTailMerge) {
      out[out.length - 1] += remaining;
    } else {
      out.push(remaining);
    }
  }
  return out;
}

// Helper: shuffle while trying to avoid adjacent equal subjects
function shuffleNoAdj(list, key = s => s.name) {
  const out = [];
  const pool = list.slice();
  while (pool.length) {
    pool.sort(() => Math.random() - 0.5);
    let placed = false;
    for (let i = 0; i < pool.length; i++) {
      if (out.length === 0 || key(pool[i]) !== key(out[out.length - 1])) {
        out.push(pool.splice(i, 1)[0]);
        placed = true;
        break;
      }
    }
    if (!placed) out.push(pool.shift());
  }
  return out;
}

// Build sessions using a fixed total minute budget (focusHours * multipliers)
function buildSessionsFromDice() {
  const base = appConfig.baseSubjectsEditable || [];
  const customs = Array.isArray(dayMeta.customSubjects) ? dayMeta.customSubjects : [];
  const all = [...base, ...customs];
  const focusHours = Number(dayMeta.focusHours) || 0;
  const moodBoost = dayMeta.mood ? (MOOD_THEMES[dayMeta.mood]?.activityBoost || 1.0) : 1.0;
  const bodyMult = dayMeta.bodyCondition ? (BODY_CONDITIONS[dayMeta.bodyCondition]?.focusMultiplier || 1.0) : 1.0;
  const combinedMultiplier = moodBoost * bodyMult;
  const totalFocusMinutes = Math.max(0, Math.round(focusHours * 60 * combinedMultiplier));

  const perc = allocatePercents(all);
  sessions = [];
  sessionIdCounter = 1;
  dayMeta.dice = {};

  for (let i = 0; i < all.length; i++) {
    const p = perc[i];
    dayMeta.dice[all[i].name] = p;
    const subjectMinsRaw = Math.round((totalFocusMinutes * p) / 100);
    let chunks = clampSessionMinutes(subjectMinsRaw);
    if (chunks.length === 0 && totalFocusMinutes > 0) {
      const fair = Math.max(10, Math.min(15, Math.round(totalFocusMinutes / (all.length || 1))));
      chunks = [fair];
    }
    chunks.forEach(m =>
      sessions.push({
        id: sessionIdCounter++,
        name: all[i].name,
        checklist: all[i].checklist,
        minutes: m
      })
    );
  }

  // Shuffle to avoid adjacent duplicates
  sessions = shuffleNoAdj(sessions, s => s.name);
}

// Quota helpers
function minutesQuota(total, pct) {
  return Math.max(0, Math.round(total * pct));
}

// Assign sessions into morning/afternoon/night using quotas and caps
function distributeWaves() {
  waves = { morning: [], afternoon: [], night: [] };

  const total = sessions.reduce((a, s) => a + (s.minutes || 0), 0);
  const dp = appConfig.dayParts || {};
  const quotas = {
    morning: minutesQuota(total, dp.morning?.quotaPct ?? 0.34),
    afternoon: minutesQuota(total, dp.afternoon?.quotaPct ?? 0.33),
    night: minutesQuota(total, dp.night?.quotaPct ?? 0.33)
  };
  const caps = {
    morning: dp.morning?.maxMinutes ?? Infinity,
    afternoon: dp.afternoon?.maxMinutes ?? Infinity,
    night: dp.night?.maxMinutes ?? Infinity
  };
  const target = {
    morning: Math.min(quotas.morning, caps.morning),
    afternoon: Math.min(quotas.afternoon, caps.afternoon),
    night: Math.min(quotas.night, caps.night)
  };

  const used = { morning: 0, afternoon: 0, night: 0 };

  const assign = (s) => {
    const space = {
      morning: Math.max(0, target.morning - used.morning),
      afternoon: Math.max(0, target.afternoon - used.afternoon),
      night: Math.max(0, target.night - used.night)
    };
    const order = Object.entries(space).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    for (const w of order) {
      const capOk = (used[w] + s.minutes) <= caps[w];
      if (space[w] > 0 && capOk) {
        waves[w].push(s);
        used[w] += s.minutes;
        return;
      }
    }
    // fallback: least-filled bucket
    const w = Object.entries(used).sort((a, b) => a[1] - b[1])[0][0];
    waves[w].push(s);
    used[w] += s.minutes;
  };

  sessions.forEach(assign);

  // Fasting night cap (safety)
  if (appConfig.fasting) {
    waves.night.forEach(ss => {
      ss.minutes = Math.min(ss.minutes, 25);
    });
  }
}

// Expose globals if needed
window.allocatePercents = allocatePercents;
window.clampSessionMinutes = clampSessionMinutes;
window.buildSessionsFromDice = buildSessionsFromDice;
window.distributeWaves = distributeWaves;