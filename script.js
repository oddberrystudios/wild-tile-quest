const container = document.getElementById("puzzle-container");
const levelButtonsContainer = document.getElementById("level-buttons");
const levelDisplay = document.getElementById("current-level");
const confetti = document.getElementById("confetti");
const watchAdBtn = document.getElementById("watch-ad-btn");
const previewImage = document.getElementById("preview-image");

let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");
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
  const gridSize = level <= 5 ? 3 : level <= 10 ? 4 : 5;
  container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  levelDisplay.textContent = `Playing Level ${level}`;
  previewImage.src = `images/level${level}.jpg`;
  previewImage.style.display = 'block';
  watchAdBtn.disabled = false;

  generatePuzzle(gridSize, level);
}

function generatePuzzle(gridSize, level) {
  container.innerHTML = '';
  const tileSize = 100;
  const correctAngles = [];
  const currentAngles = [];

  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    const angle = (Math.floor(Math.random() * 4)) * 90;
    correctAngles.push(0);
    currentAngles.push(angle);

    tile.style.backgroundImage = `url('images/level${currentLevel}.jpg')`;
    tile.style.backgroundSize = `${gridSize * tileSize}px ${gridSize * tileSize}px`;
    tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;
    tile.style.transform = `rotate(${angle}deg)`;

    tile.onclick = () => {
      currentAngles[i] = (currentAngles[i] + 90) % 360;
      tile.style.transform = `rotate(${currentAngles[i]}deg)`;
      checkWin(correctAngles, currentAngles);
    };

    container.appendChild(tile);
  }

  // Store for ad hint
  container.dataset.correct = JSON.stringify(correctAngles);
  container.dataset.current = JSON.stringify(currentAngles);
  container.dataset.size = gridSize;
}

function checkWin(correctAngles, currentAngles) {
  if (correctAngles.every((angle, i) => angle === currentAngles[i])) {
    confetti.style.display = 'block';
    setTimeout(() => confetti.style.display = 'none', 1500);

    if (currentLevel < maxLevel && !unlockedLevels.includes(currentLevel + 1)) {
      unlockedLevels.push(currentLevel + 1);
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    }

    renderLevelButtons();
    watchAdBtn.disabled = true;

    if (unlockedLevels.includes(currentLevel + 1)) {
      setTimeout(() => startLevel(currentLevel + 1), 1000);
    } else {
      alert("🎉 You completed the final level!");
    }
  }
}

function watchAdToComplete() {
  const tiles = container.querySelectorAll('.tile');
  const correctAngles = JSON.parse(container.dataset.correct);
  const currentAngles = JSON.parse(container.dataset.current);

  let i = 0;
  function rotateTile() {
    if (i >= tiles.length) return;
    const tile = tiles[i];
    const targetAngle = correctAngles[i];
    currentAngles[i] = targetAngle;
    tile.style.transform = `rotate(${targetAngle}deg)`;
    i++;
    setTimeout(rotateTile, 200);
  }

  rotateTile();

  setTimeout(() => {
    checkWin(correctAngles, currentAngles);
  }, tiles.length * 220);
}

function resetProgress() {
  if (confirm("Reset all progress?")) {
    unlockedLevels = [1];
    localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    renderLevelButtons();
    levelDisplay.textContent = '';
    container.innerHTML = '';
    previewImage.style.display = 'none';
    alert("Progress reset.");
  }
}

function restartLevel() {
  startLevel(currentLevel);
}

function goBackToLevels() {
  document.getElementById('puzzle-screen').style.display = 'none';
  showLevelSelect();
}

function goBackToStart() {
  document.getElementById('level-select-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
}
