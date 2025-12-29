// Main flow main.js
function next() {
  if (mainFlowLocked) return; 
  mainFlowLocked = true; 
  setTimeout(() => mainFlowLocked = false, 150);

  stopTimer();
  stepIndex++; 
  setProgress();

  switch(stepIndex) {

    // Morning / Ground
    case 1: {
      const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
      render({ text: `💧 Drink water${her}`, subtext: `<span class="pill">2 minutes</span>` });
      startTimer(2, next);
      break;
    }

    case 2: 
      render({ text: "🧘‍♀️ Sit silently", subtext: `<span class="pill">2 minutes</span>` });
      startTimer(2, next);
      break;

    case 3: 
      render({ 
        text: "🌬️ Deep breathing (6 times)", 
        subtext: `<span class="note">Inhale 4, hold 2, exhale 6.</span>`, 
        buttons: [{ label: "Done", action: next }] 
      });
      break;

    case 4: {
      render({ text: "🚶‍♀️ Morning walk or sit quietly", subtext: `<span class="pill">15–25 minutes</span>` });
      document.getElementById("buttons").appendChild(button("Walk 15 min", () => startTimer(15, next)));
      document.getElementById("buttons").appendChild(button("Walk 25 min", () => startTimer(25, next)));
      document.getElementById("buttons").appendChild(button("Sit quietly", next, "secondary"));
      break;
    }

    case 5:
      if (currentAffirmationIx < affirmationsArabic.length) { 
        showAffirmations(next); 
      } else { 
        next(); 
      }
      break;

    case 6: 
      render({ text: "🎧 Morning calm audio", subtext: `<span class="pill">5 minutes</span>` });
      startTimer(5, next); 
      break;

    // Spiritual
    case 7: 
      render({ text: "📖 Quran memorization", subtext: `<span class="pill">15 minutes</span>` });
      startTimer(15, next); 
      break;

    case 8: 
      render({ text: "📖 Quran reading + Adkar Sabah", subtext: `<span class="pill">15 minutes</span>` });
      startTimer(15, () => askReflection("morning", next)); 
      break;

    // Planning + Dice
    case 9:
      render({ text: "⏱️ Gentle planning", subtext: `Check schedule, calculate time, reserve rest, choose focus sessions` });
      showPlanningForm(() => { 
        addNote({ type: "planning", title: "Gentle planning", content: "Completed" }); 
        next(); 
      });
      break;

    case 10:
      render({ 
        text: "🎲 Split the focus block", 
        subtext: `Using your configured subjects`, 
        showDice: true,
        buttons: [{
          label: "Roll Dice", 
          action: () => {
            buildSessionsFromDice();
            distributeWaves();
            const alloc = Object.keys(dayMeta.dice).map(n => {
              const cat = categoryFor(n);
              return `<span class="pill">${dayMeta.dice[n]}%</span> <span class="cat ${categoryClass(cat)}">${n}</span>`;
            }).join(" ");
            render({ 
              text: "✅ Dice results saved", 
              resultHTML: `<div class="kpi">${alloc}<span class="pill">Total hours: ${focusHours}h</span></div>`,
              buttons: [{ label: "Continue", action: next }] 
            });
          }
        }]
      });
      break;

    // Wave 1: Morning focus
    case 11:
      if (waves.morning.length === 0) { next(); break; }
      runWave(waves.morning, next);
      break;

    // Mini break
    case 12: 
      render({ text: randomEnergy(), buttons: [{ label: "Next", action: next }] }); 
      break;

    // Lunch
    case 13:
      if (appConfig.fasting && isBeforeIftar()){
        render({ text: "🧘 Midday reset", subtext: `<span class="pill">10 minutes</span>`, buttons: [{ label: "Start 10 min", action: () => startTimer(10, next) }] });
      } else {
        render({ text: "🍽️ Lunch break", subtext: `<span class="pill">20–30 minutes</span>`, buttons: [
          { label: "Start 25 min", action: () => startTimer(25, next) },
          { label: "Skip", variant:"secondary", action: next }
        ]});
      }
      break;

    // Wave 2: Afternoon focus + reflection
    case 14:
      if (waves.afternoon.length === 0) { 
        askReflection("afternoon", next); 
        break; 
      }
      runWave(waves.afternoon, () => askReflection("afternoon", next));
      break;

    // Writing + research
    case 15: 
      render({ text: "✍️ Writing: reflect on people who look down on themselves", subtext: `<span class="pill">25–50 minutes</span>` });
      startTimer(30, next); 
      break;

    case 16: 
      render({ text: "💻 Research", subtext: `<span class="pill">25–50 minutes</span>` });
      startTimer(30, next); 
      break;

    // Mood changer
    case 17: 
      render({ text: "🌬️ Stretch and breathe", subtext: `<span class="pill">5 minutes</span>` });
      startTimer(5, next); 
      break;

    case 18:
      if (appConfig.fasting && isBeforeIftar()){
        render({ text: "🌬️ Light energy reset", subtext: `<span class="note">${randomEnergy()}</span>`, buttons: [{ label: "Done", action: next }] });
      } else {
        render({ text: "🍎 Eat fruit / nuts / drink water", buttons: [{ label: "Done", action: next }] });
      }
      break;

    case 19: 
      render({ text: "🎧 Listen to relaxing audio or podcast", buttons: [{ label: "Done", action: next }] }); 
      break;

    // Wave 3: Night focus
    case 20:
      if (waves.night.length === 0) { next(); break; }
      runWave(waves.night, next);
      break;

    case 21: {
      const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
      render({ text: `✨ Affirmation review${her}`, buttons: [{ label: "Done", action: next }] });
      break;
    }

    // Journaling & Closing
    case 22: 
      render({ text: "📝 Journal: one challenge and solution" }); 
      journalingForm("One challenge and solution", next); 
      break;

    case 23: 
      render({ text: "📝 Journal: 3 things done well today" }); 
      journalingForm("3 things done well", next); 
      break;

    case 24: 
      render({ text: "📝 Reflection: mood, resistance, energy levels" }); 
      journalingForm("Mood, resistance, energy", next); 
      break;

    case 25: {
      const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
      render({ text: `🎉 Congratulate yourself for completing focus sessions${her}`, buttons: [{ label: "Done", action: next }] });
      break;
    }

    case 26: 
      render({ text: "🌑 End-of-day message & self-reflection: gratitude / lessons / plan tomorrow" }); 
      endOfDayForm(() => showDownload()); 
      break;

    default: 
      showDownload(); 
      break;
  }
}

(function init(){
  const h = new Date().getHours();
  const title = document.getElementById("title");
  if (h < 12) title.innerHTML = "Reset – Morning";
  else if (h < 18) title.innerHTML = "Reset – Afternoon";
  else title.innerHTML = "Reset – Night";
  loadMealStatus();
  // Profile -> Setup -> flow
  askProfile(() => { 
    showSetup(() => { 
      stepIndex = 0; 
      next(); 
    }); 
  });
})();
