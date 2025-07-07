const container = document.getElementById("puzzle-container");
const levelButtonsContainer = document.getElementById("level-buttons");
const levelDisplay = document.getElementById("current-level");
const confetti = document.getElementById("confetti");

let unlockedLevels = JSON.parse(localStorage.getItem("unlockedLevels") || "[1]");
const maxLevel = 15;
let currentLevel = 1;

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
  currentLevel = level;
  document.getElementById('level-select-screen').style.display = 'none';
  document.getElementById('puzzle-screen').style.display = 'block';
  levelDisplay.textContent = `Playing Level ${level}`;
  generateTiles();
}

function generateTiles() {
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(3, 1fr)`;

  let rotations = [];
  for (let i = 0; i < 9; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";

    let rotateDeg = Math.floor(Math.random() * 4) * 90;
    rotations.push(rotateDeg);
    tile.style.transform = `rotate(${rotateDeg}deg)`;

    tile.onclick = () => {
      rotations[i] = (rotations[i] + 90) % 360;
      tile.style.transform = `rotate(${rotations[i]}deg)`;
      checkSolved(rotations);
    };

    container.appendChild(tile);
  }
}

function checkSolved(rotations) {
  if (rotations.every(r => r === 0)) {
    confetti.style.display = 'block';
    setTimeout(() => confetti.style.display = 'none', 1500);

    if (currentLevel < maxLevel && !unlockedLevels.includes(currentLevel + 1)) {
      unlockedLevels.push(currentLevel + 1);
      localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    }

    renderLevelButtons();
    setTimeout(() => startLevel(currentLevel + 1), 1000);
  }
}

function watchAdToGuide() {
  alert("Hint: Tap tiles to rotate. Make all images upright to win!");
}

function resetProgress() {
  if (confirm("Reset all progress?")) {
    unlockedLevels = [1];
    localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
    renderLevelButtons();
    levelDisplay.textContent = '';
    container.innerHTML = '';
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
