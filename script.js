const $ = id => document.getElementById(id);

function onlyLetters(str){
  return (str || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function frequencySequenceUniqueOrdered(phrase){
  const clean = onlyLetters(phrase);
  const counts = {};
  for (const ch of clean) counts[ch] = (counts[ch] || 0) + 1;
  const seen = new Set();
  const seq = [];
  for (const ch of clean) {
    if (!seen.has(ch)) {
      seq.push(counts[ch]);
      seen.add(ch);
    }
  }
  return seq;
}

function outsideInsideReduce(arr){
  const next = [];
  let i = 0, j = arr.length - 1;
  while (i < j) { next.push(arr[i] + arr[j]); i++; j--; }
  if (i === j) next.push(arr[i]);
  return next;
}

function reduceUntilTwoDigitsOr100(initial){
  let seq = initial.slice();
  while (seq.length > 2) seq = outsideInsideReduce(seq);
  let percentStr = String(seq[0]) + String(seq[1] || '0');
  while (percentStr.length !== 2 && percentStr !== "100") {
    let digits = percentStr.split("").map(d => parseInt(d,10));
    while (digits.length > 2) digits = outsideInsideReduce(digits);
    percentStr = String(digits[0]) + String(digits[1]);
  }
  return parseInt(percentStr,10);
}

const insertWordMap = {
  friends: "FRIENDS",
  love: "LOVE",
  enemies: "ENEMIES",
  siblings: "SIBLINGS",
  marriage: "MARRIAGE",
  crush: "CRUSH",
  business: "BUSINESS"
};

function labelFor(relation, percent){
  if (relation === "love"){
    if (percent >= 90) return "Soulmates ❤️";
    if (percent >= 70) return "Strong Love 💖";
    if (percent >= 50) return "Lovely Pair 💕";
    if (percent >= 30) return "Potential Crush 😳";
    return "Just Friends 🙂";
  }
  if (relation === "friends"){
    if (percent >= 90) return "Unbreakable Bond ✨";
    if (percent >= 75) return "Besties Forever 🤝";
    if (percent >= 60) return "Great Friends 😊";
    if (percent >= 45) return "Good Pals 🙂";
    if (percent >= 25) return "Casual Friends 👋";
    return "Strange Pairing 🤨";
  }
  return "—";
}

function computeFromNames(n1, n2, relation){
  const ins = insertWordMap[relation] || "FRIENDS";
  const combined = onlyLetters(n1) + ins + onlyLetters(n2);
  if (!combined) return null;
  const freqSeq = frequencySequenceUniqueOrdered(combined);
  const percent = reduceUntilTwoDigitsOr100(freqSeq);
  return { percent, combined };
}

function showResult(n1, n2, relation){
  const out = computeFromNames(n1, n2, relation);
  const resultArea = $("resultArea");
  if (!out) { resultArea.style.display = "none"; alert("Enter valid letters"); return; }

  const p = out.percent;
  const label = labelFor(relation, p);

  $("percentEl").textContent = p + "%";
  $("labelEl").textContent = label;
  $("pairEl").textContent = `${n1.trim()} + ${n2.trim()} (inserted: ${insertWordMap[relation]})`;
  resultArea.style.display = "";

  // Save to NeonDB
  saveToDB(n1.trim(), n2.trim(), relation, p);
}

async function saveToDB(name1, name2, relation, percent){
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({name1, name2, relationship: relation, percent})
    });
    const data = await res.json();
    if (!data.success) console.error('Save failed', data.error);
  } catch(err) { console.error('Network error', err); }
}

$("calcBtn").addEventListener("click", () =>
  showResult($("name1").value, $("name2").value, $("relation").value)
);

$("clearBtn").addEventListener("click", () => {
  $("name1").value = $("name2").value = "";
  $("resultArea").style.display = "none";
});
