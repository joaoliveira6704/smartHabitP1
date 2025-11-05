import { rooms, devices, lightTypes } from "./data/data.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações do jogo
const PRICE_PER_KWH = 0.15; // €/kWh
const PRICE_PER_M3_WATER = 1.5; // €/m³
let totalWaterCost = 0;
let totalWaterLiters = 0;
let gameTime = 0;
let totalCost = 0,
  hourlyCost = 0;

// Verificar se há dispositivo próximo
function getNearbyDevice() {
  const interactionDistance = 100;
  const playerCenterX = sprite.x + sprite.frameWidth / 2;
  const playerCenterY = sprite.y + sprite.frameHeight / 2;

  for (let device of devices) {
    const dx = device.x - playerCenterX;
    const dy = device.y - playerCenterY;
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

// Controle de teclas
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
let imagesLoaded = 0;
const totalImages = 2;

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
const waterCost = document.getElementById("waterCost");
const waterConsumption = document.getElementById("waterConsumption");
const energyConsumption = document.getElementById("energyConsumption");
const energyCost = document.getElementById("energyCost");
const energyTotalCost = document.getElementById("energyTotalCost");
const totalCombinedLabel = document.getElementById("totalCombined");

function calculateCost() {
  let totalEnergyConsumption = 0,
    totalWaterConsumption = 0;

  devices.forEach((device) => {
    if (device.on) {
      if (device.type == "light" || device.type == "appliance") {
        totalEnergyConsumption += device.power;
        hourlyCost += ((device.power / 1000) * PRICE_PER_KWH) / 3600;
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
  energyTotalCost.innerHTML = `${parseInt(totalCost)} €`;
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

// Carregar imagens
function imageLoaded() {
  imagesLoaded++;
}

backgroundImg.onload = imageLoaded;
backgroundImg.onerror = () => {
  imageLoaded();
};
backgroundImg.src = "../assets/main/map.png";

characterImg.onload = imageLoaded;
characterImg.onerror = () => {
  imageLoaded();
};
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
  updateCamera();
}

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
    /* rooms.forEach((room) => {
      ctx.fillStyle = "rgb(255 0 0 / 50%)";
      ctx.fillRect(
        room.x - camera.x,
        room.y - camera.y,
        room.width,
        room.height
      );
    }); */
  } else {
    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Grelha (com offset da câmera)
  /* ctx.strokeStyle = "rgba(189, 195, 199, 0.3)";
  ctx.lineWidth = 1;
  const startX = Math.floor(camera.x / TILE_SIZE) * TILE_SIZE;
  const startY = Math.floor(camera.y / TILE_SIZE) * TILE_SIZE;
  const endX = camera.x + camera.width;
  const endY = camera.y + camera.height;

  for (let i = startX; i <= endX; i += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(i - camera.x, 0);
    ctx.lineTo(i - camera.x, canvas.height);
    ctx.stroke();
  }
  for (let i = startY; i <= endY; i += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, i - camera.y);
    ctx.lineTo(canvas.width, i - camera.y);
    ctx.stroke();
  } */

  // Desenhar dispositivos (com offset da câmera)
  // In the render function, replace the device drawing section with:
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
        let img = new Image();
        img.src = device.on ? device.dOn : device.dOff;

        ctx.drawImage(img, device.x - camera.x, device.y - camera.y, 48, 48);
      }

      /* // Label
      ctx.fillStyle = "#000";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(device.label, deviceScreenX, deviceScreenY + 30);
      ctx.textAlign = "left"; */
    }
  });

  // Desenhar sprite (com offset da câmera)
  const screenX = sprite.x - camera.x;
  const screenY = sprite.y - camera.y;

  if (characterImg.complete && characterImg.naturalWidth > 0) {
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
    /* console.log("Movimneto"); */
  } else {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(screenX, screenY, sprite.frameWidth, sprite.frameHeight);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText("PLAYER", screenX + 10, screenY + 35);
  }

  if (characterImg.complete && characterImg.naturalWidth > 0) {
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
  } else {
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(screenX, screenY, sprite.frameWidth, sprite.frameHeight);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.fillText("PLAYER", screenX + 10, screenY + 35);
  }

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
