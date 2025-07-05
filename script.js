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
  shuffle();
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

function shuffle() {
  for (let i = 0; i < 100; i++) {
    const movable = [];
    const empty = positions.indexOf(emptyTile);
    for (let j = 0; j < totalTiles; j++) {
      if (isAdjacent(j, empty)) movable.push(j);
    }
    const rand = movable[Math.floor(Math.random() * movable.length)];
    [positions[empty], positions[rand]] = [positions[rand], positions[empty]];
  }
}

function checkWin(level) {
  const isSolved = positions.every((val, idx) => val === idx);
  if (isSolved) {
    const timeTaken = Math.floor((Date.now() - timerStart) / 1000);
    let stars = 1;
    if (timeTaken <= 30) stars = 3;
    else if (timeTaken <= 60) stars = 2;

    alert(`🎉 You completed Level ${level} in ${timeTaken}s.\nYou earned ${stars}⭐`);
    confetti.style.display = 'block';
    setTimeout(() => confetti.style.display = 'none', 2000);

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
    }
  }
}

function watchAdToComplete() {
  if (currentLevel < maxLevel && !unlockedLevels.includes(currentLevel + 1)) {
    if (typeof window.AppInventor !== "undefined") {
      window.AppInventor.setWebViewString("ad-skipped");
    } else {
      unlockedLevels.push(currentLevel + 1);
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
      renderLevelButtons();
      startLevel(currentLevel + 1);
    }
  } else {
    alert("This level is already completed or unlocked.");
  }

  return false;
}

function resetProgress() {
  if (typeof window.AppInventor !== "undefined") {
    window.AppInventor.setWebViewString("reset-confirm");
  } else {
    unlockedLevels = [1];
    bestTimes = {};
    localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
    renderLevelButtons();
    levelDisplay.textContent = '';
    container.innerHTML = '';
    alert("Progress reset.");
  }

  return false;
}

function restartLevel() {
  if (confirm("Restart current level?")) {
    startLevel(currentLevel);
  }

  return false;
}

function goBackToLevels() {
  document.getElementById('puzzle-screen').style.display = 'none';
  showLevelSelect();

  return false;
}

function goBackToStart() {
  document.getElementById('level-select-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';

  return false;
}
