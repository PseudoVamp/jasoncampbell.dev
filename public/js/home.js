// Floating accent hover effects
const floatingAccents = document.querySelectorAll(".floating-accent");
floatingAccents.forEach((accent) => {
  accent.addEventListener("mouseenter", () => {
    accent.style.transform = "scale(1.2)";
    accent.style.opacity = "0.2";
    accent.style.transition = "all 0.3s ease";
  });
  
  accent.addEventListener("mouseleave", () => {
    accent.style.transform = "scale(1)";
    accent.style.opacity = "0.1";
  });
});

// Subtle parallax effect on hero content
const heroContent = document.querySelector(".hero-content");
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  
  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
  }
});