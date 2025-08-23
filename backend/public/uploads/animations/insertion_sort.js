document.addEventListener("DOMContentLoaded", () => {
  // --- you can replace this with data-driven values if needed
  const initialArray = [5, 3, 8, 4, 2];

  const arrayContainer = document.getElementById("array-container");

  // --- status/message box like Bubble Sort
  const messageBox = document.createElement("div");
  messageBox.id = "message-box";
  messageBox.style.margin = "8px 0";
  messageBox.style.fontWeight = "600";
  arrayContainer.parentElement.insertBefore(messageBox, arrayContainer);
  const msg = (t) => (messageBox.textContent = t || "");

  // Render boxes with indices
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
  const varKey = document.getElementById("var-key");

  const arrowJ = document.getElementById("arrow-j");
  const arrowJ1 = document.getElementById("arrow-j1");
  const textJ = document.getElementById("text-j");
  const textJ1 = document.getElementById("text-j1");

  // arrow positioning helper (same as Bubble)
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

  // state
  let steps = [];
  let currentArray = [...initialArray];

  /**
   * C++ you shared (line numbers for mapping):
   * 1  void insertionSort(int arr[], int n) {
   * 2      for (int i = 1; i < n; i++) {
   * 3          int key = arr[i];
   * 4          int j = i - 1;
   * 5          while (j >= 0 && arr[j] > key) {
   * 6              arr[j + 1] = arr[j];
   * 7              j--;
   * 8          }
   * 9          arr[j + 1] = key;
   * 10     }
   * 11 }
   *
   * We will map steps only to executable lines (2,3,4,5,6,7,9).
   */

  // Build steps based on insertion sort logic (without mutating currentArray)
  (function buildSteps() {
    const arr = [...initialArray];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      steps.push({ type: "set_i", i, line: 2 });

      const key = arr[i];
      steps.push({ type: "set_key", i, key, line: 3 });

      let j = i - 1;
      steps.push({ type: "set_j", j, line: 4 });

      while (j >= 0 && arr[j] > key) {
        // compare j with key
        steps.push({ type: "compare", j, key, result: true, line: 5 });
        // shift arr[j] to arr[j+1]
        steps.push({ type: "shift", from: j, to: j + 1, value: arr[j], line: 6 });
        j--;
        steps.push({ type: "dec_j", j, line: 7 });
        // emulate shift for future comparisons
        arr[j + 1] = arr[j + 1 - 1] /* temp placeholder */; // not actually used, we just need relative positions
      }

      // If while condition failed at first check:
      if (!(i - 1 >= 0 && initialArray[i - 1] > key)) {
        steps.push({
          type: "compare",
          j: i - 1,
          key,
          result: false,
          line: 5,
        });
      }

      // final insert
      steps.push({ type: "insert_key", pos: j + 1, key, line: 8 });

      // mutate simulated array for next outer i
      // Reconstruct arr after shifts and insert:
      // Start with the original prefix up to i-1 sorted; do actual insertion
      let j2 = i - 1;
      while (j2 >= 0 && arr[j2] > key) {
        arr[j2 + 1] = arr[j2];
        j2--;
      }
      arr[j2 + 1] = key;
    }
  })();

  // Helpers to update DOM
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
      if (j < 0) return res(); // skip highlight
      const a = document.getElementById(`box-${j}`);
      if (a) a.classList.add("compare");
      setTimeout(() => {
        a && a.classList.remove("compare");
        res();
      }, 450);
    });

  const animateShift = (fromIdx, value) =>
    new Promise((res) => {
      const dst = document.getElementById(`box-${fromIdx + 1}`);
      if (!dst) return res();
      dst.classList.add("swap");
      setTimeout(() => {
        dst.textContent = String(value); // use step.value
        dst.classList.remove("swap");
        res();
      }, 450);
    });
  const animateInsert = (pos, key) =>
    new Promise((res) => {
      const tgt = document.getElementById(`box-${pos}`);
      if (!tgt) return res();
      tgt.classList.add("swap");
      setTimeout(() => {
        tgt.textContent = String(key);
        tgt.classList.remove("swap");
        res();
      }, 450);
    });

  // Play single step with animation + UI updates
  async function playStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    const s = steps[stepIndex];

    switch (s.type) {
      case "set_i":
        msg(`Starting outer loop: i = ${s.i}`);
        varI.textContent = `i = ${s.i}`;
        varJ.textContent = "j = -";
        // keep key as is until set_key
        textJ.textContent = "";
        textJ1.textContent = "";
        // place arrows: j hidden until set_j; second arrow shows current i
        placeArrow(arrowJ1, s.i);
        textJ1.textContent = `i = ${s.i}`;
        break;

      case "set_key":
        varKey.textContent = `key = ${s.key}`;
        msg(`Pick key = arr[${s.i}] = ${s.key}`);
        // show where key came from
        placeArrow(arrowJ1, s.i);
        textJ1.textContent = `key = ${s.key}`;
        break;

      case "set_j":
        varJ.textContent = `j = ${s.j}`;
        placeArrow(arrowJ, s.j);
        textJ.textContent = `arr[j] = ${currentArray[s.j] ?? "-"}`;
        // arrowJ1 points to slot j+1 (where insertion/shift happens)
        placeArrow(arrowJ1, s.j + 1);
        textJ1.textContent = `slot = j+1`;
        break;

      case "compare":
        // while (j>=0 && arr[j] > key)
        // update arrows to j and slot
        if (s.j >= 0) {
          placeArrow(arrowJ, s.j);
          textJ.textContent = `arr[j] = ${currentArray[s.j]}`;
        } else {
          textJ.textContent = `j < 0`;
        }
        placeArrow(arrowJ1, s.j + 1);
        textJ1.textContent = `key = ${varKey.textContent.split("=").pop().trim()}`;
        msg(
          s.j >= 0
            ? `Compare arr[${s.j}] (${currentArray[s.j]}) > key (${s.key}) ? ${s.result ? "Yes" : "No"}`
            : `j < 0 → stop`
        );
        await highlightCompare(Math.max(0, s.j));
        break;

      case "shift":
        await animateShift(s.from, s.value);
        currentArray[s.from + 1] = s.value;
        resetBoxes(currentArray);
        break;

      case "dec_j":
        varJ.textContent = `j = ${s.j}`;
        if (s.j >= 0) {
          placeArrow(arrowJ, s.j);
          textJ.textContent = `arr[j] = ${currentArray[s.j]}`;
          placeArrow(arrowJ1, s.j + 1);
          textJ1.textContent = `slot = j+1`;
        } else {
          // hide j arrow if j < 0
          arrowJ.style.visibility = "hidden";
          textJ.textContent = `j = -1`;
          placeArrow(arrowJ1, 0);
          textJ1.textContent = `slot = 0`;
        }
        break;

      case "insert_key":
        await animateInsert(s.pos, s.key);
        currentArray[s.pos] = s.key;
        resetBoxes(currentArray);
        msg(`Insert key ${s.key} at position ${s.pos}`);
        // after insert, clear arrows text
        textJ.textContent = "";
        textJ1.textContent = "";
        break;
    }

    if (stepIndex === steps.length - 1) msg("Sorting completed!");
  }

  function resetAll() {
    currentArray = [...initialArray];
    resetBoxes(currentArray);
    varI.textContent = "i = -";
    varJ.textContent = "j = -";
    varKey.textContent = "key = -";
    textJ.textContent = "";
    textJ1.textContent = "";
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

  // ---- step to line map (only executable lines: 2,3,4,5,6,7,9)
  const stepLineMap = steps.map((s) => s.line);

  // Send mapping to parent (algo-detail.js)
  window.parent.postMessage({ stepLineMap }, "*");

  // Handle next/prev from parent (zero-based step index)
  window.addEventListener("message", async (event) => {
    if (typeof event.data.step !== "number") return;
    const stepIndex = event.data.step;

    // rebuild state (silent) up to stepIndex
    resetAll();
    for (let k = 0; k < stepIndex; k++) {
      const s = steps[k];
      if (s.type === "set_i") {
        varI.textContent = `i = ${s.i}`;
        placeArrow(arrowJ1, s.i);
        textJ1.textContent = `i = ${s.i}`;
      } else if (s.type === "set_key") {
        varKey.textContent = `key = ${s.key}`;
        placeArrow(arrowJ1, s.i);
        textJ1.textContent = `key = ${s.key}`;
      } else if (s.type === "set_j") {
        varJ.textContent = `j = ${s.j}`;
        placeArrow(arrowJ, s.j);
        placeArrow(arrowJ1, s.j + 1);
        textJ.textContent = `arr[j] = ${currentArray[s.j] ?? "-"}`;
        textJ1.textContent = `slot = j+1`;
      } else if (s.type === "compare") {
        if (s.j >= 0) {
          placeArrow(arrowJ, s.j);
          textJ.textContent = `arr[j] = ${currentArray[s.j]}`;
        } else {
          textJ.textContent = `j < 0`;
        }
        placeArrow(arrowJ1, s.j + 1);
        textJ1.textContent = `key = ${varKey.textContent.split("=").pop().trim()}`;
      } else if (s.type === "shift") {
        currentArray[s.from + 1] = currentArray[s.from];
        resetBoxes(currentArray);
      } else if (s.type === "dec_j") {
        varJ.textContent = `j = ${s.j}`;
        if (s.j >= 0) {
          placeArrow(arrowJ, s.j);
          textJ.textContent = `arr[j] = ${currentArray[s.j]}`;
          placeArrow(arrowJ1, s.j + 1);
          textJ1.textContent = `slot = j+1`;
        } else {
          arrowJ.style.visibility = "hidden";
          textJ.textContent = `j = -1`;
          placeArrow(arrowJ1, 0);
          textJ1.textContent = `slot = 0`;
        }
      } else if (s.type === "insert_key") {
        currentArray[s.pos] = s.key;
        resetBoxes(currentArray);
      }
    }

    // play the requested step with animation
    if (stepIndex < steps.length) await playStep(stepIndex);
  });
});
