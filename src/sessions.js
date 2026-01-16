// src/sessions.js — Focus sessions, notes, questions, waves

function askKnowledgeQuestion(continueFn) {
  const q = randomKnowledgeQuestion();
  render({
    text: "🔎 Quick question",
    subtext: `<div class="note">${q}</div>`
  });
  const c = document.getElementById("checklist");
  const f = document.createElement("div");
  f.className = "field";
  f.innerHTML = `<label>Your short answer</label><textarea id="kq"></textarea>`;
  c.appendChild(f);
  document.getElementById("buttons").appendChild(button("Skip", continueFn, "secondary"));
  document.getElementById("buttons").appendChild(button("Save & Continue", () => {
    const ans = (document.getElementById("kq").value || "").trim();
    addNote({ type: "knowledge", title: "Knowledge Question", content: { question: q, answer: ans } });
    continueFn && continueFn();
  }));
}

function showFocusIntro(session, onStart) {
  const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
  const cat = categoryFor(session.name);
  render({
    text: `
      <div class="fade-in">${session.name}${her}</div>
      <div class="meta">
        <span class="cat ${categoryClass(cat)}">Category: ${cat}</span>
      </div>
    `,
    subtext: `
      <div class="affirm">${affirmationsEnglish[currentAffirmationIx % affirmationsEnglish.length]}</div>
      <div class="note">${session.minutes} minutes • Click Start</div>
    `
  });
  document.getElementById("buttons").appendChild(button(`Start ${session.name}`, () => {
    if (typeof enableAudio === "function") enableAudio();
    if (appConfig.bgAudio?.enabled && appConfig.bgAudio.mode !== "none") {
      if (typeof playBg === "function") playBg();
    }
    onStart();
  }));
}

function renderFocus(session, onFinish) {
  const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
  const cat = categoryFor(session.name);

  document.getElementById("text").innerHTML = `
    <div class="fade-in">${session.name}${her}</div>
    <div class="meta">
      <span class="cat ${categoryClass(cat)}">Category: ${cat}</span>
      <span class="pill">${session.minutes} min</span>
    </div>
  `;

  const sub = [
    (typeof upcomingMealChips === "function" ? upcomingMealChips() : ""),
    (typeof upcomingMealsText === "function" && upcomingMealsText() ? `<div class="note">${upcomingMealsText()}</div>` : "")
  ].filter(Boolean).join("");
  document.getElementById("subtext").innerHTML = sub;

  document.getElementById("checklist").innerHTML = "";
  document.getElementById("buttons").innerHTML = "";

  const back = questionsBacklog[session.name] || [];
  if (back.length) {
    const blk = document.createElement("div");
    blk.className = "list-compact";
    blk.innerHTML = `<b>Carry-over todos</b><br>${back.map(x => `• ${x}`).join("<br>")}`;
    document.getElementById("checklist").appendChild(blk);
  }

  const status = Array(session.checklist.length).fill(false);
  session.checklist.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    const span = document.createElement("span");
    span.innerText = item;
    const btn = document.createElement("button");
    btn.innerText = "✔️";
    btn.onclick = () => {
      status[i] = !status[i];
      div.classList.toggle("done", status[i]);
      btn.innerText = status[i] ? "✅" : "✔️";
    };
    div.appendChild(span);
    div.appendChild(btn);
    document.getElementById("checklist").appendChild(div);
  });

  const notesBox = document.createElement("div");
  notesBox.className = "field";
  notesBox.innerHTML = `
    <label>Notes during session (what helped / what blocked)</label>
    <textarea id="sess-notes" placeholder="Write thoughts while you work..."></textarea>
  `;
  const qBox = document.createElement("div");
  qBox.className = "field";
  qBox.innerHTML = `
    <label>Questions / next-time todos</label>
    <div class="row">
      <input type="text" id="sess-q" placeholder="Add a question / todo">
      <button id="add-q" class="secondary">Add</button>
    </div>
    <div id="sess-q-list" class="list-compact muted"></div>
  `;
  document.getElementById("checklist").appendChild(notesBox);
  document.getElementById("checklist").appendChild(qBox);

  const qList = [];
  const qListEl = () => document.getElementById("sess-q-list");
  document.getElementById("add-q").onclick = () => {
    const v = (document.getElementById("sess-q").value || "").trim();
    if (!v) return;
    qList.push(v);
    document.getElementById("sess-q").value = "";
    qListEl().innerHTML = qList.map(x => `• ${x}`).join("<br>");
  };

  const saveBtn = button("Save Checklist", () => addNote({
    type: "checklist",
    title: `${session.name} checklist`,
    content: session.checklist.map(t => ({ task: t }))
  }));
  const skipBtn = button("⏭️ Skip Focus", () => {
    finalizeSession(session, "skipped", qList);
    onFinish && onFinish();
  }, "secondary");
  document.getElementById("buttons").appendChild(saveBtn);
  document.getElementById("buttons").appendChild(skipBtn);

  activeSessionExtra = { notesElId: "sess-notes", qListRef: qList, activityName: session.name };
}

function startSessionTimer(session, doneCb) {
  activeSession = { id: session.id, name: session.name, plannedMinutes: session.minutes, startTs: Date.now() };
  startTimer(session.minutes, (status) => {
    finalizeSession(session, status, (activeSessionExtra && activeSessionExtra.qListRef) || []);
    doneCb && doneCb();
  });
}

function finalizeSession(session, status, qsArray = []) {
  stopTimer();

  // Play end chime even if manually finished/skipped
  if (window.appConfig?.sound?.notifications && typeof window.playNotification === "function") {
    try { window.playNotification("end"); } catch (e) {}
  }

  if (typeof stopBg === "function") stopBg();

  const endTs = Date.now();
  let actualSeconds = 0;
  if (activeSession && activeSession.id === session.id) {
    actualSeconds = Math.max(0, Math.round((endTs - activeSession.startTs) / 1000));
  }

  let sessNotes = "";
  if (activeSessionExtra?.notesElId) {
    const el = document.getElementById(activeSessionExtra.notesElId);
    if (el) sessNotes = (el.value || "").trim();
  }

  let carriedOver = [];
  if (qsArray && qsArray.length) {
    const laterSame = sessions.some(s => s.name === session.name && s.id !== session.id);
    if (laterSame) {
      questionsBacklog[session.name] = (questionsBacklog[session.name] || []).concat(qsArray);
      carriedOver = qsArray.slice();
    } else {
      addNote({ type: "session-questions", title: `Questions: ${session.name}`, content: qsArray });
      delete questionsBacklog[session.name];
    }
  }

  sessionLogs.push({
    id: session.id,
    name: session.name,
    plannedMinutes: session.minutes,
    actualSeconds,
    status: status === "completed" ? "completed" : "skipped",
    notes: sessNotes,
    questions: qsArray || [],
    carriedOver
  });

  if (questionsBacklog[session.name] && status === "completed") {
    delete questionsBacklog[session.name];
  }

  activeSession = null;
  activeSessionExtra = null;
}

function runWave(queue, onDone) {
  runningQueue = queue.slice();
  runningIndex = -1;
  blockAccumMinutes = 0;

  const runNext = () => {
    runningIndex++;
    if (runningIndex >= runningQueue.length) { onDone && onDone(); return; }
    const sess = runningQueue[runningIndex];

    // Enforce <= 120 minutes continuous focus
    if (blockAccumMinutes + sess.minutes > 120 && blockAccumMinutes > 0) {
      blockAccumMinutes = 0;
      render({
        text: "⏸️ Short break",
        subtext: `<span class="note">${randomEnergy()} • ${randomMoodMini()}</span>`,
        buttons: [{ label: "Continue", action: runNext }]
      });
      return;
    }

    showFocusIntro(sess, () => {
      renderFocus(sess, () => { afterOneSession(); });
      startSessionTimer(sess, () => { afterOneSession(); });
    });
  };

  const afterOneSession = () => {
    blockAccumMinutes += runningQueue[runningIndex].minutes;
    if (runningIndex < runningQueue.length - 1) {
      const roll = Math.random();
      if (roll < 0.33) {
        askKnowledgeQuestion(runNext);
      } else {
        render({ text: randomMoodMini(), buttons: [{ label: "Next", action: runNext }] });
      }
    } else {
      runNext();
    }
  };

  runNext();
}