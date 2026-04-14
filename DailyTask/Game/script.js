// 全局变量
let chess;
let ai;
let selectedPiece = null;
let validMoves = [];

// 初始化游戏
function initGame() {
    chess = new Chess();
    const difficulty = document.getElementById('difficulty').value;
    ai = new AI(difficulty);
    renderBoard();
    updateGameInfo();
    document.getElementById('message').textContent = '';
}

// 渲染棋盘
function renderBoard() {
    const chessboard = document.getElementById('chessboard');
    chessboard.innerHTML = '';
    
    // 渲染棋子
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = chess.board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `chess-piece ${piece.color}`;
                pieceElement.textContent = piece.type;
                // 根据屏幕尺寸调整网格大小
                const gridWidth = window.innerWidth <= 500 ? 40 : 53.33;
                const gridHeight = window.innerWidth <= 500 ? 42 : 56;
                pieceElement.style.top = `${row * gridHeight + gridHeight / 2}px`;
                pieceElement.style.left = `${col * gridWidth + gridWidth / 2}px`;
                pieceElement.style.transform = 'translate(-50%, -50%)';
                pieceElement.dataset.row = row;
                pieceElement.dataset.col = col;
                
                // 添加点击事件
                pieceElement.addEventListener('click', () => handlePieceClick(row, col));
                
                chessboard.appendChild(pieceElement);
            }
        }
    }
    
    // 渲染可移动的位置
    renderValidMoves();
}

// 渲染可移动的位置
function renderValidMoves() {
    const chessboard = document.getElementById('chessboard');
    
    for (const move of validMoves) {
        const indicator = document.createElement('div');
        const targetPiece = chess.board[move.row][move.col];
        
        if (targetPiece) {
            // 吃子的位置
            indicator.className = 'capture-indicator';
        } else {
            // 可移动的位置
            indicator.className = 'move-indicator';
        }
        
        // 根据屏幕尺寸调整网格大小
        const gridWidth = window.innerWidth <= 500 ? 40 : 53.33;
        const gridHeight = window.innerWidth <= 500 ? 42 : 56;
        indicator.style.top = `${move.row * gridHeight + gridHeight / 2}px`;
        indicator.style.left = `${move.col * gridWidth + gridWidth / 2}px`;
        indicator.style.transform = 'translate(-100%, -100%)';
        indicator.dataset.row = move.row;
        indicator.dataset.col = move.col;
        
        // 添加点击事件
        indicator.addEventListener('click', () => handleMoveClick(move.row, move.col));
        
        chessboard.appendChild(indicator);
    }
}

// 处理棋子点击
function handlePieceClick(row, col) {
    const piece = chess.board[row][col];
    
    // 检查游戏是否正在进行
    if (chess.gameStatus !== 'playing') {
        return;
    }
    
    // 检查是否是当前玩家的棋子
    if (piece.color !== chess.currentPlayer) {
        return;
    }
    
    // 选中棋子
    selectedPiece = { row, col };
    validMoves = chess.getValidMoves(row, col);
    renderBoard();
}

// 处理移动点击
function handleMoveClick(row, col) {
    if (selectedPiece) {
        const success = chess.move(selectedPiece.row, selectedPiece.col, row, col);
        if (success) {
            selectedPiece = null;
            validMoves = [];
            renderBoard();
            updateGameInfo();
            
            // 检查游戏是否结束
            if (chess.gameStatus !== 'playing') {
                showGameResult();
                return;
            }
            
            // AI移动
            if (chess.currentPlayer === 'black') {
                setTimeout(() => {
                    const aiMove = ai.getMove(chess);
                    if (aiMove) {
                        chess.move(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
                        renderBoard();
                        updateGameInfo();
                        
                        // 检查游戏是否结束
                        if (chess.gameStatus !== 'playing') {
                            showGameResult();
                        }
                    }
                }, 500);
            }
        }
    }
}

// 更新游戏信息
function updateGameInfo() {
    document.getElementById('turn').textContent = `当前回合：${chess.currentPlayer === 'red' ? '红方' : '黑方'}`;
    
    let statusText = '游戏进行中';
    if (chess.gameStatus === 'red_win') {
        statusText = '红方胜利！';
    } else if (chess.gameStatus === 'black_win') {
        statusText = '黑方胜利！';
    }
    document.getElementById('status').textContent = statusText;
}

// 显示游戏结果
function showGameResult() {
    let message = '';
    if (chess.gameStatus === 'red_win') {
        message = '恭喜你，红方胜利！';
    } else if (chess.gameStatus === 'black_win') {
        message = '很遗憾，黑方胜利！';
    }
    document.getElementById('message').textContent = message;
}

// 悔棋
function undoMove() {
    if (chess.undo()) {
        selectedPiece = null;
        validMoves = [];
        renderBoard();
        updateGameInfo();
        document.getElementById('message').textContent = '';
    }
}

// 重新开始游戏
function restartGame() {
    initGame();
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    initGame();
    
    // 开始游戏按钮
    document.getElementById('start-btn').addEventListener('click', initGame);
    
    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    // 悔棋按钮
    document.getElementById('undo-btn').addEventListener('click', undoMove);
    
    // 难度选择
    document.getElementById('difficulty').addEventListener('change', (e) => {
        if (ai) {
            ai.setDifficulty(e.target.value);
        }
    });
});