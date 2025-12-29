// Rendering and buttons ui.js

function render({ text = "", subtext = "", buttons = [], showDice = false, resultHTML = null }) {
    clearUI();
    setProgress();

    // Use template strings for innerHTML
    document.getElementById("text").innerHTML = `<div class="fade-in">${text}</div>`;

    const ups = upcomingMealsText();
    const sub = [subtext || "", ups ? `<div class="note">${ups}</div>` : ""]
        .filter(Boolean)
        .join("");
    document.getElementById("subtext").innerHTML = sub ? `<div class="fade-in">${sub}</div>` : "";

    if (showDice) document.getElementById("dice").innerText = "🎲";

    if (resultHTML) {
        const res = document.getElementById("result");
        res.style.display = "block";
        res.innerHTML = resultHTML;
    }

    renderMealBar(); // NEW: top checklist bar

    const btnWrap = document.getElementById("buttons");
    buttons.forEach(b => {
        const btn = document.createElement("button");
        btn.innerText = b.label ?? "Action";
        if (b.variant === "secondary") btn.classList.add("secondary");
        if (b.variant === "ghost") btn.classList.add("ghost");
        btn.onclick = () => b.action && b.action();
        btnWrap.appendChild(btn);
    });
}

function button(label, action, variant) {
    const b = document.createElement("button");
    b.innerText = label || "Action";
    if (variant === "secondary") b.classList.add("secondary");
    if (variant === "ghost") b.classList.add("ghost");
    b.onclick = action;
    return b;
}

// Renders a bar under the header with meal checkboxes for today
function renderMealBar() {
    // Ensure a container under header
    let bar = document.getElementById("mealbar");
    if (!bar) {
        const header = document.querySelector("header");
        bar = document.createElement("div");
        bar.id = "mealbar";
        bar.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 0;justify-content:flex-start;align-items:center;";
        header?.after(bar);
    }

    // Build content
    const parts = [];
    parts.push(`<span class="muted" style="font-size:12px">Meals today:</span>`);
    appConfig.meals.forEach((m, idx) => {
        const done = !!(mealStatus[idx]?.done);
        const id = `mealbox-${idx}`;
        parts.push(`
            <label for="${id}" class="pill" style="display:inline-flex;gap:6px;align-items:center;cursor:pointer;${done ? 'opacity:.6;text-decoration:line-through;' : ''}">
                <input id="${id}" type="checkbox" ${done ? 'checked' : ''} style="accent-color:#4f83ff"> ${m.label} ${m.time}
            </label>
        `);
    });
    bar.innerHTML = parts.join(" ");

    // Wire events
    appConfig.meals.forEach((m, idx) => {
        const box = document.getElementById(`mealbox-${idx}`);
        if (!box) return;
        box.addEventListener("change", (e) => {
            if (!mealStatus[idx]) mealStatus[idx] = { label: m.label, time: m.time, done: false };
            mealStatus[idx].done = !!e.target.checked;
            saveMealStatus();
            // Refresh subtext/chips to hide done ones
            const ups = upcomingMealsText();
            document.getElementById("subtext").innerHTML = ups ? `<div class="fade-in"><div class="note">${ups}</div></div>` : "";
        });
    });
}
