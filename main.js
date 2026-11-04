let currentScreen = "menu";
let buttonImg;

function preload() {
  buttonImg = loadImage(MEDIA_FOLDER + "/button.png");
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
