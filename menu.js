const playBtn = document.getElementById("playBtn");
const menu = document.getElementById("menu");
const game = document.getElementById("game");

// Start game
playBtn.addEventListener("click", function () {
  menu.classList.add("hide");

  setTimeout(function () {
    menu.style.display = "none";
    game.classList.add("show");
    game.style.visibility = "visible"; // show canvas area
  }, 500);
});

// Return to menu with "P"
document.addEventListener("keydown", function (event) {
  if (event.key.toLowerCase() === "p") {
    // Hide game visually but keep it active
    game.classList.remove("show");
    game.style.visibility = "hidden";

    // Show menu again
    menu.style.display = "block";
    menu.classList.remove("hide");
  }
});
