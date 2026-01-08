// Main flow main.js
let returnStepAfterWork = null;

function loadStateFromURL() {
  const p = new URLSearchParams(location.search);
  const encoded = p.get("state");
  if (!encoded) return null;

  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function isSameDay(ts) {
  if (!ts) return false;
  const d1 = new Date(ts);
  const d2 = new Date();
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}


function next() {
    if (mainFlowLocked) return;
    mainFlowLocked = true;
    setTimeout(() => mainFlowLocked = false, 150);

    stopTimer();
    stepIndex++;
    setProgress();

    switch (stepIndex) {
        case 1: stepGrounding(); break;
        case 2: stepAffirmations(); break;
        case 3: stepBreathing(); break;
        case 4: stepMorningWalk(); break;
        case 5: stepTransition(); break;
        case 6: stepQuranMemo(); break;
        case 7: stepQuranReading(); break;
        case 8: stepMoodSelector(); break;
        case 9: stepDiceRoller(); break;
        case 10: stepResearch(); break;
        case 11: stepMorningWave(); break;
        case 12: stepBreak(); break;
        case 13: stepLunch(); break;
        case 14: stepAfternoonWave(); break;
        case 15: stepWriting(); break;
        case 16: stepPause(); break;
        case 17: stepEnergyReset(); break;
        case 18: stepEvening(); break;
        case 19: stepEnergyReset(); break;
        case 20: stepNightWave(); break;
        case 21: stepTry(); break;
        case 22: stepAffirmationReview(); break;
        case 23: stepJournalChallenge(); break;
        case 24: stepJournalWins(); break;
        case 25: stepJournalReflection(); break;
        case 26: stepCongrats(); break;
        case 27: stepEndOfDay(); break;
        default: showDownload(); break;
    }
}

(function init() {
    const h = new Date().getHours();
    const title = document.getElementById("title");
    if (h < 12) title.innerHTML = "The Journey – Morning";
    else if (h < 18) title.innerHTML = "The Journey – Afternoon";
    else title.innerHTML = "The Journey – Night";

    // 🔥 Restore state: URL → localStorage
    let saved = null;
    const urlState = loadStateFromURL();
    if (urlState && isSameDay(urlState.dayMeta?.startTs)) {
      saved = urlState;
      console.log("Restored state from URL (same day)");
    } else {
      const local = (typeof loadAppState === "function") ? loadAppState() : null;
      if (local && isSameDay(local.dayMeta?.startTs)) {
        saved = local;
        console.log("Restored state from localStorage (same day)");
      } else {
        console.log("New day detected → starting fresh");
      }
    }



    if (saved) {
        if (typeof saved.dayMeta === "object") dayMeta = Object.assign(dayMeta, saved.dayMeta);
        if (Array.isArray(saved.sessions)) sessions = saved.sessions;
        if (saved.waves) waves = saved.waves;
        if (Array.isArray(saved.sessionLogs)) sessionLogs = saved.sessionLogs;
        if (Array.isArray(saved.mealStatus)) mealStatus = saved.mealStatus;
        if (typeof saved.stepIndex === "number") {
            stepIndex = saved.stepIndex;
        }
        if (typeof saved.timerRemaining === "number") {
            timerRemaining = saved.timerRemaining;
            console.log("Restored timerRemaining:", timerRemaining);
        }
    }

    loadMealStatus();
    if (typeof showNextMealNotification === "function") showNextMealNotification();

    // **RESTORE MOOD THEME BEFORE RENDERING**
    if (dayMeta.mood && typeof applyMoodTheme === "function") {
        // applyMoodTheme(dayMeta.mood);
    }

    // **RESTORE BODY CONDITION BEFORE RENDERING**
    if (dayMeta.bodyCondition && typeof applyBodyCondition === "function") {
        applyBodyCondition(dayMeta.bodyCondition);
    }

    // If state was restored, jump directly to the saved step — skip profile/setup
    if (saved && saved.stepIndex > 0) {
        console.log("Calling renderCurrentStep with stepIndex:", stepIndex, "timerRemaining:", timerRemaining);
        renderCurrentStep();
    } else {
        // First time: show profile → setup → flow
        askProfile(() => {
            showSetup(() => {
                if (stepIndex <= 0) stepIndex = 0;
                next();
            });
        });
    }
})();

function openOther() {
  returnStepAfterWork = stepIndex;
  clearUI();
  render({
    text: "📌 Essential Task",
    subtext: "Take care of this, your flow will be waiting"
  });

  const c = document.getElementById("checklist");

  c.innerHTML = `
    <div class="field">
      <label>Duration (minutes)</label>
      <input id="fw-min" type="number" min="5" value="25">
    </div>
    <div class="field">
      <label>What do you have to do?</label>
      <textarea id="fw-notes"></textarea>
    </div>
  `;

  const btns = document.getElementById("buttons");
  btns.innerHTML = "";

  // ▶️ Start
  btns.appendChild(
    button("Start", () => {
      const mins = Number(document.getElementById("fw-min").value || 25);
      startTimer(mins);
    })
  );

  // ✅ Done 
  btns.appendChild(
    button("Done", () => {
      const notesEl = document.getElementById("fw-notes");
      if (typeof stopTimer === "function") stopTimer(); 
      addNote({
        type: "free-other",
        title: "Obligatory Task",
        content: notesEl.value || ""
      });

      if (returnStepAfterWork !== null) {
        stepIndex = returnStepAfterWork;
        returnStepAfterWork = null;
        renderCurrentStep();
      }
    }, "secondary")
  );
}


function renderCurrentStep() {
    const step = stepIndex;

    switch (step) {
        case 1: restoreGrounding(); break;
        case 2: stepAffirmations(); break;
        case 3: stepBreathing(); break;
        case 4: stepMorningWalk(); break;
        case 5: stepTransition(); break;
        case 6: restoreQuranMemo(); break;
        case 7: restoreQuranReading(); break;
        case 8: stepMoodSelector(); break;
        case 9: stepDiceRoller(); break;
        case 10: restoreResearch(); break;
        case 11: stepMorningWave(); break;
        case 12: restoreBreak(); break;
        case 13: stepLunch(); break;
        case 14: stepAfternoonWave(); break;
        case 15: restoreWriting(); break;
        case 16: restorePause(); break;
        case 17: stepEnergyReset(); break;
        case 18: restoreEvening(); break;
        case 19: stepEnergyReset(); break;
        case 20: stepNightWave(); break;
        case 21: stepTry(); break;
        case 22: stepAffirmationReview(); break;
        case 23: stepJournalChallenge(); break;
        case 24: stepJournalWins(); break;
        case 25: stepJournalReflection(); break;
        case 26: stepCongrats(); break;
        case 27: stepEndOfDay(); break;
        default: showDownload(); break;
    }

}