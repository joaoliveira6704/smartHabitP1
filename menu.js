const playBtn = document.getElementById("playBtn");
const instructionsBtn = document.getElementById("instructionsBtn");
const objectivesBtn = document.getElementById("objectivesBtn");
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

// Start game
instructionsBtn.addEventListener("click", function () {
  menu.innerHTML = `
  <button class="menu-btn btn-objectives" id="objectivesBtn">
          Voltar
        </button>
  <div>Instruções</div>
  <button class="menu-btn btn-play" id="playBtn">Jogar</button>`;
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
