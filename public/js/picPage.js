const panels = document.querySelectorAll(".panel");

//sets the picture that is clicked to be the only one with the class of "active" (large displayed one)
panels.forEach((panel) => {
  panel.addEventListener("click", () => {
    removeActiveClasses();
    panel.classList.add("active");
  });
});

function removeActiveClasses() {
  panels.forEach((panel) => {
    panel.classList.remove("active");
  });
}
