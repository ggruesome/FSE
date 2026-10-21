
let balloons = [];
let score = 0;
let startTime = 0;
let gameStarted = false;
let gameOver = false;
let gameDuration = 30;

function setup() {
  createCanvas(700, 450);
  textFont("Arial");
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

    stroke(230);
    line(b.x, b.y + b.size / 2, b.x, b.y + b.size);

    noStroke();
    fill(b.shade);
    ellipse(b.x, b.y, b.size, b.size * 1.2);

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

  drawButton("PLAY AGAIN", width / 2, 300);
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
      break;
    }
  }
}

function startGame() {
  score = 0;
  balloons = [];
  startTime = millis();
  gameStarted = true;
  gameOver = false;
}
