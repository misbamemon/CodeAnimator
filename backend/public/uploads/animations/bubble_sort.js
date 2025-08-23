document.addEventListener("DOMContentLoaded", () => {
  const initialArray = [5, 3, 8, 4, 2];
  const arrayContainer = document.getElementById("array-container");

  // --- tiny UI add: status message
  const messageBox = document.createElement("div");
  messageBox.id = "message-box";
  messageBox.style.margin = "8px 0";
  messageBox.style.fontWeight = "600";
  arrayContainer.parentElement.insertBefore(messageBox, arrayContainer);
  const msg = (t) => (messageBox.textContent = t || "");

  // render boxes
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
  const varJ = document.getElementById("var-j");
  const varTemp = document.getElementById("var-temp");
  const arrowJ = document.getElementById("arrow-j");
  const arrowJ1 = document.getElementById("arrow-j1");
  const textJ = document.getElementById("text-j");
  const textJ1 = document.getElementById("text-j1");

  // make arrow positioning robust (no hardcoded pixels)
  // works regardless of CSS widths/margins, positions relative to arrow's offsetParent
  const placeArrow = (arrowEl, targetIdx) => {
    const target = document.getElementById(`box-${targetIdx}`);
    if (!arrowEl || !target) return;
    // ensure absolute so 'left' works
    arrowEl.style.position = "absolute";
    // base is the offsetParent of arrow
    const baseRect =
      (arrowEl.offsetParent || arrowEl.parentElement || document.body).getBoundingClientRect();
    const boxRect = target.getBoundingClientRect();
    const x = boxRect.left - baseRect.left + (boxRect.width - arrowEl.offsetWidth) / 2;
    arrowEl.style.left = `${Math.max(0, x)}px`;
    arrowEl.style.visibility = "visible";
  };

  let arr = [...initialArray];
  let steps = [];

  // Build steps (map to C++ lines)
  // 2: set_i, 3: set_j, 4: compare, 5: set_temp, 6: swap_step1 (arr[j]=arr[j+1]), 7: swap_step2 (arr[j+1]=temp)
  for (let i = 0; i < arr.length - 1; i++) {
    steps.push({ type: "set_i", i, line: 2 });
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({ type: "set_j", j, line: 3 });
      const needSwap = arr[j] > arr[j + 1];
      steps.push({ type: "compare", j, result: needSwap, line: 4 });
      if (needSwap) {
        const temp = arr[j];
        steps.push({ type: "set_temp", value: temp, line: 5 });
        steps.push({ type: "swap_step1", j, line: 6 });            // arr[j] = arr[j+1];
        steps.push({ type: "swap_step2", j, temp, line: 7 });       // arr[j+1] = temp;
        // mutate for future steps construction
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }

  let currentArray = [...initialArray];

  const resetBoxes = (values) => {
    values.forEach((val, idx) => {
      const b = document.getElementById(`box-${idx}`);
      if (b) {
        b.textContent = val;
        b.classList.remove("swap", "compare");
      }
    });
  };

  const highlightCompare = (j) =>
    new Promise((res) => {
      const a = document.getElementById(`box-${j}`);
      const b = document.getElementById(`box-${j + 1}`);
      if (a && b) {
        a.classList.add("compare");
        b.classList.add("compare");
      }
      setTimeout(() => {
        a && a.classList.remove("compare");
        b && b.classList.remove("compare");
        res();
      }, 500);
    });

  const animateSwapStep1 = (j) =>
    new Promise((res) => {
      const a = document.getElementById(`box-${j}`);
      if (!a) return res();
      a.classList.add("swap");
      setTimeout(() => {
        a.textContent = currentArray[j + 1]; // arr[j] = arr[j+1]
        a.classList.remove("swap");
        res();
      }, 450);
    });

  const animateSwapStep2 = (j, temp) =>
    new Promise((res) => {
      const b = document.getElementById(`box-${j + 1}`);
      if (!b) return res();
      b.classList.add("swap");
      setTimeout(() => {
        b.textContent = String(temp); // arr[j+1] = temp
        b.classList.remove("swap");
        res();
      }, 450);
    });

  async function playStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    const s = steps[stepIndex];

    switch (s.type) {
      case "set_i":
        msg(`Starting outer loop: i = ${s.i}`);
        varI.textContent = `i = ${s.i}`;
        varJ.textContent = "j = -";
        varTemp.textContent = "temp = -";
        textJ.textContent = "";
        textJ1.textContent = "";
        break;

      case "set_j":
        varJ.textContent = `j = ${s.j}`;
        // prepare arrows for j and j+1 (start at 0,1; then 1,2; etc.)
        placeArrow(arrowJ, s.j);
        placeArrow(arrowJ1, s.j + 1);
        break;

      case "compare":
        textJ.textContent = `arr[j] = ${currentArray[s.j]}`;
        textJ1.textContent = `arr[j+1] = ${currentArray[s.j + 1]}`;
        placeArrow(arrowJ, s.j);
        placeArrow(arrowJ1, s.j + 1);
        msg(`Comparing arr[${s.j}] and arr[${s.j + 1}]`);
        await highlightCompare(s.j);
        if (s.result) msg(`arr[${s.j}] > arr[${s.j + 1}] → swap needed`);
        else msg(`Already in order, no swap`);
        break;

      case "set_temp":
        varTemp.textContent = `temp = ${s.value}`;
        break;

      case "swap_step1":
        await animateSwapStep1(s.j);
        currentArray[s.j] = currentArray[s.j + 1]; // reflect state
        break;

      case "swap_step2":
        await animateSwapStep2(s.j, s.temp);
        currentArray[s.j + 1] = s.temp; // reflect state
        break;
    }

    if (stepIndex === steps.length - 1) msg("Sorting completed!");
  }

  function resetAll() {
    currentArray = [...initialArray];
    resetBoxes(currentArray);
    varI.textContent = "i = -";
    varJ.textContent = "j = -";
    varTemp.textContent = "temp = -";
    textJ.textContent = "";
    textJ1.textContent = "";
    // hide arrows until first set_j/compare
    [arrowJ, arrowJ1].forEach((a) => {
      if (a) {
        a.style.position = "absolute";
        a.style.left = "0px";
        a.style.visibility = "hidden";
      }
    });
    msg("");
  }
  resetAll();

  // code-line sync
  window.parent.postMessage({ stepLineMap: steps.map((s) => s.line) }, "*");

  // step control
  window.addEventListener("message", async (event) => {
    if (typeof event.data.step !== "number") return;
    const stepIndex = event.data.step;

    // rebuild state (no animations) up to stepIndex
    resetAll();
    for (let k = 0; k < stepIndex; k++) {
      const s = steps[k];
      if (s.type === "set_i") varI.textContent = `i = ${s.i}`;
      else if (s.type === "set_j") {
        varJ.textContent = `j = ${s.j}`;
        placeArrow(arrowJ, s.j);
        placeArrow(arrowJ1, s.j + 1);
      } else if (s.type === "set_temp") varTemp.textContent = `temp = ${s.value}`;
      else if (s.type === "swap_step1") currentArray[s.j] = currentArray[s.j + 1];
      else if (s.type === "swap_step2") currentArray[s.j + 1] = s.temp;
      else if (s.type === "compare") {
        textJ.textContent = `arr[j] = ${currentArray[s.j]}`;
        textJ1.textContent = `arr[j+1] = ${currentArray[s.j + 1]}`;
        placeArrow(arrowJ, s.j);
        placeArrow(arrowJ1, s.j + 1);
      }
      resetBoxes(currentArray);
    }

    if (stepIndex < steps.length) await playStep(stepIndex);
  });
});
