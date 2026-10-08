/**
 * TicTacToe Deluxe - Controlador Principal de la Aplicación
 * Con soporte para persistencia en Supabase y Leaderboard en la nube.
 */

(function () {
  'use strict';

  // --- Elementos del DOM ---
  const boardEl = document.getElementById('board');
  const cells = document.querySelectorAll('.cell');
  const winLineSvg = document.getElementById('win-line-svg');
  const winLine = document.getElementById('win-line');
  const statusMessage = document.getElementById('status-message');
  const restartBtn = document.getElementById('restart-btn');
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  const resetScoreBtn = document.getElementById('reset-score-btn');
  const modeSelect = document.getElementById('mode-select');
  const difficultySelect = document.getElementById('difficulty-select');
  const difficultyGroup = document.getElementById('difficulty-group');

  // Perfil del Jugador
  const currentPlayerNicknameEl = document.getElementById('current-player-nickname');
  const editNicknameBtn = document.getElementById('edit-nickname-btn');

  // Marcadores
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreTiesEl = document.getElementById('score-ties');
  const cardPlayerX = document.getElementById('card-player-x');
  const cardPlayerO = document.getElementById('card-player-o');
  const namePlayerX = document.getElementById('name-player-x');
  const namePlayerO = document.getElementById('name-player-o');

  // Modal de Resultado
  const resultModal = document.getElementById('result-modal');
  const modalIcon = document.getElementById('modal-icon');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const cloudSaveStatus = document.getElementById('cloud-save-status');
  const modalPlayAgainBtn = document.getElementById('modal-play-again-btn');

  // Modal de Clasificación Global (Leaderboard)
  const leaderboardBtn = document.getElementById('leaderboard-btn');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
  const dbStatusBanner = document.getElementById('db-status-banner');
  const nicknameForm = document.getElementById('nickname-form');
  const nicknameInput = document.getElementById('nickname-input');
  const leaderboardLoading = document.getElementById('leaderboard-loading');
  const leaderboardTable = document.getElementById('leaderboard-table');
  const leaderboardTbody = document.getElementById('leaderboard-tbody');
  const leaderboardEmpty = document.getElementById('leaderboard-empty');
  const supabaseGuide = document.getElementById('supabase-guide');

  // --- Estado del Juego ---
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
    [0, 4, 8], [2, 4, 6]             // Diagonales
  ];

  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X';
  let isGameActive = true;
  let isAIMoving = false;
  let currentMode = modeSelect ? modeSelect.value : 'ai';
  let currentDifficulty = difficultySelect ? difficultySelect.value : 'normal';
  let matchStartTime = Date.now();
  let moveCount = 0;

  let scores = {
    x: 0,
    o: 0,
    ties: 0
  };

  // --- Inicialización ---
  function init() {
    loadSavedScores();
    updateScoreUI();
    updateSoundIcon();
    initNickname();
    setupEventListeners();
    resetBoard();
  }

  // Cargar y guardar puntuaciones locales
  function loadSavedScores() {
    try {
      const saved = localStorage.getItem('tictactoe_scores');
      if (saved) {
        scores = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('No se pudo cargar puntuaciones de localStorage:', e);
    }
  }

  function saveScores() {
    try {
      localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage:', e);
    }
  }

  function updateScoreUI() {
    scoreXEl.textContent = scores.x;
    scoreOEl.textContent = scores.o;
    scoreTiesEl.textContent = scores.ties;
  }

  function updateSoundIcon() {
    if (window.soundFX) {
      soundIcon.textContent = window.soundFX.isMuted ? '🔇' : '🔊';
      soundBtn.setAttribute('title', window.soundFX.isMuted ? 'Activar sonido' : 'Silenciar sonido');
    }
  }

  // Manejo de Nickname
  function initNickname() {
    const nick = (window.supabaseService && window.supabaseService.getNickname()) || 'Jugador X';
    setNicknameUI(nick);
  }

  function setNicknameUI(nick) {
    if (currentPlayerNicknameEl) currentPlayerNicknameEl.textContent = nick;
    if (namePlayerX) namePlayerX.textContent = nick;
    if (nicknameInput) nicknameInput.value = nick;
  }

  // --- Configuración de Eventos ---
  function setupEventListeners() {
    // Clic en celdas
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCellClick(e);
        }
      });
    });

    // Botones de acción del juego
    restartBtn.addEventListener('click', () => {
      if (window.soundFX) window.soundFX.playReset();
      resetBoard();
    });

    modalPlayAgainBtn.addEventListener('click', () => {
      closeResultModal();
      resetBoard();
    });

    soundBtn.addEventListener('click', () => {
      if (window.soundFX) {
        window.soundFX.toggleMute();
        updateSoundIcon();
      }
    });

    resetScoreBtn.addEventListener('click', () => {
      if (confirm('¿Deseas reiniciar todas las puntuaciones locales?')) {
        scores = { x: 0, o: 0, ties: 0 };
        saveScores();
        updateScoreUI();
        if (window.soundFX) window.soundFX.playReset();
      }
    });

    // Perfil y Nickname
    if (editNicknameBtn) {
      editNicknameBtn.addEventListener('click', () => {
        openLeaderboardModal();
        if (nicknameInput) nicknameInput.focus();
      });
    }

    if (nicknameForm) {
      nicknameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newNick = nicknameInput.value.trim();
        if (newNick && window.supabaseService) {
          const savedNick = window.supabaseService.setNickname(newNick);
          setNicknameUI(savedNick);
          alert(`¡Apodo guardado como "${savedNick}"!`);
          loadLeaderboardData();
        }
      });
    }

    // Modal de Leaderboard
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', openLeaderboardModal);
    }

    if (closeLeaderboardBtn) {
      closeLeaderboardBtn.addEventListener('click', closeLeaderboardModal);
    }

    if (leaderboardModal) {
      leaderboardModal.addEventListener('click', (e) => {
        if (e.target === leaderboardModal) {
          closeLeaderboardModal();
        }
      });
    }

    // Selector de Modo
    modeSelect.addEventListener('change', (e) => {
      currentMode = e.target.value;
      if (currentMode === 'ai') {
        difficultyGroup.style.display = 'flex';
        namePlayerO.textContent = 'IA (O)';
      } else {
        difficultyGroup.style.display = 'none';
        namePlayerO.textContent = 'Jugador O';
      }
      resetBoard();
    });

    // Selector de Dificultad
    difficultySelect.addEventListener('change', (e) => {
      currentDifficulty = e.target.value;
      resetBoard();
    });

    // Recalcular línea ganadora en redimensionamiento de ventana
    window.addEventListener('resize', () => {
      const winCombo = checkWinCombo();
      if (!isGameActive && winCombo) {
        drawLine(winCombo);
      }
    });
  }

  // --- Lógica del Turno ---
  function handleCellClick(e) {
    const cell = e.currentTarget;
    const index = parseInt(cell.getAttribute('data-index'), 10);

    if (board[index] !== '' || !isGameActive || isAIMoving) {
      return;
    }

    makeMove(index, currentPlayer);

    // Si el juego sigue activo y el modo es IA, ejecuta turno de la IA
    if (isGameActive && currentMode === 'ai' && currentPlayer === 'O') {
      executeAIMove();
    }
  }

  function makeMove(index, player) {
    board[index] = player;
    moveCount++;
    renderCell(cells[index], player);

    if (window.soundFX) {
      window.soundFX.playMove(player);
    }

    const winCombo = checkWinCombo();

    if (winCombo) {
      handleWin(player, winCombo);
    } else if (isBoardFull()) {
      handleDraw();
    } else {
      // Alternar turno
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateTurnIndicator();
    }
  }

  function renderCell(cellEl, player) {
    cellEl.classList.add('taken');
    cellEl.setAttribute('aria-label', `Casilla marcada con ${player}`);

    if (player === 'X') {
      cellEl.innerHTML = `
        <svg class="symbol-svg-x" viewBox="0 0 100 100" aria-hidden="true">
          <line x1="22" y1="22" x2="78" y2="78" />
          <line x1="78" y1="22" x2="22" y2="78" />
        </svg>
      `;
    } else {
      cellEl.innerHTML = `
        <svg class="symbol-svg-o" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="30" />
        </svg>
      `;
    }
  }

  function executeAIMove() {
    isAIMoving = true;
    statusMessage.textContent = 'IA pensando...';

    const delay = currentDifficulty === 'hard' ? 450 : 350;

    setTimeout(() => {
      if (!isGameActive) {
        isAIMoving = false;
        return;
      }

      const move = window.ticTacToeAI.getMove(board, currentDifficulty, 'O', 'X');
      if (move !== null && move !== undefined) {
        makeMove(move, 'O');
      }
      isAIMoving = false;
    }, delay);
  }

  // --- Verificaciones de Fin de Partida ---
  function checkWinCombo() {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return combo;
      }
    }
    return null;
  }

  function isBoardFull() {
    return board.every(cell => cell !== '');
  }

  function handleWin(winner, combo) {
    isGameActive = false;
    scores[winner.toLowerCase()]++;
    saveScores();
    updateScoreUI();

    const durationSeconds = Math.max(1, Math.round((Date.now() - matchStartTime) / 1000));

    // Resaltar celdas ganadoras
    combo.forEach(idx => {
      cells[idx].classList.add('winning-cell');
    });

    // Dibujar línea animada
    drawLine(combo, winner);

    // Sonido y Confeti
    if (window.soundFX) window.soundFX.playWin();
    if (window.confetti) window.confetti.fire(3200);

    const winnerName = winner === 'X' 
      ? (window.supabaseService ? window.supabaseService.getNickname() : 'Jugador X')
      : (currentMode === 'ai' ? 'la Inteligencia Artificial' : 'Jugador O');

    statusMessage.textContent = `¡Victoria para ${winner}!`;

    // Guardar partida en Supabase
    saveMatchRecord(winner, durationSeconds, combo);

    // Mostrar modal
    setTimeout(() => {
      openResultModal(
        '🏆',
        `¡Ganó ${winner}!`,
        `¡Felicidades! ${winnerName} ha ganado la ronda en ${durationSeconds}s.`
      );
    }, 700);
  }

  function handleDraw() {
    isGameActive = false;
    scores.ties++;
    saveScores();
    updateScoreUI();

    const durationSeconds = Math.max(1, Math.round((Date.now() - matchStartTime) / 1000));

    if (window.soundFX) window.soundFX.playDraw();

    statusMessage.textContent = '¡Empate!';

    // Guardar partida en Supabase
    saveMatchRecord('tie', durationSeconds, null);

    setTimeout(() => {
      openResultModal(
        '🤝',
        '¡Empate!',
        `Tablero completo en ${durationSeconds}s. ¡Ningún jugador cedió terreno!`
      );
    }, 600);
  }

  async function saveMatchRecord(winner, durationSeconds, combo) {
    if (!cloudSaveStatus) return;

    if (window.supabaseService && window.supabaseService.isConfigured) {
      cloudSaveStatus.textContent = '☁️ Sincronizando con Supabase...';
      const result = await window.supabaseService.recordGame({
        winner: winner,
        gameMode: currentMode,
        aiDifficulty: currentMode === 'ai' ? currentDifficulty : null,
        totalMoves: moveCount,
        durationSeconds: durationSeconds,
        finalBoard: board,
        winningLine: combo,
        playerXName: window.supabaseService.getNickname(),
        playerOName: currentMode === 'ai' ? `IA (${currentDifficulty})` : 'Jugador O'
      });

      if (result.success) {
        cloudSaveStatus.textContent = '✅ Guardado en Supabase (Ranking actualizado)';
      } else {
        cloudSaveStatus.textContent = '⚠️ Guardado localmente (error al sincronizar nube)';
      }
    } else {
      cloudSaveStatus.textContent = '💾 Guardado localmente (Supabase no configurado)';
    }
  }

  // --- Trazo de la Línea Ganadora ---
  function drawLine(combo, winner = 'X') {
    const boardRect = boardEl.getBoundingClientRect();
    const cellA = cells[combo[0]].getBoundingClientRect();
    const cellC = cells[combo[2]].getBoundingClientRect();

    const x1 = cellA.left + cellA.width / 2 - boardRect.left;
    const y1 = cellA.top + cellA.height / 2 - boardRect.top;
    const x2 = cellC.left + cellC.width / 2 - boardRect.left;
    const y2 = cellC.top + cellC.height / 2 - boardRect.top;

    winLineSvg.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);

    winLine.setAttribute('x1', x1);
    winLine.setAttribute('y1', y1);
    winLine.setAttribute('x2', x2);
    winLine.setAttribute('y2', y2);

    if (winner === 'O') {
      winLine.classList.add('win-o');
    } else {
      winLine.classList.remove('win-o');
    }

    winLine.classList.add('active');
  }

  function clearLine() {
    winLine.classList.remove('active', 'win-o');
    winLine.setAttribute('x1', '0');
    winLine.setAttribute('y1', '0');
    winLine.setAttribute('x2', '0');
    winLine.setAttribute('y2', '0');
  }

  // --- Actualización de Interfaz ---
  function updateTurnIndicator() {
    if (!isGameActive) {
      cardPlayerX.classList.remove('active-turn');
      cardPlayerO.classList.remove('active-turn');
      return;
    }

    if (currentPlayer === 'X') {
      cardPlayerX.classList.add('active-turn');
      cardPlayerO.classList.remove('active-turn');
      statusMessage.textContent = 'Turno de X';
    } else {
      cardPlayerX.classList.remove('active-turn');
      cardPlayerO.classList.add('active-turn');
      statusMessage.textContent = currentMode === 'ai' ? 'Turno de la IA (O)' : 'Turno de O';
    }
  }

  function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    isAIMoving = false;
    currentPlayer = 'X';
    matchStartTime = Date.now();
    moveCount = 0;

    clearLine();

    cells.forEach((cell, idx) => {
      cell.innerHTML = '';
      cell.classList.remove('taken', 'winning-cell');
      cell.setAttribute('aria-label', `Casilla ${idx + 1}`);
    });

    updateTurnIndicator();
  }

  // --- Modal de Resultado ---
  function openResultModal(icon, title, desc) {
    modalIcon.textContent = icon;
    resultTitle.textContent = title;
    resultDesc.textContent = desc;
    resultModal.classList.add('open');
    resultModal.setAttribute('aria-hidden', 'false');
    modalPlayAgainBtn.focus();
  }

  function closeResultModal() {
    resultModal.classList.remove('open');
    resultModal.setAttribute('aria-hidden', 'true');
  }

  // --- Modal de Leaderboard / Clasificación ---
  function openLeaderboardModal() {
    if (!leaderboardModal) return;
    leaderboardModal.classList.add('open');
    leaderboardModal.setAttribute('aria-hidden', 'false');
    loadLeaderboardData();
  }

  function closeLeaderboardModal() {
    if (!leaderboardModal) return;
    leaderboardModal.classList.remove('open');
    leaderboardModal.setAttribute('aria-hidden', 'true');
  }

  async function loadLeaderboardData() {
    const isConnected = window.supabaseService && window.supabaseService.isConfigured;

    if (dbStatusBanner) {
      dbStatusBanner.className = isConnected 
        ? 'db-status-banner connected' 
        : 'db-status-banner disconnected';
      
      const statusText = dbStatusBanner.querySelector('.status-text');
      if (statusText) {
        statusText.textContent = isConnected
          ? '⚡ Conectado a Supabase (Ranking en tiempo real)'
          : '⚠️ Modo local (Supabase sin credenciales en js/config.js)';
      }
    }

    if (!isConnected) {
      // Mostrar la guía amigable para conectar Supabase
      if (leaderboardLoading) leaderboardLoading.style.display = 'none';
      if (leaderboardTable) leaderboardTable.style.display = 'none';
      if (leaderboardEmpty) leaderboardEmpty.style.display = 'none';
      if (supabaseGuide) supabaseGuide.style.display = 'block';
      return;
    }

    // Si está conectado, consultar datos en Supabase
    if (supabaseGuide) supabaseGuide.style.display = 'none';
    if (leaderboardEmpty) leaderboardEmpty.style.display = 'none';
    if (leaderboardTable) leaderboardTable.style.display = 'none';
    if (leaderboardLoading) leaderboardLoading.style.display = 'block';

    const result = await window.supabaseService.fetchLeaderboard();
    leaderboardLoading.style.display = 'none';

    if (result.success && result.data && result.data.length > 0) {
      renderLeaderboardRows(result.data);
      leaderboardTable.style.display = 'table';
    } else {
      leaderboardEmpty.style.display = 'block';
    }
  }

  function renderLeaderboardRows(players) {
    if (!leaderboardTbody) return;
    leaderboardTbody.innerHTML = '';
    const myNick = window.supabaseService ? window.supabaseService.getNickname() : '';

    players.forEach((p, idx) => {
      const rank = idx + 1;
      let rankDisplay = rank;
      if (rank === 1) rankDisplay = '<span class="rank-badge rank-1">🥇</span>';
      else if (rank === 2) rankDisplay = '<span class="rank-badge rank-2">🥈</span>';
      else if (rank === 3) rankDisplay = '<span class="rank-badge rank-3">🥉</span>';
      else rankDisplay = `<span class="rank-badge">${rank}</span>`;

      const isMe = p.nickname.toLowerCase() === myNick.toLowerCase();
      const tr = document.createElement('tr');
      if (isMe) tr.className = 'current-user';

      tr.innerHTML = `
        <td>${rankDisplay}</td>
        <td>${escapeHtml(p.nickname)} ${isMe ? '(Tú)' : ''}</td>
        <td><strong>${p.wins || 0}</strong></td>
        <td>${p.losses || 0}</td>
        <td>${p.max_streak || 0}</td>
        <td><span class="win-rate-pill">${p.win_rate_percentage || 0}%</span></td>
      `;
      leaderboardTbody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
