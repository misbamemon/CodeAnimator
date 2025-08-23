document.addEventListener("DOMContentLoaded", () => {
    const initialArray = [5, 3, 8, 4, 2];
    const arrayContainer = document.getElementById("array-container");
  
    // --- Message box
    const messageBox = document.createElement("div");
    messageBox.id = "message-box";
    arrayContainer.parentElement.insertBefore(messageBox, arrayContainer);
    const msg = (t) => (messageBox.textContent = t || "");
  
    // Render array
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
  
    // Refs
    const varI = document.getElementById("var-i");
    const varJ = document.getElementById("var-j");
    const varMin = document.getElementById("var-min");
    const varTemp = document.getElementById("var-temp");
    const arrowJ = document.getElementById("arrow-j");
    const arrowMin = document.getElementById("arrow-min");
    const textJ = document.getElementById("text-j");
    const textMin = document.getElementById("text-min");
  
    // Position arrow
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
  
    // Map C++ code lines:
    // 2: set_i, 3: set_minIndex, 4: set_j, 5: compare, 6: update_minIndex, 7: swap_start, 8: swap_done
    for (let i = 0; i < arr.length - 1; i++) {
      steps.push({ type: "set_i", i, line: 2 });
      steps.push({ type: "set_min", minIndex: i, line: 3 });
  
      let minIndex = i;
      for (let j = i + 1; j < arr.length; j++) {
        steps.push({ type: "set_j", j, line: 4 });
        steps.push({ type: "compare", j, minIndex, line: 5 });
  
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
          steps.push({ type: "update_min", minIndex, line: 6 });
        }
      }
  
      if (minIndex !== i) {
        steps.push({ type: "swap_start", i, minIndex, line: 7 });
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        steps.push({ type: "swap_done", i, minIndex, line: 8 });
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
  
    const highlightCompare = (j, min) =>
      new Promise((res) => {
        const a = document.getElementById(`box-${j}`);
        const b = document.getElementById(`box-${min}`);
        if (a) a.classList.add("compare");
        if (b) b.classList.add("compare");
        setTimeout(() => {
          a && a.classList.remove("compare");
          b && b.classList.remove("compare");
          res();
        }, 500);
      });
  
    const animateSwap = (i, min) =>
      new Promise((res) => {
        const a = document.getElementById(`box-${i}`);
        const b = document.getElementById(`box-${min}`);
        if (!a || !b) return res();
        a.classList.add("swap");
        b.classList.add("swap");
        setTimeout(() => {
          const temp = currentArray[i];
          currentArray[i] = currentArray[min];
          currentArray[min] = temp;
          a.textContent = currentArray[i];
          b.textContent = currentArray[min];
          a.classList.remove("swap");
          b.classList.remove("swap");
          res();
        }, 500);
      });
  
    async function playStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= steps.length) return;
      const s = steps[stepIndex];
  
      switch (s.type) {
        case "set_i":
          msg(`Outer loop starts: i = ${s.i}`);
          varI.textContent = `i = ${s.i}`;
          varJ.textContent = "j = -";
          varMin.textContent = "minIndex = -";
          varTemp.textContent = "temp = -";
          break;
  
        case "set_min":
          varMin.textContent = `minIndex = ${s.minIndex}`;
          placeArrow(arrowMin, s.minIndex);
          break;
  
        case "set_j":
          varJ.textContent = `j = ${s.j}`;
          placeArrow(arrowJ, s.j);
          break;
  
        case "compare":
          textJ.textContent = `arr[ j ] = ${currentArray[s.j]}`;
          textMin.textContent = `arr[mIdx] = ${currentArray[s.minIndex]}`;
          placeArrow(arrowJ, s.j);
          placeArrow(arrowMin, s.minIndex);
          msg(`Comparing arr[ ${s.j} ] with arr[minIndex=${s.minIndex}]`);
          await highlightCompare(s.j, s.minIndex);
          break;
  
        case "update_min":
          varMin.textContent = `minIndex = ${s.minIndex}`;
          placeArrow(arrowMin, s.minIndex);
          msg(`New minimum found at index ${s.minIndex}`);
          break;
  
        case "swap_start":
          varTemp.textContent = `temp = ${currentArray[s.i]}`;
          msg(`Swapping arr[${s.i}] and arr[${s.minIndex}]`);
          await animateSwap(s.i, s.minIndex);
          break;
  
        case "swap_done":
          msg(`Swap done`);
          break;
      }
  
      if (stepIndex === steps.length - 1) msg("Sorting completed!");
    }
  
    function resetAll() {
      currentArray = [...initialArray];
      resetBoxes(currentArray);
      varI.textContent = "i = -";
      varJ.textContent = "j = -";
      varMin.textContent = "minIndex = -";
      textJ.textContent = "";
      textMin.textContent = "";
      [arrowJ, arrowMin].forEach((a) => {
        a.style.position = "absolute";
        a.style.left = "0px";
        a.style.visibility = "hidden";
      });
      msg("");
    }
    resetAll();
  
    // Send step-line map
    window.parent.postMessage({ stepLineMap: steps.map((s) => s.line) }, "*");
  
    // Listen for step control
    window.addEventListener("message", async (event) => {
      if (typeof event.data.step !== "number") return;
      const stepIndex = event.data.step;
  
      resetAll();
      for (let k = 0; k < stepIndex; k++) {
        const s = steps[k];
        if (s.type === "set_i") varI.textContent = `i = ${s.i}`;
        else if (s.type === "set_min") varMin.textContent = `minIndex = ${s.minIndex}`;
        else if (s.type === "set_j") varJ.textContent = `j = ${s.j}`;
        else if (s.type === "update_min") varMin.textContent = `minIndex = ${s.minIndex}`;
        else if (s.type === "swap_start") {
          const temp = currentArray[s.i];
          currentArray[s.i] = currentArray[s.minIndex];
          currentArray[s.minIndex] = temp;
        }
        else if (s.type === "compare") {
          textJ.textContent = `arr[ j ] = ${currentArray[s.j]}`;
          textMin.textContent = `arr[ minIndex ] = ${currentArray[s.minIndex]}`;
        }
        resetBoxes(currentArray);
      }
  
      if (stepIndex < steps.length) await playStep(stepIndex);
    });
  });
  