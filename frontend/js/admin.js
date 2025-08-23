document.addEventListener("DOMContentLoaded", () => {
  // Admin access check
  const isAdmin = localStorage.getItem("isAdmin");
  const adminEmail = localStorage.getItem("userEmail");

  if (!isAdmin) {
    alert("Access denied!");
    window.location.href = "home.html";
    return;
  }

  // Show admin info
  document.getElementById("admin-info").textContent = `Welcome, ${adminEmail}`;

  // Logout
  document.getElementById("admin-logout").addEventListener("click", () => {
    if (confirm("Do you want to logout?")) {
      localStorage.clear();
      window.location.href = "home.html";
    }
  });

  const usersTable = document.querySelector("#users-table tbody");
  const feedbackTable = document.querySelector("#feedback-table tbody");
  const algorithmTable = document.querySelector("#algorithm-table tbody");

  const algoForm = document.getElementById("algorithm-form");
  const algoIdInput = document.getElementById("algoId");
  const algoName = document.getElementById("algoName");
  const algoCode = document.getElementById("algoCode");
  const algoImage = document.getElementById("algoImage");
  const algoExplanation = document.getElementById("algoExplanation");
  const algoVisualHtml = document.getElementById("algoVisualHtml");
  const algoVisualCss = document.getElementById("algoVisualCss");
  const algoVisualJs = document.getElementById("algoVisualJs");

  // Fetch users
  fetch("/api/users")
    .then(res => res.json())
    .then(data => {
      usersTable.innerHTML = "";
      data.users.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td><button class="delete-user" data-id="${u.id}">Delete</button></td>`;
        usersTable.appendChild(tr);
      });

      // delete user
      document.querySelectorAll(".delete-user").forEach(btn => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this user?")) {
            fetch(`/api/users/${btn.dataset.id}`, { method: "DELETE" })
              .then(res => res.json())
              .then(() => location.reload());
          }
        });
      });
    });

  // Fetch feedbacks
  fetch("/api/feedbacks")
    .then(res => res.json())
    .then(data => {
      feedbackTable.innerHTML = "";
      data.feedbacks.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${f.id}</td>
          <td>${f.user_name}</td>
          <td>${f.algo_name}</td>
          <td>${f.feedback}</td>
          <td><button class="delete-feedback" data-id="${f.id}">Delete</button></td>`;
        feedbackTable.appendChild(tr);
      });

      // delete feedback
      document.querySelectorAll(".delete-feedback").forEach(btn => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this feedback?")) {
            fetch(`/api/feedbacks/${btn.dataset.id}`, { method: "DELETE" })
              .then(res => res.json())
              .then(() => location.reload());
          }
        });
      });
    });

  // Fetch algorithms
  function loadAlgorithms() {
    fetch("/api/algorithms")
      .then(res => res.json())
      .then(data => {
        algorithmTable.innerHTML = "";
        data.algorithms.forEach(a => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${a.id}</td>
            <td>${a.name}</td>
            <td>
              <button class="edit-btn" data-id="${a.id}">Edit</button>
              <button class="delete-btn" data-id="${a.id}">Delete</button>
            </td>`;
          algorithmTable.appendChild(tr);
        });

        // Edit algorithm
        document.querySelectorAll(".edit-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            const algo = data.algorithms.find(al => al.id == btn.dataset.id);
            algoIdInput.value = algo.id;
            algoName.value = algo.name;
            algoCode.value = algo.code;
            algoExplanation.value = algo.explanation;
            alert("Now you can update the selected algorithm.");
          });
        });

        // Delete algorithm
        document.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", () => {
            if (confirm("Delete this algorithm?")) {
              fetch(`/api/algorithm/${btn.dataset.id}`, { method: "DELETE" })
                .then(res => res.json())
                .then(() => loadAlgorithms());
            }
          });
        });
      });
  }
  loadAlgorithms();

  // Add / update algorithm
  algoForm.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", algoName.value);
    formData.append("code", algoCode.value);
    formData.append("explanation", algoExplanation.value);
    if (algoImage.files[0]) formData.append("image", algoImage.files[0]);
    if (algoVisualHtml.files[0]) formData.append("visual_html", algoVisualHtml.files[0]);
    if (algoVisualCss.files[0]) formData.append("visual_css", algoVisualCss.files[0]);
    if (algoVisualJs.files[0]) formData.append("visual_js", algoVisualJs.files[0]);

    const method = algoIdInput.value ? "PUT" : "POST";
    const url = algoIdInput.value ? `/api/algorithm/${algoIdInput.value}` : "/api/algorithm";

    fetch(url, { method, body: formData })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "Algorithm saved successfully!");
        algoForm.reset();
        algoIdInput.value = "";
        loadAlgorithms();
      })
      .catch(() => alert("Failed to save algorithm."));
  });
});
