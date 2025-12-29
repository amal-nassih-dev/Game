function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
}

function startTimer(minutes, onEnd) {
    stopTimer();
    timerRemaining = Math.round(minutes * 60);
    timerPaused = false;

    // local latch for pre-end beep
    let preEndPlayed = false;

    const timerEl = document.getElementById("timer");
    timerEl.innerText = formatMinSec(timerRemaining);

    const btnWrap = document.getElementById("buttons");
    const pauseBtn = document.createElement("button");
    pauseBtn.innerText = "⏸️ Pause";
    pauseBtn.classList.add("secondary");
    pauseBtn.onclick = () => {
        if (!timer) return;
        timerPaused = !timerPaused;
        pauseBtn.innerText = timerPaused ? "▶️ Resume" : "⏸️ Pause";
    };

    const skipBtn = document.createElement("button");
    skipBtn.innerText = "⏭️ Skip / Next";
    skipBtn.classList.add("ghost");
    skipBtn.onclick = () => { stopTimer(); onEnd && onEnd("skipped"); };

    btnWrap.prepend(skipBtn);
    btnWrap.prepend(pauseBtn);

    timer = setInterval(() => {
        if (!timerPaused) {
            timerRemaining--;
            timerEl.innerText = formatMinSec(Math.max(timerRemaining, 0));

            const pre = (appConfig && appConfig.sound && typeof appConfig.sound.preEndSeconds === "number")
                ? appConfig.sound.preEndSeconds
                : 120;

            if (!preEndPlayed && pre > 0 && timerRemaining === pre) {
                preEndPlayed = true;
                notifyBeep("preend");
            }

            if (timerRemaining <= 0) {
                stopTimer();
                notifyBeep("end");
                onEnd && onEnd("completed");
            }
        }
    }, 1000);
}

function notifyBeep(type) {
    // Try audio.js first
    if (typeof playNotification === "function") {
        try { playNotification(type); return; } catch (e) { }
    }
    // Fallback: inline WebAudio
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = (type === "end") ? 660 : 440;
        g.gain.value = (appConfig && appConfig.sound && typeof appConfig.sound.volume === "number")
            ? Math.max(0, Math.min(1, appConfig.sound.volume))
            : 0.5;
        o.connect(g); g.connect(ctx.destination);
        o.start();
        setTimeout(() => { o.stop(); ctx.close(); }, 220);
    } catch (e) { }
}