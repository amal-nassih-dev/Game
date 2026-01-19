// src/flow.js — centralized flow configuration and helpers

// Define the ordered flow for the day here. Reorder items as needed.
// id is just a label; run is the step function; restore runs on refresh.
const flowConfig = [
  { id: "grounding", run: stepGrounding, restore: restoreGrounding },
  { id: "transition", run: stepTransition },
  { id: "quranMemo", run: stepQuranMemo, restore: restoreQuranMemo },
  { id: "quranReading", run: stepQuranReading, restore: restoreQuranReading },
  { id: "mood", run: stepMoodSelector },
  { id: "dice", run: stepDiceRoller },
  { id: "morningWave", run: stepMorningWave },
  { id: "break", run: stepBreak, restore: restoreBreak },
  { id: "research", run: stepResearch, restore: restoreResearch },
  { id: "lunch", run: stepLunch, restore: restoreLunch },
  { id: "afternoonWave", run: stepAfternoonWave },
  { id: "curiosity", run: stepCuriosity, restore: stepCuriosity },
  { id: "pause", run: stepPause, restore: restorePause },
  { id: "energyReset1", run: stepEnergyReset },
  { id: "evening", run: stepEvening, restore: restoreEvening },
  { id: "energyReset2", run: stepEnergyReset },
  { id: "nightWave", run: stepNightWave },
  { id: "writing", run: stepWriting, restore: restoreWriting },
  { id: "celebrate", run: stepTry },
  { id: "affirmationReview", run: stepAffirmationReview },
  { id: "journalChallenge", run: stepJournalChallenge },
  { id: "journalWins", run: stepJournalWins },
  { id: "journalReflection", run: stepJournalReflection },
  { id: "congrats", run: stepCongrats },
  { id: "endOfDay", run: stepEndOfDay }
];

function flowTotalSteps() { return flowConfig.length; }

function runStepAt(idx) {
  const cfg = flowConfig[idx - 1]; // stepIndex is 1-based
  if (!cfg) { showDownload(); return; }
  if (typeof cfg.run === "function") cfg.run(); else next();
}

function restoreStepAt(idx) {
  const cfg = flowConfig[idx - 1];
  if (!cfg) { showDownload(); return; }
  if (typeof cfg.restore === "function") cfg.restore();
  else if (typeof cfg.run === "function") cfg.run();
  else showDownload();
}

// Expose helpers
window.flowConfig = flowConfig;
window.flowTotalSteps = flowTotalSteps;
window.runStepAt = runStepAt;
window.restoreStepAt = restoreStepAt;