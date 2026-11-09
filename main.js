const MEDIA_FOLDER = 'media';
let currentScreen = "menu";
let buttonImg;
let gameMusic;
let highscoreSound;
let clickSound;
let mouseOverButton = false;

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
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(44);
  stroke("black");
  strokeWeight(3);
  text("F.M.R. ARCADE", width / 2, 80);

  fill(255);
  textSize(20);
  text("Pick a game to play!", width / 2, 130);

  drawButton("BALLOON POP", width / 2, 190, color(40, 160, 230));

  drawButton("FLOWER GARDEN", width / 2, 285, color(250, 175, 40));

  drawButton("COIN COLLECTOR", width / 2, 380, color(30, 170, 150));

  //HighScores
    //Balloon Pop
  fill(255);
  textSize(16);
  text("Highscore: " + balloonHighscore, width / 2, 238);
    //Flower Garden
  fill(255);
  textSize(16);
  text("Highscore: " + flowerHighscore, width / 2, 333);
    //Coin Collector
  fill(255);
  textSize(16);
  text("Highscore: " + coinHighscore, width / 2, 428);
}

// True while one of the games is actually being played (not on a start, game over or quit screen)
function isGameActive() {
  if (currentScreen === "balloonpop") {
    return gameStarted && !gameOver && !confirmQuit;
  } else if (currentScreen === "flowergarden") {
    return gardenStarted && !gardenOver;
  } else if (currentScreen === "coincollector") {
    return coinGameStarted && !coinGameOver;
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
    if (overButton(width / 2, 190)) {
      currentScreen = "balloonpop";
    } else if (overButton(width / 2, 285)) {
      currentScreen = "flowergarden";
    } else if (overButton(width / 2, 380)) {
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
  }
}
