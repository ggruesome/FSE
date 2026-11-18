let coins = [];
let coinScore = 0;
let coinStartTime = 0;
let coinGameStarted = false;
let coinGameOver = false;
let coinConfirmQuit = false;
let coinPauseStart = 0;
let coinGameDuration = 30;

let draggedCoin = null;
let chestOpen = false;
let chestAnimation = 0;
let lastSpawnTime = 0;
let chestCorner = 0;

let coinHighscore;
let coinImg;
let chestSheet;

// chest_sheet.png holds 6 square frames, closed (0) to fully open (5)
const CHEST_FRAMES = 6;

const chest = {
  x: 590,
  y: 345,
  w: 120,
  h: 120
};

const chestCorners = [
  { x: 115, y: 150 },
  { x: 585, y: 150 },
  { x: 115, y: 350 },
  { x: 585, y: 350 }
];

function coinPreload() {
  coinImg = loadImage(MEDIA_FOLDER + "/coin.png");
  chestSheet = loadImage(MEDIA_FOLDER + "/chest_sheet.png");

  // Highscores
  coinHighscore = getItem("coinHighscore");
  if (coinHighscore === null) {
    coinHighscore = 0;
  }
}

function coinDraw() {
  if (!coinGameStarted || coinGameOver || coinConfirmQuit) {
    drawSpaceBackground(color(69, 220, 184));
  } else {
    drawCoinBackground();
  }

  if (!coinGameStarted) {
    drawCoinStartScreen();
    return;
  }

  if (coinGameOver) {
    drawCoinGameOver();
    return;
  }

  if (coinConfirmQuit) {
    drawConfirmQuit(color(30, 170, 150));
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
    recordGameResult("coincollector", coinScore);
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
    0.35
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
  imageMode(CENTER);
  image(coinImg, c.x, c.y, c.size, c.size);
  pop();
}

function drawTreasureChest() {
  push();
  rectMode(CENTER);

  // Glow when the chest is open
  if (chestAnimation > 0.1) {
    noStroke();
    fill(255, 210, 80, 55 * chestAnimation);
    ellipse(chest.x, chest.y, 170, 150);
  }

  // Pick a frame of the sprite sheet based on how open the chest is
  let frame = round(chestAnimation * (CHEST_FRAMES - 1));
  drawChestFrame(frame, chest.x, chest.y + chest.h / 2, chest.w);

  // Coins already collected peek out once the lid is open
  // Only the top half shows, so the coins look like they sit inside
  if (frame >= CHEST_FRAMES - 2) {
    imageMode(CORNER);
    for (let i = 0; i < min(coinScore, 5); i++) {
      image(
        coinImg,
        chest.x - 41 + (i % 5) * 18, chest.y + 5, 16, 8,
        0, 0, coinImg.width, coinImg.height / 2
      );
    }
  }

  fill(255, 225, 145);
  textAlign(CENTER, CENTER);
  textSize(12);
  text(chestOpen ? "OPEN!" : "TREASURE", chest.x, chest.y + 75);

  pop();
}

// Draw one frame of the chest sprite, centered on x with its base at y
function drawChestFrame(frame, x, y, size) {
  let fw = chestSheet.width / CHEST_FRAMES;
  push();
  imageMode(CORNER);
  image(chestSheet, x - size / 2, y - size, size, size, frame * fw, 0, fw, chestSheet.height);
  pop();
}

// Broad area that triggers the chest opening
function isCoinNearChest(c) {
  return (
    c.x > chest.x - chest.w / 2 - 15 &&
    c.x < chest.x + chest.w / 2 + 15 &&
    c.y > chest.y - chest.h / 2 - 15 &&
    c.y < chest.y + chest.h / 2
  );
}

// Deposit area: must release within the chest's actual opening
function isCoinInsideChest(c) {
  return (
    c.x > chest.x - chest.w / 2 &&
    c.x < chest.x + chest.w / 2 &&
    c.y > chest.y - 60 &&
    c.y < chest.y + 15
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
  drawGameIntroPanel(color(69, 220, 184));
  drawCoinStartArtwork(183, 210);

  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(34);
  text("COIN COLLECTOR", width / 2, 84);

  fill(155, 255, 226);
  textSize(10);
  text("MISSION 03  •  TREASURE RUN", 415, 174);
  fill(255);
  textSize(16);
  text("Recover the cosmic treasure.", 415, 201);
  fill(194, 203, 229);
  textStyle(NORMAL);
  textSize(11);
  text("Drag coins into the chest. It moves", 415, 226);
  text("after every deposit. You have 30 seconds.", 415, 244);

  drawButton("START", width / 2, 310, color(30, 170, 150));
  drawButton("MENU", width / 2, 375, color(30, 170, 150));
}

function drawCoinStartArtwork(x, y) {
  push();
  noFill();
  stroke(255, 210, 105, 90);
  strokeWeight(1);
  ellipse(x, y, 132, 82);
  ellipse(x, y, 112, 70);

  drawCoin({ x: x - 43, y: y - 28, size: 25 });
  drawCoin({ x: x + 47, y: y - 25, size: 22 });

  drawChestFrame(0, x, y + 40, 90);
  pop();
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
    playHighscoreSound();
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

  drawButton("PLAY AGAIN", width / 2, 310, color(30, 170, 150));
  drawButton("EXIT", width / 2, 370, color(30, 170, 150));
}

// Called from mousePressed() in main.js while Coin Collector is showing
function coinMousePressed() {
  if (coinConfirmQuit) {
    if (overButton(width / 2 - 125, 290)) {
      quitCoinGame();
    } else if (overButton(width / 2 + 125, 290)) {
      resumeCoinGame();
    }
    return;
  }

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
  if (!coinGameStarted || coinGameOver || coinConfirmQuit || draggedCoin === null) {
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
  coinConfirmQuit = false;

  // Start chest at a random corner
  chestCorner = floor(random(chestCorners.length));
  chest.x = chestCorners[chestCorner].x;
  chest.y = chestCorners[chestCorner].y;

  // Start with several moving coins
  for (let i = 0; i < 5; i++) {
    spawnCoin();
  }
}

// Called from keyPressed() in main.js while Coin Collector is showing
function coinKeyPressed() {
  // Esc only does something while a game is being played
  if (keyCode !== ESCAPE || !coinGameStarted || coinGameOver) {
    return;
  }

  if (coinConfirmQuit) {
    resumeCoinGame();
  } else {
    coinConfirmQuit = true;
    coinPauseStart = millis();
    draggedCoin = null;
    chestOpen = false;
  }
}

function resumeCoinGame() {
  // Push the timers forward so the paused time doesn't count
  coinStartTime += millis() - coinPauseStart;
  lastSpawnTime += millis() - coinPauseStart;
  coinConfirmQuit = false;
}

function quitCoinGame() {
  coinConfirmQuit = false;
  coinGameStarted = false;
  coins = [];
  draggedCoin = null;
  coinScore = 0;
}

// Reset the game and go back to the main menu
function coinExitToMenu() {
  quitCoinGame();
  coinGameOver = false;
  currentScreen = "menu";
}
