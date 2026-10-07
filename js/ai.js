/**
 * TicTacToe AI - Algoritmos de inteligencia artificial para Tres en Raya:
 * - Fácil: Movimientos aleatorios.
 * - Normal: Estratégico (gana y bloquea amenazas inmediatas, con probabilidad de despiste).
 * - Imbatible (Minimax): Evaluación óptima del árbol de juego.
 */
class TicTacToeAI {
  constructor() {
    this.winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
      [0, 4, 8], [2, 4, 6]             // Diagonales
    ];
  }

  getEmptyCells(board) {
    const cells = [];
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) cells.push(i);
    }
    return cells;
  }

  checkWin(board, player) {
    return this.winningLines.some(line => {
      return line.every(idx => board[idx] === player);
    });
  }

  isTerminal(board) {
    if (this.checkWin(board, 'X')) return { winner: 'X' };
    if (this.checkWin(board, 'O')) return { winner: 'O' };
    if (this.getEmptyCells(board).length === 0) return { winner: 'tie' };
    return null;
  }

  getMove(board, difficulty, aiPlayer = 'O', humanPlayer = 'X') {
    const emptyCells = this.getEmptyCells(board);
    if (emptyCells.length === 0) return null;

    if (difficulty === 'easy') {
      return this.getRandomMove(emptyCells);
    } else if (difficulty === 'normal') {
      return this.getNormalMove(board, emptyCells, aiPlayer, humanPlayer);
    } else {
      return this.getMinimaxMove(board, aiPlayer, humanPlayer);
    }
  }

  getRandomMove(emptyCells) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  getNormalMove(board, emptyCells, aiPlayer, humanPlayer) {
    // 1. Ganar si es posible en este turno
    for (const idx of emptyCells) {
      board[idx] = aiPlayer;
      if (this.checkWin(board, aiPlayer)) {
        board[idx] = '';
        return idx;
      }
      board[idx] = '';
    }

    // 2. Bloquear victoria inminente del humano
    for (const idx of emptyCells) {
      board[idx] = humanPlayer;
      if (this.checkWin(board, humanPlayer)) {
        board[idx] = '';
        return idx;
      }
      board[idx] = '';
    }

    // 3. Con 30% de probabilidad hacer un movimiento aleatorio (para ser humano y no perfecto)
    if (Math.random() < 0.3) {
      return this.getRandomMove(emptyCells);
    }

    // 4. Preferir el centro
    if (emptyCells.includes(4)) return 4;

    // 5. Preferir esquinas
    const corners = [0, 2, 6, 8].filter(idx => emptyCells.includes(idx));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return this.getRandomMove(emptyCells);
  }

  getMinimaxMove(board, aiPlayer, humanPlayer) {
    const emptyCells = this.getEmptyCells(board);

    // Optimización: si el tablero está vacío, elegir centro o esquina aleatoria de inmediato
    if (emptyCells.length === 9) {
      const bestOpenings = [0, 2, 4, 6, 8];
      return bestOpenings[Math.floor(Math.random() * bestOpenings.length)];
    }

    let bestScore = -Infinity;
    let bestMove = emptyCells[0];

    for (const idx of emptyCells) {
      board[idx] = aiPlayer;
      const score = this.minimax(board, 0, false, aiPlayer, humanPlayer, -Infinity, Infinity);
      board[idx] = '';

      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    return bestMove;
  }

  minimax(board, depth, isMaximizing, aiPlayer, humanPlayer, alpha, beta) {
    const terminal = this.isTerminal(board);
    if (terminal) {
      if (terminal.winner === aiPlayer) return 10 - depth;
      if (terminal.winner === humanPlayer) return depth - 10;
      return 0; // empate
    }

    const emptyCells = this.getEmptyCells(board);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of emptyCells) {
        board[idx] = aiPlayer;
        const evaluation = this.minimax(board, depth + 1, false, aiPlayer, humanPlayer, alpha, beta);
        board[idx] = '';
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Poda alfa-beta
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of emptyCells) {
        board[idx] = humanPlayer;
        const evaluation = this.minimax(board, depth + 1, true, aiPlayer, humanPlayer, alpha, beta);
        board[idx] = '';
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Poda alfa-beta
      }
      return minEval;
    }
  }
}

window.ticTacToeAI = new TicTacToeAI();
