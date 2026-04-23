/**
 * 中国象棋游戏交互逻辑
 * 处理用户输入、游戏流程、保存加载等
 */
let game;
let ai;
let gameMode = 'pvp';
let selectedDifficulty = 'medium';
let selectedFirstMove = 'player';
let selectedPiece = null;
let validMoves = [];
let cellSize = 57.78;
let boardOffsetX = 0;
let boardOffsetY = 0;
let isVictoryShowing = false;

document.addEventListener('DOMContentLoaded', () => {
    game = new ChineseChess();
    ai = new ChessAI(selectedDifficulty);
    initBoard();
    setupEventListeners();
    updateDisplay();
});

function initBoard() {
    const board = document.getElementById('board');
    const isMobile = window.innerWidth <= 560;

    if (isMobile) {
        cellSize = 40;
    } else {
        cellSize = 57.78;
    }

    boardOffsetX = cellSize / 2;
    boardOffsetY = cellSize / 2;

    const boardWidth = 9 * cellSize;
    const boardHeight = 10 * cellSize;
    board.style.width = boardWidth + 'px';
    board.style.height = boardHeight + 'px';
}

function setupEventListeners() {
    const gameModeSelect = document.getElementById('gameMode');
    gameModeSelect.addEventListener('change', (e) => {
        gameMode = e.target.value;
        const difficultySection = document.getElementById('difficultySection');
        const firstMoveSection = document.getElementById('firstMoveSection');

        if (gameMode === 'pve') {
            difficultySection.style.display = 'flex';
            firstMoveSection.style.display = 'flex';
        } else {
            difficultySection.style.display = 'none';
            firstMoveSection.style.display = 'none';
        }
    });

    document.getElementById('difficulty').addEventListener('change', (e) => {
        selectedDifficulty = e.target.value;
        ai.setLevel(selectedDifficulty);
    });

    document.getElementById('firstMove').addEventListener('change', (e) => {
        selectedFirstMove = e.target.value;
    });

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('undoBtn').addEventListener('click', undoMove);
    document.getElementById('saveBtn').addEventListener('click', saveGame);
    document.getElementById('loadBtn').addEventListener('click', loadGame);

    const board = document.getElementById('board');
    board.addEventListener('click', handleBoardClick);
}

function startGame() {
    game.reset();
    ai = new ChessAI(selectedDifficulty);
    isVictoryShowing = false;

    const overlay = document.getElementById('victoryOverlay');
    if (overlay) overlay.remove();

    const board = document.getElementById('board');
    board.classList.remove('victory');

    if (gameMode === 'pve') {
        game.setPlayerColor('red');
        if (selectedFirstMove === 'ai') {
            game.currentPlayer = 'black';
        } else {
            game.currentPlayer = 'red';
        }
    } else {
        game.setPlayerColor('red');
        game.currentPlayer = 'red';
    }

    renderBoard();
    updateDisplay();
    updateCheckWarning();
    document.getElementById('board').classList.remove('disabled');
    document.getElementById('undoBtn').disabled = true;

    if (gameMode === 'pve' && game.currentPlayer === 'black') {
        document.getElementById('board').classList.add('disabled');
        setTimeout(makeAIMove, 500);
    }
}

function restartGame() {
    game.reset();
    selectedPiece = null;
    validMoves = [];
    isVictoryShowing = false;

    const overlay = document.getElementById('victoryOverlay');
    if (overlay) overlay.remove();

    const board = document.getElementById('board');
    board.classList.remove('victory');

    if (gameMode === 'pve') {
        game.setPlayerColor('red');
        if (selectedFirstMove === 'ai') {
            game.currentPlayer = 'black';
        } else {
            game.currentPlayer = 'red';
        }
    } else {
        game.setPlayerColor('red');
        game.currentPlayer = 'red';
    }

    renderBoard();
    updateDisplay();
    updateCheckWarning();
    document.getElementById('board').classList.remove('disabled');
    document.getElementById('undoBtn').disabled = true;
    document.getElementById('message').textContent = '';

    if (gameMode === 'pve' && game.currentPlayer === 'black') {
        document.getElementById('board').classList.add('disabled');
        setTimeout(makeAIMove, 500);
    }
}

function handleBoardClick(e) {
    if (isVictoryShowing) {
        return;
    }

    if (game.getGameStatus() !== 'playing') {
        return;
    }

    if (gameMode === 'pve' && game.currentPlayer !== game.getPlayerColor()) {
        return;
    }

    const board = document.getElementById('board');
    const rect = board.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.round((x - boardOffsetX) / cellSize);
    const row = Math.round((y - boardOffsetY) / cellSize);

    if (row < 0 || row >= 10 || col < 0 || col >= 9) {
        return;
    }

    const clickedPiece = game.getBoard()[row][col];

    if (selectedPiece) {
        const isValidMoveTarget = validMoves.some(m => m.row === row && m.col === col);

        if (isValidMoveTarget) {
            const result = game.makeMove(selectedPiece.row, selectedPiece.col, row, col);

            if (result.success) {
                selectedPiece = null;
                validMoves = [];
                renderBoard();
                updateDisplay();
                updateCheckWarning();
                document.getElementById('undoBtn').disabled = !game.canUndo();

                if (result.gameOver) {
                    showGameResult(result.winner);
                    document.getElementById('board').classList.add('disabled');
                    return;
                }

                if (!result.gameOver && gameMode === 'pvp') {
                    const nextPlayer = game.getCurrentPlayer();
                    if (game.isInCheck(nextPlayer) && !game.hasLegalMoves(nextPlayer)) {
                        const winner = game.currentPlayer === 'red' ? 'black' : 'red';
                        game.gameStatus = winner + '_win';
                        showGameResult(winner);
                        document.getElementById('board').classList.add('disabled');
                        return;
                    }
                }

                if (gameMode === 'pve') {
                    document.getElementById('board').classList.add('disabled');
                    setTimeout(makeAIMove, 500);
                }
            }
        } else if (clickedPiece && clickedPiece.color === game.currentPlayer) {
            selectedPiece = { row, col };
            validMoves = game.getValidMoves(row, col);
            renderBoard();
        } else {
            selectedPiece = null;
            validMoves = [];
            renderBoard();
        }
    } else {
        if (clickedPiece && clickedPiece.color === game.currentPlayer) {
            selectedPiece = { row, col };
            validMoves = game.getValidMoves(row, col);
            renderBoard();
        }
    }
}

function makeAIMove() {
    if (game.getGameStatus() !== 'playing') return;
    if (gameMode !== 'pve') return;
    if (game.currentPlayer === game.getPlayerColor()) return;

    try {
        const aiMove = ai.getMove(game);

        if (!aiMove) {
            const currentPlayer = game.getCurrentPlayer();
            const opponent = currentPlayer === 'red' ? 'black' : 'red';

            if (game.isInCheck(currentPlayer)) {
                game.gameStatus = opponent + '_win';
                showGameResult(opponent);
                document.getElementById('board').classList.add('disabled');
                document.getElementById('message').textContent = currentPlayer === 'red' ? '红方被将死！' : '黑方被将死！';
            } else {
                game.gameStatus = 'draw';
                document.getElementById('message').textContent = '双方僵持，判为平局！';
            }
            updateDisplay();
            return;
        }

        const result = game.makeMove(aiMove.fromRow, aiMove.fromCol, aiMove.row, aiMove.col);

        if (result.success) {
            renderBoard();
            updateDisplay();
            updateCheckWarning();
            document.getElementById('undoBtn').disabled = !game.canUndo();

            if (result.gameOver) {
                showGameResult(result.winner);
                document.getElementById('board').classList.add('disabled');
                return;
            }

            document.getElementById('board').classList.remove('disabled');
        } else {
            document.getElementById('board').classList.remove('disabled');
        }
    } catch (error) {
        console.error('AI move error:', error);
        document.getElementById('board').classList.remove('disabled');
    }
}

function undoMove() {
    if (!game.canUndo()) return;

    const wasVictoryShowing = isVictoryShowing;
    isVictoryShowing = false;

    const overlay = document.getElementById('victoryOverlay');
    if (overlay) overlay.remove();

    const board = document.getElementById('board');
    board.classList.remove('victory');

    if (gameMode === 'pve') {
        const playerColor = game.getPlayerColor();
        if (game.moveHistory.length >= 2) {
            game.undo();
            game.undo();
        }
        if (game.currentPlayer === playerColor) {
            document.getElementById('board').classList.remove('disabled');
        } else {
            document.getElementById('board').classList.add('disabled');
        }
    } else {
        game.undo();
        document.getElementById('board').classList.remove('disabled');
    }

    selectedPiece = null;
    validMoves = [];
    renderBoard();
    updateDisplay();
    updateCheckWarning();
    document.getElementById('undoBtn').disabled = !game.canUndo();
    document.getElementById('message').textContent = '';
}

function saveGame() {
    if (game.getGameStatus() === 'idle') {
        alert('请先开始游戏');
        return;
    }

    const saveData = {
        gameData: game.toJSON(),
        mode: gameMode,
        difficulty: selectedDifficulty,
        firstMove: selectedFirstMove,
        timestamp: new Date().toISOString()
    };

    const saves = JSON.parse(localStorage.getItem('chessSaves') || '[]');
    saves.unshift(saveData);

    if (saves.length > 10) {
        saves.pop();
    }

    localStorage.setItem('chessSaves', JSON.stringify(saves));
    alert('游戏已保存！');
}

function loadGame() {
    const saves = JSON.parse(localStorage.getItem('chessSaves') || '[]');

    if (saves.length === 0) {
        alert('没有保存的游戏');
        return;
    }

    const modal = createSaveLoadModal(saves);
    document.body.appendChild(modal);
}

function createSaveLoadModal(saves) {
    const modal = document.createElement('div');
    modal.className = 'save-load-modal';
    modal.id = 'saveLoadModal';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const title = document.createElement('h2');
    title.textContent = '加载游戏';
    content.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'save-list';

    saves.forEach((save, index) => {
        const li = document.createElement('li');

        const info = document.createElement('div');
        info.className = 'save-item-info';

        const modeText = save.mode === 'pve' ? '人机对战' : '双人对战';
        const difficultyText = getDifficultyText(save.difficulty);
        const date = new Date(save.timestamp);
        const timeStr = date.toLocaleString('zh-CN');

        info.innerHTML = `
            <div>${modeText} - ${difficultyText}</div>
            <div class="save-item-time">${timeStr}</div>
        `;
        li.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'save-item-actions';

        const loadBtn = document.createElement('button');
        loadBtn.textContent = '加载';
        loadBtn.style.cssText = 'padding: 5px 10px; background: #8b4513; color: #fff; border: none; border-radius: 3px; cursor: pointer;';
        loadBtn.onclick = () => loadSave(index);
        actions.appendChild(loadBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除';
        deleteBtn.style.cssText = 'padding: 5px 10px; background: #ccc; color: #333; border: none; border-radius: 3px; cursor: pointer;';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSave(index);
            modal.remove();
            loadGame();
        };
        actions.appendChild(deleteBtn);

        li.appendChild(actions);
        list.appendChild(li);
    });

    content.appendChild(list);

    const buttons = document.createElement('div');
    buttons.className = 'modal-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = '关闭';
    cancelBtn.onclick = () => modal.remove();
    buttons.appendChild(cancelBtn);

    content.appendChild(buttons);

    modal.appendChild(content);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    return modal;
}

function loadSave(index) {
    const saves = JSON.parse(localStorage.getItem('chessSaves') || '[]');
    if (index < 0 || index >= saves.length) return;

    const save = saves[index];

    game = new ChineseChess();
    game.fromJSON(save.gameData);
    gameMode = save.mode;
    selectedDifficulty = save.difficulty;
    selectedFirstMove = save.firstMove;

    ai = new ChessAI(selectedDifficulty);

    document.getElementById('gameMode').value = gameMode;
    document.getElementById('difficulty').value = selectedDifficulty;
    document.getElementById('firstMove').value = selectedFirstMove;

    const difficultySection = document.getElementById('difficultySection');
    const firstMoveSection = document.getElementById('firstMoveSection');
    if (gameMode === 'pve') {
        difficultySection.style.display = 'flex';
        firstMoveSection.style.display = 'flex';
    } else {
        difficultySection.style.display = 'none';
        firstMoveSection.style.display = 'none';
    }

    selectedPiece = null;
    validMoves = [];

    renderBoard();
    updateDisplay();
    updateCheckWarning();
    document.getElementById('board').classList.remove('disabled');
    document.getElementById('undoBtn').disabled = !game.canUndo();
    document.getElementById('message').textContent = '';

    document.getElementById('saveLoadModal')?.remove();

    if (gameMode === 'pve' && game.currentPlayer !== game.getPlayerColor()) {
        document.getElementById('board').classList.add('disabled');
        setTimeout(makeAIMove, 500);
    }
}

function deleteSave(index) {
    const saves = JSON.parse(localStorage.getItem('chessSaves') || '[]');
    saves.splice(index, 1);
    localStorage.setItem('chessSaves', JSON.stringify(saves));
}

function getDifficultyText(difficulty) {
    const map = {
        'beginner': '初级',
        'easy': '简单',
        'medium': '中等',
        'hard': '困难',
        'expert': '专家'
    };
    return map[difficulty] || difficulty;
}

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    const isMobile = window.innerWidth <= 560;
    if (isMobile) {
        cellSize = 40;
    } else {
        cellSize = 57.78;
    }
    boardOffsetX = cellSize / 2;
    boardOffsetY = cellSize / 2;

    const boardData = game.getBoard();
    const lastMove = game.getLastMove();

    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 9; c++) {
            if (boardData[r][c] !== null) {
                const piece = boardData[r][c];
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece.color}`;
                pieceElement.textContent = piece.type;

                pieceElement.style.left = (c * cellSize + boardOffsetX) + 'px';
                pieceElement.style.top = (r * cellSize + boardOffsetY) + 'px';

                if (lastMove && lastMove.from && lastMove.to) {
                    if ((lastMove.from.row === r && lastMove.from.col === c) ||
                        (lastMove.to.row === r && lastMove.to.col === c)) {
                        pieceElement.classList.add('selected');
                    }
                }

                board.appendChild(pieceElement);
            }
        }
    }

    if (selectedPiece) {
        const selectedPieceEl = board.querySelector(`.piece[style*="left: ${selectedPiece.col * cellSize + boardOffsetX}px"][style*="top: ${selectedPiece.row * cellSize + boardOffsetY}px"]`);
        if (selectedPieceEl) {
            selectedPieceEl.classList.add('selected');
        }
    }

    for (const move of validMoves) {
        const indicator = document.createElement('div');
        const targetPiece = boardData[move.row][move.col];

        if (targetPiece) {
            indicator.className = 'capture-indicator';
        } else {
            indicator.className = 'move-indicator';
        }

        indicator.style.left = (move.col * cellSize + boardOffsetX) + 'px';
        indicator.style.top = (move.row * cellSize + boardOffsetY) + 'px';

        indicator.classList.add('valid-move');
        board.appendChild(indicator);
    }

    if (lastMove && lastMove.to) {
        const indicator = document.createElement('div');
        indicator.className = 'last-move-indicator';
        indicator.style.left = (lastMove.to.col * cellSize + boardOffsetX) + 'px';
        indicator.style.top = (lastMove.to.row * cellSize + boardOffsetY) + 'px';
        board.appendChild(indicator);
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
        const playerName = game.getCurrentPlayer() === 'red' ? '红方' : '黑方';
        const modeText = gameMode === 'pve' ? '(人机)' : '(双人对战)';
        statusEl.textContent = `游戏进行中 ${modeText}`;

        if (gameMode === 'pve') {
            const isPlayerTurn = game.getCurrentPlayer() === game.getPlayerColor();
            turnEl.textContent = isPlayerTurn ? `当前回合：玩家（${playerName}）` : `当前回合：AI`;
        } else {
            turnEl.textContent = `当前回合：${playerName}`;
        }
    }
}

function updateCheckWarning() {
    const checkWarning = document.getElementById('checkWarning');
    const currentPlayer = game.getCurrentPlayer();

    if (game.isInCheck(currentPlayer)) {
        checkWarning.style.display = 'block';
    } else {
        checkWarning.style.display = 'none';
    }
}

function showGameResult(winner, pattern = null) {
    isVictoryShowing = true;

    const board = document.getElementById('board');
    board.classList.add('victory');

    let winnerName;
    if (winner === 'red') {
        if (gameMode === 'pve' && game.getPlayerColor() === 'black') {
            winnerName = 'AI获胜！';
        } else {
            winnerName = '红方获胜！';
        }
    } else if (winner === 'black') {
        if (gameMode === 'pve' && game.getPlayerColor() === 'red') {
            winnerName = 'AI获胜！';
        } else {
            winnerName = '黑方获胜！';
        }
    }

    const messageEl = document.getElementById('message');
    messageEl.textContent = winnerName;

    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    overlay.id = 'victoryOverlay';

    const content = document.createElement('div');
    content.className = 'victory-content';

    const title = document.createElement('div');
    title.className = `victory-title ${winner}`;
    title.textContent = winnerName;
    content.appendChild(title);

    if (pattern) {
        const patternEl = document.createElement('div');
        patternEl.className = 'victory-pattern';
        patternEl.textContent = pattern;
        content.appendChild(patternEl);
    }

    const message = document.createElement('div');
    message.className = 'victory-message';
    message.textContent = pattern ? '恭喜获胜！' : '游戏结束';
    content.appendChild(message);

    const hint = document.createElement('div');
    hint.className = 'victory-hint';
    hint.textContent = '点击任意位置跳过';
    content.appendChild(hint);

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', skipVictoryAnimation);
}

function skipVictoryAnimation() {
    const overlay = document.getElementById('victoryOverlay');
    if (overlay) {
        overlay.remove();
    }
    isVictoryShowing = false;
}

window.addEventListener('resize', () => {
    if (game.getGameStatus() !== 'idle') {
        renderBoard();
    }
});