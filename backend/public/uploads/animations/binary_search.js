document.addEventListener("DOMContentLoaded", () => {
  const arr = [2, 3, 4, 5, 8, 10]; // must be sorted
  const key = 5;
  const arrayContainer = document.getElementById("array-container");

  const varLow = document.getElementById("var-low");
  const varHigh = document.getElementById("var-high");
  const varMid = document.getElementById("var-mid");
  const varKey = document.getElementById("var-key");

  const arrowMid = document.getElementById("arrow-mid");
  const msgBox = document.getElementById("message-box");

  varKey.textContent = `key = ${key}`;

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

  const placeArrow = (arrowEl, targetIdx) => {
    const target = document.getElementById(`box-${targetIdx}`);
    if (!arrowEl || !target) return;
    const baseRect = (arrowEl.offsetParent || arrowEl.parentElement).getBoundingClientRect();
    const boxRect = target.getBoundingClientRect();
    const x = boxRect.left - baseRect.left + (boxRect.width - arrowEl.offsetWidth) / 2;
    arrowEl.style.left = `${Math.max(0, x)}px`;
    arrowEl.style.visibility = "visible";
  };

  // --- Build steps ---
  let steps = [];
  let low = 0, high = arr.length - 1;
  let keyFound = false;

  // Add initial while_start step
  steps.push({ type: "while_start", low, high, line: 2 });

  while (low <= high) {
    let mid = Math.floor(low + (high - low) / 2);
    steps.push({ type: "set_vars", low, high, mid, line: 3 });
    steps.push({ type: "compare", mid, result: arr[mid] === key, line: 4 });

    if (arr[mid] === key) {
      steps.push({ type: "found", mid, line: 5 });
      keyFound = true;
      break;
    } else if (arr[mid] < key) {
      steps.push({ type: "right", mid, line: 6 });
      low = mid + 1;
    } else {
      steps.push({ type: "left", mid, line: 7 });
      high = mid - 1;
    }
  }

  if (!keyFound) steps.push({ type: "not_found", line: 8 });

  function resetBoxes() {
    arr.forEach((val, idx) => {
      const b = document.getElementById(`box-${idx}`);
      if (b) b.classList.remove("compare");
    });
  }

  function resetAll() {
    varLow.textContent = "low = -";
    varHigh.textContent = "high = -";
    varMid.textContent = "mid = -";
    msgBox.textContent = "";
    resetBoxes();
    arrowMid.style.visibility = "hidden";
  }

  // --- Play a step ---
  async function playStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    const s = steps[stepIndex];
    resetBoxes();

    switch (s.type) {
      case "while_start":
        varLow.textContent = `low = ${s.low}`;
        varHigh.textContent = `high = ${s.high}`;
        varMid.textContent = `mid = ${Math.floor(s.low + (s.high - s.low) / 2)}`;
        msgBox.textContent = `Start while loop: low <= high`;
        placeArrow(arrowMid, Math.floor(s.low + (s.high - s.low) / 2));
        break;

      case "set_vars":
        varLow.textContent = `low = ${s.low}`;
        varHigh.textContent = `high = ${s.high}`;
        varMid.textContent = `mid = ${s.mid}`;
        msgBox.textContent = `Checking mid index ${s.mid}`;
        placeArrow(arrowMid, s.mid);
        break;

      case "compare":
        const b = document.getElementById(`box-${s.mid}`);
        if (b) b.classList.add("compare");
        msgBox.textContent = s.result ? `arr[${s.mid}] == key` : `arr[${s.mid}] != key`;
        placeArrow(arrowMid, s.mid);
        break;

      case "found":
        msgBox.textContent = `Key found at index ${s.mid}`;
        placeArrow(arrowMid, s.mid);
        break;

      case "left":
        msgBox.textContent = `arr[${s.mid}] > key → search left half`;
        placeArrow(arrowMid, s.mid);
        break;

      case "right":
        msgBox.textContent = `arr[${s.mid}] < key → search right half`;
        placeArrow(arrowMid, s.mid);
        break;

      case "not_found":
        msgBox.textContent = `Key not found`;
        arrowMid.style.visibility = "hidden";
        break;
    }
  }

  // --- Next/Prev control ---
  let currentStep = 0;
  window.addEventListener("message", async (event) => {
    if (typeof event.data.step !== "number") return;
    currentStep = event.data.step;

    // Stop further animation after key found
    const foundStep = steps.findIndex(s => s.type === "found");
    if (foundStep >= 0 && currentStep > foundStep) {
      currentStep = foundStep;
    }

    resetAll();
    for (let k = 0; k <= currentStep; k++) {
      await playStep(k);
    }
  });

  // Send step-line mapping for code highlight
  window.parent.postMessage({ stepLineMap: steps.map(s => s.line) }, "*");

  resetAll();
});
