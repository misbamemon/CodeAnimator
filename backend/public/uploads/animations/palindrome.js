document.addEventListener("DOMContentLoaded", () => {
  const n = 121; // Example number
  const varN = document.getElementById("var-n");
  const varOriginal = document.getElementById("var-original");
  const varReversed = document.getElementById("var-reversed");
  const varDigit = document.getElementById("var-digit");
  const arrowCode = document.getElementById("arrow-code"); // Arrow for code highlight
  const msgBox = document.getElementById("message-box");

  varN.textContent = `n = ${n}`;
  varOriginal.textContent = `original = ${n}`;
  varReversed.textContent = `reversed = 0`;
  varDigit.textContent = `digit = -`;

  let steps = [];
  let tempN = n;
  let reversed = 0;
  const original = n;

  // Initial while start
  steps.push({ type: "while_start", tempN, reversed, line: 3 });

  while (tempN > 0) {
    let digit = tempN % 10;
    steps.push({ type: "extract_digit", digit, tempN, reversed, line: 4 });
    reversed = reversed * 10 + digit;
    steps.push({ type: "update_reversed", reversed, line: 5 });
    tempN = Math.floor(tempN / 10);
    steps.push({ type: "update_n", tempN, line: 6 });

    if (tempN > 0) steps.push({ type: "while_start", tempN, reversed, line: 3 });
  }

  steps.push({ type: "check_palindrome", original, reversed, line: 7 });

  function placeArrow(line) {
    if (!arrowCode) return;
    arrowCode.style.visibility = "visible";
    arrowCode.style.position = "absolute";
    arrowCode.style.top = `${line * 25}px`; // adjust vertical position for code line
    arrowCode.style.left = "0px";
  }

  async function playStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    const s = steps[stepIndex];

    switch (s.type) {
      case "while_start":
        msgBox.textContent = `Check while condition: n > 0 → ${s.tempN} > 0`;
        placeArrow(s.line);
        break;
      case "extract_digit":
        varDigit.textContent = `digit = ${s.digit}`;
        msgBox.textContent = `Extract digit ${s.digit} from n=${s.tempN}`;
        placeArrow(s.line);
        break;
      case "update_reversed":
        varReversed.textContent = `reversed = ${s.reversed}`;
        msgBox.textContent = `Update reversed = ${s.reversed}`;
        placeArrow(s.line);
        break;
      case "update_n":
        varN.textContent = `n = ${s.tempN}`;
        msgBox.textContent = `Update n = ${s.tempN}`;
        placeArrow(s.line);
        break;
      case "check_palindrome":
        msgBox.textContent = s.original === s.reversed ? `${n} is PALINDROME` : `${n} is NOT PALINDROME`;
        placeArrow(s.line);
        break;
    }
  }

  function resetAll() {
    varDigit.textContent = "digit = -";
    varReversed.textContent = "reversed = 0";
    varN.textContent = `n = ${n}`;
    msgBox.textContent = "";
    if (arrowCode) arrowCode.style.visibility = "hidden";
  }

  window.addEventListener("message", async (event) => {
    if (typeof event.data.step !== "number") return;
    const stepIndex = event.data.step;
    resetAll();
    for (let k = 0; k <= stepIndex; k++) {
      await playStep(k);
    }
  });

  resetAll();
  window.parent.postMessage({ stepLineMap: steps.map(s => s.line) }, "*");
});
