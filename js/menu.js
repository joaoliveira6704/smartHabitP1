// referência a elementos
const playBtn = document.getElementById("playBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const optionsBtn = document.getElementById("optionsBtn");
const objectivesBtn = document.getElementById("objectivesBtn");
const menu = document.getElementById("menu");
const instructionsMenu = document.getElementById("instructionsMenu");
const optionsMenu = document.getElementById("optionsMenu");
const game = document.getElementById("game");
const menuBtns = document.getElementById("menu-btns");
const instructionContainer = document.getElementById("instructions-container");
const optionsContainer = document.getElementById("options-container");
const logo = document.getElementById("logo");
const backInstructionsBtn = document.getElementById("backInstructions-btn");
const backOptionsBtn = document.getElementById("backOptions-btn");

let gameActive = false;

// Animação ao clicar no botão "voltar" dentro das instruções
backInstructionsBtn.addEventListener("click", function () {
  instructionsMenu.classList.remove("show");
  instructionsMenu.classList.add("hide");

  setTimeout(function () {
    instructionsMenu.style.display = "none";
    instructionsMenu.classList.remove("hide");

    menu.style.display = "block";
    menu.classList.remove("hide");
    menu.classList.add("show");
  }, 500);
});

// Animação ao clicar no botão "voltar" dentro das opções
backOptionsBtn.addEventListener("click", function () {
  optionsMenu.classList.remove("show");
  optionsMenu.classList.add("hide");

  setTimeout(function () {
    optionsMenu.style.display = "none";
    optionsMenu.classList.remove("hide");

    menu.style.display = "block";
    menu.classList.remove("hide");
    menu.classList.add("show");
  }, 500);
});

// Animação ao entrar no menu de instruções
instructionsBtn.addEventListener("click", function () {
  menu.classList.remove("show");
  menu.classList.add("hide");

  setTimeout(function () {
    menu.style.display = "none";
    menu.classList.remove("hide");

    instructionsMenu.style.display = "block";
    instructionsMenu.classList.remove("hide");
    instructionsMenu.classList.add("show");
  }, 500);
});

// Animação ao entrar no menu de opções
optionsBtn.addEventListener("click", function () {
  menu.classList.remove("show");
  menu.classList.add("hide");

  setTimeout(function () {
    menu.style.display = "none";
    menu.classList.remove("hide");

    optionsMenu.style.display = "block";
    optionsMenu.classList.remove("hide");
    optionsMenu.classList.add("show");
  }, 500);
});

// Animação ao entrar no jogo (play)
playBtn.addEventListener("click", function () {
  menu.classList.remove("show");
  menu.classList.add("hide");

  setTimeout(function () {
    menu.style.display = "none";
    menu.classList.remove("hide");

    game.classList.add("show");
    game.style.visibility = "visible";
    gameActive = true;
  }, 500);
});

// Aceder ao menu durante o jogo
document.addEventListener("keydown", function (event) {
  if (
    (event.key.toLowerCase() === "p" || event.key === "Escape") &&
    gameActive
  ) {
    game.classList.remove("show");
    game.style.visibility = "hidden";
    gameActive = false;

    menu.style.display = "block";
    menu.classList.remove("hide");
    menu.classList.add("show");
  }
});
