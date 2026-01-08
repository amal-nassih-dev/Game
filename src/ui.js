// Rendering and buttons ui.js

function render({ text = "", subtext = "", buttons = [], showDice = false, resultHTML = null, center = false }) {
    clearUI();
    setProgress();

    // Toggle on #stage, not #main
    const stage = document.getElementById("stage");
    if (stage) stage.classList.toggle("center-stage", !!center);

    const textEl = document.getElementById("text");
    if (textEl) textEl.innerHTML = `<div class="fade-in">${text}</div>`;

    const subEl = document.getElementById("subtext");
    if (subEl) subEl.innerHTML = subtext ? `<div class="fade-in">${subtext}</div>` : "";

    if (!Array.isArray(buttons) || buttons.length === 0) {
        buttons = [{ label: "Next", action: next }];
    }

    const diceEl = document.getElementById("dice");
    if (diceEl) diceEl.innerText = showDice ? "🎲" : "";

    if (resultHTML) {
        const res = document.getElementById("result");
        if (res) {
            res.style.display = "block";
            res.innerHTML = resultHTML;
        }
    }

    renderMealBar();

    const btnWrap = document.getElementById("buttons");
    if (btnWrap) {
        btnWrap.innerHTML = "";
        buttons.forEach(b => {
            const btn = document.createElement("button");
            btn.innerText = b.label ?? "Action";
            btn.classList.add("action-btn", "primary");
            if (b.variant === "secondary") { btn.classList.remove("primary"); btn.classList.add("secondary"); }
            if (b.variant === "ghost") { btn.classList.remove("primary"); btn.classList.add("ghost"); }
            btn.onclick = () => b.action && b.action();
            if (b.label === "Next" || b.label === "Done" || b.label === "Continue") {
                btn.classList.add("floating-next-btn");
            }
            btnWrap.appendChild(btn);
        });
    }
    if (typeof updateAzkarButton === "function") {
        updateAzkarButton();
    }
}

function button(label, action, variant) {
    const b = document.createElement("button");
    b.innerText = label || "Action";
    b.classList.add("action-btn");
    if (variant === "secondary") b.classList.add("secondary");
    if (variant === "ghost") b.classList.add("ghost");
    b.onclick = action;

    // If it's a "Next" button, add floating class
    if (label === "Next" || label === "Done" || label === "Continue") {
        b.classList.add("floating-next-btn");
    }

    return b;
}

// Replace renderMealBar to render floating meals outside #app
function renderMealBar() {
    // Remove any old in-app bar if present
    const old = document.getElementById("mealbar");
    if (old && old.parentNode) old.parentNode.removeChild(old);

    // If fasting, hide floating meals (but still show iftar notification)
    const existingFloating = document.getElementById("top-mealbar");
    if (existingFloating) existingFloating.remove();

    // Create floating meal bar appended to body (shows meal pills and an X)
    // ...existing code...
    if (!appConfig.fasting && Array.isArray(appConfig.meals) && appConfig.meals.length) {
        const bar = document.createElement("div");
        bar.id = "top-mealbar";
        bar.className = "top-mealbar";
        const left = document.createElement("div");
        left.className = "tm-left";
        left.innerHTML = `<strong style="margin-right:8px;font-size:13px;color:var(--muted)">Meals</strong>`;
        appConfig.meals.forEach((m, idx) => {
            const done = !!(mealStatus[idx]?.done);
            const pill = document.createElement("span");
            pill.className = "pill";
            pill.style.marginRight = "8px";
            pill.style.opacity = done ? "0.5" : "1";
            pill.innerText = `${m.label} ${m.time}`;
            left.appendChild(pill);
        });
        const close = document.createElement("button");
        close.className = "top-meal-close ghost";
        close.innerText = "✕";
        close.onclick = () => {
            // Mark all upcoming meals as dismissed/done for today so notifications don't reappear
            if (!Array.isArray(mealStatus) || mealStatus.length !== appConfig.meals.length) {
                mealStatus = appConfig.meals.map(m => ({ label: m.label, time: m.time, done: true }));
            } else {
                mealStatus.forEach(ms => ms.done = true);
            }
            if (typeof saveMealStatus === "function") saveMealStatus();
            if (typeof saveAppState === "function") saveAppState();
            bar.remove();
            const notif = document.getElementById("top-notif-meal");
            if (notif) notif.remove();
        };

        bar.appendChild(left);
        bar.appendChild(close);
        document.body.appendChild(bar);
    }

    // refresh top-left next meal / iftar notification
    if (typeof showNextMealNotification === "function") showNextMealNotification();
}

// Create persistent restart button (called once at init)

function createRestartButton() {
  if (document.getElementById("restart-btn")) return;
  const btn = document.createElement("button");
  btn.id = "restart-btn";
  btn.innerText = "🔄 Restart Day";
  btn.onclick = () => {
    if (confirm("Are you sure you want to restart? All progress will be lost.")) {
      restartDay(false);
    }
  };
  document.body.appendChild(btn);
}

function centerStage(on = true) {
    const stage = document.getElementById("stage");
    if (stage) stage.classList.toggle("center-stage", !!on);
}

function restartDay(hardReload = true) {
  try {
    // 1) Stop timers and clear UI artifacts
    if (typeof stopTimer === "function") stopTimer();
    // Remove floating next, mealbar, notifications
    try {
      const btn = document.querySelector(".floating-next-btn"); if (btn) btn.remove();
      const mealbar = document.getElementById("top-mealbar"); if (mealbar) mealbar.remove();
      const notif = document.getElementById("top-notif-meal"); if (notif) notif.remove();
    } catch(e) {}

    // 2) Clear saved state (per-day and meals)
    if (typeof clearSavedState === "function") clearSavedState();
    // Remove any mealStatus_* keys and any dbr_state_* keys in case of date mismatch
    try {
      const toDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.startsWith("mealStatus_") || k.startsWith("dbr_state_")) {
          toDelete.push(k);
        }
      }
      toDelete.forEach(k => localStorage.removeItem(k));
    } catch (e) {}

    // 3) Reset runtime globals
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
      dice: null,
      mood: null
    };

    // 4) Either hard reload (cleanest) or soft restart (re-render)
    if (hardReload) {
      if (typeof clearSavedState === "function") clearSavedState();
      dayMeta.startTs = new Date(0).toISOString();
      location.href = location.pathname;
      return;
    }else {
  // 🧼 Soft restart (no reload)
       clearUI();

       stepIndex = 0;
       timerRemaining = 0;
       timerPaused = false;

       if (typeof setProgress === "function") setProgress();
       askProfile(() => {
         showSetup(() => {
           stepIndex = 0;
           next();
         });
       });
    }

  } catch (e) {
    // As a fallback, force reload
    location.reload();
  }
}
function createBoostEnergyButton() {
  if (document.getElementById("boost-btn")) return;

  const btn = document.createElement("button");
  btn.id = "boost-btn";
  btn.innerText = "⚡ Boost Energy";

  btn.style.position = "fixed";
  btn.style.zIndex = "9998";

  btn.onclick = () => {
    localStorage.setItem("forceStep0", "1");
    window.location.href = "src/energy.html";
  };

  document.body.appendChild(btn);
}

function boostEnergy() {
  // Save state so user can resume later
  if (typeof saveAppState === "function") {
    saveAppState();
  }

  // Optional: mark where we came from
  localStorage.setItem("returnToApp", "1");

  // Go to energy flow
  window.location.href = "src/energy.html";
}

window.boostEnergy = boostEnergy;
window.restartDay = restartDay;
function updateAzkarButton() {
  const btn = document.getElementById("azkar-btn");
  if (!btn) return;

  if (isEveningTime()) {
    btn.style.display = "inline-flex";
    btn.onclick = () => {
      clearUI();
      render({
        text: "🕌 Adkar Al-Masa2",
        subtext: "Read calmly – 10 minutes"
      });
      startTimer(10, next);
    };
  } else {
    btn.style.display = "none";
  }
}
