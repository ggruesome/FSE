
let gardenPlants = [];
let gardenScore = 0;
let gardenStartTime = 0;
let gardenStarted = false;
let gardenOver = false;
let gardenDuration = 90;

let flowerHighscore;
let gardenNewHighscore = false;

let draggedTool = null;
let waterCanFilled = false;
let gardenMessage = "Drag tools onto your plants to care for them!";

let wateringCanImg;
let wateringCanFullImg;
let shovelImg;
let fertilizerImg;

const toolList = [
  { id: "water", label: "Watering Can", color: [65, 155, 245] },
  { id: "weed", label: "Shovel", color: [90, 175, 100] },
  { id: "fertilize", label: "Fertilizer", color: [180, 115, 225] },
  { id: "health", label: "Magnifier", color: [245, 180, 65] }
];

const plotX = [255, 380, 505];
const plotY = [140, 235, 330];

const waterBarrel = {
  x: 625,
  y: 125,
  w: 75,
  h: 90
};

function flowerPreload() {
    // Tool images
    wateringCanImg = loadImage(MEDIA_FOLDER + "/WateringCan.png");
    wateringCanFullImg = loadImage(MEDIA_FOLDER + "/WateringCanFull.png");
    shovelImg = loadImage(MEDIA_FOLDER + "/shovel.png");
    fertilizerImg = loadImage(MEDIA_FOLDER + "/fertilizer.png");

    // Highscore
    flowerHighscore = getItem("flowerHighscore");
    if (flowerHighscore === null) {
      flowerHighscore = 0;
    }
}

function flowerSetup() {
  // fertilizer.png has a white background, so crop it and make the outside clear
  fertilizerImg = fertilizerImg.get(175, 120, 675, 785);
  clearWhiteEdges(fertilizerImg);
  resetGarden();
}

// Turns white pixels touching the image edges transparent, scanning in from each side
function clearWhiteEdges(img) {
  img.loadPixels();
  let w = img.width;
  let h = img.height;

  function clearIfWhite(x, y) {
    let i = 4 * (y * w + x);
    let p = img.pixels;
    if (p[i] > 235 && p[i + 1] > 235 && p[i + 2] > 235) {
      p[i + 3] = 0;
      return true;
    }
    return false;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w && clearIfWhite(x, y); x++) {}
    for (let x = w - 1; x >= 0 && clearIfWhite(x, y); x--) {}
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h && clearIfWhite(x, y); y++) {}
    for (let y = h - 1; y >= 0 && clearIfWhite(x, y); y--) {}
  }

  img.updatePixels();
}

// Draws an image centered at x, y, scaled to fit inside maxW x maxH
function drawToolImage(img, x, y, maxW, maxH) {
  let s = min(maxW / img.width, maxH / img.height);
  imageMode(CENTER);
  image(img, x, y, img.width * s, img.height * s);
}

function flowerDraw() {
  background(30, 27, 60);

  if (!gardenStarted) {
    drawGardenStartScreen();
    return;
  }

  if (gardenOver) {
    drawGardenGameOver();
    return;
  }

  let timeLeft = max(
    0,
    gardenDuration - floor((millis() - gardenStartTime) / 1000)
  );

  if (timeLeft <= 0) {
    gardenOver = true;
    draggedTool = null;

    // Store Highscore
    gardenNewHighscore = gardenScore > flowerHighscore;
    if (gardenNewHighscore) {
      flowerHighscore = gardenScore;
      storeItem("flowerHighscore", flowerHighscore);
    }
    return;
  }

  drawGardenBackground();
  drawGardenHUD(timeLeft);
  drawWaterBarrel();
  drawToolShelf();
  drawGardenPlots();
  drawGardenMessage();
  drawGardenMenuButton();

  // Draw the tool being dragged last, so it stays visible
  if (draggedTool !== null) {
    drawTool(
      draggedTool.id,
      mouseX,
      mouseY,
      draggedTool.id === "water" && waterCanFilled
    );

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(12);

    if (draggedTool.id === "water" && !waterCanFilled) {
      text("Drag to barrel to fill", mouseX, mouseY + 42);
    } else {
      text("Release over a plot", mouseX, mouseY + 42);
    }
  }
}

function resetGarden() {
  gardenPlants = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      gardenPlants.push({
        x: plotX[col],
        y: plotY[row],
        plantType: floor(random(3)),
        health: floor(random(45, 85)),
        water: random(25, 75),
        growth: random(0.4, 0.8),
        weed: random() < 0.4
      });
    }
  }
}

function drawGardenBackground() {
  noStroke();
  fill(65, 125, 65);
  rect(0, 0, width, height);

  // Grass details
  for (let i = 0; i < 75; i++) {
    let x = (i * 97) % width;
    let y = (i * 61) % height;

    stroke(80, 145, 75);
    strokeWeight(2);
    line(x, y, x + 4, y - 6);
  }

  noStroke();

  // Garden fence
  fill(120, 75, 45);
  rect(180, 62, 390, 10);

  for (let x = 190; x < 570; x += 63) {
    rect(x, 50, 10, 30, 4);
  }

  drawFlower(190, 388, color(255, 220, 100));
  drawFlower(615, 380, color(255, 150, 180));
}

function drawFlower(x, y, petalColor) {
  noStroke();
  fill(55, 110, 45);
  rect(x - 2, y, 4, 15);

  fill(petalColor);
  for (let i = 0; i < 5; i++) {
    let angle = TWO_PI * i / 5;
    ellipse(
      x + cos(angle) * 7,
      y + sin(angle) * 7,
      9,
      9
    );
  }

  fill(255, 220, 80);
  ellipse(x, y, 8, 8);
}

function drawGardenHUD(timeLeft) {
  fill(255, 220, 120);
  textAlign(LEFT, CENTER);
  textSize(22);
  text("Score: " + gardenScore, 18, 25);

  fill(255);
  textSize(14);
  text("Highscore: " + flowerHighscore, 18, 45);

  fill(255, 220, 120);
  textSize(22);

  textAlign(RIGHT, CENTER);
  text("Time: " + timeLeft, width - 18, 25);
}

function drawToolShelf() {
  fill(35, 32, 70);
  noStroke();
  rect(10, 55, 140, 350, 15);

  fill(255, 225, 145);
  textAlign(CENTER, CENTER);
  textSize(15);
  text("DRAG A TOOL", 80, 72);

  for (let i = 0; i < toolList.length; i++) {
    let tool = toolList[i];
    let x = 80;
    let y = 115 + i * 76;

    fill(tool.color[0], tool.color[1], tool.color[2]);
    stroke(230);
    strokeWeight(1);
    rect(x - 60, y - 30, 120, 65, 10);

    drawTool(
      tool.id,
      x,
      y - 5,
      tool.id === "water" && waterCanFilled
    );

    noStroke();
    fill(255);
    textSize(12);
    text(tool.label, x, y + 20);
  }

  fill(255, 235, 180);
  textSize(11);
  text("Drag tools to plots", 80, 392);
}

function drawTool(id, x, y, filled) {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  if (id === "water") {
    drawToolImage(filled ? wateringCanFullImg : wateringCanImg, x, y, 48, 36);
  }

  if (id === "weed") {
    drawToolImage(shovelImg, x, y, 44, 42);
  }

  if (id === "fertilize") {
    drawToolImage(fertilizerImg, x, y, 40, 36);
  }

  if (id === "health") {
    // Magnifying glass
    stroke(65, 65, 85);
    strokeWeight(5);
    line(x + 7, y + 7, x + 18, y + 18);

    fill(100, 205, 255);
    stroke(220);
    strokeWeight(2);
    ellipse(x - 3, y - 3, 26, 26);

    noStroke();
    fill(220, 250, 255, 180);
    ellipse(x - 8, y - 8, 7, 7);
  }

  pop();
}

function drawWaterBarrel() {
  // Platform
  noStroke();
  fill(120, 75, 45);
  rect(waterBarrel.x - 40, waterBarrel.y + 38, 80, 12, 4);

  // Barrel body
  fill(40, 105, 190);
  stroke(25, 60, 115);
  strokeWeight(3);
  rect(
    waterBarrel.x - 28,
    waterBarrel.y - 12,
    56,
    62,
    10
  );

  // Barrel opening
  fill(30, 70, 130);
  ellipse(waterBarrel.x, waterBarrel.y - 12, 56, 20);

  fill(65, 165, 235);
  ellipse(waterBarrel.x, waterBarrel.y - 12, 42, 12);

  noStroke();
  fill(255, 225, 145);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("WATER", waterBarrel.x, waterBarrel.y + 62);

  if (!waterCanFilled) {
    fill(150, 225, 255);
    textSize(11);
    text("Fill can here", waterBarrel.x, waterBarrel.y + 77);
  }
}

function drawGardenPlots() {
  for (let p of gardenPlants) {
    // Soil
    noStroke();
    fill(100, 60, 40);
    rect(p.x - 53, p.y - 29, 106, 60, 10);

    fill(125, 80, 50);
    for (let j = 0; j < 5; j++) {
      ellipse(
        p.x - 40 + j * 18,
        p.y + 20 + (j % 2) * 4,
        4,
        4
      );
    }

    // Health bar
    fill(25, 35, 30);
    rect(p.x - 30, p.y - 43, 60, 7, 4);

    if (p.health > 65) {
      fill(80, 230, 100);
    } else if (p.health > 35) {
      fill(255, 200, 65);
    } else {
      fill(245, 85, 90);
    }

    rect(
      p.x - 30,
      p.y - 43,
      60 * constrain(p.health / 100, 0, 1),
      7,
      4
    );

    drawPlant(p);

    if (p.weed) {
      drawWeed(p.x + 34, p.y + 5);
    }

    // Show a water warning when a plant is thirsty
    if (p.water < 30) {
      fill(100, 210, 255);
      textSize(13);
      text("!", p.x - 38, p.y - 15);
    }
  }
}

function drawPlant(p) {
  let plantSize = 20 + p.growth * 18;

  stroke(40, 95, 40);
  strokeWeight(4);
  line(p.x, p.y + 18, p.x, p.y - 5);

  noStroke();

  if (p.health < 25) {
    fill(150, 125, 70);
  } else {
    fill(65, 140 + p.health * 0.5, 55);
  }

  ellipse(p.x - 10, p.y + 3, plantSize, plantSize * 0.6);
  ellipse(p.x + 10, p.y - 5, plantSize, plantSize * 0.6);

  if (p.plantType === 0) {
    fill(240, 85, 75);
    ellipse(p.x, p.y - 12, 17, 17);
  } else if (p.plantType === 1) {
    fill(255, 210, 65);
    ellipse(p.x, p.y - 15, 15, 15);
  } else {
    fill(185, 120, 245);
    ellipse(p.x, p.y - 15, 14, 14);
  }
}

function drawWeed(x, y) {
  stroke(35, 90, 35);
  strokeWeight(3);
  line(x, y + 10, x, y - 5);
  line(x, y + 5, x - 8, y - 2);
  line(x, y + 5, x + 8, y - 4);

  noStroke();
  fill(90, 170, 65);
  ellipse(x - 8, y - 2, 10, 6);
  ellipse(x + 8, y - 4, 10, 6);
  ellipse(x, y - 5, 8, 12);
}

function drawGardenMessage() {
  noStroke();
  fill(25, 25, 55, 230);
  rect(165, 415, 445, 28, 8);

  fill(255, 240, 180);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(gardenMessage, 387, 429);
}

// Small button in the corner to leave mid-game
function drawGardenMenuButton() {
  drawButton("MENU", 655, 429, color(250, 175, 40), 70, 28);
}

function overGardenMenuButton() {
  return overButton(655, 429, 70, 28);
}

function drawGardenStartScreen() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("GROW GARDEN", width / 2, 140);

  fill(255);
  textSize(19);
  text("Fill your watering can, then drag it to a plant.", width / 2, 205);
  text("Use tools to remove weeds, fertilize, and inspect.", width / 2, 240);

  drawButton("START GARDENING", width / 2, 310, color(250, 175, 40));
  drawButton("MENU", width / 2, 375, color(250, 175, 40));
}

function drawGardenGameOver() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(38);
  text("GARDEN TIME'S UP!", width / 2, 130);

  fill(255);
  textSize(25);
  text("Care score: " + gardenScore, width / 2, 185);

  // Display Highscore
  if (gardenNewHighscore) {
    fill(255, 220, 120);
    textSize(20);
    text("New highscore!", width / 2, 222);
  } else {
    fill(255);
    textSize(20);
    text("Highscore: " + flowerHighscore, width / 2, 222);
  }

  fill(255);
  textSize(17);
  text("Every little bit of care helps your garden grow!", width / 2, 258);

  drawButton("PLAY AGAIN", width / 2, 310, color(250, 175, 40));
  drawButton("MENU", width / 2, 375, color(250, 175, 40));
}

function flowerMousePressed() {
  if (!gardenStarted || gardenOver) {
    if (overButton(width / 2, 310)) {
      startGardenGame();
    } else if (overButton(width / 2, 375)) {
      flowerExitToMenu();
    }
    return;
  }

  if (overGardenMenuButton()) {
    flowerExitToMenu();
    return;
  }

  // Start dragging a tool from the shelf
  for (let i = 0; i < toolList.length; i++) {
    let tool = toolList[i];
    let x = 80;
    let y = 115 + i * 76;

    if (
      mouseX > x - 60 &&
      mouseX < x + 60 &&
      mouseY > y - 30 &&
      mouseY < y + 35
    ) {
      draggedTool = { id: tool.id };
      return;
    }
  }
}

function flowerMouseReleased() {
  if (!gardenStarted || gardenOver || draggedTool === null) {
    draggedTool = null;
    return;
  }

  let tool = draggedTool.id;

  // Watering can: first fill it at the barrel
  if (tool === "water" && !waterCanFilled) {
    if (
      dist(mouseX, mouseY, waterBarrel.x, waterBarrel.y) < 65
    ) {
      waterCanFilled = true;
      gardenMessage = "Watering can filled! Now drag it to a plant.";
    } else {
      gardenMessage = "Take the empty watering can to the barrel first.";
    }

    draggedTool = null;
    return;
  }

  // Drop a tool onto a plant plot
  let targetPlant = null;

  for (let p of gardenPlants) {
    if (
      mouseX > p.x - 55 &&
      mouseX < p.x + 55 &&
      mouseY > p.y - 30 &&
      mouseY < p.y + 35
    ) {
      targetPlant = p;
      break;
    }
  }

  if (targetPlant === null) {
    gardenMessage = "Drop the tool directly onto a garden plot.";
    draggedTool = null;
    return;
  }

  careForPlant(targetPlant, tool);
  draggedTool = null;
}

function careForPlant(p, tool) {
  if (tool === "water") {
    if (!waterCanFilled) {
      gardenMessage = "Your watering can is empty. Refill it at the barrel!";
      return;
    }

    p.water = min(100, p.water + 40);
    p.health = min(100, p.health + 12);
    p.growth = min(1, p.growth + 0.08);

    waterCanFilled = false;
    gardenScore += 2;
    gardenMessage = "Water poured! Refill the can for another plant.";
  }

  if (tool === "weed") {
    if (p.weed) {
      p.weed = false;
      p.health = min(100, p.health + 15);
      gardenScore += 5;
      gardenMessage = "Weeds removed! Your plant can grow better.";
    } else {
      gardenMessage = "No weeds here. Try a plot with visible weeds.";
    }
  }

  if (tool === "fertilize") {
    p.growth = min(1, p.growth + 0.2);
    p.health = min(100, p.health + 8);
    gardenScore += 3;
    gardenMessage = "Fertilizer added! Your plant is growing.";
  }

  if (tool === "health") {
    gardenMessage =
      "Health: " + round(p.health) +
      "% | Water: " + round(p.water) + "%" +
      (p.weed ? " | Weeds present!" : " | No weeds.");
  }
}

function startGardenGame() {
  resetGarden();

  gardenScore = 0;
  waterCanFilled = false;
  draggedTool = null;
  gardenMessage = "Drag the watering can to the barrel to fill it!";
  gardenStartTime = millis();

  gardenStarted = true;
  gardenOver = false;
}

// Reset the game and go back to the main menu
function flowerExitToMenu() {
  gardenStarted = false;
  gardenOver = false;
  draggedTool = null;
  waterCanFilled = false;
  gardenScore = 0;
  currentScreen = "menu";
}
