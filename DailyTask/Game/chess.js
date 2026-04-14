class Chess {
    constructor() {
        this.board = this.initBoard();
        this.currentPlayer = 'red'; // 红方先行
        this.selectedPiece = null;
        this.moveHistory = [];
        this.gameStatus = 'playing'; // playing, red_win, black_win, draw
    }

    // 初始化棋盘
    initBoard() {
        const board = Array(10).fill().map(() => Array(9).fill(null));
        
        // 黑方棋子（上方）
        board[0][0] = { type: '車', color: 'black' };
        board[0][1] = { type: '马', color: 'black' };
        board[0][2] = { type: '象', color: 'black' };
        board[0][3] = { type: '士', color: 'black' };
        board[0][4] = { type: '将', color: 'black' };
        board[0][5] = { type: '士', color: 'black' };
        board[0][6] = { type: '象', color: 'black' };
        board[0][7] = { type: '马', color: 'black' };
        board[0][8] = { type: '車', color: 'black' };
        board[2][1] = { type: '炮', color: 'black' };
        board[2][7] = { type: '炮', color: 'black' };
        board[3][0] = { type: '卒', color: 'black' };
        board[3][2] = { type: '卒', color: 'black' };
        board[3][4] = { type: '卒', color: 'black' };
        board[3][6] = { type: '卒', color: 'black' };
        board[3][8] = { type: '卒', color: 'black' };
        
        // 红方棋子（下方）
        board[9][0] = { type: '車', color: 'red' };
        board[9][1] = { type: '马', color: 'red' };
        board[9][2] = { type: '相', color: 'red' };
        board[9][3] = { type: '士', color: 'red' };
        board[9][4] = { type: '帅', color: 'red' };
        board[9][5] = { type: '士', color: 'red' };
        board[9][6] = { type: '相', color: 'red' };
        board[9][7] = { type: '马', color: 'red' };
        board[9][8] = { type: '車', color: 'red' };
        board[7][1] = { type: '炮', color: 'red' };
        board[7][7] = { type: '炮', color: 'red' };
        board[6][0] = { type: '兵', color: 'red' };
        board[6][2] = { type: '兵', color: 'red' };
        board[6][4] = { type: '兵', color: 'red' };
        board[6][6] = { type: '兵', color: 'red' };
        board[6][8] = { type: '兵', color: 'red' };
        
        return board;
    }

    // 检查位置是否在棋盘内
    isInBoard(row, col) {
        return row >= 0 && row < 10 && col >= 0 && col < 9;
    }

    // 检查位置是否有己方棋子
    isFriendlyPiece(row, col, color) {
        const piece = this.board[row][col];
        return piece && piece.color === color;
    }

    // 检查位置是否有敌方棋子
    isEnemyPiece(row, col, color) {
        const piece = this.board[row][col];
        return piece && piece.color !== color;
    }

    // 检查将帅是否见面
    isGeneralFaceToFace() {
        // 找到红帅和黑将的位置
        let redGeneral = null;
        let blackGeneral = null;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === '帅') {
                    redGeneral = { row, col };
                } else if (piece && piece.type === '将') {
                    blackGeneral = { row, col };
                }
            }
        }
        
        // 如果将帅在同一列
        if (redGeneral && blackGeneral && redGeneral.col === blackGeneral.col) {
            // 检查中间是否有棋子
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

    // 检查走子是否合法
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        // 不能走到己方棋子的位置
        if (this.isFriendlyPiece(toRow, toCol, piece.color)) {
            return false;
        }
        
        // 根据棋子类型检查走法
        switch (piece.type) {
            case '帅':
            case '将':
                return this.isValidGeneralMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '士':
                return this.isValidAdvisorMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '相':
            case '象':
                return this.isValidElephantMove(fromRow, fromCol, toRow, toCol, piece.color);
            case '马':
                return this.isValidHorseMove(fromRow, fromCol, toRow, toCol);
            case '車':
                return this.isValidChariotMove(fromRow, fromCol, toRow, toCol);
            case '炮':
                return this.isValidCannonMove(fromRow, fromCol, toRow, toCol);
            case '兵':
            case '卒':
                return this.isValidPawnMove(fromRow, fromCol, toRow, toCol, piece.color);
            default:
                return false;
        }
    }

    // 帅/将的走法
    isValidGeneralMove(fromRow, fromCol, toRow, toCol, color) {
        // 帅将只能在九宫格内移动
        const isInPalace = (row, col) => {
            if (color === 'red') {
                return row >= 7 && row <= 9 && col >= 3 && col <= 5;
            } else {
                return row >= 0 && row <= 2 && col >= 3 && col <= 5;
            }
        };
        
        if (!isInPalace(toRow, toCol)) {
            return false;
        }
        
        // 只能走一步，且只能上下左右
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            return true;
        }
        
        return false;
    }

    // 士/仕的走法
    isValidAdvisorMove(fromRow, fromCol, toRow, toCol, color) {
        // 士只能在九宫格内移动
        const isInPalace = (row, col) => {
            if (color === 'red') {
                return row >= 7 && row <= 9 && col >= 3 && col <= 5;
            } else {
                return row >= 0 && row <= 2 && col >= 3 && col <= 5;
            }
        };
        
        if (!isInPalace(toRow, toCol)) {
            return false;
        }
        
        // 士只能斜走一步
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        if (rowDiff === 1 && colDiff === 1) {
            return true;
        }
        
        return false;
    }

    // 相/象的走法
    isValidElephantMove(fromRow, fromCol, toRow, toCol, color) {
        // 相不能过河
        if (color === 'red' && toRow >= 5) {
            return false;
        }
        if (color === 'black' && toRow <= 4) {
            return false;
        }
        
        // 相走田
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        if (rowDiff === 2 && colDiff === 2) {
            // 检查象眼是否被塞住
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            if (!this.board[midRow][midCol]) {
                return true;
            }
        }
        
        return false;
    }

    // 马的走法
    isValidHorseMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // 马走日
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            // 检查马腿是否被绊住
            if (rowDiff === 2) {
                // 纵向移动，检查横向马腿
                const midRow = fromRow + (toRow > fromRow ? 1 : -1);
                if (this.board[midRow][fromCol]) {
                    return false;
                }
            } else {
                // 横向移动，检查纵向马腿
                const midCol = fromCol + (toCol > fromCol ? 1 : -1);
                if (this.board[fromRow][midCol]) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }

    // 车的走法
    isValidChariotMove(fromRow, fromCol, toRow, toCol) {
        // 车只能走直线
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        // 检查路径上是否有棋子
        if (fromRow === toRow) {
            // 横向移动
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) {
                    return false;
                }
            }
        } else {
            // 纵向移动
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

    // 炮的走法
    isValidCannonMove(fromRow, fromCol, toRow, toCol) {
        // 炮只能走直线
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        // 计算路径上的棋子数量
        let pieceCount = 0;
        
        if (fromRow === toRow) {
            // 横向移动
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let col = start; col < end; col++) {
                if (this.board[fromRow][col]) {
                    pieceCount++;
                }
            }
        } else {
            // 纵向移动
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let row = start; row < end; row++) {
                if (this.board[row][fromCol]) {
                    pieceCount++;
                }
            }
        }
        
        // 炮吃子需要一个炮架，移动不需要
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece) {
            return pieceCount === 1;
        } else {
            return pieceCount === 0;
        }
    }

    // 兵/卒的走法
    isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);
        
        if (color === 'red') {
            // 红兵（现在在下方）
            if (fromRow > 4) {
                // 没过河，只能前进（向上）
                return rowDiff === -1 && colDiff === 0;
            } else {
                // 过河后，可以前进、左右移动，但不能后退
                return rowDiff <= 0 && Math.abs(rowDiff) + colDiff === 1;
            }
        } else {
            // 黑卒（现在在上方）
            if (fromRow < 5) {
                // 没过河，只能前进（向下）
                return rowDiff === 1 && colDiff === 0;
            } else {
                // 过河后，可以前进、左右移动，但不能后退
                return rowDiff >= 0 && Math.abs(rowDiff) + colDiff === 1;
            }
        }
    }

    // 执行移动
    move(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        // 保存移动前的状态
        const prevState = JSON.parse(JSON.stringify(this.board));
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            board: prevState
        });
        
        // 执行移动
        const piece = this.board[fromRow][fromCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // 检查胜负
        this.checkGameStatus();
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        
        return true;
    }

    // 悔棋
    undo() {
        if (this.moveHistory.length === 0) {
            return false;
        }
        
        const lastMove = this.moveHistory.pop();
        this.board = lastMove.board;
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.gameStatus = 'playing';
        
        return true;
    }

    // 检查游戏状态
    checkGameStatus() {
        // 检查将帅是否存在
        let redGeneralExists = false;
        let blackGeneralExists = false;
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === '帅') {
                    redGeneralExists = true;
                } else if (piece && piece.type === '将') {
                    blackGeneralExists = true;
                }
            }
        }
        
        if (!redGeneralExists) {
            this.gameStatus = 'black_win';
        } else if (!blackGeneralExists) {
            this.gameStatus = 'red_win';
        }
    }

    // 获取可移动的位置
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) {
            return [];
        }
        
        const validMoves = [];
        
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    validMoves.push({ row: r, col: c });
                }
            }
        }
        
        return validMoves;
    }

    // 重新开始游戏
    restart() {
        this.board = this.initBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.gameStatus = 'playing';
    }
}