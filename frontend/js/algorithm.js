document.addEventListener("DOMContentLoaded", () => {
  const algoContainer = document.getElementById("algo-container");
  const searchInput = document.getElementById("search");
  const searchButton = document.querySelector(".desktop-search button");
  const notification = document.getElementById("notification");
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMobile = document.querySelector(".close-mobile");
  const mobileSearchInput = document.getElementById("mobile-search");
  const mobileSearchButton = document.querySelector(".mobile-search button");

  // ----- Hamburger Menu -----
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.add("active");
    hamburger.style.display = "none";
  });
  closeMobile.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    hamburger.style.display = "block";
  });

  // ----- Responsive Desktop Search -----
  const desktopSearch = document.querySelector(".desktop-search");
  function handleResize() {
    desktopSearch.style.display = window.innerWidth <= 768 ? "none" : "flex";
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  // ----- Notification -----
  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => (notification.style.display = "none"), 3000);
  }

  // ----- Fetch algorithms -----
  fetch("/api/algorithms")
    .then(res => res.json())
    .then(data => {
      if (data.success && data.algorithms.length) {
        data.algorithms.forEach(algo => {
          const item = document.createElement("div");
          item.classList.add("algo-item");

          // Card
          const card = document.createElement("div");
          card.classList.add("card");
          card.setAttribute("data-algo", algo.name);

          // Image
          const img = document.createElement("img");
          img.src = algo.image_url;
          img.alt = algo.name;

          // Wait for image load to prevent row collapse
          img.onload = () => {
            card.appendChild(img);

            // Label
            const label = document.createElement("div");
            label.classList.add("label");
            label.innerHTML = `<h3>${algo.name}</h3>`;

            item.appendChild(card);
            item.appendChild(label);
            algoContainer.appendChild(item);
          };

          // Card click
          card.addEventListener("click", () => {
            const isLoggedIn = localStorage.getItem("userEmail");
            if (isLoggedIn) {
              window.location.href = `algo-detail.html?algo=${encodeURIComponent(algo.name)}`;
            } else {
              document.getElementById("overlay").style.display = "block";
              document.getElementById("login-popup").style.display = "block";
            }
          });
        });
      } else {
        showNotification("No algorithms found in database");
      }
    })
    .catch(() => showNotification("Failed to load algorithms"));

  // ----- Search Functionality -----
  function searchAlgorithms(query) {
    const items = document.querySelectorAll(".algo-item");
    let foundAny = false;
    items.forEach(item => {
      const name = item.querySelector(".card").getAttribute("data-algo").toLowerCase();
      if (name.includes(query)) {
        item.style.display = "flex";
        foundAny = true;
      } else item.style.display = "none";
    });
    if (!foundAny) showNotification("No algorithm found!");
  }

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return showNotification("Please enter an algorithm name!");
    searchAlgorithms(query);
  });

  mobileSearchButton.addEventListener("click", () => {
    const query = mobileSearchInput.value.toLowerCase().trim();
    if (!query) return showNotification("Please enter an algorithm name!");
    searchAlgorithms(query);
    if (window.innerWidth <= 768) {
      mobileMenu.classList.remove("active");
      hamburger.style.display = "block";
    }
  });
});