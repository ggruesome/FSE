let currentScreen = "menu";

function preload() {
  balloonPreload();
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
    drawGameScreen("COIN COLLECTOR");
  }
}

function drawMenu() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(44);
  text("MAIN MENU", width / 2, 90);

  fill(255);
  textSize(20);
  text("Pick a game to play!", width / 2, 145);

  drawButton("BALLOON POP", width / 2, 220);
  drawButton("FLOWER GARDEN", width / 2, 290);
  drawButton("COIN COLLECTOR", width / 2, 360);
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

function drawButton(label, x, y) {
  rectMode(CENTER);
  noStroke();

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

  rectMode(CORNER);
}

function mousePressed() {
  if (currentScreen === "balloonpop") {
    balloonMousePressed();
    return;
  }

  if (currentScreen === "menu") {
    if (overButton(width / 2, 220)) {
      currentScreen = "balloonpop";
    } else if (overButton(width / 2, 290)) {
      currentScreen = "flowergarden";
    } else if (overButton(width / 2, 360)) {
      currentScreen = "coincollector";
    }
    return;
  }

  if (overButton(width / 2, 310)) {
    currentScreen = "menu";
  }
}

function keyPressed() {
  if (currentScreen === "balloonpop") {
    balloonKeyPressed();
  }
}
