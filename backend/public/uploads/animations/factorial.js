document.addEventListener("DOMContentLoaded", () => {
    const nValue = 5; // example
    const arrayContainer = document.getElementById("array-container");
  
    // Message box
    const messageBox = document.createElement("div");
    messageBox.id = "message-box";
    arrayContainer.parentElement.insertBefore(messageBox, arrayContainer);
    const msg = (t) => (messageBox.textContent = t || "");
  
    // Render array [1..n]
    const renderArray = (n) => {
      arrayContainer.innerHTML = "";
      for (let i = 1; i <= n; i++) {
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
    };
    renderArray(nValue);
  
    // Variables
    const varN = document.getElementById("var-n");
    const varI = document.getElementById("var-i");
    const varResult = document.getElementById("var-result");
    const arrowI = document.getElementById("arrow-i");
    const textI = document.getElementById("text-i");
  
    const placeArrow = (arrowEl, targetIdx) => {
      const target = document.getElementById(`box-${targetIdx}`);
      if (!arrowEl || !target) return;
      arrowEl.style.position = "absolute";
      const baseRect = (arrowEl.offsetParent || document.body).getBoundingClientRect();
      const boxRect = target.getBoundingClientRect();
      const x = boxRect.left - baseRect.left + (boxRect.width - arrowEl.offsetWidth) / 2;
      arrowEl.style.left = `${Math.max(0, x)}px`;
      arrowEl.style.visibility = "visible";
    };
  
    // Steps
    let steps = [];
    steps.push({ type: "set_n", value: nValue, line: 1 });
    steps.push({ type: "set_result", value: 1, line: 2 });
    for (let i = 1; i <= nValue; i++) {
      steps.push({ type: "set_i", value: i, line: 3 });
      steps.push({ type: "multiply", i, line: 4 });
    }
  
    let currentResult = 1;
  
    const animateMultiply = (i) => new Promise((res) => {
      const box = document.getElementById(`box-${i}`);
      if (!box) return res();
      box.classList.add("update");
      setTimeout(() => {
        currentResult *= i;
        varResult.textContent = `result = ${currentResult}`;
        box.classList.remove("update");
        res();
      }, 500);
    });
  
    async function playStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= steps.length) return;
      const s = steps[stepIndex];
      switch (s.type) {
        case "set_n":
          varN.textContent = `n = ${s.value}`;
          varI.textContent = "i = -";
          varResult.textContent = "result = -";
          msg(`Starting factorial of ${s.value}`);
          break;
        case "set_result":
          varResult.textContent = `result = ${s.value}`;
          msg(`Initialize result = 1`);
          break;
        case "set_i":
          varI.textContent = `i = ${s.value}`;
          placeArrow(arrowI, s.value);
          textI.textContent = `i = ${s.value}`;
          msg(`Loop i = ${s.value}`);
          break;
        case "multiply":
          msg(`result *= ${s.i}`);
          await animateMultiply(s.i);
          break;
      }
      if (stepIndex === steps.length - 1) {
        msg(`Factorial completed: ${currentResult}`);
      }
    }
  
    function resetAll() {
      renderArray(nValue);
      varN.textContent = "n = -";
      varI.textContent = "i = -";
      varResult.textContent = "result = -";
      textI.textContent = "";
      arrowI.style.visibility = "hidden";
      currentResult = 1;
      msg("");
    }
    resetAll();
  
    // Step mapping for algo-detail.js
    window.parent.postMessage({ stepLineMap: steps.map((s) => s.line) }, "*");
  
    // Step control
    window.addEventListener("message", async (event) => {
      if (typeof event.data.step !== "number") return;
      const stepIndex = event.data.step;
      resetAll();
      for (let k = 0; k < stepIndex; k++) {
        const s = steps[k];
        if (s.type === "set_n") varN.textContent = `n = ${s.value}`;
        else if (s.type === "set_result") varResult.textContent = `result = ${s.value}`;
        else if (s.type === "set_i") {
          varI.textContent = `i = ${s.value}`;
          placeArrow(arrowI, s.value);
          textI.textContent = `i = ${s.value}`;
        }
        else if (s.type === "multiply") currentResult *= s.i;
      }
      varResult.textContent = `result = ${currentResult}`;
      await playStep(stepIndex);
    });
  });
  