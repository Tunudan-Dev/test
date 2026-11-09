// Snake - JS pur, sans dépendance. Conforme à la spécification §1 à §10.
(function () {
  'use strict';

  // §3 Constantes
  const GRID = 20;
  const CELL = 24;
  const TICK_MS = 120;
  const INITIAL_LENGTH = 3;
  const POINTS_PER_FOOD = 10;

  // §9 Éléments DOM
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const overlayEl = document.getElementById('overlay');
  const overlayTitleEl = document.getElementById('overlay-title');
  const finalScoreEl = document.getElementById('final-score');
  const restartHintEl = document.getElementById('restart-hint');

  canvas.width = GRID * CELL;
  canvas.height = GRID * CELL;

  // §2 Correspondance touches -> directions
  const KEY_DIRS = {
    ArrowUp: { x: 0, y: -1 }, z: { x: 0, y: -1 }, Z: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, q: { x: -1, y: 0 }, Q: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 }
  };

  // §4 État
  let snake = [];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 0, y: 0 };
  let score = 0;
  let gameOver = false;
  let timerId = null;

  /** Arrête la boucle si elle existe (correctif T23 : jamais deux intervalles). */
  function stopLoop() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function updateScore() {
    scoreEl.textContent = String(score);
  }

  /** §7 Tire une case libre au hasard ; retourne null si aucune. */
  function placeFood() {
    const occupied = new Set(snake.map((s) => s.x + ',' + s.y));
    const free = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (!occupied.has(x + ',' + y)) free.push({ x, y });
      }
    }
    if (free.length === 0) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  /** §8.1 / §8.2 Fin de partie (défaite ou victoire). */
  function endGame(title) {
    gameOver = true;
    stopLoop();
    overlayTitleEl.textContent = title;
    finalScoreEl.textContent = 'Score final : ' + score;
    restartHintEl.textContent = 'Appuyez sur Espace pour rejouer';
    overlayEl.classList.remove('hidden');
  }

  function fillCell(x, y, margin, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + margin, y * CELL + margin, CELL - 2 * margin, CELL - 2 * margin);
  }

  /** §8.3 Rendu : fond, grille, nourriture, corps, tête. */
  function draw() {
    const size = GRID * CELL;
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= GRID; i++) {
      const p = i * CELL + 0.5;
      ctx.moveTo(p, 0); ctx.lineTo(p, size);
      ctx.moveTo(0, p); ctx.lineTo(size, p);
    }
    ctx.stroke();

    if (food) fillCell(food.x, food.y, 2, '#ef4444');
    for (let i = 1; i < snake.length; i++) fillCell(snake[i].x, snake[i].y, 1, '#22c55e');
    if (snake.length > 0) fillCell(snake[0].x, snake[0].y, 1, '#86efac');
  }

  /** §6 Un pas de jeu. */
  function tick() {
    if (gameOver) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      endGame('Game Over');
      draw();
      return;
    }

    const grows = food !== null && head.x === food.x && head.y === food.y;
    const body = grows ? snake : snake.slice(0, -1); // la queue se libère si pas de croissance
    if (body.some((s) => s.x === head.x && s.y === head.y)) {
      endGame('Game Over');
      draw();
      return;
    }

    snake.unshift(head);
    if (grows) {
      score += POINTS_PER_FOOD;
      updateScore();
      food = placeFood();
    } else {
      snake.pop();
    }

    if (snake.length >= GRID * GRID || food === null) {
      endGame('Victoire !');
    }
    draw();
  }

  /** §5 / §10 Réinitialisation idempotente (correctif T23). */
  function reset() {
    stopLoop(); // 1. jamais d'intervalle résiduel
    snake = [];
    for (let i = 0; i < INITIAL_LENGTH; i++) snake.push({ x: 10 - i, y: 10 });
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    food = placeFood();
    overlayEl.classList.add('hidden');
    finalScoreEl.textContent = '';
    updateScore();
    draw();
    timerId = setInterval(tick, TICK_MS); // un seul intervalle actif
  }

  /** §2 / §6 / §10 Gestion du clavier. */
  function onKeyDown(event) {
    if (event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
      if (gameOver) reset(); // ignoré pendant une partie en cours
      return;
    }
    const wanted = KEY_DIRS[event.key];
    if (!wanted) return; // autres touches ignorées
    if (event.key.startsWith('Arrow')) event.preventDefault();
    if (gameOver) return;
    // Anti-demi-tour : comparé à dir (dernier tick), pas à nextDir
    if (wanted.x === -dir.x && wanted.y === -dir.y) return;
    nextDir = wanted;
  }

  document.addEventListener('keydown', onKeyDown);
  reset();
})();
