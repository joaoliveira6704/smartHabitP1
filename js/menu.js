const playBtn = document.getElementById("playBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const objectivesBtn = document.getElementById("objectivesBtn");
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const menuBtns = document.getElementById("menu-btns");
const instructionContainer = document.getElementById("instructions-container");
const logo = document.getElementById("logo");
const backBtn = document.getElementById("back-btn");

// Start game
playBtn.addEventListener("click", function () {
  menu.classList.add("hide");

  setTimeout(function () {
    menu.style.display = "none";
    game.classList.add("show");
    game.style.visibility = "visible"; // show canvas area
  }, 500);
});

backBtn.addEventListener("click", function () {
  menu.classList.add("hide");
  setTimeout(function () {
    logo.style.display = "block";
    menu.classList.remove("hide");
    instructionContainer.style.display = "none";
    menuBtns.style.display = "block";
  }, 500);
});

// Instructions window
instructionsBtn.addEventListener("click", function () {
  menu.classList.add("hide");
  setTimeout(function () {
    logo.style.display = "none";
    menu.classList.remove("hide");
    menuBtns.classList.add("show");
    instructionContainer.style.display = "block";
    menuBtns.style.display = "none";
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
