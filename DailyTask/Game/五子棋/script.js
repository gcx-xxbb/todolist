let game;
let ai;
let gameMode = 'pvp';
let selectedDifficulty = 'medium';
let cellSize = 30;
let boardOffset = 15;

document.addEventListener('DOMContentLoaded', () => {
    game = new Gobang();
    ai = new GobangAI(selectedDifficulty);

    initBoard();
    setupEventListeners();
    updateDisplay();
});

function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    const isMobile = window.innerWidth <= 520;
    cellSize = isMobile ? 20 : 30;
    boardOffset = cellSize / 2;

    const boardSize = 15 * cellSize;
    board.style.width = boardSize + 'px';
    board.style.height = boardSize + 'px';
}

function setupEventListeners() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameMode = btn.dataset.mode;

            const difficultySelector = document.getElementById('difficultySelector');
            if (gameMode === 'pve') {
                difficultySelector.style.display = 'block';
            } else {
                difficultySelector.style.display = 'none';
            }
        });
    });

    document.getElementById('difficulty').addEventListener('change', (e) => {
        selectedDifficulty = e.target.value;
        ai.setLevel(selectedDifficulty);
    });

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('undo-btn').addEventListener('click', undoMove);

    const board = document.getElementById('board');
    board.addEventListener('click', handleBoardClick);
}

function startGame() {
    game.reset();
    ai = new GobangAI(selectedDifficulty);
    renderBoard();
    updateDisplay();
    document.getElementById('board').classList.remove('disabled');
    document.getElementById('undo-btn').disabled = true;
}

function restartGame() {
    game.reset();
    renderBoard();
    updateDisplay();
    document.getElementById('board').classList.remove('disabled');
    document.getElementById('undo-btn').disabled = true;
}

function handleBoardClick(e) {
    if (game.getGameStatus() !== 'playing') {
        return;
    }

    if (gameMode === 'pve' && game.getCurrentPlayer() === 'white') {
        return;
    }

    const board = document.getElementById('board');
    const rect = board.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.round((x - boardOffset) / cellSize);
    const row = Math.round((y - boardOffset) / cellSize);

    if (row < 0 || row >= 15 || col < 0 || col >= 15) {
        return;
    }

    const result = game.makeMove(row, col);

    if (result.success) {
        renderBoard();
        updateDisplay();

        document.getElementById('undo-btn').disabled = !game.canUndo();

        if (result.gameOver) {
            showGameResult(result.winner);
            document.getElementById('board').classList.add('disabled');
            return;
        }

        if (gameMode === 'pve' && game.getCurrentPlayer() === 'white') {
            document.getElementById('board').classList.add('disabled');

            setTimeout(() => {
                const aiMove = ai.getMove(game);
                if (aiMove) {
                    const aiResult = game.makeMove(aiMove.row, aiMove.col);
                    renderBoard();
                    updateDisplay();

                    document.getElementById('undo-btn').disabled = !game.canUndo();

                    if (aiResult.gameOver) {
                        showGameResult(aiResult.winner);
                        document.getElementById('board').classList.add('disabled');
                    } else {
                        document.getElementById('board').classList.remove('disabled');
                    }
                }
            }, 300);
        }
    }
}

function undoMove() {
    if (!game.canUndo()) return;

    if (gameMode === 'pve') {
        if (game.moveHistory.length >= 2) {
            game.undo();
            game.undo();
        }
    } else {
        game.undo();
    }

    renderBoard();
    updateDisplay();
    document.getElementById('undo-btn').disabled = !game.canUndo();
    document.getElementById('board').classList.remove('disabled');
    document.getElementById('message').textContent = '';
}

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    const isMobile = window.innerWidth <= 520;
    cellSize = isMobile ? 20 : 30;
    boardOffset = cellSize / 2;

    const boardSize = 15 * cellSize;
    board.style.width = boardSize + 'px';
    board.style.height = boardSize + 'px';

    const boardData = game.getBoard();
    const lastMove = game.getLastMove();

    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (boardData[r][c] !== null) {
                const stone = document.createElement('div');
                stone.className = `stone ${boardData[r][c]}`;

                if (lastMove && lastMove.row === r && lastMove.col === c) {
                    stone.classList.add('last');
                }

                stone.style.left = (c * cellSize + boardOffset) + 'px';
                stone.style.top = (r * cellSize + boardOffset) + 'px';

                board.appendChild(stone);
            }
        }
    }
}

function updateDisplay() {
    const statusEl = document.getElementById('status');
    const turnEl = document.getElementById('turn');

    if (game.getGameStatus() === 'idle') {
        statusEl.textContent = '请选择模式并开始游戏';
        turnEl.textContent = '';
        return;
    }

    if (game.getGameStatus() === 'playing') {
        const playerName = game.getCurrentPlayer() === 'black' ? '黑方' : '白方';
        const modeText = gameMode === 'pve' ? '(人机)' : '(双人对战)';
        statusEl.textContent = `游戏进行中 ${modeText}`;
        turnEl.textContent = `当前回合：${playerName}`;
    }
}

function showGameResult(winner) {
    const messageEl = document.getElementById('message');

    if (winner === 'black') {
        messageEl.textContent = '黑方获胜！';
    } else if (winner === 'white') {
        if (gameMode === 'pve') {
            messageEl.textContent = 'AI获胜！';
        } else {
            messageEl.textContent = '白方获胜！';
        }
    } else if (winner === 'draw') {
        messageEl.textContent = '平局！';
    }
}

window.addEventListener('resize', () => {
    if (game.getGameStatus() === 'playing' || game.getMoveHistory().length > 0) {
        renderBoard();
    }
});