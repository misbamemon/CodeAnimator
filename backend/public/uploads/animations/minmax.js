document.addEventListener("DOMContentLoaded", () => {
  const initialArray = [5, 3, 8, 4, 2]; // example array
  const arrayContainer = document.getElementById("array-container");

  // --- tiny UI: message box ---
  const messageBox = document.createElement("div");
  messageBox.id = "message-box";
  messageBox.style.margin = "8px 0";
  messageBox.style.fontWeight = "600";
  arrayContainer.parentElement.insertBefore(messageBox, arrayContainer);
  const msg = (t) => (messageBox.textContent = t || "");

  // render array boxes
  function renderArray(values) {
    arrayContainer.innerHTML = "";
    values.forEach((val, idx) => {
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
  renderArray(initialArray);

  // refs
  const varI = document.getElementById("var-i");
  const varMin = document.getElementById("var-min");
  const varMax = document.getElementById("var-max");
  const arrowI = document.getElementById("arrow-i");

  const placeArrow = (arrowEl, targetIdx) => {
    const target = document.getElementById(`box-${targetIdx}`);
    if (!arrowEl || !target) return;
    arrowEl.style.position = "absolute";
    const baseRect =
      (arrowEl.offsetParent || arrowEl.parentElement || document.body).getBoundingClientRect();
    const boxRect = target.getBoundingClientRect();
    const x = boxRect.left - baseRect.left + (boxRect.width - arrowEl.offsetWidth) / 2;
    arrowEl.style.left = `${Math.max(0, x)}px`;
    arrowEl.style.visibility = "visible";
  };

  let arr = [...initialArray];
  let steps = [];

  // Step construction
  steps.push({ type: "initMin", value: arr[0], line: 2 });
  steps.push({ type: "initMax", value: arr[0], line: 3 });

  for (let i = 1; i < arr.length; i++) {
    steps.push({ type: "setI", i, line: 4 });
    steps.push({ type: "checkMin", i, line: 5 });
    steps.push({ type: "checkMax", i, line: 6 });
  }
  steps.push({ type: "finished", line: 7 });

  let currentArray = [...initialArray];
  let minVal = arr[0];
  let maxVal = arr[0];

  const resetBoxes = () => {
    arr.forEach((val, idx) => {
      const b = document.getElementById(`box-${idx}`);
      if (b) b.classList.remove("highlight");
    });
  };

  async function playStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    const s = steps[stepIndex];
    resetBoxes();

    switch (s.type) {
      case "initMin":
        minVal = s.value;
        varMin.textContent = `minVal = ${minVal}`;
        msg(`Initialize minVal = ${minVal}`);
        break;

      case "initMax":
        maxVal = s.value;
        varMax.textContent = `maxVal = ${maxVal}`;
        msg(`Initialize maxVal = ${maxVal}`);
        break;

      case "setI":
        varI.textContent = `i = ${s.i}`;
        placeArrow(arrowI, s.i);
        msg(`Checking element arr[${s.i}] = ${arr[s.i]}`);
        break;

      case "checkMin":
        const checkMin = arr[s.i] < minVal;
        if (checkMin) minVal = arr[s.i];
        varMin.textContent = `minVal = ${minVal}`;
        msg(`arr[${s.i}] < minVal ? ${checkMin} → minVal updated to ${minVal}`);
        placeArrow(arrowI, s.i);
        document.getElementById(`box-${s.i}`).classList.add("highlight");
        break;

      case "checkMax":
        const checkMax = arr[s.i] > maxVal;
        if (checkMax) maxVal = arr[s.i];
        varMax.textContent = `maxVal = ${maxVal}`;
        msg(`arr[${s.i}] > maxVal ? ${checkMax} → maxVal updated to ${maxVal}`);
        placeArrow(arrowI, s.i);
        document.getElementById(`box-${s.i}`).classList.add("highlight");
        break;

      case "finished":
        msg(`Finished! minVal = ${minVal}, maxVal = ${maxVal}`);
        arrowI.style.visibility = "hidden";
        break;
    }
  }

  function resetAll() {
    currentArray = [...initialArray];
    resetBoxes();
    varI.textContent = "i = -";
    varMin.textContent = "minVal = -";
    varMax.textContent = "maxVal = -";
    msg("");
    arrowI.style.visibility = "hidden";
  }
  resetAll();

  // send step-line mapping for code arrow highlight
  window.parent.postMessage({ stepLineMap: steps.map((s) => s.line) }, "*");

  // step control from parent
  let currentStep = 0;
  window.addEventListener("message", async (event) => {
    if (typeof event.data.step !== "number") return;
    currentStep = event.data.step;
    resetAll();
    for (let k = 0; k <= currentStep; k++) {
      await playStep(k);
    }
  });
});
