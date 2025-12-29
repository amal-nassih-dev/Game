// ===============================
// Profile and Setup screens setup.js
// ===============================

function askProfile(onDone){
  render({
    text: "👋 Welcome! Let’s personalize your day.",
    subtext: "These details help adjust timings and suggestions."
  });

  const c = document.getElementById("checklist");
  const row = document.createElement("div");
  row.className = "grid2";

  row.innerHTML = `
    <div class="field">
      <label>Your name (optional)</label>
      <input type="text" id="name">
    </div>

    <div class="field">
      <label>Energy level now (1-10)</label>
      <input type="number" id="energy" min="1" max="10" value="6">
    </div>

    <div class="field">
      <label>Total focus hours for main block</label>
      <input type="number" id="focusHours" min="1" max="10" value="4">
    </div>

    <div class="field">
      <label>Today’s main priority</label>
      <input type="text" id="priority" placeholder="e.g., Portfolio, Job search, DSA">
    </div>
  `;
  c.appendChild(row);

  document.getElementById("buttons").appendChild(
    button("Continue", () => {
      const name = (document.getElementById("name").value || "").trim();
      const energy = Number(document.getElementById("energy").value || 6);
      const fh = Number(document.getElementById("focusHours").value || 4);
      const priority = (document.getElementById("priority").value || "").trim();

      focusHours = Math.max(1, Math.min(10, fh));
      dayMeta.userProfile = { name, energy, priority };
      dayMeta.focusHours = focusHours;

      addNote({
        type: "profile",
        title: "Profile",
        content: dayMeta.userProfile
      });

      onDone && onDone();
    })
  );
}

function showSetup(onDone){
  render({
    text: "⚙️ Setup",
    subtext: "Adjust focus subjects, fasting, meals and categories"
  });

  const wrap = document.getElementById("checklist");

  // ---------- Fasting ----------
  const fastingDiv = document.createElement("div");
  fastingDiv.className = "grid2";
  fastingDiv.innerHTML = `
    <div class="field">
      <label>Fasting today (Ramadan / voluntary)</label>
      <select id="cfg-fasting">
        <option value="false"${appConfig.fasting ? "" : " selected"}>No</option>
        <option value="true"${appConfig.fasting ? " selected" : ""}>Yes</option>
      </select>
    </div>

    <div class="field">
      <label>Iftar time (HH:MM)</label>
      <input type="text" id="cfg-iftar" value="${appConfig.iftarTime}">
    </div>

    <div class="field">
      <label>Suhoor time (HH:MM)</label>
      <input type="text" id="cfg-suhoor" value="${appConfig.suhoorTime}">
    </div>
  `;
  wrap.appendChild(fastingDiv);

  // ---------- Meals ----------
  const mealsDiv = document.createElement("div");
  mealsDiv.className = "field";
  mealsDiv.innerHTML = `<label>Meals (time + composition)</label>`;
  const mealsList = document.createElement("div");

  function renderMeals(){
    mealsList.innerHTML = "";
    appConfig.meals.forEach((m, i) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <input type="text" value="${m.label}" data-k="label">
        <input type="text" value="${m.time}" data-k="time" style="max-width:120px">
        <input type="text" value="${m.macro}" data-k="macro" style="flex:1">
      `;
      row.appendChild(
        button("Remove", () => {
          appConfig.meals.splice(i, 1);
          renderMeals();
        }, "ghost")
      );
      mealsList.appendChild(row);
    });
  }
  renderMeals();

  const addMealRow = document.createElement("div");
  addMealRow.className = "row";
  addMealRow.innerHTML = `
    <input type="text" id="meal-label" placeholder="Label (e.g., Lunch)">
    <input type="text" id="meal-time" placeholder="HH:MM" style="max-width:120px">
    <input type="text" id="meal-macro" placeholder="Macros / composition" style="flex:1">
  `;

  const addMealBtn = button("Add Meal", () => {
    const label = document.getElementById("meal-label").value.trim();
    const time = document.getElementById("meal-time").value.trim();
    const macro = document.getElementById("meal-macro").value.trim();
    if (!label || !time) return;
    appConfig.meals.push({ label, time, macro });
    document.getElementById("meal-label").value = "";
    document.getElementById("meal-time").value = "";
    document.getElementById("meal-macro").value = "";
    renderMeals();
  }, "secondary");

  mealsDiv.append(mealsList, addMealRow, addMealBtn);
  wrap.appendChild(mealsDiv);

  // ---------- Food challenges ----------
  const chDiv = document.createElement("div");
  chDiv.className = "field";
  chDiv.innerHTML = `<label>Food challenges (daily)</label>`;
  const chArea = document.createElement("textarea");
  chArea.id = "cfg-challenges";
  chArea.value = appConfig.foodChallenges.join("\n");
  chDiv.appendChild(chArea);
  wrap.appendChild(chDiv);

  // ---------- Subjects ----------
  const subjDiv = document.createElement("div");
  subjDiv.className = "field";
  subjDiv.innerHTML = `<label>Focus subjects (edit / add)</label>`;
  const subjList = document.createElement("div");
  subjDiv.appendChild(subjList);

  function renderSubjects(){
    subjList.innerHTML = "";
    appConfig.baseSubjectsEditable.forEach((s, idx) => {
      const cat = appConfig.categories[s.name] || "focus";
      const box = document.createElement("div");
      box.className = "field";
      box.innerHTML = `
        <div class="row">
          <input type="text" value="${s.name}" data-idx="${idx}" data-k="name" style="flex:1">
          <select data-idx="${idx}" data-k="cat" style="max-width:160px">
            <option value="focus"${cat==="focus"?" selected":""}>Focus</option>
            <option value="learning"${cat==="learning"?" selected":""}>Learning</option>
            <option value="faith"${cat==="faith"?" selected":""}>Faith</option>
            <option value="health"${cat==="health"?" selected":""}>Health</option>
          </select>
        </div>
        <div class="row">
          <textarea data-idx="${idx}" data-k="tasks"
            placeholder="Checklist, one per line">${s.checklist.join("\n")}</textarea>
        </div>
      `;
      box.appendChild(
        button("Remove", () => {
          appConfig.baseSubjectsEditable.splice(idx, 1);
          renderSubjects();
        }, "ghost")
      );
      subjList.appendChild(box);
    });
  }
  renderSubjects();

  document.getElementById("buttons").appendChild(
    button("Save & Continue", () => onDone && onDone())
  );
}
