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
  positions = [...Array(totalTiles).keys()];
  shuffleSolvable(); // Ensures puzzle is solvable
  renderPuzzle(level);
  levelDisplay.textContent = `Playing Level ${level}`;

  timerStart = Date.now();

  watchAdBtn.disabled = unlockedLevels.includes(level + 1);
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

function shuffleSolvable() {
  do {
    shuffle();
  } while (!isSolvable(positions));
}

function shuffle() {
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
}

function isSolvable(arr) {
  let invCount = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] !== emptyTile && arr[j] !== emptyTile && arr[i] > arr[j]) invCount++;
    }
  }
  if (size % 2 === 1) return invCount % 2 === 0;
  const emptyRow = Math.floor(arr.indexOf(emptyTile) / size);
  return (invCount + size - emptyRow) % 2 === 0;
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

    if (unlockedLevels.includes(level + 1)) {
      setTimeout(() => startLevel(level + 1), 1000);
    } else if (level === maxLevel) {
      alert("🎉 You completed the final level!\nThanks for playing Wild Tile Quest.");
    }
  }
}

// Demo: Move tiles automatically to solve (tutorial-style)
function moveTile(fromIndex, toIndex, delay = 350) {
  return new Promise(resolve => {
    [positions[fromIndex], positions[toIndex]] = [positions[toIndex], positions[fromIndex]];
    renderPuzzle(currentLevel);
    setTimeout(resolve, delay);
  });
}

async function solvePuzzleAnimation() {
  alert("🎯 Watch how to solve this level step by step...");
  positions = [...Array(totalTiles).keys()];
  renderPuzzle(currentLevel);

  await new Promise(res => setTimeout(res, 1000));
}

async function watchAdToComplete() {
  if (currentLevel <= maxLevel) {
    alert("🎥 Ad watched successfully!");
    await solvePuzzleAnimation();

    // Optional unlock
    if (!unlockedLevels.includes(currentLevel + 1) && currentLevel < maxLevel) {
      unlockedLevels.push(currentLevel + 1);
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    }

    watchAdBtn.disabled = true;
    renderLevelButtons();

    if (currentLevel < maxLevel) {
      setTimeout(() => startLevel(currentLevel + 1), 2000);
    } else {
      alert("🎉 Game Completed! No more levels.");
    }
  }
}

function resetProgress() {
  if (confirm("⚠️ Are you sure you want to reset all progress?")) {
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
  if (confirm("🔁 Restart this level?")) {
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
