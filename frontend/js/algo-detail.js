document.addEventListener("DOMContentLoaded", () => {
  const storedUserId = localStorage.getItem("userId");
  if (storedUserId) {
    document.getElementById("userId").value = storedUserId;
  }

  const params = new URLSearchParams(window.location.search);
  const algoName = params.get("algo");

  if (!algoName) {
    alert("No algorithm specified!");
    return;
  }

  document.getElementById("algo-title").textContent = `Algorithm: ${algoName}`;

  let currentStep = 0;
  let iframe;
  let stepLineMap = [];

  fetch(`/api/algorithm?name=${encodeURIComponent(algoName)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert("Algorithm not found!");
        return;
      }

      // Show code with line numbers
      const codeSection = document.getElementById("code-section");
      const lines = data.code.split("\n");
      codeSection.innerHTML = lines
        .map((line, i) => `<span id="line-${i + 1}">${line || "\u00A0"}</span>`)
        .join("");

      // Render visualization iframe
      let visualPath = data.visual_html;
      if (!visualPath.startsWith("/")) {
        visualPath = `/uploads/animations/${visualPath}`;
      }

      document.getElementById("visual-section").innerHTML =
        `<iframe id="visual-frame" src="${visualPath}" width="100%" height="500"></iframe>`;

      // Render explanation
      document.getElementById("explanation-section").textContent = data.explanation;
      document.getElementById("algorithmId").value = data.id;

      iframe = document.getElementById("visual-frame");

      // Listen for step-to-line mapping from iframe
      window.addEventListener("message", event => {
        if (event.data && event.data.stepLineMap) {
          stepLineMap = event.data.stepLineMap;
          moveArrow(currentStep);
        }
      });

      iframe.addEventListener("load", () => {
        sendStepToIframe(currentStep);
      });
    })
    .catch(err => console.error(err));

  function moveArrow(step) {
    document.querySelectorAll("#code-section span").forEach(span => {
      span.classList.remove("current-line");
    });

    if (stepLineMap.length === 0) return;

    const lineNumber = stepLineMap[step];
    const activeLine = document.getElementById(`line-${lineNumber}`);
    if (activeLine) {
      activeLine.classList.add("current-line");
      activeLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function sendStepToIframe(step) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ step }, "*");
    }
  }

  // Prev/Next buttons
  document.getElementById('prevLine').addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      moveArrow(currentStep);
      sendStepToIframe(currentStep);
    }
  });

  document.getElementById('nextLine').addEventListener('click', () => {
    if (stepLineMap.length === 0) return;
    if (currentStep < stepLineMap.length - 1) {
      currentStep++;
      moveArrow(currentStep);
      sendStepToIframe(currentStep);
    }
  });

  // Feedback form submit
  const feedbackForm = document.getElementById("feedbackForm");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userId = document.getElementById("userId").value;
      const algorithmId = document.getElementById("algorithmId").value;
      const feedbackText = document.getElementById("feedbackText").value;

      if (!userId) {
        alert("Please login to submit feedback!");
        return;
      }
      if (!algorithmId) {
        alert("Algorithm not set properly!");
        return;
      }

      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, algorithmId, feedbackText })
      })
        .then(res => res.json())
        .then(data => {
          document.getElementById("feedbackMsg").textContent = data.message;
          document.getElementById("feedbackText").value = "";
        })
        .catch(err => console.error(err));
    });
  }
});
