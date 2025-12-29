// ===============================
// Affirmations flow affirmations.js
// ===============================
function showAffirmations(onDone){
  const ix = currentAffirmationIx;
  const isLast = ix >= affirmationsArabic.length - 1;

  const her = dayMeta.userProfile?.name
    ? `, ${dayMeta.userProfile.name}`
    : "";

  render({
    text: "✨ Affirmation" + her,
    subtext: `
      <div class="affirm">${affirmationsArabic[ix]}</div>
      <div class="note">${affirmationsEnglish[ix]}</div>
    `,
    buttons: [{
      label: isLast ? "Continue" : "Next affirmation",
      action: () => {
        currentAffirmationIx++;

        if (currentAffirmationIx < affirmationsArabic.length) {
          showAffirmations(onDone);
        } else {
          setTimeout(() => onDone && onDone(), 0);
        }
      }
    }]
  });
}
