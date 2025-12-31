// Step handlers — each case extracted into its own function

// Case 1: Morning grounding or hydration
function stepGrounding() {
    const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
    const act = getAdaptiveActivity("grounding") || 
                (appConfig.fasting ? "🧘‍♀️ Ground yourself (2 min)" : "💧 Drink water (2 min)");

    render({
        text: `${act}${her}`,
        subtext: `<span class="pill">2 minutes</span>`,
        buttons: [{
            label: "Done",
            action: () => {
                markActivityDone(appConfig.fasting ? "grounding" : "hydration");
                next();
            }
        }],
        center: true
    });
}

// Case 2: Silence
function stepSilence() {
    const act = getAdaptiveActivity("silence") || "🧘‍♀️ Sit silently (2 min)";
    render({
        text: act,
        subtext: `<span class="pill">2 minutes</span>`,
        buttons: [{
            label: "Done",
            action: () => {
                markActivityDone("silence");
                next();
            }
        }],
        center: true
    });
}

// Case 3: Deep breathing
function stepBreathing() {
    render({
        text: "🌬️ Deep breathing (6 times)",
        subtext: `<span class="note">Inhale 4, hold 2, exhale 6.</span>`,
        buttons: [{ label: "Done", action: next }],
        center: true
    });
}

// Case 4: Morning walk
function stepMorningWalk() {
    render({ text: "🚶‍♀️ Morning walk or sit quietly", subtext: `<span class="pill">15–25 minutes</span>` , center: true});
    document.getElementById("buttons").appendChild(button("Walk 15 min", () => startTimer(15, next)));
    document.getElementById("buttons").appendChild(button("Walk 25 min", () => startTimer(25, next)));
    document.getElementById("buttons").appendChild(button("Sit quietly", next, "secondary"));
}

// Case 5: Affirmations
function stepAffirmations() {
    if (currentAffirmationIx < affirmationsArabic.length) {
        showAffirmations(next);
    } else {
        next();
    }
}

// Case 6: Morning audio
function stepMorningAudio() {
    const act = getAdaptiveActivity("morningAudio") || "🎧 Listen to calming audio (5 min)";
    render({
        text: act,
        subtext: `<span class="pill">5 minutes</span>`,
        buttons: [{
            label: "Start",
            action: () => {
                markActivityDone("morningAudio");
                startTimer(5, next);
            }
        }],
        center: true
    });
}


// Case 7: Transition message
function stepTransition() {
    const moodMsg = getTransitionMessageByMood();
    render({
        text: moodMsg,
        buttons: [{ label: "Continue", action: next }],
        center: true
    });
}

// Case 8: Quran memorization
function stepQuranMemo() {
    render({ text: "📖 Quran memorization", subtext: `<span class="pill">15 minutes</span>` , center: true});
    startTimer(15, next);
}

// Case 9: Quran reading + reflection
function stepQuranReading() {
    render({ text: "📖 Quran reading + Adkar Sabah", subtext: `<span class="pill">15 minutes</span>`, center: true });
    startTimer(15, () => askReflection("morning", next));
}

// Case 10: Mood selector
function stepMoodSelector() {
    loadMoodTheme();
    render({ text: "🌅 How are you feeling?", subtext: `This adjusts your day's activities`, center: true });
    showMoodSelector(() => next());
}

// Case 11: Dice roller
function stepDiceRoller() {
    render({
        text: "🎲 Split the focus block",
        subtext: `Using your configured subjects`,
        showDice: true,
        buttons: [{
            label: "Roll Dice",
            action: () => {
                buildSessionsFromDice();
                distributeWaves();
                const moodBoost = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].activityBoost : 1.0;
                const adjustedHours = (dayMeta.focusHours * moodBoost).toFixed(1);
                const alloc = Object.keys(dayMeta.dice).map(n => {
                    const cat = categoryFor(n);
                    return `<span class="pill">${dayMeta.dice[n]}%</span> <span class="cat ${categoryClass(cat)}">${n}</span>`;
                }).join(" ");
                const moodLabel = dayMeta.mood ? MOOD_THEMES[dayMeta.mood].label : "Neutral";
                render({
                    text: "✅ Dice results saved",
                    resultHTML: `<div class="kpi">${alloc}<span class="pill">Mood: ${moodLabel}</span><span class="pill">Adjusted hours: ${adjustedHours}h</span></div>`,
                    buttons: [{ label: "Continue", action: next }]
                });
            }
        }], center: true 
    });
}

// Case 12: Morning wave
function stepMorningWave() {
    if (waves.morning.length === 0) {
        next();
        return;
    }
    runWave(waves.morning, next);
}

// Case 13: Break
function stepBreak() {
    const breakDur = getBreakDurationByMood();
    const breakActivity = pickActivityByMood("break") || randomEnergy();
    render({
        text: breakActivity,
        subtext: `<span class="pill">${breakDur} minutes</span>`,
        buttons: [
            { label: "Start", action: () => startTimer(breakDur, next) },
            { label: "Skip", variant: "secondary", action: next }
        ], center: true 
    });
}

// Case 14: Lunch
function stepLunch() {
    if (appConfig.fasting && isBeforeIftar()) {
        render({
            text: "🧘 Midday reset",
            subtext: `<span class="pill">10 minutes</span>`,
            buttons: [{ label: "Start 10 min", action: () => startTimer(10, next) }]
        });
    } else {
        render({
            text: "🍽️ Lunch break",
            subtext: `<span class="pill">20–30 minutes</span>`,
            buttons: [
                { label: "Start 25 min", action: () => startTimer(25, next) },
                { label: "Skip", variant: "secondary", action: next }
            ], center: true 
        });
    }
}

// Case 15: Afternoon wave
function stepAfternoonWave() {
    if (waves.afternoon.length === 0) {
        askReflection("afternoon", next);
        return;
    }
    runWave(waves.afternoon, () => askReflection("afternoon", next));
}

// Case 16: Writing
function stepWriting() {
    render({
        text: "✍️ Writing",
        subtext: `<span class="pill">25–50 minutes</span>`, center: true 
    });
    startTimer(30, next);
}

// Case 17: Research
function stepResearch() {
    render({
        text: "💻 Research",
        subtext: `<span class="pill">25–50 minutes</span>`, center: true 
    });
    startTimer(30, next);
}

// Case 18: Pause/stretch
function stepPause() {
    const pauseDur = getPauseDurationByMood();
    const pauseActivity = pickActivityByMood("pause") || "🌬️ Breathe";
    render({
        text: pauseActivity,
        subtext: `<span class="pill">${pauseDur} minutes</span>`, center: true 
    });
    startTimer(pauseDur, next);
}

function stepTry() {
    const pauseDur = getPauseDurationByMood();
    const pauseActivity = pickActivityByMood("pause") || "🌬️ Breathe";
    render({
        text: pauseActivity,
        subtext: `<span class="pill">Good Job My lady now go dance </span>`, center: true 
    });
    startTimer(pauseDur, next);
}


// Case 19: Energy reset
function stepEnergyReset() {
    if (appConfig.fasting && isBeforeIftar()) {
        render({
            text: "🌬️ Light energy reset",
            subtext: `<span class="note">${pickActivityByMood("pause") || randomEnergy()}</span>`,
            buttons: [{ label: "Done", action: next }], center: true 
        });
    } else {
        const bodyActivity = pickBodyAwareActivity("break") || pickActivityByMood("break") || "🍎 Fruit + water";
        render({
            text: bodyActivity,
            buttons: [{ label: "Done", action: next }], center: true 
        });
    }
}

// Case 20: Evening Quran/relaxation
function stepEvening() {
    if (appConfig.fasting) {
        render({
            text: "📖 Quran reading & Adkar",
            subtext: `<span class="pill">15 minutes</span>`
        });
        document.getElementById("buttons").appendChild(button("Start 15 min", () => startTimer(15, next)));
        document.getElementById("buttons").appendChild(button("Or do an energy reset", next, "secondary"));
    } else {
        render({
            text: "🎧 Listen to relaxing audio or podcast",
            buttons: [{ label: "Done", action: next }], center: true 
        });
    }
}

// Case 21: Night wave
function stepNightWave() {
    if (waves.night.length === 0) {
        next();
        return;
    }
    runWave(waves.night, next);
}

// Case 22: Affirmation review
function stepAffirmationReview() {
    const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
    const moodAffirm = getAffirmationByMood("english");
    const moodArabic = getAffirmationByMood("arabic");

    render({
        text: `✨ ${moodAffirm}${her}`,
        subtext: `<span class="note">${moodArabic}</span>`,
        buttons: [{ label: "Done", action: next }], center: true 
    });
}

// Case 23: Journal - Challenge
function stepJournalChallenge() {
    render({ text: "📝 Journal: one challenge and solution" , center: true });
    journalingForm("One challenge and solution", next);
}

// Case 24: Journal - Wins
function stepJournalWins() {
    render({ text: "📝 Journal: 3 things done well today" , center: true });
    journalingForm("3 things done well", next);
}

// Case 25: Journal - Reflection
function stepJournalReflection() {
    render({ text: "📝 Reflection: mood, resistance, energy levels" , center: true });
    journalingForm("Mood, resistance, energy", next);
}

// Case 26: Congratulations
function stepCongrats() {
    const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
    render({
        text: `🎉 Congratulate yourself for completing focus sessions${her}`,
        buttons: [{ label: "Done", action: next }], center: true
    });
}

// Case 27: End of day
function stepEndOfDay() {
    render({ text: "🌑 End-of-day message & self-reflection: gratitude / lessons / plan tomorrow" , center: true });
    endOfDayForm(() => showDownload());
}

// Case 13: Break (uses mood-based duration)
function stepBreak() {
    const breakDur = getBreakDurationByMood();
    const breakActivity = pickActivityByMood("break") || randomEnergy();
    render({
        text: breakActivity,
        subtext: `<span class="pill">${breakDur} minutes</span>`,
        buttons: [
            { label: "Start", action: () => startTimer(breakDur, next) },
            { label: "Skip", variant: "secondary", action: next }
        ], center: true 
    });
}

// Case 18: Pause (uses mood-based duration)
function stepPause() {
    const pauseDur = getPauseDurationByMood();
    const pauseActivity = pickActivityByMood("pause") || "🌬️ Breathe";
    render({
        text: pauseActivity,
        subtext: `<span class="pill">${pauseDur} minutes</span>`, center: true 
    });
    startTimer(pauseDur, next);
}