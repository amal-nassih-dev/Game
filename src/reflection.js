// Reflection forms reflection.js
function askReflection(tag, afterSubmit){
  clearUI(); 
  setProgress();

  const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
  const title = tag === "morning" 
    ? `📝 Morning reflection${her}` 
    : `📝 Afternoon reflection${her}`;

  document.getElementById("text").innerHTML = title;
  document.getElementById("subtext").innerHTML = "Answer briefly. This helps improve the next plan.";

  const wrap = document.getElementById("checklist");

  // Reflection questions
  reflectionQuestions.forEach((q,i)=>{
    const div = document.createElement("div"); 
    div.className = "field";
    div.innerHTML = `<label>${q}</label><textarea id="ref-q-${i}"></textarea>`;
    wrap.appendChild(div);
  });

  // Morning curiosity prompt
  if(tag === "morning"){
    const prompt = randomCuriosity();
    const cd = document.createElement("div"); 
    cd.className = "field";
    cd.innerHTML = `<label>🎯 Curiosity: ${prompt}<br>
                     <span class="note">Take 2–5 minutes to research and summarize.</span></label>
                     <textarea id="curiosity"></textarea>`;
    wrap.appendChild(cd);
  }

  const btns = document.getElementById("buttons");
  btns.appendChild(button("Skip", ()=>afterSubmit && afterSubmit(), "secondary"));

  btns.appendChild(button("Save & Continue", ()=>{
    const answers = reflectionQuestions.map((q,i)=>({
      q,
      a: (document.getElementById(`ref-q-${i}`).value || "").trim()
    }));

    addNote({type: `reflection-${tag}`, title: title, content: answers});

    if(tag === "morning"){
      const cur = (document.getElementById("curiosity").value || "").trim();
      addNote({
        type: "curiosity",
        title: "Curiosity",
        content: cur,
        meta: {prompt: randomCuriosity()}
      });
    }

    afterSubmit && afterSubmit();
  }));
}
