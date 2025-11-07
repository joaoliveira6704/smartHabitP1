const playBtn = document.getElementById("playBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const objectivesBtn = document.getElementById("objectivesBtn");
const menu = document.getElementById("menu");
const instructionsMenu = document.getElementById("instructionsMenu");
const game = document.getElementById("game");
const menuBtns = document.getElementById("menu-btns");
const instructionContainer = document.getElementById("instructions-container");
const logo = document.getElementById("logo");
const backBtn = document.getElementById("back-btn");

let gameActive = false;

// Start game
playBtn.addEventListener("click", function () {
  menu.classList.add("hide");
  setTimeout(function () {
    menu.style.display = "none";
    game.classList.add("show");
    game.style.visibility = "visible";
    gameActive = true;
  }, 500);
});

backBtn.addEventListener("click", function () {
  instructionsMenu.classList.add("hide");
  setTimeout(function () {
    instructionsMenu.style.display = "none";
    instructionsMenu.classList.remove("show");
    menu.style.display = "block";
    menu.classList.remove("hide");
  }, 500);
});

// Instructions window
instructionsBtn.addEventListener("click", function () {
  menu.classList.add("hide");
  setTimeout(function () {
    menu.style.display = "none";
    instructionsMenu.style.display = "block";
    instructionsMenu.classList.add("show");
  }, 500);
});

// Return to menu with "P"
document.addEventListener("keydown", function (event) {
  if (event.key.toLowerCase() === "p" && gameActive) {
    // Hide game
    game.classList.remove("show");
    game.style.visibility = "hidden";
    gameActive = false;

    // Show menu again
    menu.style.display = "block";
    menu.classList.remove("hide");
  }
});
