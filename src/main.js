// Main flow main.js
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
    if (h < 12) title.innerHTML = "Reset – Morning";
    else if (h < 18) title.innerHTML = "Reset – Afternoon";
    else title.innerHTML = "Reset – Night";


    // Restore last saved state for today (if any)
    const saved = (typeof loadAppState === "function") ? loadAppState() : null;
    console.log("Saved state:", saved);

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