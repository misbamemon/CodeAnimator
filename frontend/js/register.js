document.addEventListener("DOMContentLoaded", () => {
  const showLoginNav = document.getElementById("show-login-nav");
  const showLoginMain = document.getElementById("show-login-main");
  const userInitialDisplay = document.getElementById("user-initial-display");
  const loginPopup = document.getElementById("login-popup");
  const registerPopup = document.getElementById("register-popup");
  const overlay = document.getElementById("overlay");
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  const closeButtons = document.querySelectorAll(".close-btn");
  const mobileLoginLink = document.getElementById("mobile-login-link");
  const mobileUserCircle = document.getElementById("mobile-user-circle");
  const mobileUserEmail = document.getElementById("mobile-user-email");
  const logoutBtn = document.getElementById("logout");

  // --- Mobile Menu ---
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMobile = document.querySelector(".close-mobile");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        mobileMenu.classList.add("active");
        hamburger.style.display = "none";
      }
    });
  }

  if (closeMobile && mobileMenu) {
    closeMobile.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        mobileMenu.classList.remove("active");
        hamburger.style.display = "block";
      }
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      hamburger.style.display = "none";
      mobileMenu.classList.remove("active");
    } else {
      hamburger.style.display = "block";
    }
  });

  document.querySelectorAll(".mobile-nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      if (!mobileMenu || window.innerWidth > 768) return;
      mobileMenu.style.right = "-70%";
      setTimeout(() => {
        mobileMenu.classList.remove("active");
        mobileMenu.style.right = "";
        hamburger.style.display = "block";
      }, 300);
    });
  });

  // --- Popup functions ---
  const hideAllPopups = () => {
    overlay.style.display = "none";
    loginPopup.style.display = "none";
    registerPopup.style.display = "none";
  };

  const showLoginPopup = () => {
    overlay.style.display = "block";
    loginPopup.style.display = "block";
  };

  // --- Update Navbar UI ---
  const updateNavbarUI = () => {
    const email = localStorage.getItem("userEmail");
    const isAdmin = localStorage.getItem("isAdmin");

    if (email) {
      // Desktop
      if (userInitialDisplay) {
        userInitialDisplay.textContent = email.charAt(0).toUpperCase();
        userInitialDisplay.style.display = "flex";
        if (showLoginNav) showLoginNav.style.display = "none";
        if (showLoginMain) showLoginMain.style.display = "none";
      }
      if (logoutBtn) logoutBtn.style.display = "block";

      // Mobile
      if (mobileUserCircle && mobileUserEmail) {
        mobileUserCircle.textContent = email.charAt(0).toUpperCase();
        mobileUserEmail.textContent = email;
        document.getElementById("mobile-user-info").style.display = "flex";
        if (mobileLoginLink) mobileLoginLink.style.display = "none";
      }
    } else {
      // Desktop
      if (userInitialDisplay) userInitialDisplay.style.display = "none";
      if (showLoginNav) showLoginNav.style.display = "inline-block";
      if (showLoginMain) showLoginMain.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";

      // Mobile
      if (mobileUserCircle && mobileUserEmail) {
        document.getElementById("mobile-user-info").style.display = "none";
        if (mobileLoginLink) mobileLoginLink.style.display = "block";
      }
    }
  };

  // --- Toggle Password Eye Icon ---
  document.querySelectorAll(".eye-btn").forEach(eyeBtn => {
    eyeBtn.addEventListener("click", () => {
      const input = eyeBtn.parentElement.querySelector("input");
      input.type = input.type === "password" ? "text" : "password";
      eyeBtn.classList.toggle("fa-eye");
      eyeBtn.classList.toggle("fa-eye-slash");
    });
  });

  // --- Login/Popup Event Listeners ---
  if (showLoginNav) showLoginNav.addEventListener("click", e => { e.preventDefault(); showLoginPopup(); });
  if (showLoginMain) showLoginMain.addEventListener("click", e => { e.preventDefault(); showLoginPopup(); });
  if (mobileLoginLink) mobileLoginLink.addEventListener("click", e => { e.preventDefault(); showLoginPopup(); });

  closeButtons.forEach(btn => btn.addEventListener("click", hideAllPopups));
  overlay.addEventListener("click", hideAllPopups);

  if (showRegisterLink) showRegisterLink.addEventListener("click", e => {
    e.preventDefault();
    loginPopup.style.display = "none";
    registerPopup.style.display = "block";
  });

  if (showLoginLink) showLoginLink.addEventListener("click", e => {
    e.preventDefault();
    registerPopup.style.display = "none";
    loginPopup.style.display = "block";
  });

  // --- Notification ---
  const showNotification = message => {
    const notif = document.getElementById("notification");
    if (!notif) return;
    notif.textContent = message;
    notif.style.display = "block";
    setTimeout(() => { notif.style.display = "none"; }, 3000);
  };

  // --- Logout ---
  const doLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    updateNavbarUI();
  };

  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      if (confirm("Do you want to Logout?")) doLogout();
    });
  }

  if (userInitialDisplay) {
    userInitialDisplay.addEventListener("click", () => {
      if (confirm("Do you want to Logout?")) doLogout();
    });
  }

  // --- Login Form Submit ---
  const loginForm = document.getElementById("loginform");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = loginForm.querySelector('input[name="email"]').value;
      const password = loginForm.querySelector('input[name="password"]').value;

      fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Admin login
            if (data.isAdmin) {
              localStorage.setItem("isAdmin", "true");
              localStorage.setItem("userEmail", data.email);
              window.location.href = "admin.html";
              return;
            }

            // Normal user login
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("userId", data.userId);

            showNotification("Login successful!");
            hideAllPopups();
            updateNavbarUI();
          } else {
            showNotification(data.message || "Login failed");
          }
        })
        .catch(() => showNotification("Error during login"));
    });
  }

  // --- Register Form Submit ---
  const registerForm = document.getElementById("registerform");
  if (registerForm) {
    registerForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = registerForm.querySelector('input[name="name"]').value;
      const email = registerForm.querySelector('input[name="email"]').value;
      const password = registerForm.querySelector('input[name="password"]').value;

      fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
        .then(res => res.json())
        .then(data => {
          showNotification(data.message || "Registered");
          if (data.success) {
            hideAllPopups();
            loginPopup.style.display = "block";
            overlay.style.display = "block";
          }
        })
        .catch(() => showNotification("Error during registration"));
    });
  }

  // --- Initial UI Update ---
  updateNavbarUI();
});
