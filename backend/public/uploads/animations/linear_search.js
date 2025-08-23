document.addEventListener("DOMContentLoaded", () => {
    const arr = [5, 3, 8, 4, 2];
    const key = 4;
    const arrayContainer = document.getElementById("array-container");
  
    const varI = document.getElementById("var-i");
    const varKey = document.getElementById("var-key");
    const varFound = document.getElementById("var-found");
  
    const arrowI = document.getElementById("arrow-i");
    const textI = document.getElementById("text-i");
    const msgBox = document.getElementById("message-box");
  
    varKey.textContent = `key = ${key}`;
    varFound.textContent = "found = -";
  
    // Render array boxes
    function renderArray() {
      arrayContainer.innerHTML = "";
      arr.forEach((val, idx) => {
        const col = document.createElement("div");
        col.className = "column";
        const indexBox = document.createElement("div");
        indexBox.className = "index-box";
        indexBox.textContent = idx;
        const valueBox = document.createElement("div");
        valueBox.className = "array-box";
        valueBox.id = `box-${idx}`;
        valueBox.textContent = val;
        col.appendChild(indexBox);
        col.appendChild(valueBox);
        arrayContainer.appendChild(col);
      });
    }
    renderArray();
  
    // Arrow positioning
    const placeArrow = (arrowEl, targetIdx) => {
      const target = document.getElementById(`box-${targetIdx}`);
      if (!arrowEl || !target) return;
      const baseRect = (arrowEl.offsetParent || arrowEl.parentElement).getBoundingClientRect();
      const boxRect = target.getBoundingClientRect();
      const x = boxRect.left - baseRect.left + (boxRect.width - arrowEl.offsetWidth) / 2;
      arrowEl.style.left = `${Math.max(0, x)}px`;
      arrowEl.style.visibility = "visible";
    };
  
    // Build steps
  // Build steps
let steps = [];
let keyFound = false;
for (let i = 0; i < arr.length; i++) {
  steps.push({ type: "set_i", i, line: 2 });
  steps.push({ type: "compare", i, result: arr[i] === key, line: 3 });
  if (arr[i] === key) {
    steps.push({ type: "found", i, line: 4 });
    keyFound = true;
    break;  // stop adding more steps
  }
}

// Only push "not_found" if key not found
if (!keyFound) {
  steps.push({ type: "not_found", line: 5 });
}

  
    function resetBoxes() {
      arr.forEach((val, idx) => {
        const b = document.getElementById(`box-${idx}`);
        if (b) b.classList.remove("compare");
      });
    }
  
    function resetAll() {
      varI.textContent = "i = -";
      varFound.textContent = "found = -";
      msgBox.textContent = "";
      resetBoxes();
      arrowI.style.visibility = "hidden";
    }
  
    async function playStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= steps.length) return;
      const s = steps[stepIndex];
      resetBoxes();
  
      switch (s.type) {
        case "set_i":
          varI.textContent = `i = ${s.i}`;
          msgBox.textContent = `Checking index ${s.i}`;
          placeArrow(arrowI, s.i);
          break;
  
        case "compare":
          const b = document.getElementById(`box-${s.i}`);
          if (b) b.classList.add("compare");
          textI.textContent = `arr[i] = ${arr[s.i]}`;
          msgBox.textContent = s.result ? `arr[${s.i}] == key` : `arr[${s.i}] != key`;
          placeArrow(arrowI, s.i);
          break;
  
        case "found":
          varFound.textContent = `found = ${s.i}`;
          msgBox.textContent = `Key found at index ${s.i}`;
          placeArrow(arrowI, s.i);
          break;
  
        case "not_found":
          msgBox.textContent = `Key not found in array`;
          arrowI.style.visibility = "hidden";
          break;
      }
    }
  
    // Next/Prev control
    let currentStep = 0;
    window.addEventListener("message", async (event) => {
      if (typeof event.data.step !== "number") return;
      currentStep = event.data.step;
      resetAll();
      for (let k = 0; k <= currentStep; k++) {
        await playStep(k);
      }
    });
  
    // Send step-line mapping for code highlight
    window.parent.postMessage({ stepLineMap: steps.map((s) => s.line) }, "*");
  
    resetAll();
  });
  