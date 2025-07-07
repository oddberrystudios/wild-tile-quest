const container = document.getElementById("puzzle-container");
const levelButtonsContainer = document.getElementById("level-buttons");
const levelDisplay = document.getElementById("current-level");
const confetti = document.getElementById("confetti");
const watchAdBtn = document.getElementById("watch-ad-btn");
const previewImage = document.getElementById("preview-image");

let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");
let bestTimes = JSON.parse(localStorage.getItem("bestTimes") || "{}");

let size = 3;
let totalTiles, emptyTile, positions = [], timerStart = null;
let currentLevel = 1;
const maxLevel = 15;
let solutionSteps = [];

function showLevelSelect() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('level-select-screen').style.display = 'block';
  renderLevelButtons();
}

function renderLevelButtons() {
  levelButtonsContainer.innerHTML = '';
  for (let level = 1; level <= maxLevel; level++) {
    const btn = document.createElement('button');
    btn.textContent = `Level ${level}`;
    btn.className = 'level-btn';
    if (!unlockedLevels.includes(level)) {
      btn.classList.add('locked');
      btn.disabled = true;
    }
    btn.onclick = () => startLevel(level);
    levelButtonsContainer.appendChild(btn);
  }
}

function startLevel(level) {
  document.getElementById('level-select-screen').style.display = 'none';
  document.getElementById('puzzle-screen').style.display = 'block';

  currentLevel = level;
  if (level <= 5) size = 3;
  else if (level <= 10) size = 4;
  else size = 5;

  totalTiles = size * size;
  emptyTile = totalTiles - 1;
  generateSolvablePuzzle();
  renderPuzzle(level);
  levelDisplay.textContent = `Playing Level ${level}`;

  timerStart = Date.now();
  watchAdBtn.disabled = false;
  previewImage.src = `images/level${level}.jpg`;
  previewImage.style.display = 'block';
}

function renderPuzzle(level) {
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  for (let i = 0; i < totalTiles; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';

    const pos = positions[i];
    if (pos === emptyTile) {
      tile.classList.add('hidden');
    } else {
      const row = Math.floor(pos / size);
      const col = pos % size;
      tile.style.backgroundImage = `url('images/level${level}.jpg')`;
      tile.style.backgroundSize = `${size * 100}px ${size * 100}px`;
      tile.style.backgroundPosition = `-${(col * 100)}px -${(row * 100)}px`;
    }

    tile.addEventListener('click', () => tryMove(i, level));
    container.appendChild(tile);
  }
}

function tryMove(index, level) {
  const empty = positions.indexOf(emptyTile);
  if (isAdjacent(index, empty)) {
    [positions[index], positions[empty]] = [positions[empty], positions[index]];
    renderPuzzle(level);
    checkWin(level);
  }
}

function isAdjacent(i, j) {
  const xi = i % size, yi = Math.floor(i / size);
  const xj = j % size, yj = Math.floor(j / size);
  return Math.abs(xi - xj) + Math.abs(yi - yj) === 1;
}

// New: Generate solvable puzzle by making random moves from solved state
function generateSolvablePuzzle() {
  positions = [...Array(totalTiles).keys()];
  solutionSteps = [];
  let emptyIndex = totalTiles - 1;

  for (let i = 0; i < 40; i++) {
    const adjacent = [];
    for (let j = 0; j < totalTiles; j++) {
      if (isAdjacent(j, emptyIndex)) adjacent.push(j);
    }
    const moveIndex = adjacent[Math.floor(Math.random() * adjacent.length)];
    [positions[emptyIndex], positions[moveIndex]] = [positions[moveIndex], positions[emptyIndex]];
    solutionSteps.push({ from: moveIndex, to: emptyIndex }); // record move
    emptyIndex = moveIndex;
  }
}

function checkWin(level) {
  const isSolved = positions.every((val, idx) => val === idx);
  if (isSolved) {
    const timeTaken = Math.floor((Date.now() - timerStart) / 1000);
    let stars = 1;
    if (timeTaken <= 30) stars = 3;
    else if (timeTaken <= 60) stars = 2;

    confetti.style.display = 'block';
    setTimeout(() => confetti.style.display = 'none', 1500);

    if (!bestTimes[level] || timeTaken < bestTimes[level]) {
      bestTimes[level] = timeTaken;
      localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
    }

    if (level < maxLevel && !unlockedLevels.includes(level + 1)) {
      unlockedLevels.push(level + 1);
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    }

    watchAdBtn.disabled = true;
    renderLevelButtons();

    if (level < maxLevel) {
      setTimeout(() => startLevel(level + 1), 1000);
    } else {
      alert("🎉 Congratulations! You've completed all levels.");
    }
  }
}

// 🧠 Instead of skipping — play the solution tutorial step-by-step
async function watchAdToComplete() {
  alert("🎥 You watched an ad. Here's how to solve this level!");

  // Reset to original scrambled state
  generateSolvablePuzzle();
  renderPuzzle(currentLevel);

  // Play recorded solution steps in reverse
  const reversedSteps = [...solutionSteps].reverse();

  for (let step of reversedSteps) {
    await new Promise(resolve => setTimeout(resolve, 400));
    [positions[step.from], positions[step.to]] = [positions[step.to], positions[step.from]];
    renderPuzzle(currentLevel);
  }

  alert("🎯 Now try it yourself!");
}

function resetProgress() {
  if (confirm("Reset all progress?")) {
    unlockedLevels = [1];
    bestTimes = {};
    localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
    renderLevelButtons();
    levelDisplay.textContent = '';
    container.innerHTML = '';
    alert("✅ Progress reset.");
  }
}

function restartLevel() {
  if (confirm("Restart level?")) {
    startLevel(currentLevel);
  }
}

function goBackToLevels() {
  document.getElementById('puzzle-screen').style.display = 'none';
  showLevelSelect();
}

function goBackToStart() {
  document.getElementById('level-select-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
}
