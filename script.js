const levelButtonsContainer = document.getElementById("level-buttons");
const puzzleContainer = document.getElementById("puzzle-container");
const levelDisplay = document.getElementById("current-level");
const confetti = document.getElementById("confetti");

let currentLevel = 1;
let maxLevel = 15;
let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");

function showLevelSelect() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("level-select-screen").style.display = "block";
  renderLevelButtons();
}

function renderLevelButtons() {
  levelButtonsContainer.innerHTML = '';
  for (let i = 1; i <= maxLevel; i++) {
    const btn = document.createElement("button");
    btn.textContent = "Level " + i;
    btn.disabled = !unlockedLevels.includes(i);
    btn.onclick = () => startLevel(i);
    levelButtonsContainer.appendChild(btn);
  }
}

function startLevel(level) {
  currentLevel = level;
  document.getElementById("level-select-screen").style.display = "none";
  document.getElementById("puzzle-screen").style.display = "block";
  levelDisplay.textContent = "Playing Level " + level;

  const img = new Image();
  img.src = `images/level${level}.jpg`;
  img.onload = () => buildPuzzle(img);
}

function buildPuzzle(img) {
  puzzleContainer.innerHTML = '';
  const size = 3;
  const tileSize = 100;

  for (let i = 0; i < size * size; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    const row = Math.floor(i / size);
    const col = i % size;
    tile.style.backgroundImage = `url(${img.src})`;
    tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;
    tile.dataset.rotation = Math.floor(Math.random() * 4) * 90;
    tile.style.transform = `rotate(${tile.dataset.rotation}deg)`;

    tile.onclick = () => {
      tile.dataset.rotation = (parseInt(tile.dataset.rotation) + 90) % 360;
      tile.style.transform = `rotate(${tile.dataset.rotation}deg)`;
      checkSolved();
    };

    puzzleContainer.appendChild(tile);
  }
}

function checkSolved() {
  const tiles = document.querySelectorAll(".tile");
  const allCorrect = Array.from(tiles).every(tile => parseInt(tile.dataset.rotation) === 0);

  if (allCorrect) {
    confetti.style.display = 'block';
    setTimeout(() => confetti.style.display = 'none', 1500);

    if (currentLevel < maxLevel && !unlockedLevels.includes(currentLevel + 1)) {
      unlockedLevels.push(currentLevel + 1);
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    }

    setTimeout(() => startLevel(currentLevel + 1), 1200);
  }
}

function restartLevel() {
  startLevel(currentLevel);
}

function goBackToLevels() {
  document.getElementById("puzzle-screen").style.display = "none";
  showLevelSelect();
}

function goBackToStart() {
  document.getElementById("level-select-screen").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}

function resetProgress() {
  if (confirm("Reset all progress?")) {
    unlockedLevels = [1];
    localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    renderLevelButtons();
  }
}
