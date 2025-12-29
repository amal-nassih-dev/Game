// Journaling and EOD journal.js
function journalingForm(title, onDone){
  const c = document.getElementById("checklist");
  const f = document.createElement("div"); 
  f.className = "field";
  f.innerHTML = `<label>${title}</label><textarea id="journal"></textarea>`;
  c.appendChild(f);

  document.getElementById("buttons").appendChild(
    button("Save & Continue", ()=>{
      const txt = (document.getElementById("journal").value || "").trim();
      addNote({type:"journal", title, content: txt});
      onDone && onDone();
    })
  );
}

function endOfDayForm(onDone){
  const c = document.getElementById("checklist");
  const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";

  const f1 = document.createElement("div"); 
  f1.className = "field";
  f1.innerHTML = `<label>Gratitude (3 items)${her}</label><textarea id="eod-grat"></textarea>`;

  const f2 = document.createElement("div"); 
  f2.className = "field";
  f2.innerHTML = `<label>Lessons learned</label><textarea id="eod-lessons"></textarea>`;

  const f3 = document.createElement("div"); 
  f3.className = "field";
  f3.innerHTML = `<label>Plan for tomorrow</label><textarea id="eod-plan"></textarea>`;

  c.appendChild(f1);
  c.appendChild(f2);
  c.appendChild(f3);

  document.getElementById("buttons").appendChild(
    button("Save & Finish", ()=>{
      const grat = (document.getElementById("eod-grat").value || "").trim();
      const lessons = (document.getElementById("eod-lessons").value || "").trim();
      const plan = (document.getElementById("eod-plan").value || "").trim();

      addNote({
        type: "eod",
        title: "End of day",
        content: {grat, lessons, plan}
      });

      onDone && onDone();
    })
  );
}
