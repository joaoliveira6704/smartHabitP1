// Definição das divisões
export const rooms = [
  {
    name: "Wc Suite",
    x: 1104,
    y: 504,
    width: 288,
    height: 312,
    color: "red",
  },
  {
    name: "Wc",
    x: 768,
    y: 504,
    width: 288,
    height: 312,
    color: "#e3f2fd",
  },
];

// Tipos de iluminação
export const lightTypes = {
  LED: { power: 10, color: "#ffd700", efficiency: "Alta" },
  TUNGSTEN: { power: 60, color: "#ffb347", efficiency: "Média" },
  INCANDESCENT: { power: 100, color: "#ff6b6b", efficiency: "Baixa" },
  HALOGEN: { power: 75, color: "#ff9ff3", efficiency: "Média-Baixa" },
};

// Dispositivos
export const devices = [
  /* // Luzes
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
 */
  // Eletrodomésticos
  {
    type: "appliance",
    name: "Micro-ondas",
    power: 150,
    x: 48,
    y: 480,
    width: 48,
    height: 48,
    on: false,
    dOff: "../../assets/appliances/microwaveOff.png",
    dOn: "../../assets/appliances/microwaveOn.png",
    id: "micro",
    sound: "../../assets/sounds/microwave.mp3",
  },
  {
    type: "appliance",
    name: "TV",
    power: 150,
    x: 135,
    y: 195,
    width: 48,
    height: 48,
    on: false,
    id: "tv",
    sound: "../../assets/sounds/tv.mp3",
  },
  /*
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
  }, */
];
