// src/timer.js — time-based countdown with safe globals (no duplicate identifiers)
(function () {
  // Private state
  let handle = null;
  let paused = false;
  let remaining = 0; // seconds
  let endAt = 0;     // epoch ms when running

  function saveState() {
    if (typeof window.saveAppState === "function") window.saveAppState();
  }

  function stopTimer() {
    if (handle) clearInterval(handle);
    handle = null;
    paused = false;
    remaining = 0;
    endAt = 0;
    const timerEl = document.getElementById("timer");
    if (timerEl) {
      timerEl.classList.remove("active");
      timerEl.style.display = "none";
    }
    const tc = document.getElementById("timer-controls");
    if (tc) tc.remove();
    saveState();
  }

  function ensureTimerUI() {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return;
    if (!timerEl.querySelector("svg")) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 200 200");
      const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bgCircle.setAttribute("cx", "100");
      bgCircle.setAttribute("cy", "100");
      bgCircle.setAttribute("r", "90");
      bgCircle.setAttribute("fill", "none");
      bgCircle.setAttribute("stroke", "rgba(77, 166, 255, 0.1)");
      bgCircle.setAttribute("stroke-width", "8");
      svg.appendChild(bgCircle);

      const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ring.setAttribute("cx", "100");
      ring.setAttribute("cy", "100");
      ring.setAttribute("r", "90");
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "#4da6ff");
      ring.setAttribute("stroke-width", "8");
      ring.setAttribute("stroke-linecap", "round");
      ring.classList.add("timer-ring");
      ring.style.strokeDasharray = "565.48";
      ring.style.strokeDashoffset = "565.48";
      ring.style.transition = "stroke-dashoffset 1s linear";
      svg.appendChild(ring);

      timerEl.appendChild(svg);
    }
    if (!timerEl.querySelector(".timer-text")) {
      const textDiv = document.createElement("div");
      textDiv.className = "timer-text";
      timerEl.appendChild(textDiv);
    }
  }

  function buildTimerControls(onEnd) {
    let controls = document.getElementById("timer-controls");
    if (controls) controls.remove();
    controls = document.createElement("div");
    controls.id = "timer-controls";
    controls.style.cssText = "display:flex;gap:12px;margin-top:16px;justify-content:center;align-items:center;width:100%;";

    const pauseBtn = document.createElement("button");
    pauseBtn.className = "timer-icon-btn";
    pauseBtn.innerHTML = paused ? "▶️" : "⏸️";
    pauseBtn.title = paused ? "Resume" : "Pause";
    pauseBtn.onclick = () => {
      paused = !paused;
      if (paused) {
        remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        pauseBtn.innerHTML = "▶️";
        pauseBtn.title = "Resume";
      } else {
        endAt = Date.now() + remaining * 1000;
        pauseBtn.innerHTML = "⏸️";
        pauseBtn.title = "Pause";
      }
      saveState();
    };

    const skipBtn = document.createElement("button");
    skipBtn.className = "timer-icon-btn";
    skipBtn.innerHTML = "⏭️";
    skipBtn.title = "Skip";
    skipBtn.onclick = () => {
      stopTimer();
      if (typeof onEnd === "function") onEnd();
      saveState();
    };

    controls.appendChild(pauseBtn);
    controls.appendChild(skipBtn);

    const app = document.getElementById("app");
    if (app) app.appendChild(controls);
  }

  function tickLoop(totalSeconds, onEnd) {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return;
    const ring = timerEl.querySelector(".timer-ring");
    const textEl = timerEl.querySelector(".timer-text");
    const circumference = 565.48;
    let preEndPlayed = false;

    const preEnd = (window.appConfig?.sound?.preEndSeconds ?? 120);

    const recomputeRemaining = () => {
      if (!paused) {
        remaining = Math.ceil((endAt - Date.now()) / 1000);
      }
    };

    const tick = () => {
      recomputeRemaining();
      const safeRemaining = Math.max(0, remaining);
      if (textEl) textEl.innerText = formatMinSec(safeRemaining);
      if (totalSeconds > 0 && ring) {
        const offset = circumference * (safeRemaining / totalSeconds);
        ring.style.strokeDashoffset = Math.max(0, offset);
      }
      if (safeRemaining === preEnd && !preEndPlayed && window.appConfig?.sound?.notifications) {
        if (typeof window.playNotification === "function") window.playNotification("pre-end");
        preEndPlayed = true;
      }
      if (safeRemaining <= 0) {
        stopTimer();
        if (window.appConfig?.sound?.notifications && typeof window.playNotification === "function") {
          window.playNotification("end");
        }
        if (typeof onEnd === "function") {
          if (window.REQUIRE_MANUAL_ADVANCE && typeof window.onTimerEndWrapper === "function") {
            window.onTimerEndWrapper(onEnd);
          } else {
            onEnd();
          }
        }
      }
    };

    tick();
    handle = setInterval(tick, 1000);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") tick();
    });
  }

  function startTimer(minutes, onEnd) {
    stopTimer();
    const durationSec = Math.max(0, Math.round((Number(minutes) || 0) * 60));
    paused = false;
    remaining = durationSec;
    endAt = Date.now() + durationSec * 1000;

    const timerEl = document.getElementById("timer");
    if (timerEl) {
      timerEl.classList.add("active");
      timerEl.style.display = "flex";
      timerEl.innerHTML = ""; // rebuild UI cleanly for each start
    }
    ensureTimerUI();
    buildTimerControls(onEnd);
    tickLoop(durationSec, onEnd);
    saveState();
  }

  function resumeTimer(onEnd) {
    if (remaining <= 0) return;
    const timerEl = document.getElementById("timer");
    if (timerEl) {
      timerEl.classList.add("active");
      timerEl.style.display = "flex";
      timerEl.innerHTML = "";
    }
    ensureTimerUI();
    buildTimerControls(onEnd);
    if (!paused) {
      endAt = Date.now() + remaining * 1000;
    }
    tickLoop(remaining, onEnd);
    saveState();
  }

  window.startTimer = startTimer;
  window.stopTimer = stopTimer;
  window.resumeTimer = resumeTimer;
  window.AppTimer = { startTimer, stopTimer, resumeTimer };
})();