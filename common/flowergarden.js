let flowerHighscore;

function flowerPreload() {
  // Highscores
  flowerHighscore = getItem("flowerHighscore");
  if (flowerHighscore === null) {
    flowerHighscore = 0;
  }
}