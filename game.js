const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Configurações do jogo
const PRICE_PER_KWH = 0.15; // €/kWh
const PRICE_PER_M3_WATER = 1.5; // €/m³
let totalCost = 0;
let totalWaterCost = 0;
let totalWaterLiters = 0;
let gameTime = 0;
let totalCombined = totalCost + totalWaterCost;

// Definição das divisões
const rooms = [
  {
    name: "Sala",
    x: 50,
    y: 50,
    width: 300,
    height: 250,
    color: "#e8f5e9",
  },
  {
    name: "Cozinha",
    x: 400,
    y: 50,
    width: 350,
    height: 250,
    color: "#fff3e0",
  },
  {
    name: "Casa de Banho",
    x: 50,
    y: 350,
    width: 200,
    height: 200,
    color: "#e3f2fd",
  },
  {
    name: "Quarto",
    x: 300,
    y: 350,
    width: 450,
    height: 200,
    color: "#f3e5f5",
    hasSensor: true,
  },
];

// Tipos de iluminação
const lightTypes = {
  LED: { power: 10, color: "#ffd700", efficiency: "Alta" },
  TUNGSTEN: { power: 60, color: "#ffb347", efficiency: "Média" },
  INCANDESCENT: { power: 100, color: "#ff6b6b", efficiency: "Baixa" },
  HALOGEN: { power: 75, color: "#ff9ff3", efficiency: "Média-Baixa" },
};

// Dispositivos
const devices = [
  // Luzes
  {
    type: "light",
    lightType: "LED",
    x: 150,
    y: 100,
    room: "Sala",
    on: false,
    label: "Luz LED",
    id: "light1",
  },
  {
    type: "light",
    lightType: "INCANDESCENT",
    x: 550,
    y: 100,
    room: "Cozinha",
    on: false,
    label: "Luz Inc.",
    id: "light2",
  },
  {
    type: "light",
    lightType: "LED",
    x: 120,
    y: 420,
    room: "Casa de Banho",
    on: false,
    label: "Luz LED",
    id: "light3",
  },
  {
    type: "light",
    lightType: "HALOGEN",
    x: 500,
    y: 420,
    room: "Quarto",
    on: false,
    label: "Luz Halog.",
    sensor: true,
    id: "light4",
  },

  // Eletrodomésticos
  {
    type: "appliance",
    power: 150,
    x: 600,
    y: 150,
    room: "Cozinha",
    on: false,
    label: "Micro-ondas",
    icon: "📱",
    id: "micro",
    soundType: "appliance",
  },
  {
    type: "appliance",
    power: 200,
    x: 200,
    y: 150,
    room: "Sala",
    on: false,
    label: "TV",
    icon: "📺",
    id: "tv",
    soundType: "tv",
  },

  // Água
  {
    type: "water",
    waterFlow: 12,
    x: 650,
    y: 200,
    room: "Cozinha",
    on: false,
    label: "Torneira",
    icon: "🚰",
    id: "tap1",
    soundType: "water",
  },
  {
    type: "water",
    waterFlow: 10,
    x: 120,
    y: 480,
    room: "Casa de Banho",
    on: false,
    label: "Torneira",
    icon: "🚰",
    id: "tap2",
    soundType: "water",
  },
  {
    type: "water",
    waterFlow: 6,
    x: 180,
    y: 480,
    room: "Casa de Banho",
    on: false,
    label: "Autoclismo",
    icon: "🚽",
    id: "flush",
    soundType: "water",
  },
];

// Verificar se há dispositivo próximo
function getNearbyDevice() {
  const interactionDistance = 80;
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
  console.log(`${device.label} ${device.on ? "ligado" : "desligado"}`);
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
    const response = await fetch("./collision.txt");
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

// Configurações do sprite
const sprite = {
  x: 100,
  y: 200,
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
backgroundImg.src = "./map.png";

characterImg.onload = imageLoaded;
characterImg.onerror = () => {
  imageLoaded();
};
characterImg.src = "./character.png";

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

  updateCamera();
}

// Renderizar
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenhar fundo (com offset da câmera)
  if (backgroundImg.complete && backgroundImg.naturalWidth > 0) {
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
