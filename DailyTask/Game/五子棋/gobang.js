class Gobang {
    constructor() {
        this.boardSize = 15;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameStatus = 'idle';
        this.moveHistory = [];
        this.lastMove = null;
    }

    reset() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameStatus = 'playing';
        this.moveHistory = [];
        this.lastMove = null;
    }

    getBoard() {
        return this.board;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    getGameStatus() {
        return this.gameStatus;
    }

    getLastMove() {
        return this.lastMove;
    }

    canUndo() {
        return this.moveHistory.length > 0 && this.gameStatus === 'playing';
    }

    getMoveHistory() {
        return this.moveHistory;
    }

    makeMove(row, col) {
        if (this.gameStatus !== 'playing') {
            return { success: false, reason: '游戏未开始或已结束' };
        }

        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
            return { success: false, reason: '超出棋盘范围' };
        }

        if (this.board[row][col] !== null) {
            return { success: false, reason: '该位置已有棋子' };
        }

        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        this.lastMove = { row, col };

        const winResult = this.checkWin(row, col);
        if (winResult) {
            this.gameStatus = winResult.winner + '_win';
            return { success: true, gameOver: true, winner: winResult.winner };
        }

        if (this.isBoardFull()) {
            this.gameStatus = 'draw';
            return { success: true, gameOver: true, winner: 'draw' };
        }

        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        return { success: true, gameOver: false };
    }

    undo() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = null;
        this.currentPlayer = lastMove.player;
        this.lastMove = this.moveHistory.length > 0
            ? { row: this.moveHistory[this.moveHistory.length - 1].row, col: this.moveHistory[this.moveHistory.length - 1].col }
            : null;

        if (this.gameStatus.endsWith('_win') || this.gameStatus === 'draw') {
            this.gameStatus = 'playing';
        }

        return true;
    }

    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];

        for (const { dr, dc } of directions) {
            let count = 1;
            count += this.countInDirection(row, col, dr, dc, player);
            count += this.countInDirection(row, col, -dr, -dc, player);

            if (count >= 5) {
                return { winner: player };
            }
        }

        return null;
    }

    countInDirection(row, col, dr, dc, player) {
        let count = 0;
        let r = row + dr;
        let c = col + dc;

        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }

        return count;
    }

    isBoardFull() {
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    getValidMoves() {
        const moves = [];
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === null) {
                    moves.push({ row: r, col: c });
                }
            }
        }
        return moves;
    }

    clone() {
        const newGame = new Gobang();
        newGame.board = this.board.map(row => [...row]);
        newGame.currentPlayer = this.currentPlayer;
        newGame.gameStatus = this.gameStatus;
        newGame.moveHistory = [...this.moveHistory];
        newGame.lastMove = this.lastMove;
        return newGame;
    }
}

window.Gobang = Gobang;