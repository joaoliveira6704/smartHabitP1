import { rooms, devices } from "./data/data.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ============================================
// VARIÁVEIS GLOBAIS DO JOGO
// ============================================

// Constantes de preços para cálculo de custos
const PRICE_PER_KWH = 0.15; // Preço por kilowatt-hora em euros
const PRICE_PER_M3_WATER = 1.5; // Preço por metro cúbico de água em euros

// Variáveis de controlo do jogo
let totalWaterCost = 0; // Custo total acumulado de água
let totalWaterLiters = 0; // Litros totais de água consumidos
let gameTime = 0; // Contador de tempo do jogo (em frames)
let totalCost = 0; // Custo total acumulado de energia

// Referências aos elementos HTML
const waterCost = document.getElementById("waterCost");
const waterConsumption = document.getElementById("waterConsumption");
const energyConsumption = document.getElementById("energyConsumption");
const energyCost = document.getElementById("energyCost");
const energyTotalCost = document.getElementById("energyTotalCost");
const totalCombinedLabel = document.getElementById("totalCombined");

// Variável para controlar gestos (deteção de mão levantada)
let lastHandRaisedState = false;

// ============================================
// INTERAÇÃO COM DISPOSITIVOS
// ============================================

// Verifica se existe algum dispositivo no raio de interação
function getNearbyDevice() {
  let interactionDistance;

  // Calcular o centro do jogador
  const playerCenterX = sprite.x + sprite.frameWidth / 2;
  const playerCenterY = sprite.y + sprite.frameHeight / 2;

  // Percorrer todos os dispositivos para verificar proximidade
  for (let device of devices) {
    // Definir distância de interação baseada no tipo de dispositivo
    if (device.name === "Micro-ondas" || device.name === "TV") {
      interactionDistance = 60; // Dispositivos maiores têm maior alcance
    } else {
      interactionDistance = 30; // Distância padrão
    }

    // Calcular distância euclidiana entre jogador e dispositivo
    const dx = device.x - playerCenterX + 30;
    const dy = device.y - playerCenterY + device.height;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se o jogador estiver dentro da distância de interação
    if (distance < interactionDistance) {
      return device;
    }
  }
  return null; // Nenhum dispositivo próximo
}

/**
 * Interage com o dispositivo mais próximo
 * Cada dispositivo tem comportamento específico
 */
function interactWithDevice() {
  const device = getNearbyDevice();
  if (!device) return; // Sair se não houver dispositivo próximo

  // Lógica específica para a Sanita
  if (device.name === "Sanita") {
    if (device.on) return; // Já está em uso, ignorar

    device.on = true; // Ativar autoclismo

    // Desligar automaticamente após 6 segundos
    setTimeout(() => {
      device.on = false;
    }, 6000);

    return;
  }

  // Lógica específica para o Micro-ondas
  if (device.name === "Micro-ondas") {
    if (device.on) return; // Já está em uso, ignorar

    device.on = true; // Ligar micro-ondas

    // Desligar após 9.9 segundos (duração do áudio)
    setTimeout(() => {
      device.on = false;
    }, 9900);

    return;
  }

  // Para os restantes dispositivos, simplesmente alternar o estado (ligar/desligar)
  device.on = !device.on;
}

// Cria animação da tv ligada
function createTVSprite() {
  // Paletas de cores para diferentes secções da TV
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

  // Desenhar colunas de cores aleatórias para criar efeito de TV ligada
  for (let i = 135; i <= 190; i++) {
    // Secção superior
    ctx.fillStyle = upColors[Math.floor(Math.random() * upColors.length)];
    ctx.fillRect(i - camera.x, 195 - camera.y, 11, 25);

    // Secção média
    ctx.fillStyle = midColors[Math.floor(Math.random() * midColors.length)];
    ctx.fillRect(i - camera.x, 215 - camera.y, 11, 4);

    // Secção inferior
    ctx.fillStyle = lowColors[Math.floor(Math.random() * lowColors.length)];
    ctx.fillRect(i - camera.x, 219 - camera.y, 11, 11);

    i += 10; // Saltar 10 pixels para a próxima coluna
  }
}

// ============================================
// EVENTOS DE TECLADO
// ============================================

// Detetar teclas premidas
document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;

  // Tecla 'E' para interagir com dispositivos
  if (e.key.toLowerCase() === "e") {
    interactWithDevice();
  }
});

// Detetar teclas libertadas
document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ============================================
// SISTEMA DE COLISÃO E MAPA
// ============================================

const TILE_SIZE = 48; // Tamanho de cada tile do mapa em píxeis
let collisionMap = []; // Matriz que define onde há colisões (0 = livre, 1 = colisão)
let mapWidth = 0; // Largura do mapa em tiles
let mapHeight = 0; // Altura do mapa em tiles
let mapPixelWidth = 0; // Largura do mapa em píxeis
let mapPixelHeight = 0; // Altura do mapa em píxeis

// Objeto que controla a visualização do mapa
const camera = {
  x: 0, // Posição X da câmera no mapa
  y: 0, // Posição Y da câmera no mapa
  width: canvas.width, // Largura da área visível
  height: canvas.height, // Altura da área visível
};

// ============================================
// RECURSOS GRÁFICOS
// ============================================

const backgroundImg = new Image(); // Imagem do mapa de fundo
const characterImg = new Image(); // Spritesheet do personagem

// Carregar o mapa de colisão
async function loadCollisionMap() {
  const response = await fetch("./js/data/collision.txt");
  const text = await response.text();
  const lines = text.trim().split("\n");

  // Converter o texto em matriz numérica
  collisionMap = lines.map((line) =>
    line
      .trim()
      .split(" ")
      .map((char) => parseInt(char))
  );

  // Calcular dimensões do mapa
  mapHeight = collisionMap.length;
  mapWidth = collisionMap[0]?.length || 0;
  mapPixelWidth = mapWidth * TILE_SIZE;
  mapPixelHeight = mapHeight * TILE_SIZE;
}

// Verificar se há colisão
function checkCollision(x, y, width, height) {
  // Criar hitbox focada nos pés do personagem
  const hitbox = {
    x: x + width * 0.25,
    y: y + height * 0.5,
    width: width * 0.5,
    height: height * 0.5,
  };

  // Verificar colisão nos 4 cantos da hitbox
  const points = [
    { x: hitbox.x, y: hitbox.y }, // Canto superior esquerdo
    { x: hitbox.x + hitbox.width, y: hitbox.y }, // Canto superior direito
    { x: hitbox.x, y: hitbox.y + hitbox.height - 1 }, // Canto inferior esquerdo
    { x: hitbox.x + hitbox.width, y: hitbox.y + hitbox.height - 1 }, // Canto inferior direito
  ];

  // Verificar cada ponto
  for (let point of points) {
    const tileX = Math.floor(point.x / TILE_SIZE);
    const tileY = Math.floor(point.y / TILE_SIZE);

    // Verificar se o tile está dentro dos limites e se é sólido
    if (tileY >= 0 && tileY < mapHeight && tileX >= 0 && tileX < mapWidth) {
      if (collisionMap[tileY][tileX] === 1) {
        return true; // Colisão detetada
      }
    }
  }
  return false; // Sem colisão
}

// Calcular custo dos dispositivos
function calculateCost() {
  let totalEnergyConsumption = 0; // Consumo total de energia em Watts
  let totalWaterConsumption = 0; // Consumo total de água em L/min
  let hourlyCost = 0; // Custo de energia por hora
  let hourlyWaterCost = 0; // Custo de água por hora

  // Calcular consumo dos dispositivos
  devices.forEach((device) => {
    if (device.on) {
      if (device.type == "light" || device.type == "appliance") {
        // Dispositivos elétricos
        totalEnergyConsumption += device.power;
        hourlyCost += (device.power / 100) * PRICE_PER_KWH;
        totalCost += PRICE_PER_KWH / 60;
      } else {
        // Dispositivos de água
        totalWaterConsumption += device.waterFlow;
        totalWaterCost += (device.waterFlow / 1000) * PRICE_PER_M3_WATER;
        hourlyWaterCost += (device.waterFlow / 1000) * PRICE_PER_M3_WATER;
        totalWaterLiters += device.waterFlow / 60;
      }
    }
  });

  // Calcular consumo das luzes dos quartos
  rooms.forEach((room) => {
    if (room.on) {
      totalEnergyConsumption += room.power;
      hourlyCost += (room.power / 100) * PRICE_PER_KWH;
      totalCost += PRICE_PER_KWH / 60;
    }
  });

  // Calcular custo total combinado
  let totalCombined = totalCost + totalWaterCost;

  // Atualizar interface com os valores calculados
  totalCombinedLabel.innerHTML = `${parseFloat(totalCombined).toFixed(2)} €`;
  energyConsumption.innerHTML = `${totalEnergyConsumption} W`;
  energyCost.innerHTML = `${parseFloat(hourlyCost).toFixed(2)} €`;
  energyTotalCost.innerHTML = `${parseFloat(totalCost).toFixed(2)} €`;
  waterConsumption.innerHTML = `${totalWaterConsumption} L/MIN`;
  waterCost.innerHTML = `${parseFloat(hourlyWaterCost).toFixed(2)} €`;
  totalWater.innerHTML = `${parseInt(totalWaterLiters)} L`;
}

// ============================================
// CONFIGURAÇÃO DO SPRITE
// ============================================

const sprite = {
  x: 260, // Posição inicial X
  y: 250, // Posição inicial Y
  speed: 3, // Velocidade de movimento

  // Dimensões do sprite no spritesheet
  frameWidth: 64,
  frameHeight: 64,
  framesPerRow: 4, // Número de frames de animação por direção
  currentFrame: 0, // Frame atual da animação
  frameCounter: 0, // Contador para controlar velocidade da animação
  animationSpeed: 8, // Velocidade da animação (quanto maior, mais lenta)

  direction: 0, // Direção atual (0=baixo, 1=esquerda, 2=direita, 3=cima)
  isMoving: false, // Se o personagem está em movimento
};

// ============================================
// CONTROLO DE TECLADO
// ============================================

// Objeto para guardar estado das teclas
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

//Atualizar câmera
function updateCamera() {
  // câmera no centro do sprite
  camera.x = sprite.x + sprite.frameWidth / 2 - camera.width / 2;
  camera.y = sprite.y + sprite.frameHeight / 2 - camera.height / 2;

  // Limitar câmera aos limites do mapa (não mostrar área fora do mapa)
  camera.x = Math.max(0, Math.min(mapPixelWidth - camera.width, camera.x));
  camera.y = Math.max(0, Math.min(mapPixelHeight - camera.height, camera.y));
}

// Carregar recursos gráficos
backgroundImg.src = "../assets/main/map.png";
characterImg.src = "../assets/main/character.png";

// ============================================
// EVENTOS DE TECLADO PARA MOVIMENTO
// ============================================

// Registar teclas premidas
window.addEventListener("keydown", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = true;
    e.preventDefault();
  }
});

// Registar teclas libertadas
window.addEventListener("keyup", (e) => {
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
    e.preventDefault();
  }
});

// ============================================
// ATUALIZAÇÃO DO JOGO
// ============================================
function update() {
  sprite.isMoving = false;

  // Guardar posição anterior para reverter se houver colisão
  const oldX = sprite.x;
  const oldY = sprite.y;

  // Processar input de movimento
  if (keys.ArrowUp || keys.w) {
    sprite.y -= sprite.speed;
    sprite.direction = 3; // Direção para cima
    sprite.isMoving = true;
  }
  if (keys.ArrowDown || keys.s) {
    sprite.y += sprite.speed;
    sprite.direction = 0; // Direção para baixo
    sprite.isMoving = true;
  }
  if (keys.ArrowLeft || keys.a) {
    sprite.x -= sprite.speed;
    sprite.direction = 1; // Direção para esquerda
    sprite.isMoving = true;
  }
  if (keys.ArrowRight || keys.d) {
    sprite.x += sprite.speed;
    sprite.direction = 2; // Direção para direita
    sprite.isMoving = true;
  }

  // Verificar colisão e reverter movimento se necessário
  if (sprite.isMoving) {
    if (
      checkCollision(sprite.x, sprite.y, sprite.frameWidth, sprite.frameHeight)
    ) {
      sprite.x = oldX;
      sprite.y = oldY;
    }
  }

  // Atualizar animação do sprite
  if (sprite.isMoving) {
    sprite.frameCounter++;
    if (sprite.frameCounter >= sprite.animationSpeed) {
      sprite.frameCounter = 0;
      sprite.currentFrame = (sprite.currentFrame + 1) % sprite.framesPerRow;
    }
  } else {
    // Parado: mostrar frame inicial
    sprite.currentFrame = 0;
    sprite.frameCounter = 0;
  }

  // Incrementar tempo do jogo
  gameTime += 1;
  gameTime++;

  // Atualizar custos a cada segundo (60 frames)
  if (gameTime % 60 === 0) {
    calculateCost();
  }

  // Detetar gesto de mão levantada (se disponível)
  const currentHandRaisedState = window.detectHandRaised();

  // Se a mão foi levantada (transição de false para true)
  if (currentHandRaisedState && !lastHandRaisedState) {
    interactWithDevice();
  }

  lastHandRaisedState = currentHandRaisedState;

  // Atualizar câmera
  updateCamera();
}

// ============================================
// PRELOAD DE DISPOSITIVOS
// ============================================

// Carregar recursos de áudio e imagens para cada dispositivo
devices.forEach((device) => {
  // Carregar som se existir
  if (device.sound) {
    device.audioElement = new Audio(device.sound);
    device.audioElement.loop = true; // Som em loop
    device.audioElement.volume = 0.1; // Volume baixo
  }

  // Pré-carregar imagens de ligado/desligado
  if (device.dOn) {
    device.imageOn = new Image();
    device.imageOn.src = device.dOn;
  }
  if (device.dOff) {
    device.imageOff = new Image();
    device.imageOff.src = device.dOff;
  }
});

// ============================================
// RENDERIZAÇÃO
// ============================================

function render() {
  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    backgroundImg,
    camera.x, // Posição X no mapa
    camera.y, // Posição Y no mapa
    camera.width, // Largura a recortar
    camera.height, // Altura a recortar
    0, // X no canvas
    0, // Y no canvas
    camera.width, // Largura no canvas
    camera.height // Altura no canvas
  );

  // ============================================
  // DESENHAR DISPOSITIVOS
  // ============================================

  devices.forEach((device) => {
    // Calcular posição no ecrã (com offset da câmera)
    const deviceScreenX = device.x - camera.x;
    const deviceScreenY = device.y - camera.y;

    // Só desenhar se estiver no viewport, para poupar memória
    if (
      deviceScreenX > -90 &&
      deviceScreenX < canvas.width + 90 &&
      deviceScreenY > -90 &&
      deviceScreenY < canvas.height + 90
    ) {
      // Desenhar imagem do dispositivo (ligado ou desligado)
      if (device.imageOn || device.imageOff) {
        let img = device.on ? device.imageOn : device.imageOff;

        ctx.drawImage(
          img,
          deviceScreenX,
          deviceScreenY,
          device.width,
          device.height
        );
      } else {
        // Animação para TV quando ligada
        if ((device.name === "TV") & device.on) {
          createTVSprite();
        }
      }

      // Animação de gotas de água para dispositivos ligados
      if (device.on && device.type === "water") {
        if (device.name != "Sanita") {
          ctx.fillStyle = "#64B5F6"; // Cor azul para água

          // Desenhar 3 gotas animadas
          for (let i = 0; i < 3; i++) {
            let dropX = deviceScreenX + device.width / 2;
            let dropY;

            // Posicionar gotas conforme o dispositivo
            if (device.name === "Banheira") {
              dropY = deviceScreenY + 40 + ((gameTime * 2 + i * 10) % 22);
            } else if (device.id === "tapKitchen") {
              dropY = deviceScreenY + 19 + ((gameTime * 2 + i * 10) % 18);
              dropX = deviceScreenX + device.width / 2 - 5;
            } else if (device.name === "Chuveiro") {
              dropY = deviceScreenY + 40 + ((gameTime * 2 + i * 10) % 60);
            } else {
              dropY = deviceScreenY + 10 + ((gameTime * 2 + i * 5) % 13);
            }

            // Desenhar gota circular
            ctx.beginPath();
            ctx.arc(dropX, dropY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Controlar reprodução de áudio
      if (device.audioElement) {
        if (device.on) {
          if (device.audioElement.paused) {
            device.audioElement.play();
            if (device.name === "TV") {
              device.audioElement.volume = 0.1;
            }
          }
        } else {
          if (!device.audioElement.paused) {
            device.audioElement.pause();
            device.audioElement.currentTime = 0; // Reiniciar áudio
          }
        }
      }
    }

    // ============================================
    // GESTÃO DE ILUMINAÇÃO DOS QUARTOS
    // ============================================

    rooms.forEach((room) => {
      // Verificar se o jogador está dentro do quarto (para sensores)
      if (
        sprite.x + sprite.frameWidth / 2 > room.x &&
        sprite.x + sprite.frameWidth / 2 < room.x + room.width &&
        sprite.y + sprite.frameHeight > room.y &&
        sprite.y + sprite.frameHeight < room.y + room.height &&
        room.interaction === "sensor"
      ) {
        room.on = true; // Ligar luz automaticamente
      } else {
        // Verificar se há algum dispositivo ligado no quarto
        let device = devices.find((device) => device.room === room.name);
        if (device && device.on) {
          room.on = true; // Manter luz ligada
        } else {
          room.on = false; // Desligar luz
        }
      }

      // Desenhar overlay de iluminação
      if (room.on) {
        ctx.fillStyle = room.colorOn; // Cor quando ligado
      } else {
        ctx.fillStyle = room.colorOff; // Cor quando desligado
      }
      ctx.fillRect(
        room.x - camera.x,
        room.y - camera.y,
        room.width,
        room.height
      );
    });

    // ============================================
    // LABEL DE INTERAÇÃO
    // ============================================

    // Mostrar instrução de interação se houver dispositivo próximo
    let closestDevice = getNearbyDevice();

    if (closestDevice) {
      // Desenhar fundo da label
      let labelBgImage = new Image();
      labelBgImage.src = "../assets/main/labelBg.png";
      ctx.drawImage(
        labelBgImage,
        canvas.width / 2 - 256,
        canvas.height - 60,
        512,
        49
      );

      // Texto de interação personalizado por dispositivo
      ctx.fillStyle = "#000";
      ctx.font = "16px BlockBlueprint";
      ctx.textAlign = "center";
      let text;

      if (closestDevice.name === "Sanita") {
        text = `${
          closestDevice.on
            ? "Autoclismo em Uso..."
            : "Pressione E para Puxar o Autoclismo"
        }`;
      } else if (closestDevice.name === "Micro-ondas") {
        text = `${
          closestDevice.on
            ? "Micro-ondas em uso..."
            : "Pressione E para Usar o Micro-ondas"
        }`;
      } else {
        text = `Pressione E para ${closestDevice.on ? "Desligar" : "Ligar"} ${
          closestDevice.name
        }`;
      }
      ctx.fillText(text, canvas.width / 2, canvas.height - 35);
    }
  });

  // ============================================
  // DESENHAR PERSONAGEM
  // ============================================

  const screenX = sprite.x - camera.x;
  const screenY = sprite.y - camera.y;

  ctx.drawImage(
    characterImg,
    sprite.currentFrame * sprite.frameWidth, // X no spritesheet
    sprite.direction * sprite.frameHeight, // Y no spritesheet (linha da direção)
    sprite.frameWidth,
    sprite.frameHeight,
    screenX,
    screenY,
    sprite.frameWidth,
    sprite.frameHeight
  );

  // ============================================
  // MINIMAPA
  // ============================================

  const minimapImg = new Image();
  minimapImg.src = "../assets/main/map.png";

  // Fundo preto do minimapa
  ctx.fillStyle = "#000000";
  ctx.fillRect(440, 0, 170, 100);

  // Imagem do mapa em miniatura
  ctx.drawImage(minimapImg, 445, 5, 150, 100);

  // Indicador da posição do jogador
  ctx.fillStyle = "red";
  ctx.fillRect(sprite.x / 9.5 + 445, sprite.y / 9 + 3, 5, 5);

  // ============================================
  // LISTA DE DISPOSITIVOS ATIVOS
  // ============================================

  // Fundo branco para a lista
  ctx.fillStyle = "#fff";
  ctx.font = "16px BlockBlueprint";
  ctx.fillRect(
    5,
    5,
    270,
    devices.filter((device) => device.on && device.type != "light").length *
      20 +
      rooms.filter((room) => room.on).length * 20
  );

  // Listar dispositivos ligados (exceto luzes)
  ctx.fillStyle = "#000000";
  ctx.textAlign = "left";
  let posI = 20;

  devices
    .filter((device) => device.on && device.type != "light")
    .forEach((device) => {
      ctx.fillText(
        `${device.name} - ${device.power || device.waterFlow} ${
          device.room
            ? "W - " +
              rooms
                .find((room) => room.name === device.room)
                .type.toLocaleUpperCase()
            : device.power
            ? "W"
            : "L/M"
        }`,
        20,
        posI
      );

      posI += 20;
    });

  // Listar luzes dos quartos ligadas
  rooms
    .filter((room) => room.on)
    .forEach((room) => {
      ctx.fillText(
        `Luz ${room.name} - ${room.power} W - ${room.type.toLocaleUpperCase()}`,
        20,
        posI
      );

      posI += 20;
    });
}

// ============================================
// GAME LOOP PRINCIPAL
// ============================================

function gameLoop() {
  update(); // Atualizar lógica do jogo
  render(); // Desenhar tudo no canvas
  requestAnimationFrame(gameLoop); // Agendar próximo frame
}

// Iniciar o jogo depois de carregar o mapa de colisão
loadCollisionMap().then(() => {
  gameLoop();
});
