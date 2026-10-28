let coins = [];
let coinScore = 0;
let coinStartTime = 0;
let coinGameStarted = false;
let coinGameOver = false;
let coinGameDuration = 30;

let draggedCoin = null;
let chestOpen = false;
let chestAnimation = 0;
let lastSpawnTime = 0;
let chestCorner = 0;

let coinHighscore;

const chest = {
  x: 590,
  y: 345,
  w: 150,
  h: 105
};

const chestCorners = [
  { x: 115, y: 150 },
  { x: 585, y: 150 },
  { x: 115, y: 350 },
  { x: 585, y: 350 }
];

function coinPreload() {
  // Highscores
  coinHighscore = getItem("coinHighscore");
  if (coinHighscore === null) {
    coinHighscore = 0;
  }
}

function coinDraw() {
  drawCoinBackground();

  if (!coinGameStarted) {
    drawCoinStartScreen();
    return;
  }

  if (coinGameOver) {
    drawCoinGameOver();
    return;
  }

  let timeLeft = max(
    0,
    coinGameDuration - floor((millis() - coinStartTime) / 1000)
  );

  if (timeLeft <= 0) {
    coinGameOver = true;
    draggedCoin = null;
    chestOpen = false;
    return;
  }

  // Score and timer
  fill(255, 220, 120);
  textSize(22);
  textAlign(LEFT, CENTER);
  text("Coins: " + coinScore, 20, 25);
  text("Highscore: " + coinHighscore, 20, 50);

  textAlign(RIGHT, CENTER);
  text("Time: " + timeLeft, width - 20, 25);

  fill(210);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Grab a coin and drag it into the open chest!", width / 2, 57);

  // Spawn coins regularly, up to a maximum of 10
  if (millis() - lastSpawnTime > 1100 && coins.length < 10) {
    spawnCoin();
    lastSpawnTime = millis();
  }

  // Move the grabbed coin with the cursor
  if (draggedCoin !== null) {
    draggedCoin.x = mouseX;
    draggedCoin.y = mouseY;

    // Open chest when the coin reaches its opening
    chestOpen = isCoinNearChest(draggedCoin);
  } else {
    chestOpen = false;
  }

  chestAnimation = lerp(
    chestAnimation,
    chestOpen ? 1 : 0,
    0.2
  );

  drawTreasureChest();

  // Move and draw every coin
  for (let i = coins.length - 1; i >= 0; i--) {
    let c = coins[i];

    // The grabbed coin follows the cursor instead
    if (c !== draggedCoin) {
      c.x += c.vx;
      c.y += c.vy;

      // Bounce off the play area's boundaries
      if (c.x < c.size / 2 || c.x > width - c.size / 2) {
        c.vx *= -1;
        c.x = constrain(c.x, c.size / 2, width - c.size / 2);
      }

      if (c.y < 90 || c.y > height - c.size / 2) {
        c.vy *= -1;
        c.y = constrain(c.y, 90, height - c.size / 2);
      }
    }

    drawCoin(c);
  }

  if (draggedCoin !== null) {
    fill(chestOpen ? color(120, 255, 160) : color(255));
    textAlign(CENTER, CENTER);
    textSize(16);
    text(
      chestOpen ? "Release to deposit!" : "Drag the coin to the chest",
      width / 2,
      height - 18
    );
  }
}

function drawCoinBackground() {
  noStroke();
  fill(42, 38, 78);
  rect(0, 75, width, height - 75);

  stroke(58, 53, 98);
  strokeWeight(1);

  for (let x = 0; x < width; x += 35) {
    line(x, 75, x, height);
  }

  for (let y = 75; y < height; y += 35) {
    line(0, y, width, y);
  }

  noStroke();
}

function spawnCoin() {
  let c = {
    x: random(35, width - 35),
    y: random(100, height - 40),
    size: random(38, 48),
    vx: random([-1, 1]) * random(0.7, 1.8),
    vy: random([-1, 1]) * random(0.5, 1.4)
  };

  // Avoid spawning a coin directly inside the chest
  if (dist(c.x, c.y, chest.x, chest.y) < 100) {
    c.x = random(40, 300);
    c.y = random(100, 300);
  }

  coins.push(c);
}

function drawCoin(c) {
  push();

  stroke(255, 220, 100);
  strokeWeight(3);
  fill(255, 190, 45);
  ellipse(c.x, c.y, c.size, c.size);

  stroke(255, 235, 140);
  strokeWeight(2);
  noFill();
  ellipse(c.x, c.y, c.size * 0.72, c.size * 0.72);

  noStroke();
  fill(140, 85, 20);
  textAlign(CENTER, CENTER);
  textSize(c.size * 0.52);
  text("$", c.x, c.y + 1);

  pop();
}

function drawTreasureChest() {
  push();
  rectMode(CENTER);

  // Glow when the chest is open
  if (chestAnimation > 0.1) {
    noStroke();
    fill(255, 210, 80, 55 * chestAnimation);
    ellipse(chest.x, chest.y + 5, 190, 140);
  }

  // Main chest body
  stroke(85, 45, 25);
  strokeWeight(3);
  fill(125, 67, 36);
  rect(chest.x, chest.y + 25, chest.w, 62, 10);

  // Wooden panels
  stroke(175, 105, 50);
  strokeWeight(2);
  line(chest.x - 45, chest.y + 5, chest.x - 45, chest.y + 53);
  line(chest.x + 45, chest.y + 5, chest.x + 45, chest.y + 53);

  // Dark opening
  noStroke();
  fill(35, 25, 40);
  rect(chest.x, chest.y + 2, chest.w - 15, 28, 5);

  // Coins already collected
  for (let i = 0; i < min(coinScore, 5); i++) {
    fill(255, 200, 45);
    stroke(255, 230, 120);
    strokeWeight(1);
    ellipse(
      chest.x - 45 + (i % 5) * 22,
      chest.y + 12,
      18,
      12
    );
  }

  // Animated lid
  let lidY = chest.y - 13 - chestAnimation * 25;

  push();
  translate(chest.x, lidY);
  rotate(-chestAnimation * 0.12);

  stroke(85, 45, 25);
  strokeWeight(3);
  fill(180, 105, 48);
  rect(0, 0, chest.w + 8, 30, 9);

  stroke(230, 160, 75);
  strokeWeight(2);
  line(-55, -4, 55, -4);

  pop();

  // Lock
  noStroke();
  fill(255, 215, 75);
  rect(chest.x, chest.y + 17, 20, 25, 4);

  fill(115, 75, 25);
  ellipse(chest.x, chest.y + 15, 7, 7);

  fill(255, 225, 145);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(chestOpen ? "OPEN!" : "TREASURE", chest.x, chest.y + 80);

  pop();
}

// Broad area that triggers the chest opening
function isCoinNearChest(c) {
  return (
    c.x > chest.x - chest.w / 2 - 15 &&
    c.x < chest.x + chest.w / 2 + 15 &&
    c.y > chest.y - 45 &&
    c.y < chest.y + chest.h / 2
  );
}

// Deposit area: must release within the chest's actual opening
function isCoinInsideChest(c) {
  return (
    c.x > chest.x - chest.w / 2 + 10 &&
    c.x < chest.x + chest.w / 2 - 10 &&
    c.y > chest.y - 30 &&
    c.y < chest.y + 12
  );
}

function moveChestToNewCorner() {
  let possibleCorners = [];

  for (let i = 0; i < chestCorners.length; i++) {
    if (i !== chestCorner) {
      possibleCorners.push(i);
    }
  }

  let nextCorner = random(possibleCorners);
  chestCorner = nextCorner;

  chest.x = chestCorners[nextCorner].x;
  chest.y = chestCorners[nextCorner].y;
}

function drawCoinStartScreen() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(39);
  text("COIN COLLECTOR", width / 2, 115);

  fill(255);
  textSize(19);
  text("Grab and drag coins into the treasure chest!", width / 2, 175);
  text("The chest moves after every deposit.", width / 2, 210);
  text("Collect as many as possible in 30 seconds.", width / 2, 245);

  drawButton("START", width / 2, 310);
  drawButton("MENU", width / 2, 375);
}

function drawCoinGameOver() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(38);
  text("TIME'S UP!", width / 2, 145);

  fill(255);
  textSize(25);
  text("Coins deposited: " + coinScore, width / 2, 200);

  // Store/Display Highscore
  if (coinScore > coinHighscore) {
    coinHighscore = coinScore;
    storeItem("coinHighscore", coinHighscore);
    fill(255, 220, 120);
    textSize(20);
    text("New highscore!", width / 2, 255);
  } else {
    fill(255);
    textSize(20);
    text("Highscore: " + coinHighscore, width / 2, 255);
  }

  textSize(17);
  text("Great work practicing your coordination!", width / 2, 230);

  drawButton("PLAY AGAIN", width / 2, 310);
  drawButton("EXIT", width / 2, 370);
}

// Called from mousePressed() in main.js while Coin Collector is showing
function coinMousePressed() {
  if (!coinGameStarted) {
    if (overButton(width / 2, 310)) {
      startCoinGame();
    } else if (overButton(width / 2, 375)) {
      coinExitToMenu();
    }
    return;
  }

  if (coinGameOver) {
    if (overButton(width / 2, 310)) {
      startCoinGame();
    } else if (overButton(width / 2, 370)) {
      coinExitToMenu();
    }
    return;
  }

  // Grab a coin
  for (let i = coins.length - 1; i >= 0; i--) {
    let c = coins[i];

    if (dist(mouseX, mouseY, c.x, c.y) < c.size / 2) {
      draggedCoin = c;

      // Draw grabbed coin on top
      coins.splice(i, 1);
      coins.push(draggedCoin);
      break;
    }
  }
}

// Called from mouseReleased() in main.js while Coin Collector is showing
function coinMouseReleased() {
  if (!coinGameStarted || coinGameOver || draggedCoin === null) {
    return;
  }

  if (isCoinInsideChest(draggedCoin)) {
    // Remove the coin completely so it is no longer visible
    let depositedCoin = draggedCoin;
    coins = coins.filter(c => c !== depositedCoin);
    draggedCoin = null;

    coinScore++;
    chestOpen = false;

    // Move chest after a successful deposit
    moveChestToNewCorner();
  } else {
    // Release outside the opening: coin returns to play
    draggedCoin.x = constrain(draggedCoin.x, 30, width - 30);
    draggedCoin.y = constrain(draggedCoin.y, 100, height - 35);
    draggedCoin = null;
    chestOpen = false;
  }
}

function startCoinGame() {
  coinScore = 0;
  coins = [];
  draggedCoin = null;
  chestOpen = false;
  chestAnimation = 0;
  coinStartTime = millis();
  lastSpawnTime = millis();
  coinGameStarted = true;
  coinGameOver = false;

  // Start chest at a random corner
  chestCorner = floor(random(chestCorners.length));
  chest.x = chestCorners[chestCorner].x;
  chest.y = chestCorners[chestCorner].y;

  // Start with several moving coins
  for (let i = 0; i < 5; i++) {
    spawnCoin();
  }
}

// Reset the game and go back to the main menu
function coinExitToMenu() {
  coinGameStarted = false;
  coinGameOver = false;
  coins = [];
  draggedCoin = null;
  coinScore = 0;
  currentScreen = "menu";
}
