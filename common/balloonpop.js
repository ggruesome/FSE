let balloons = [];
let pops = [];
let score = 0;
let startTime = 0;
let gameStarted = false;
let gameOver = false;
let confirmQuit = false;
let pauseStart = 0;
let gameDuration = 30;
let popSound;
let balloonImg;
let popGif;
let lightningImg;

let balloonHighscore;

// Called from preload() in main.js
function balloonPreload() {
  popSound = loadSound(MEDIA_FOLDER + "/pop.mp3");
  balloonImg = loadImage(MEDIA_FOLDER + "/balloon.png");
  popGif = loadImage(MEDIA_FOLDER + "/pop.gif");
  lightningImg = loadImage(MEDIA_FOLDER + "/lightning.png");

  balloonHighscore = getItem("balloonHighscore");
  if (balloonHighscore === null) {
    balloonHighscore = 0;
  }
}

// Called from setup() in main.js
function balloonSetup() {
  // Shrink the huge image once so drawing it every frame stays fast
  balloonImg.resize(130, 0);
  lightningImg.resize(40, 0); // For lightning balloons
  // Turn the red balloon white (keeping its shading) so tint() can color it.
  // Draw it through a grayscale + brighten filter, then keep the result.
  let g = createGraphics(balloonImg.width, balloonImg.height);
  g.drawingContext.filter = "grayscale(100%) brightness(300%)";
  g.image(balloonImg, 0, 0);
  balloonImg = g.get();
  g.remove();

  // Do the same to every frame of the pop gif. A gif has many frames, so
  // instead of a filter we change each frame's pixels directly.
  for (let frame of popGif.gifProperties.frames) {
    let px = frame.image.data;
    for (let i = 0; i < px.length; i += 4) {
      let gray = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      let v = min(255, gray * 3);
      px[i] = v;
      px[i + 1] = v;
      px[i + 2] = v;
    }
  }
}

// Called from draw() in main.js while Balloon Pop is showing
function balloonDraw() {
  background(30, 27, 60);

  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  if (confirmQuit) {
    drawConfirmQuit();
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
  if (frameCount % 40 === 0 && balloons.length < 10) {
    balloons.push({
      x: random(50, width - 50),
      y: height + 30,
      size: random(45, 65),
      speed: random(0.7, 1.5),
      shade: color(
        random(100, 255),
        random(100, 220),
        random(150, 255)
      ),
      lightning: random() < 1/7 // About 1 in 7 chance
    });
  }

  // Move and draw balloons
  for (let i = balloons.length - 1; i >= 0; i--) {
    let b = balloons[i];

    if (!b.lightning) {
      b.y -= b.speed;
    } else {
      b.y -= b.speed * 3;
    }

    let modifier = floor(random(1, 5));//1-4
    if (modifier == 2) {
      b.x -= b.speed * random(0.1, 0.3);
    } else if (modifier == 3) {
      b.x += b.speed * random(0.1, 0.3);
    }

    let w = b.size;
    let h = w * (balloonImg.height / balloonImg.width);
    tint(b.shade);
    image(balloonImg, b.x - w / 2, b.y - h * 0.28, w, h);
    noTint();

    // Draw the lightning bolt on top so it moves with the balloon
    if (b.lightning) {
      let lw = b.size * 0.8;
      let lh = lw * (lightningImg.height / lightningImg.width);
      image(lightningImg, b.x - lw / 2, b.y - lh / 2, lw, lh);
    }

    // Remove balloons that leave the screen
    if (b.y < -100) {
      score--; //Minus score for missed balloons
      balloons.splice(i, 1);
    }
  }

  for (let i = pops.length - 1; i >= 0; i--) {
    let p = pops[i];
    let f = floor((frameCount - p.startFrame+3) / 2);
    if (f >= popGif.numFrames()) {
      pops.splice(i, 1);
      continue;
    }
    popGif.setFrame(f);
    let w = p.size * 2;
    let h = p.size * (balloonImg.height / balloonImg.width);
    tint(p.shade);
    image(popGif, p.x - w / 2, p.y - h * 0.5, w, h);
    noTint();
  }
}

function drawStartScreen() {
//Balloon decoration
if (frameCount % 120 === 0 && balloons.length < 10) {
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
    let modifier = floor(random(1, 5));//1-4
    if (modifier == 2) {
      b.x -= b.speed * random(0.1, 0.3);
    } else if (modifier == 3) {
      b.x += b.speed * random(0.1, 0.3);
    }

    // The image includes the string, so it's much taller than it is wide.
    // Shift it up so the round part of the balloon is centered on (b.x, b.y).
    let w = b.size;
    let h = w * (balloonImg.height / balloonImg.width);
    tint(b.shade);
    image(balloonImg, b.x - w / 2, b.y - h * 0.28, w, h);
    noTint();

    // Remove balloons that leave the screen
    if (b.y < -100) {
      balloons.splice(i, 1);
    }
  }

  fill(255, 220, 120);
  stroke("black");
  strokeWeight(3);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("BALLOON POP", width / 2, 140);

  fill(255);
  stroke("black");
  strokeWeight(3);
  textSize(20);
  text("Click the balloons to pop them!", width / 2, 200);
  text("Pop as many as possible in 30 seconds.", width / 2, 235);

  drawButton("START", width / 2, 300);
  drawButton("MENU", width / 2, 370);
}

function drawGameOver() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(38);
  text("GAME OVER!", width / 2, 160);

  fill(255);
  textSize(26);
  text("Final score: " + score, width / 2, 220);

  if (score > balloonHighscore) {
    balloonHighscore = score;
    storeItem("balloonHighscore", balloonHighscore);
    fill(255, 220, 120);
    textSize(22);
    text("New highscore!", width / 2, 260);
  } else {
    fill(255, 220, 120);
    textSize(22);
    text("Highscore: " + balloonHighscore, width / 2, 260);
  }

  fill(255);
  textSize(20);
  drawButton("PLAY AGAIN?", width / 2, 300);
  drawButton("EXIT", width / 2, 360);
}

function drawConfirmQuit() {
  fill(255, 220, 120);
  textAlign(CENTER, CENTER);
  textSize(34);
  text("Are you sure you want to quit?", width / 2, 170);

  fill(255);
  textSize(18);
  text("Your score will be lost.", width / 2, 215);

  drawButton("YES", width / 2 - 125, 290);
  drawButton("NO", width / 2 + 125, 290);
}

// Called from mousePressed() in main.js while Balloon Pop is showing
function balloonMousePressed() {
  if (confirmQuit) {
    if (overButton(width / 2 - 125, 290)) {
      quitGame();
    } else if (overButton(width / 2 + 125, 290)) {
      resumeGame();
    }
    return;
  }

  if (!gameStarted) {
    if (overButton(width / 2, 300)) {
      startGame();
    } else if (overButton(width / 2, 370)) {
      exitToMenu();
    }
    return;
  }

  if (gameOver) {
    if (overButton(width / 2, 300)) {
      startGame();
    } else if (overButton(width / 2, 360)) {
      exitToMenu();
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
      pops.push({ x: b.x, y: b.y, size: b.size, shade: b.shade, startFrame: frameCount });
      break;
    }
  }
}

function startGame() {
  userStartAudio();
  score = 0;
  balloons = [];
  pops = [];
  startTime = millis();
  gameStarted = true;
  gameOver = false;
  confirmQuit = false;
}

// Called from keyPressed() in main.js while Balloon Pop is showing
function balloonKeyPressed() {
  // Esc only does something while a game is being played
  if (keyCode !== ESCAPE || !gameStarted || gameOver) {
    return;
  }

  if (confirmQuit) {
    resumeGame();
  } else {
    confirmQuit = true;
    pauseStart = millis();
  }
}

function resumeGame() {
  // Push the start time forward so the paused time doesn't count
  startTime += millis() - pauseStart;
  confirmQuit = false;
}

function quitGame() {
  confirmQuit = false;
  gameStarted = false;
  balloons = [];
  score = 0;
}

// Reset the game and go back to the main menu
function exitToMenu() {
  quitGame();
  gameOver = false;
  currentScreen = "menu";
}
