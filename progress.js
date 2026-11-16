const games = [
  { key: "balloonpop", label: "Balloon Pop", highscoreKey: "balloonHighscore", bestId: "best-balloon", playsId: "plays-balloon" },
  { key: "flowergarden", label: "Flower Garden", highscoreKey: "flowerHighscore", bestId: "best-garden", playsId: "plays-garden" },
  { key: "coincollector", label: "Coin Collector", highscoreKey: "coinHighscore", bestId: "best-coins", playsId: "plays-coins" }
];

const storedResults = localStorage.getItem("arcadeResults");
const results = storedResults === null ? [] : JSON.parse(storedResults);
const storedGameCounts = localStorage.getItem("arcadeGameCounts");
const savedGameCounts = storedGameCounts === null ? {} : JSON.parse(storedGameCounts);
const gameCounts = new Map(
  games.map(game => [game.key, Number(savedGameCounts[game.key] || 0)])
);

const storedRoundCount = localStorage.getItem("arcadeRoundsPlayed");
document.getElementById("round-count").textContent =
  storedRoundCount === null ? results.length : Number(storedRoundCount);
document.getElementById("games-tried").textContent =
  games.filter(game => gameCounts.get(game.key) > 0).length;

let mostPlayed = null;
for (const game of games) {
  if (mostPlayed === null || gameCounts.get(game.key) > gameCounts.get(mostPlayed.key)) {
    mostPlayed = game;
  }
}
document.getElementById("most-played").textContent =
  results.length === 0 ? "—" : mostPlayed.label;

for (const game of games) {
  const storedBest = localStorage.getItem(game.highscoreKey);
  const best = storedBest === null ? 0 : Number(storedBest);
  document.getElementById(game.bestId).textContent = best;
  document.getElementById(game.playsId).textContent = gameCounts.get(game.key);
}

const historyList = document.getElementById("recent-rounds");
if (results.length === 0) {
  const emptyState = document.createElement("li");
  emptyState.className = "empty-state";
  emptyState.textContent = "No score history yet. Complete a game and newly recorded rounds will appear here.";
  historyList.append(emptyState);
} else {
  for (const result of results.slice(-10).reverse()) {
    const game = games.find(item => item.key === result.game);
    if (!game) {
      continue;
    }

    const row = document.createElement("li");
    row.className = "history-row";

    const gameName = document.createElement("span");
    gameName.className = "history-game";
    gameName.textContent = game.label;

    const score = document.createElement("span");
    score.className = "history-score";
    score.textContent = `Score: ${result.score}`;

    const date = document.createElement("time");
    date.className = "history-date";
    date.dateTime = result.playedAt;
    date.textContent = new Date(result.playedAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    row.append(gameName, score, date);
    historyList.append(row);
  }
}
