// ===============================
// Step handlers
// ===============================

// Case 1: Morning grounding or hydration
function stepGrounding() {
    const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
    const act =
        getAdaptiveActivity("grounding") ||
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

// Case 2: Silence / affirmations
function stepAffirmations() {
    if (currentAffirmationIx < affirmationsArabic.length) {
        showAffirmations(next);
    } else {
        next();
    }
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
    render({
        text: "🚶‍♀️ Morning walk or sit quietly",
        subtext: `<span class="pill">15–25 minutes</span>`,
        center: true
    });

    const btns = document.getElementById("buttons");
    btns.appendChild(button("Walk 15 min", () => startTimer(15, next)));
    btns.appendChild(button("Walk 25 min", () => startTimer(25, next)));
    btns.appendChild(button("Sit quietly", next, "secondary"));
}

// Case 5: Transition
function stepTransition() {
    render({
        text: getTransitionMessageByMood(),
        buttons: [{ label: "Continue", action: next }],
        center: true
    });
}

// Case 6: Quran memorization
function stepQuranMemo() {
    render({
        text: "📖 Quran memorization",
        subtext: `<span class="pill">15 minutes</span>`,
        center: true
    });
    startTimer(15, next);
}

// Case 7: Quran reading
function stepQuranReading() {
    render({
        text: "📖 Quran reading + Adkar Sabah",
        subtext: `<span class="pill">15 minutes</span>`,
        center: true
    });
    startTimer(15, () => askReflection("morning", next));
}

// Case 8: Mood selector
function stepMoodSelector() {
    loadMoodTheme();
    render({
        text: "🌅 How are you feeling?",
        subtext: "This adjusts your day's activities",
        center: true
    });
    showMoodSelector(() => next());
}

// Case 9: Dice roller
function stepDiceRoller() {
    render({
        text: "🎲 Split the focus block",
        subtext: "Using your configured subjects",
        showDice: true,
        buttons: [{
            label: "Roll Dice",
            action: () => {
                buildSessionsFromDice();
                distributeWaves();

                const moodBoost = dayMeta.mood
                    ? MOOD_THEMES[dayMeta.mood].activityBoost
                    : 1.0;

                const adjustedHours = (dayMeta.focusHours * moodBoost).toFixed(1);
                const alloc = Object.keys(dayMeta.dice).map(n => {
                    const cat = categoryFor(n);
                    return `<span class="pill">${dayMeta.dice[n]}%</span>
                            <span class="cat ${categoryClass(cat)}">${n}</span>`;
                }).join(" ");

                render({
                    text: "✅ Dice results saved",
                    resultHTML: `
                        <div class="kpi">
                            ${alloc}
                            <span class="pill">Adjusted hours: ${adjustedHours}h</span>
                        </div>`,
                    buttons: [{ label: "Continue", action: next }]
                });
            }
        }],
        center: true
    });
}

// Case 10: Research
function stepResearch() {
    render({
        text: "💻 Research",
        subtext: `<span class="pill">25–50 minutes</span>`,
        center: true
    });
    startTimer(30, next);
}

// Case 11: Morning wave
function stepMorningWave() {
    if (!waves.morning.length) return next();
    runWave(waves.morning, () => {
        stepCuriosity({ title: "🧠 Curiosity Break" });
    });
}

// Case 12: Break
function stepBreak() {
    const dur = getBreakDurationByMood();
    const act = pickActivityByMood("break") || randomEnergy();
    render({
        text: act,
        subtext: `<span class="pill">${dur} minutes</span>`,
        buttons: [
            { label: "Start", action: () => startTimer(dur, next) },
            { label: "Skip", variant: "secondary", action: next }
        ],
        center: true
    });
}

// Case 13: Lunch
function stepLunch() {
    if (appConfig.fasting && isBeforeIftar()) {
        render({
            text: "🧘 Midday reset",
            subtext: `<span class="pill">10 minutes</span>`,
            buttons: [{ label: "Start", action: () => startTimer(10, next) }],
            center: true
        });
    } else {
        render({
            text: "🍽️ Lunch break",
            subtext: `<span class="pill">20–30 minutes</span>`,
            buttons: [
                { label: "Start 25 min", action: () => startTimer(25, next) },
                { label: "Skip", variant: "secondary", action: next }
            ],
            center: true
        });
    }
}

// Case 14: Afternoon wave
function stepAfternoonWave() {
    if (!waves.afternoon.length) {
        askReflection("afternoon", next);
        return;
    }
    runWave(waves.afternoon, () =>{
        stepCuriosity({ title: "🧠 Curiosity Break" });
        askReflection("afternoon", next);
    });
}

// Case 15: Writing
function stepWriting() {
    render({
        text: "✍️ Writing",
        subtext: `<span class="pill">25–50 minutes</span>`,
        center: true
    });
    startTimer(30, next);
}

// Case 16: Pause
function stepPause() {
    const dur = getPauseDurationByMood();
    const act = pickActivityByMood("pause") || "🌬️ Breathe";
    render({
        text: act,
        subtext: `<span class="pill">${dur} minutes</span>`,
        center: true
    });
    startTimer(dur, next);
}

// Case 17 & 19: Energy reset
function stepEnergyReset() {
    const act =
        (appConfig.fasting && isBeforeIftar())
            ? pickActivityByMood("pause") || randomEnergy()
            : pickBodyAwareActivity("break") || "🍎 Fruit + water";

    render({
        text: act,
        buttons: [{ label: "Done", action: next }],
        center: true
    });
}

// Case 18: Evening
function stepEvening() {
    if (appConfig.fasting) {
        render({
            text: "📖 Quran reading & Adkar",
            subtext: `<span class="pill">15 minutes</span>`,
            center: true
        });
        const btns = document.getElementById("buttons");
        btns.appendChild(button("Start 15 min", () => startTimer(15, next)));
        btns.appendChild(button("Energy reset", next, "secondary"));
    } else {
        render({
            text: "🎧 Listen to relaxing audio or podcast",
            buttons: [{ label: "Done", action: next }],
            center: true
        });
    }
}

// Case 20: Night wave
function stepNightWave() {
    if (!waves.night.length) return next();
    runWave(waves.night, next);
    runWave(waves.night, () => {
        stepCuriosity({ title: "🧠 Curiosity Break" });
    });
}

// Case 21: Celebration
function stepTry() {
    render({
        text: "💃 You did it!",
        subtext: `<span class="note">Celebrate your effort</span>`,
        center: true
    });
    setTimeout(next, 1200);
}

// Case 22: Affirmation review
function stepAffirmationReview() {
    render({
        text: `✨ ${getAffirmationByMood("english")}`,
        subtext: `<span class="note">${getAffirmationByMood("arabic")}</span>`,
        buttons: [{ label: "Done", action: next }],
        center: true
    });
}

// Case 23–25: Journaling
function stepJournalChallenge() {
    render({ text: "📝 One challenge + solution", center: true });
    journalingForm("One challenge and solution", next);
}
function stepJournalWins() {
    render({ text: "📝 3 things you did well", center: true });
    journalingForm("3 things done well", next);
}
function stepJournalReflection() {
    render({ text: "📝 Mood & energy reflection", center: true });
    journalingForm("Mood, resistance, energy", next);
}

// Case 26: Congrats
function stepCongrats() {
    render({
        text: "Pick a random object near you. Ask: 'If this didn’t exist, what would replace it?' ",
        buttons: [{ label: "Done", action: next }],
        center: true
    });
}

// Case 27: End
function stepEndOfDay() {
    render({
        text: "🌑 End-of-day reflection",
        center: true
    });
    endOfDayForm(() => showDownload());
}

function stepCuriosity({ title = "🤔 Curiosity Moment", autoAdvance = true } = {}) {
    const prompt = getRandomCuriosityPrompt();

    render({
        text: title,
        subtext: `<div class="note">${prompt}</div>`,
        buttons: [
            {
                label: "Think about it",
                action: () => autoAdvance && next()
            },
            {
                label: "Skip",
                variant: "secondary",
                action: next
            }
        ],
        center: true
    });
}
