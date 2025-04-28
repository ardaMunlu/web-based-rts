// === Game Setup ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const resources = {
  wood: 0,
  food: 0,
  rock: 0,
  iron: 0
};

const townCenter = {
  x: 400,
  y: 300,
  size: 40
};

const villagers = [
  {
    x: 450,
    y: 300,
    size: 20,
    speed: 2,
    selected: false,
    target: null,
    gathering: false,
    resourceType: null,
    gatherSpeed: 1, // units per second
    lastGatherTime: 0
  }
];

const resourceNodes = [
  { type: 'wood', x: 150, y: 100, amount: 100 },
  { type: 'food', x: 650, y: 120, amount: 100 },
  { type: 'rock', x: 200, y: 500, amount: 100 },
  { type: 'iron', x: 600, y: 450, amount: 100 }
];

// === Input Handling ===
canvas.addEventListener('mousedown', function(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (event.button === 0) {
    // Left click -> Select villager
    let clickedOnVillager = false;
    for (const villager of villagers) {
      const dist = Math.hypot(villager.x - mouseX, villager.y - mouseY);
      if (dist < villager.size) {
        villager.selected = true;
        clickedOnVillager = true;
      } else {
        villager.selected = false;
      }
    }
    if (!clickedOnVillager) {
      for (const villager of villagers) {
        villager.selected = false;
      }
    }
  }

  if (event.button === 2) {
    // Right click -> Move or Gather
    event.preventDefault(); // prevent browser context menu

    for (const villager of villagers) {
      if (villager.selected) {
        let clickedOnResource = false;
        for (const node of resourceNodes) {
          const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
          if (dist < 25) {
            // Right clicked on resource
            villager.target = { x: node.x, y: node.y };
            villager.gathering = true;
            villager.resourceType = node.type;
            villager.resourceNode = node;
            clickedOnResource = true;
            break;
          }
        }
        if (!clickedOnResource) {
          // Right clicked empty ground -> just move
          villager.target = { x: mouseX, y: mouseY };
          villager.gathering = false;
          villager.resourceType = null;
          villager.resourceNode = null;
        }
      }
    }
  }
});

// Prevent right-click menu on canvas
canvas.addEventListener('contextmenu', event => event.preventDefault());

// === Game Loop ===
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  const now = Date.now();
  for (const villager of villagers) {
    if (villager.target) {
      const dx = villager.target.x - villager.x;
      const dy = villager.target.y - villager.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2) {
        villager.x += (dx / dist) * villager.speed;
        villager.y += (dy / dist) * villager.speed;
      } else {
        // Arrived at target
        if (villager.gathering && villager.resourceNode) {
          if (now - villager.lastGatherTime > 1000) {
            if (villager.resourceNode.amount > 0) {
              resources[villager.resourceType]++;
              villager.resourceNode.amount--;
              villager.lastGatherTime = now;
              updateUI();
            }
          }
        } else {
          villager.target = null;
        }
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Town Center
  ctx.fillStyle = 'brown';
  ctx.fillRect(townCenter.x - townCenter.size / 2, townCenter.y - townCenter.size / 2, townCenter.size, townCenter.size);

  // Draw Resources
  for (const node of resourceNodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = getResourceColor(node.type);
    ctx.fill();
    ctx.closePath();
  }

  // Draw Villagers
  for (const villager of villagers) {
    // Draw selection circle
    if (villager.selected) {
      ctx.beginPath();
      ctx.arc(villager.x, villager.y, villager.size, 0, Math.PI * 2);
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }

    // Draw villager
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(villager.x, villager.y, villager.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateUI() {
  document.getElementById('wood').innerText = resources.wood;
  document.getElementById('food').innerText = resources.food;
  document.getElementById('rock').innerText = resources.rock;
  document.getElementById('iron').innerText = resources.iron;
}

function getResourceColor(type) {
  switch (type) {
    case 'wood': return 'green';
    case 'food': return 'red';
    case 'rock': return 'gray';
    case 'iron': return 'black';
    default: return 'white';
  }
}

// === Start Game ===
gameLoop();
