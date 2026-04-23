/**
 * 中国象棋游戏核心类
 * 实现完整的象棋规则、走子逻辑、胜负判定
 */
class ChineseChess {
    constructor() {
        this.boardSize = 10;
        this.colSize = 9;
        this.board = this.initBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.gameStatus = 'idle';
        this.lastMove = null;
        this.playerColor = 'red';
    }

    initBoard() {
        const board = Array(this.boardSize).fill().map(() => Array(this.colSize).fill(null));

        board[0][0] = { type: '车', color: 'black' };
        board[0][1] = { type: '马', color: 'black' };
        board[0][2] = { type: '象', color: 'black' };
        board[0][3] = { type: '士', color: 'black' };
        board[0][4] = { type: '将', color: 'black' };
        board[0][5] = { type: '士', color: 'black' };
        board[0][6] = { type: '象', color: 'black' };
        board[0][7] = { type: '马', color: 'black' };
        board[0][8] = { type: '车', color: 'black' };
        board[2][1] = { type: '炮', color: 'black' };
        board[2][7] = { type: '炮', color: 'black' };
        board[3][0] = { type: '卒', color: 'black' };
        board[3][2] = { type: '卒', color: 'black' };
        board[3][4] = { type: '卒', color: 'black' };
        board[3][6] = { type: '卒', color: 'black' };
        board[3][8] = { type: '卒', color: 'black' };

        board[9][0] = { type: '车', color: 'red' };
        board[9][1] = { type: '马', color: 'red' };
        board[9][2] = { type: '相', color: 'red' };
        board[9][3] = { type: '士', color: 'red' };
        board[9][4] = { type: '帅', color: 'red' };
        board[9][5] = { type: '士', color: 'red' };
        board[9][6] = { type: '相', color: 'red' };
        board[9][7] = { type: '马', color: 'red' };
        board[9][8] = { type: '车', color: 'red' };
        board[7][1] = { type: '炮', color: 'red' };
        board[7][7] = { type: '炮', color: 'red' };
        board[6][0] = { type: '兵', color: 'red' };
        board[6][2] = { type: '兵', color: 'red' };
        board[6][4] = { type: '兵', color: 'red' };
        board[6][6] = { type: '兵', color: 'red' };
        board[6][8] = { type: '兵', color: 'red' };

        return board;
    }

    reset() {
        this.board = this.initBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.gameStatus = 'playing';
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

    getMoveHistory() {
        return this.moveHistory;
    }

    getPlayerColor() {
        return this.playerColor;
    }

    setPlayerColor(color) {
        this.playerColor = color;
    }

    canUndo() {
        return this.moveHistory.length > 0 && this.gameStatus === 'playing';
    }

    isInBoard(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.colSize;
    }

    isOwnPiece(row, col, color) {
        const piece = this.board[row][col];
        return piece && piece.color === color;
    }

    isEnemyPiece(row, col, color) {
        const piece = this.board[row][col];
        return piece && piece.color !== color;
    }

    isGeneralFaceToFace() {
        let redGeneral = null;
        let blackGeneral = null;

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.colSize; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === '帅') {
                    redGeneral = { row, col };
                } else if (piece && piece.type === '将') {
                    blackGeneral = { row, col };
                }
            }
        }

        if (redGeneral && blackGeneral && redGeneral.col === blackGeneral.col) {
            const minRow = Math.min(redGeneral.row, blackGeneral.row);
            const maxRow = Math.max(redGeneral.row, blackGeneral.row);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][redGeneral.col]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    isInPalace(row, col, color) {
        if (color === 'red') {
            return row >= 7 && row <= 9 && col >= 3 && col <= 5;
        } else {
            return row >= 0 && row <= 2 && col >= 3 && col <= 5;
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        if (this.isOwnPiece(toRow, toCol, piece.color)) {
            return false;
        }

        let valid = false;
        switch (piece.type) {
            case '帅':
            case '将':
                valid = this.isValidGeneralMove(fromRow, fromCol, toRow, toCol, piece.color);
                break;
            case '士':
                valid = this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.color);
                break;
            case '相':
            case '象':
                valid = this.isValidElephantMove(fromRow, fromCol, toRow, toCol, piece.color);
                break;
            case '马':
                valid = this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
                break;
            case '车':
                valid = this.isValidChariotMove(fromRow, fromCol, toRow, toCol);
                break;
            case '炮':
                valid = this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
                break;
            case '兵':
            case '卒':
                valid = this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
                break;
            default:
                valid = false;
        }

        if (valid) {
            const tempBoard = this.board.map(row => [...row]);
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;

            const wouldFace = this.isGeneralFaceToFace();

            this.board = tempBoard;

            if (wouldFace) {
                return false;
            }
        }

        return valid;
    }

    isValidGeneralMove(fromRow, fromCol, toRow, toCol, color) {
        if (!this.isInPalace(toRow, toCol, color)) {
            return false;
        }

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    isValidAdvisorMove(fromRow, fromCol, toRow, toCol, color) {
        if (!this.isInPalace(toRow, toCol, color)) {
            return false;
        }

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        return rowDiff === 1 && colDiff === 1;
    }

    isValidElephantMove(fromRow, fromCol, toRow, toCol, color) {
        if (color === 'red' && toRow < 5) {
            return false;
        }
        if (color === 'black' && toRow > 4) {
            return false;
        }

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (rowDiff === 2 && colDiff === 2) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            return !this.board[midRow][midCol];
        }

        return false;
    }

    isValidHorseMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            if (rowDiff === 2) {
                const midRow = fromRow + (toRow > fromRow ? 1 : -1);
                if (this.board[midRow][fromCol]) {
                    return false;
                }
            } else {
                const midCol = fromCol + (toCol > fromCol ? 1 : -1);
                if (this.board[fromRow][midCol]) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    isValidChariotMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }

        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) {
                    return false;
                }
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) {
                    return false;
                }
            }
        }

        return true;
    }

    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }

        let pieceCount = 0;

        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) {
                    pieceCount++;
                }
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) {
                    pieceCount++;
                }
            }
        }

        const targetPiece = this.board[toRow][toCol];
        if (targetPiece) {
            return pieceCount === 1;
        } else {
            return pieceCount === 0;
        }
    }

    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);

        if (color === 'red') {
            if (fromRow > 4) {
                return rowDiff === -1 && colDiff === 0;
            } else {
                return rowDiff <= 0 && Math.abs(rowDiff) + colDiff === 1;
            }
        } else {
            if (fromRow < 5) {
                return rowDiff === 1 && colDiff === 0;
            } else {
                return rowDiff >= 0 && Math.abs(rowDiff) + colDiff === 1;
            }
        }
    }

    isInCheck(color) {
        let generalPos = null;

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.colSize; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === (color === 'red' ? '帅' : '将')) {
                    generalPos = { row, col };
                    break;
                }
            }
            if (generalPos) break;
        }

        if (!generalPos) return false;

        const enemyColor = color === 'red' ? 'black' : 'red';

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.colSize; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === enemyColor) {
                    if (this.isValidMove(row, col, generalPos.row, generalPos.col)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (this.gameStatus !== 'playing') {
            return { success: false, reason: '游戏未开始或已结束' };
        }

        if (!this.isInBoard(fromRow, fromCol) || !this.isInBoard(toRow, toCol)) {
            return { success: false, reason: '超出棋盘范围' };
        }

        const piece = this.board[fromRow][fromCol];
        if (!piece) {
            return { success: false, reason: '起始位置没有棋子' };
        }

        if (piece.color !== this.currentPlayer) {
            return { success: false, reason: '这是对方的棋子' };
        }

        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return { success: false, reason: '无效的走法' };
        }

        const capturedPiece = this.board[toRow][toCol];
        const prevState = JSON.parse(JSON.stringify(this.board));

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            board: prevState,
            captured: capturedPiece
        });
        this.lastMove = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };

        const currentPlayerBeforeSwitch = this.currentPlayer;
        const opponentColor = this.currentPlayer === 'red' ? 'black' : 'red';
        this.currentPlayer = opponentColor;

        const wonPiece = this.checkWinCondition(opponentColor);
        if (wonPiece) {
            this.gameStatus = wonPiece.color + '_win';
            return { success: true, gameOver: true, winner: wonPiece.color };
        }

        if (this.isGeneralFaceToFace()) {
            this.gameStatus = currentPlayerBeforeSwitch + '_win';
            return { success: true, gameOver: true, winner: currentPlayerBeforeSwitch };
        }

        return { success: true, gameOver: false };
    }

    checkWinCondition(lastMoveColor) {
        const opponentColor = lastMoveColor === 'red' ? 'black' : 'red';
        let opponentGeneralExists = false;
        let opponentGeneralPos = null;

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.colSize; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    if (piece.type === '帅' || piece.type === '将') {
                        opponentGeneralExists = true;
                        opponentGeneralPos = { row, col };
                    }
                }
            }
        }

        if (!opponentGeneralExists) {
            return { color: lastMoveColor, reason: 'capture' };
        }

        if (opponentGeneralPos && !this.hasLegalMoves(opponentColor)) {
            return { color: lastMoveColor, reason: 'checkmate' };
        }

        return null;
    }

    hasLegalMoves(color) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.colSize; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    undo() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastMove = this.moveHistory.pop();
        this.board = lastMove.board;
        this.currentPlayer = lastMove.board[lastMove.to.row][lastMove.to.col]
            ? lastMove.board[lastMove.to.row][lastMove.to.col].color
            : (this.currentPlayer === 'red' ? 'black' : 'red');

        this.lastMove = this.moveHistory.length > 0
            ? { from: this.moveHistory[this.moveHistory.length - 1].from, to: this.moveHistory[this.moveHistory.length - 1].to }
            : null;

        if (this.gameStatus.endsWith('_win')) {
            this.gameStatus = 'playing';
        }

        return true;
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) {
            return [];
        }

        const validMoves = [];

        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.colSize; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    validMoves.push({ row: r, col: c });
                }
            }
        }

        return validMoves;
    }

    getAllPieces(color) {
        const pieces = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.colSize; col++) {
                const piece = this.board[row][col];
                if (piece && (!color || piece.color === color)) {
                    pieces.push({ row, col, piece });
                }
            }
        }
        return pieces;
    }

    clone() {
        const newGame = new ChineseChess();
        newGame.board = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
        newGame.currentPlayer = this.currentPlayer;
        newGame.gameStatus = this.gameStatus;
        newGame.moveHistory = [...this.moveHistory];
        newGame.lastMove = this.lastMove ? { ...this.lastMove } : null;
        newGame.playerColor = this.playerColor;
        return newGame;
    }

    toJSON() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            moveHistory: this.moveHistory,
            lastMove: this.lastMove,
            playerColor: this.playerColor
        };
    }

    fromJSON(data) {
        this.board = data.board;
        this.currentPlayer = data.currentPlayer;
        this.gameStatus = data.gameStatus;
        this.moveHistory = data.moveHistory || [];
        this.lastMove = data.lastMove;
        this.playerColor = data.playerColor || 'red';
    }
}

window.ChineseChess = ChineseChess;