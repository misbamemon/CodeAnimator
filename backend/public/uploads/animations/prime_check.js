document.addEventListener("DOMContentLoaded", () => {
  const n = 29; // Example number to check
  const arrayContainer = document.getElementById("array-container");
  const varN = document.getElementById("var-n");
  const varI = document.getElementById("var-i");
  const varRem = document.getElementById("var-rem");
  const arrowI = document.getElementById("arrow-i");
  const textI = document.getElementById("text-i");
  const msgBox = document.getElementById("message-box");

  varN.textContent = `n = ${n}`;

  const maxI = Math.floor(Math.sqrt(n));
  let steps = [];
  let primeFound = true;

  // Step 1: Check if n <= 1
  steps.push({ type: "check_n_le_1", line: 2, n });

  if (n <= 1) {
    steps.push({ type: "return_false", line: 3 });
    primeFound = false;
  } else {
    // Step 2: For loop from i=2 to sqrt(n)
    for (let i = 2; i <= maxI; i++) {
      steps.push({ type: "for_check", i, line: 4 });
      const rem = n % i;
      steps.push({ type: "if_divisible", i, rem, line: 5 });
      if (rem === 0) {
        steps.push({ type: "return_false", line: 6 });
        primeFound = false;
        break;
      }
      // loop iteration end, arrow goes back to for_check in next step automatically
    }
  }

  if (primeFound) steps.push({ type: "return_true", line: 7 });

  // Render i boxes
  arrayContainer.innerHTML = "";
  for (let i = 2; i <= maxI; i++) {
    const col = document.createElement("div");
    col.className = "column";
    const indexBox = document.createElement("div");
    indexBox.className = "index-box";
    indexBox.textContent = i;
    const valueBox = document.createElement("div");
    valueBox.className = "array-box";
    valueBox.id = `box-${i}`;
    valueBox.textContent = i;
    col.appendChild(indexBox);
    col.appendChild(valueBox);
    arrayContainer.appendChild(col);
  }

  function placeArrow(targetIdx) {
    const target = document.getElementById(`box-${targetIdx}`);
    if (!arrowI || !target) return;
    arrowI.style.position = "absolute";
    const baseRect = (arrowI.offsetParent || arrowI.parentElement || document.body).getBoundingClientRect();
    const boxRect = target.getBoundingClientRect();
    const x = boxRect.left - baseRect.left + (boxRect.width - arrowI.offsetWidth)/2;
    arrowI.style.left = `${Math.max(0, x)}px`;
    arrowI.style.visibility = "visible";
  }

  function resetAll() {
    varI.textContent = "i = -";
    varRem.textContent = "n % i = -";
    textI.textContent = "";
    msgBox.textContent = "";
    arrowI.style.visibility = "hidden";
  }

  async function playStep(stepIndex) {
    if(stepIndex < 0 || stepIndex >= steps.length) return;
    const s = steps[stepIndex];

    switch(s.type) {
      case "check_n_le_1":
        msgBox.textContent = `Check if n <= 1`;
        if (s.n <= 1) msgBox.textContent += " → true";
        else msgBox.textContent += " → false";
        break;

      case "for_check":
        varI.textContent = `i = ${s.i}`;
        msgBox.textContent = `For loop condition: i*i <= n → ${s.i}*${s.i} <= ${n}`;
        placeArrow(s.i);
        break;

      case "if_divisible":
        varRem.textContent = `n % i = ${s.rem}`;
        msgBox.textContent = s.rem === 0 ? `${n} divisible by ${s.i} → Not prime` : `${n} not divisible by ${s.i}`;
        break;

      case "return_false":
        msgBox.textContent = `${n} is NOT prime`;
        arrowI.style.visibility = "hidden";
        break;

      case "return_true":
        msgBox.textContent = `${n} is PRIME`;
        arrowI.style.visibility = "hidden";
        break;
    }
  }

  let currentStep = 0;
  window.addEventListener("message", async (event) => {
    if(typeof event.data.step !== "number") return;
    currentStep = event.data.step;
    resetAll();
    for (let k = 0; k <= currentStep; k++) {
      await playStep(k);
    }
  });

  resetAll();
  window.parent.postMessage({ stepLineMap: steps.map(s => s.line) }, "*");
});
