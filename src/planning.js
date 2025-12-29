// planning.js
function showPlanningForm(onDone){
  const c = document.getElementById("checklist");

  const f1 = document.createElement("div");
  f1.className = "field";
  f1.innerHTML = `
    <label>Key commitments today (time blocks)</label>
    <textarea id="plan-commit"></textarea>
  `;

  const f2 = document.createElement("div");
  f2.className = "field";
  f2.innerHTML = `
    <label>Rest & breaks reserved (describe)</label>
    <textarea id="plan-rest"></textarea>
  `;

  const f3 = document.createElement("div");
  f3.className = "field";
  f3.innerHTML = `
    <label>Top 3 outcomes for today</label>
    <textarea id="plan-outcomes"></textarea>
  `;

  c.append(f1, f2, f3);

  const wrapper = document.createElement("div");
  wrapper.className = "field";
  wrapper.innerHTML = `<label>Add your focus subjects (optional)</label>`;

  const list = document.createElement("div");
  list.id = "custom-list";

  const addRow = document.createElement("div");
  addRow.className = "row";
  addRow.innerHTML = `
    <input type="text" id="cs-name" placeholder="Subject name (e.g., 🟡 Portfolio)">
    <textarea id="cs-tasks" placeholder="Checklist items, one per line"></textarea>
  `;

  const addBtn = button("Add Subject", () => {
    const name = (document.getElementById("cs-name").value || "").trim();
    const tasks = (document.getElementById("cs-tasks").value || "")
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    if (!name || tasks.length === 0) return;

    dayMeta.customSubjects.push({ name, checklist: tasks });
    renderCustomList(list);

    document.getElementById("cs-name").value = "";
    document.getElementById("cs-tasks").value = "";
  }, "secondary");

  wrapper.append(addRow, addBtn, list);
  c.appendChild(wrapper);

  renderCustomList(list);

  document.getElementById("buttons").appendChild(
    button("Save & Continue", () => {
      const commit = (document.getElementById("plan-commit").value || "").trim();
      const rest = (document.getElementById("plan-rest").value || "").trim();
      const outcomes = (document.getElementById("plan-outcomes").value || "").trim();

      addNote({
        type: "planning",
        title: "Plan details",
        content: { commit, rest, outcomes }
      });

      onDone && onDone();
    })
  );
}

function renderCustomList(container){
  container.innerHTML = "";

  if (dayMeta.customSubjects.length === 0) {
    container.innerHTML = `
      <div class="note">No custom subjects added yet.</div>
    `;
    return;
  }

  dayMeta.customSubjects.forEach((s, idx) => {
    const item = document.createElement("div");
    item.className = "checklist-item";
    item.innerHTML = `
      <span>${s.name} — ${s.checklist.length} items</span>
    `;

    const rm = button(
      "Remove",
      () => {
        dayMeta.customSubjects.splice(idx, 1);
        renderCustomList(container);
      },
      "ghost"
    );

    item.appendChild(rm);
    container.appendChild(item);
  });
}
