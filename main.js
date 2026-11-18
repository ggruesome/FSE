const PROGRESS_STORAGE_KEY = "arcadeResults";
const PROGRESS_TOTAL_KEY = "arcadeRoundsPlayed";
const PROGRESS_GAME_COUNTS_KEY = "arcadeGameCounts";
let currentScreen = "menu";
let buttonImg;
let gameMusic;
let highscoreSound;
let clickSound;
let mouseOverButton = false;

// Hover animation state for the menu card icons
let menuHovered = { balloon: false, flower: false, coin: false };
let balloonPopStart = -1000;
let balloonInflateStart = -1000;
let flowerBloom = 0;
let flowerSpin = 0;
let coinSpin = 0;

function preload() {
  buttonImg = loadImage(MEDIA_FOLDER + "/button.png");
  gameMusic = loadSound(MEDIA_FOLDER + "/Audio/GameMusicLoop.mp3");
  highscoreSound = loadSound(MEDIA_FOLDER + "/Audio/Highscore.mp3");
  clickSound = loadSound(MEDIA_FOLDER + "/Audio/click.wav");

  // Volume from 0 (silent) to 1 (full)
  gameMusic.setVolume(0.2);
  highscoreSound.setVolume(0.4);
  clickSound.setVolume(0.4);
  balloonPreload();
  coinPreload();
  flowerPreload();
}

function setup() {
  createCanvas(700, 450);
  textFont("Arial");
  balloonSetup();
  flowerSetup();
}

function draw() {
  background(30, 27, 60);
  updateMusic();
  mouseOverButton = false;

  if (currentScreen === "menu") {
    drawMenu();
  } else if (currentScreen === "balloonpop") {
    balloonDraw();
  } else if (currentScreen === "flowergarden") {
    flowerDraw();
  } else if (currentScreen === "coincollector") {
    coinDraw();
  }
}

function drawMenu() {
  drawMenuBackground();

  fill(255, 224, 142);
  noStroke();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(27);
  text("Fine Motor Rehabilitation Arcade", width / 2, 45);

  fill(192, 199, 236);
  textStyle(NORMAL);
  textSize(12);
  text("PICK YOUR NEXT CHALLENGE", width / 2, 85);

  drawButton("PROGRESS", width - 72, 105, color(104, 100, 212), 112, 30);

  drawMenuCard(120, "BALLOON POP", "POP • DODGE • SCORE", balloonHighscore, color(54, 185, 255), "balloon");
  drawMenuCard(350, "FLOWER GARDEN", "GROW YOUR GARDEN", flowerHighscore, color(255, 183, 74), "flower");
  drawMenuCard(580, "COIN COLLECTOR", "GRAB • DRAG • DEPOSIT", coinHighscore, color(54, 218, 173), "coin");

  fill(147, 156, 199);
  textSize(10);
  text("THREE GAMES  •  PERSONAL BESTS SAVED", width / 2, 432);
}

function drawMenuBackground() {
  for (let y = 0; y < height; y += 15) {
    let blend = map(y, 0, height, 0, 1);
    noStroke();
    fill(lerpColor(color(24, 27, 60), color(39, 31, 78), blend));
    rect(0, y, width, 15);
  }

  noStroke();
  fill(104, 89, 190, 18);
  ellipse(90, 70, 260, 200);
  fill(45, 193, 221, 12);
  ellipse(width - 50, height - 20, 270, 200);

  for (let i = 0; i < 32; i++) {
    let x = (i * 173 + frameCount * 0.08) % width;
    let y = (i * 79 + sin(frameCount * 0.018 + i) * 9 + height) % height;
    let glow = 50 + 70 * (0.5 + 0.5 * sin(frameCount * 0.04 + i));
    fill(193, 211, 255, glow);
    circle(x, y, i % 4 === 0 ? 3 : 2);
  }
}

function drawSpaceBackground(accent) {
  for (let y = 0; y < height; y += 15) {
    let blend = map(y, 0, height, 0, 1);
    noStroke();
    fill(lerpColor(color(8, 12, 32), color(24, 23, 58), blend));
    rect(0, y, width, 15);
  }

  noStroke();
  fill(accent.levels[0], accent.levels[1], accent.levels[2], 22);
  ellipse(105, 85, 270, 230);
  fill(103, 91, 188, 18);
  ellipse(width - 55, height - 20, 280, 190);

  push();
  noFill();
  stroke(accent.levels[0], accent.levels[1], accent.levels[2], 42);
  strokeWeight(1);
  ellipse(width - 22, 75, 180, 52);
  ellipse(width - 22, 75, 150, 43);
  noStroke();
  fill(accent.levels[0], accent.levels[1], accent.levels[2], 18);
  circle(width - 22, 75, 66);
  pop();

  for (let i = 0; i < 36; i++) {
    let x = (i * 149 + frameCount * 0.06) % width;
    let y = (i * 83 + sin(frameCount * 0.02 + i) * 7 + height) % height;
    let glow = 55 + 90 * (0.5 + 0.5 * sin(frameCount * 0.045 + i));
    fill(205, 218, 255, glow);
    circle(x, y, i % 5 === 0 ? 3 : 2);
  }
}

function drawGameIntroPanel(accent) {
  push();
  rectMode(CENTER);
  noStroke();
  fill(5, 8, 25, 115);
  rect(width / 2, 215, 530, 130, 20);
  fill(25, 31, 66, 225);
  stroke(accent.levels[0], accent.levels[1], accent.levels[2], 115);
  strokeWeight(1.5);
  rect(width / 2, 211, 530, 130, 20);
  noStroke();
  fill(accent);
  rect(96, 211, 4, 88, 2);
  pop();
}

function drawMenuCard(x, title, subtitle, highscore, accent, icon) {
  const y = 270;
  const cardWidth = 202;
  const cardHeight = 258;
  const hovered = overButton(x, y, cardWidth, cardHeight);

  if (hovered) {
    mouseOverButton = true;
  }

  push();
  rectMode(CENTER);
  noStroke();
  fill(8, 10, 28, 90);
  rect(x, y + 7, cardWidth, cardHeight, 19);

  fill(hovered ? color(55, 59, 105) : color(36, 40, 79));
  stroke(hovered ? color(255, 255, 255, 150) : color(accent.levels[0], accent.levels[1], accent.levels[2], 100));
  strokeWeight(hovered ? 2 : 1);
  rect(x, hovered ? y - 3 : y, cardWidth, cardHeight, 19);

  noStroke();
  fill(accent);
  rect(x, hovered ? y - 123 : y - 126, cardWidth - 26, 5, 3);

  updateMenuHover(icon, hovered);
  drawMenuIcon(icon, x, (hovered ? y - 3 : y) - 72, accent);

  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(title === "FLOWER GARDEN" ? 14 : 16);
  text(title, x, (hovered ? y - 3 : y) - 26);

  fill(184, 193, 225);
  textStyle(NORMAL);
  textSize(9);
  text(subtitle, x, (hovered ? y - 3 : y) - 4);

  fill(25, 29, 62);
  rect(x, (hovered ? y - 3 : y) + 35, 138, 27, 14);
  fill(accent);
  textStyle(BOLD);
  textSize(11);
  text("BEST  " + highscore, x, (hovered ? y - 3 : y) + 35);

  fill(hovered ? color(255) : accent);
  textSize(11);
  text("PLAY NOW  →", x, (hovered ? y - 3 : y) + 83);
  pop();
}

// Start or stop an icon's animation when the mouse enters or leaves its card
function updateMenuHover(icon, hovered) {
  if (hovered && !menuHovered[icon]) {
    if (icon === "balloon") {
      balloonPopStart = frameCount;
      popSound.play();
    }
  } else if (!hovered && menuHovered[icon]) {
    if (icon === "balloon") {
      balloonInflateStart = frameCount;
    }
  }
  menuHovered[icon] = hovered;
}

function drawMenuIcon(icon, x, y, accent) {
  push();
  if (icon === "balloon") {
    imageMode(CENTER);
    tint(accent);
    if (menuHovered.balloon) {
      // Play the pop gif once, then leave the spot empty. Same frame
      // offset and placement as the in-game pop (see balloonpop.js)
      let f = floor((frameCount - balloonPopStart + 3) / 2);
      if (f < popGif.numFrames()) {
        popGif.setFrame(f);
        let balloonY = y - 5 - 35 + 70 * 0.28;
        imageMode(CORNER);
        image(popGif, x - 35, balloonY - 35, 70, 70);
      }
    } else {
      // Grow back with a little overshoot after the mouse leaves
      let t = min(1, (frameCount - balloonInflateStart) / 15);
      let s = 1 + 2.7 * pow(t - 1, 3) + 1.7 * pow(t - 1, 2);
      image(balloonImg, x, y - 5 + 35 * (1 - s), 35 * s, 70 * s);
    }
    noTint();
    imageMode(CORNER);
  } else if (icon === "flower") {
    // Petals open up and twirl while hovered
    flowerBloom = lerp(flowerBloom, menuHovered.flower ? 1 : 0, 0.15);
    flowerSpin += flowerBloom * 0.05;

    stroke(105, 220, 143);
    strokeWeight(3);
    line(x, y + 12, x, y + 30);
    noStroke();
    fill(105, 220, 143);
    ellipse(x - 7, y + 20, 12, 6);
    ellipse(x + 7, y + 25, 12, 6);
    let petalDistance = 11 + flowerBloom * 3;
    let petalSize = 12 + flowerBloom * 3;
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI * i / 6 + flowerSpin;
      fill(accent);
      circle(x + cos(angle) * petalDistance, y + sin(angle) * petalDistance, petalSize);
    }
    fill(255, 225, 119);
    circle(x, y, 11 + flowerBloom * 2);
  } else {
    // Spin while hovered, then settle facing forward again
    if (menuHovered.coin) {
      coinSpin += 0.15;
    } else {
      coinSpin = lerp(coinSpin, round(coinSpin / PI) * PI, 0.2);
    }
    imageMode(CENTER);
    image(coinImg, x, y, max(2, 48 * abs(cos(coinSpin))), 48);
    imageMode(CORNER);
  }
  pop();
}

function recordGameResult(game, score) {
  const results = getItem(PROGRESS_STORAGE_KEY) || [];
  const gameCounts = getItem(PROGRESS_GAME_COUNTS_KEY) || {};
  results.push({ game, score, playedAt: new Date().toISOString() });
  storeItem(PROGRESS_STORAGE_KEY, results.slice(-100));
  storeItem(PROGRESS_TOTAL_KEY, (getItem(PROGRESS_TOTAL_KEY) || 0) + 1);
  gameCounts[game] = (gameCounts[game] || 0) + 1;
  storeItem(PROGRESS_GAME_COUNTS_KEY, gameCounts);
}

// True while one of the games is actually being played (not on a start, game over or quit screen)
function isGameActive() {
  if (currentScreen === "balloonpop") {
    return gameStarted && !gameOver && !confirmQuit;
  } else if (currentScreen === "flowergarden") {
    return gardenStarted && !gardenOver && !gardenConfirmQuit;
  } else if (currentScreen === "coincollector") {
    return coinGameStarted && !coinGameOver && !coinConfirmQuit;
  }
  return false;
}

// Loop the game music during gameplay and stop it everywhere else
function updateMusic() {
  if (isGameActive()) {
    if (!gameMusic.isPlaying()) {
      gameMusic.loop();
    }
  } else if (gameMusic.isPlaying()) {
    gameMusic.stop();
  }
}

// Play the highscore jingle (called by each game when a new highscore is set)
function playHighscoreSound() {
  highscoreSound.play();
}

// True if the mouse is over a button drawn by drawButton at (x, y)
function overButton(x, y, w = 220, h = 50) {
  return mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
}

// Draws the tinted button image; w and h are the clickable size
function drawButton(label, x, y, col, w = 220, h = 50) {
  imageMode(CENTER);
  noStroke();

  // Lighten the tint when the mouse is over it
  if (overButton(x, y, w, h)) {
    mouseOverButton = true;
    tint(lerpColor(col, color(255), 0.25));
  } else {
    tint(col);
  }
  image(buttonImg, x, y + 3, w + 20, h + 12);
  noTint();

  // Outlined text so it stays readable on light colors
  stroke(0, 90);
  strokeWeight(3);
  fill(255);
  textSize(h * 0.4);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  noStroke();

  imageMode(CORNER);
}

function mousePressed() {
  // Browsers block audio until the user clicks, so unlock it here
  userStartAudio();

  // Click sound for any button drawn this frame that the mouse is over
  if (mouseOverButton) {
    clickSound.play();
  }

  if (currentScreen === "balloonpop") {
    balloonMousePressed();
    return;
  }

  if (currentScreen === "coincollector") {
    coinMousePressed();
    return;
  }

  if (currentScreen === "flowergarden") {
    flowerMousePressed();
    return;
  }

  if (currentScreen === "menu") {
    if (overButton(width - 72, 105, 112, 30)) {
      window.location.href = "progress.html";
    } else if (overButton(120, 270, 202, 258)) {
      currentScreen = "balloonpop";
    } else if (overButton(350, 270, 202, 258)) {
      currentScreen = "flowergarden";
    } else if (overButton(580, 270, 202, 258)) {
      currentScreen = "coincollector";
    }
    return;
  }
}

function mouseReleased() {
  if (currentScreen === "coincollector") {
    coinMouseReleased();
  } else if (currentScreen === "flowergarden") {
    flowerMouseReleased();
  }
}

function keyPressed() {
  if (currentScreen === "balloonpop") {
    balloonKeyPressed();
  } else if (currentScreen === "coincollector") {
    coinKeyPressed();
  } else if (currentScreen === "flowergarden") {
    flowerKeyPressed();
  }
}
