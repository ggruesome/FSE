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
}

function draw() {
  background(30, 27, 60);

  if (currentScreen === "menu") {
    drawMenu();
  } else if (currentScreen === "balloonpop") {
    balloonDraw();
  } else if (currentScreen === "flowergarden") {
    drawGameScreen("FLOWER GARDEN");
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

// Placeholder screen
function drawGameScreen(title) {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(40);
  text(title, width / 2, 160);

  fill(255);
  textSize(20);
  text("Coming soon!", width / 2, 215);

  drawButton("BACK", width / 2, 310);
}

// True if the mouse is over a button drawn by drawButton at (x, y)
function overButton(x, y) {
  return mouseX > x - 110 && mouseX < x + 110 && mouseY > y - 25 && mouseY < y + 25;
}

// Pass a color to draw the tinted button image instead of a plain rectangle
function drawButton(label, x, y, col) {
  rectMode(CENTER);
  imageMode(CENTER);
  noStroke();

  if (col) {
    // Lighten the tint when the mouse is over it
    if (overButton(x, y)) {
      tint(lerpColor(col, color(255), 0.25));
    } else {
      tint(col);
    }
    image(buttonImg, x, y + 3, 240, 62);
    noTint();

    // Outlined text so it stays readable on light colors
    stroke(0, 90);
    strokeWeight(3);
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(label, x, y);
    noStroke();
  } else {
    // Lighten the button when the mouse is over it
    if (overButton(x, y)) {
      fill(255, 120, 155);
    } else {
      fill(245, 90, 130);
    }
    rect(x, y, 220, 50, 10);

    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(label, x, y);
  }

  rectMode(CORNER);
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

  if (overButton(width / 2, 310)) {
    currentScreen = "menu";
  }
}

function mouseReleased() {
  if (currentScreen === "coincollector") {
    coinMouseReleased();
  }
}

function keyPressed() {
  if (currentScreen === "balloonpop") {
    balloonKeyPressed();
  }
}
