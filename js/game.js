import { rooms, devices, lightTypes } from "./data/data.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações do jogo
const PRICE_PER_KWH = 0.15; // €/kWh
const PRICE_PER_M3_WATER = 1.5; // €/m³
let totalWaterCost = 0,
  totalWaterLiters = 0,
  gameTime = 0,
  totalCost = 0;
const waterCost = document.getElementById("waterCost");
const waterConsumption = document.getElementById("waterConsumption");
const energyConsumption = document.getElementById("energyConsumption");
const energyCost = document.getElementById("energyCost");
const energyTotalCost = document.getElementById("energyTotalCost");
const totalCombinedLabel = document.getElementById("totalCombined");
let lastHandRaisedState = false;

// Verificar se há dispositivo próximo
function getNearbyDevice() {
  const interactionDistance = 60;
  const playerCenterX = sprite.x + sprite.frameWidth / 2;
  const playerCenterY = sprite.y + sprite.frameHeight / 2;

  for (let device of devices) {
    const dx = device.x - playerCenterX;
    const dy = device.y - playerCenterY + device.height;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < interactionDistance) {
      return device;
    }
  }
  return null;
}

// Interagir com dispositivo
function interactWithDevice() {
  const device = getNearbyDevice();
  if (!device) return;

  device.on = !device.on;

  // Feedback visual
  console.log(`${device.power} ${device.on ? "ligado" : "desligado"}`);
}

function createTVSprite() {
  // Criar frames coloridos para simular uma TV ligada
  const upColors = [
    "#ffffff",
    "#f4f700",
    "#87f6ec",
    "#8dfa00",
    "#d137e5",
    "#d91e00",
  ];
  const midColors = [
    "#d91e00",
    "#000000",
    "#d137e5",
    "#000000",
    "#87f6ec",
    "#000000",
    "#ffffff",
  ];
  const lowColors = [
    "#000c61",
    "#ffffff",
    "#011a9a",
    "#000000",
    "#000000",
    "#000000",
  ];
  for (let i = 135; i <= 190; i++) {
    ctx.fillStyle = upColors[Math.floor(Math.random() * upColors.length)];
    ctx.fillRect(i - camera.x, 195 - camera.y, 11, 25);
    ctx.fillStyle = midColors[Math.floor(Math.random() * midColors.length)];
    ctx.fillRect(i - camera.x, 215 - camera.y, 11, 4);
    ctx.fillStyle = lowColors[Math.floor(Math.random() * lowColors.length)];
    ctx.fillRect(i - camera.x, 219 - camera.y, 11, 11);
    i += 10;
  }
}

// Controle teclas
document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key.toLowerCase() === "e") {
    interactWithDevice();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Mapa de colisão
const TILE_SIZE = 48;
let collisionMap = [];
let mapWidth = 0;
let mapHeight = 0;
let mapPixelWidth = 0;
let mapPixelHeight = 0;

// Camera
const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
};

// Imagens
const backgroundImg = new Image();
const characterImg = new Image();

// Carregar mapa de colisão
async function loadCollisionMap() {
  try {
    const response = await fetch("./js/data/collision.txt");
    const text = await response.text();
    const lines = text.trim().split("\n");

    collisionMap = lines.map((line) =>
      line
        .trim()
        .split(" ")
        .map((char) => parseInt(char))
    );

    mapHeight = collisionMap.length;
    mapWidth = collisionMap[0]?.length || 0;
    mapPixelWidth = mapWidth * TILE_SIZE;
    mapPixelHeight = mapHeight * TILE_SIZE;
  } catch (error) {
    // Mapa padrão maior se não carregar
    mapWidth = 60;
    mapHeight = 40;
    mapPixelWidth = mapWidth * TILE_SIZE;
    mapPixelHeight = mapHeight * TILE_SIZE;
    collisionMap = Array(mapHeight)
      .fill(0)
      .map(() => Array(mapWidth).fill(0));
  }
}

// Verificar colisão
function checkCollision(x, y, width, height) {
  // Criar hitbox menor focada nos pés do personagem
  const hitbox = {
    x: x + width * 0.25,
    y: y + height * 0.5,
    width: width * 0.5,
    height: height * 0.5,
  };

  // Verificar os 4 cantos da hitbox
  const points = [
    { x: hitbox.x, y: hitbox.y },
    { x: hitbox.x + hitbox.width, y: hitbox.y },
    { x: hitbox.x, y: hitbox.y + hitbox.height - 1 },
    { x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height - 1 },
  ];

  for (let point of points) {
    const tileX = Math.floor(point.x / TILE_SIZE);
    const tileY = Math.floor(point.y / TILE_SIZE);

    if (tileY >= 0 && tileY < mapHeight && tileX >= 0 && tileX < mapWidth) {
      if (collisionMap[tileY][tileX] === 1) {
        return true;
      }
    }
  }
  return false;
}

function calculateCost() {
  let totalEnergyConsumption = 0,
    totalWaterConsumption = 0,
    hourlyCost = 0;

  devices.forEach((device) => {
    if (device.on) {
      if (device.type == "light" || device.type == "appliance") {
        totalEnergyConsumption += device.power;
        hourlyCost += (device.power / 100) * PRICE_PER_KWH;
        totalCost += PRICE_PER_KWH / 60;
      } else {
        totalWaterConsumption += device.waterFlow;
        totalWaterCost += (device.waterFlow / 1000) * PRICE_PER_M3_WATER;
        totalWaterLiters += device.waterFlow / 60;
      }
    }
  });

  let totalCombined = totalCost + totalWaterCost;

  totalCombinedLabel.innerHTML = `${parseFloat(totalCombined).toFixed(2)} €`;
  energyConsumption.innerHTML = `${totalEnergyConsumption} W`;
  energyCost.innerHTML = `${parseFloat(hourlyCost).toFixed(2)} €`;
  energyTotalCost.innerHTML = `${parseFloat(totalCost).toFixed(2)} €`;
  waterConsumption.innerHTML = `${totalWaterConsumption} L/MIN`;
  waterCost.innerHTML = `${parseFloat(totalWaterCost).toFixed(2)} €`;
  totalWater.innerHTML = `${parseInt(totalWaterLiters)} L`;
}

// Configurações do sprite
const sprite = {
  x: 260,
  y: 250,
  speed: 3,

  frameWidth: 64,
  frameHeight: 64,
  framesPerRow: 4,
  currentFrame: 0,
  frameCounter: 0,
  animationSpeed: 8,

  direction: 0,
  isMoving: false,
};

// Teclas
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
};

// Atualizar câmera para seguir o personagem
function updateCamera() {
  // Centrar câmera no personagem
  camera.x = sprite.x + sprite.frameWidth / 2 - camera.width / 2;
  camera.y = sprite.y + sprite.frameHeight / 2 - camera.height / 2;

  // Limitar câmera aos limites do mapa
  camera.x = Math.max(0, Math.min(mapPixelWidth - camera.width, camera.x));
  camera.y = Math.max(0, Math.min(mapPixelHeight - camera.height, camera.y));
}

backgroundImg.src = "../assets/main/map.png";
characterImg.src = "../assets/main/character.png";

// Teclado
window.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
    e.preventDefault();
  }
});

// Atualizar
function update() {
  sprite.isMoving = false;

  const oldX = sprite.x;
  const oldY = sprite.y;

  if (keys.ArrowUp || keys.w) {
    sprite.y -= sprite.speed;
    sprite.direction = 3;
    sprite.isMoving = true;
  }
  if (keys.ArrowDown || keys.s) {
    sprite.y += sprite.speed;
    sprite.direction = 0;
    sprite.isMoving = true;
  }
  if (keys.ArrowLeft || keys.a) {
    sprite.x -= sprite.speed;
    sprite.direction = 1;
    sprite.isMoving = true;
  }
  if (keys.ArrowRight || keys.d) {
    sprite.x += sprite.speed;
    sprite.direction = 2;
    sprite.isMoving = true;
  }

  if (sprite.isMoving) {
    if (
      checkCollision(sprite.x, sprite.y, sprite.frameWidth, sprite.frameHeight)
    ) {
      sprite.x = oldX;
      sprite.y = oldY;
    }
  }

  // Limites do mapa (não do canvas)
  sprite.x = Math.max(0, Math.min(mapPixelWidth - sprite.frameWidth, sprite.x));
  sprite.y = Math.max(
    0,
    Math.min(mapPixelHeight - sprite.frameHeight, sprite.y)
  );

  if (sprite.isMoving) {
    sprite.frameCounter++;
    if (sprite.frameCounter >= sprite.animationSpeed) {
      sprite.frameCounter = 0;
      sprite.currentFrame = (sprite.currentFrame + 1) % sprite.framesPerRow;
    }
  } else {
    sprite.currentFrame = 0;
    sprite.frameCounter = 0;
  }
  gameTime += 1;
  // Atualizar custos (a cada segundo)
  gameTime++;
  if (gameTime % 60 === 0) {
    calculateCost();
  }

  const currentHandRaisedState = window.detectHandRaised();

  if (currentHandRaisedState && !lastHandRaisedState) {
    interactWithDevice();
  }

  lastHandRaisedState = currentHandRaisedState;

  updateCamera();
}

//Criar fora de qualquer loop para evitar bugs no audio
devices.forEach((device) => {
  if (device.sound) {
    device.audioElement = new Audio(device.sound);
    device.audioElement.loop = true;
    device.audioElement.volume = 0.3;
  }
});

// Renderizar
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar fundo (com offset da câmera)
  if (backgroundImg.complete) {
    ctx.drawImage(
      backgroundImg,
      camera.x,
      camera.y,
      camera.width,
      camera.height,
      0,
      0,
      camera.width,
      camera.height
    );
    rooms.forEach((room) => {
      ctx.fillStyle = "rgb(0 0 0 / 75%)";
      ctx.fillRect(
        room.x - camera.x,
        room.y - camera.y,
        room.width,
        room.height
      );
    });
  } else {
    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Desenhar dispositivos (com offset da câmera)
  devices.forEach((device) => {
    const deviceScreenX = device.x - camera.x;
    const deviceScreenY = device.y - camera.y;

    // Só desenhar se estiver visível na tela
    if (
      deviceScreenX > -50 &&
      deviceScreenX < canvas.width + 50 &&
      deviceScreenY > -50 &&
      deviceScreenY < canvas.height + 50
    ) {
      if (device.type === "light") {
        // Desenhar luz
        ctx.fillStyle = device.on ? lightTypes[device.lightType].color : "#666";
        ctx.beginPath();
        ctx.arc(deviceScreenX, deviceScreenY, 15, 0, Math.PI * 2);
        ctx.fill();
        if (device.on) {
          ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      } else {
        // Desenhar eletrodoméstico ou água
        if (device.dOn && device.dOff) {
          let img = new Image();
          img.src = device.on ? device.dOn : device.dOff;

          ctx.drawImage(
            img,
            deviceScreenX,
            deviceScreenY,
            device.width,
            device.height
          );
        } else {
          if ((device.name === "TV") & device.on) {
            createTVSprite();
          }
        }

        if (device.audioElement) {
          if (device.on) {
            if (device.audioElement.paused) {
              device.audioElement
                .play()
                .catch((e) => console.log("Audio play failed:", e));
            }
          } else {
            if (!device.audioElement.paused) {
              device.audioElement.pause();
              device.audioElement.currentTime = 0;
            }
          }
        }
      }
    }

    // Mostrar label de interação
    let closestDevice = getNearbyDevice();

    if (closestDevice) {
      let labelBgImage = new Image();
      labelBgImage.src = "../assets/main/labelBg.png";
      ctx.drawImage(
        labelBgImage,
        canvas.width / 2 - 256,
        canvas.height - 60,
        512,
        49
      );

      // Texto de interação
      ctx.fillStyle = "#000";
      ctx.font = "16px BlockBlueprint";
      ctx.textAlign = "center";

      ctx.fillText(
        `Pressione E para ${device.on ? "Desligar" : "Ligar"} ${
          closestDevice.name
        }`,
        canvas.width / 2,
        canvas.height - 35
      );
    }
  });

  // Desenhar sprite (com offset da câmera)
  const screenX = sprite.x - camera.x;
  const screenY = sprite.y - camera.y;

  ctx.drawImage(
    characterImg,
    sprite.currentFrame * sprite.frameWidth,
    sprite.direction * sprite.frameHeight,
    sprite.frameWidth,
    sprite.frameHeight,
    screenX,
    screenY,
    sprite.frameWidth,
    sprite.frameHeight
  );

  /* // Info de debug
  ctx.fillStyle = "#fff";
  ctx.fillRect(5, 5, 250, 95);
  ctx.fillStyle = "#2c3e50";
  ctx.font = "14px Arial";
  ctx.fillText(
    `Pos: (${Math.round(sprite.x)}, ${Math.round(sprite.y)})`,
    10,
    20
  );
  ctx.fillText(
    `Câmera: (${Math.round(camera.x)}, ${Math.round(camera.y)})`,
    10,
    40
  );
  ctx.fillText(
    `Direção: ${["Baixo", "Esquerda", "Direita", "Cima"][sprite.direction]}`,
    10,
    60
  );
  ctx.fillText(`Frame: ${sprite.currentFrame}`, 10, 80); */
}

// Game loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Inicializar
loadCollisionMap().then(() => {
  gameLoop();
});
