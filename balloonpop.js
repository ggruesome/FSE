
let balloons = [];
let score = 0;
let startTime = 0;
let gameStarted = false;
let gameOver = false;
let gameDuration = 30;
let popSound;
let balloonImg;

function preload() {
  popSound = loadSound(MEDIA_FOLDER + "/pop.mp3");
  balloonImg = loadImage(MEDIA_FOLDER + "/balloon.png");
}

function setup() {
  createCanvas(700, 450);
  textFont("Arial");

  // Shrink the huge image once so drawing it every frame stays fast
  balloonImg.resize(130, 0);

  // Turn the red balloon white (keeping its shading) so tint() can color it.
  // Draw it through a grayscale + brighten filter, then keep the result.
  let g = createGraphics(balloonImg.width, balloonImg.height);
  g.drawingContext.filter = "grayscale(100%) brightness(300%)";
  g.image(balloonImg, 0, 0);
  balloonImg = g.get();
  g.remove();
}

function draw() {
  background(30, 27, 60);

  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  let timeLeft = max(
    0,
    gameDuration - floor((millis() - startTime) / 1000)
  );

  if (timeLeft === 0) {
    gameOver = true;
    return;
  }

  // Display score and timer
  fill(255, 220, 120);
  textSize(22);
  textAlign(LEFT, CENTER);
  text("Score: " + score, 20, 25);

  textAlign(RIGHT, CENTER);
  text("Time: " + timeLeft, width - 20, 25);

  // Add balloons
  if (frameCount % 35 === 0 && balloons.length < 10) {
    balloons.push({
      x: random(50, width - 50),
      y: height + 30,
      size: random(45, 65),
      speed: random(0.7, 1.5),
      shade: color(
        random(100, 255),
        random(100, 220),
        random(150, 255)
      )
    });
  }

  // Move and draw balloons
  for (let i = balloons.length - 1; i >= 0; i--) {
    let b = balloons[i];

    b.y -= b.speed;

    // The image includes the string, so it's much taller than it is wide.
    // Shift it up so the round part of the balloon is centered on (b.x, b.y).
    let w = b.size;
    let h = w * (balloonImg.height / balloonImg.width);
    tint(b.shade);
    image(balloonImg, b.x - w / 2, b.y - h * 0.28, w, h);
    noTint();

    // Remove balloons that leave the screen
    if (b.y < -50) {
      balloons.splice(i, 1);
    }
  }
}

function drawStartScreen() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("BALLOON POP", width / 2, 140);

  fill(255);
  textSize(20);
  text("Click the balloons to pop them!", width / 2, 200);
  text("Pop as many as possible in 30 seconds.", width / 2, 235);

  drawButton("START", width / 2, 310);
}

function drawGameOver() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(38);
  text("GAME OVER!", width / 2, 160);

  fill(255);
  textSize(26);
  text("Final score: " + score, width / 2, 220);

  drawButton("PLAY AGAIN?", width / 2, 300);
}

function drawButton(label, x, y) {
  rectMode(CENTER);
  noStroke();
  fill(245, 90, 130);
  rect(x, y, 180, 50, 10);

  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(label, x, y);

  rectMode(CORNER);
}

function mousePressed() {
  if (!gameStarted || gameOver) {
    if (
      mouseX > width / 2 - 90 &&
      mouseX < width / 2 + 90 &&
      mouseY > (gameOver ? 275 : 285) &&
      mouseY < (gameOver ? 325 : 335)
    ) {
      startGame();
    }
    return;
  }

  // Pop the balloon that was clicked
  for (let i = balloons.length - 1; i >= 0; i--) {
    let b = balloons[i];

    if (dist(mouseX, mouseY, b.x, b.y) < b.size * 0.6) {
      balloons.splice(i, 1);
      score++;
      popSound.play();
      break;
    }
  }
}

function startGame() {
  userStartAudio();
  score = 0;
  balloons = [];
  startTime = millis();
  gameStarted = true;
  gameOver = false;
}
