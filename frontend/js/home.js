document.addEventListener("DOMContentLoaded", () => {
  // --- FAQ toggle ---
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.addEventListener("click", () => {
      q.parentElement.classList.toggle("active");
    });
  });

  // Add any other home-page-specific JS here if needed
});
