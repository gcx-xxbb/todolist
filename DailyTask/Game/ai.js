class AI {
    constructor(difficulty) {
        this.difficulty = difficulty;
    }

    // 设置难度
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    // 获取AI的下一步移动
    getMove(chess) {
        switch (this.difficulty) {
            case 'beginner':
                return this.getBeginnerMove(chess);
            case 'easy':
                return this.getEasyMove(chess);
            case 'medium':
                return this.getMediumMove(chess);
            case 'hard':
                return this.getHardMove(chess);
            default:
                return this.getBeginnerMove(chess);
        }
    }

    // 新手级AI：随机走子
    getBeginnerMove(chess) {
        const validMoves = this.getAllValidMoves(chess, 'black');
        if (validMoves.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    // 初级级AI：简单评估函数
    getEasyMove(chess) {
        const validMoves = this.getAllValidMoves(chess, 'black');
        if (validMoves.length === 0) {
            return null;
        }

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            // 模拟移动
            const tempChess = JSON.parse(JSON.stringify(chess));
            tempChess.move(move.from.row, move.from.col, move.to.row, move.to.col);
            
            // 评估分数
            const score = this.evaluateBoard(tempChess.board);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || validMoves[0];
    }

    // 中级级AI：改进的评估函数
    getMediumMove(chess) {
        const validMoves = this.getAllValidMoves(chess, 'black');
        if (validMoves.length === 0) {
            return null;
        }

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            // 模拟移动
            const tempChess = this.cloneChess(chess);
            tempChess.move(move.from.row, move.from.col, move.to.row, move.to.col);
            
            // 评估分数（考虑对手的反应）
            const score = this.minimax(tempChess, 1, false);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || validMoves[0];
    }

    // 高级级AI：minimax算法带深度搜索
    getHardMove(chess) {
        const validMoves = this.getAllValidMoves(chess, 'black');
        if (validMoves.length === 0) {
            return null;
        }

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            // 模拟移动
            const tempChess = this.cloneChess(chess);
            tempChess.move(move.from.row, move.from.col, move.to.row, move.to.col);
            
            // 评估分数（深度搜索）
            const score = this.minimax(tempChess, 3, false);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || validMoves[0];
    }

    // 获取所有有效的移动
    getAllValidMoves(chess, color) {
        const validMoves = [];
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = chess.board[row][col];
                if (piece && piece.color === color) {
                    const moves = chess.getValidMoves(row, col);
                    for (const move of moves) {
                        validMoves.push({
                            from: { row, col },
                            to: move
                        });
                    }
                }
            }
        }
        
        return validMoves;
    }

    // 评估棋盘分数
    evaluateBoard(board) {
        let score = 0;
        
        // 棋子价值表
        const pieceValues = {
            '帅': 10000,
            '将': 10000,
            '車': 900,
            '马': 400,
            '相': 300,
            '象': 300,
            '士': 200,
            '炮': 400,
            '兵': 100,
            '卒': 100
        };
        
        // 位置价值表（简化版）
        const positionValues = {
            '車': [
                [50, 50, 50, 50, 50, 50, 50, 50, 50],
                [50, 100, 100, 100, 100, 100, 100, 100, 50],
                [50, 100, 150, 150, 150, 150, 150, 100, 50],
                [50, 100, 150, 200, 200, 200, 150, 100, 50],
                [50, 100, 150, 200, 200, 200, 150, 100, 50],
                [50, 100, 150, 200, 200, 200, 150, 100, 50],
                [50, 100, 150, 150, 150, 150, 150, 100, 50],
                [50, 100, 100, 100, 100, 100, 100, 100, 50],
                [50, 50, 50, 50, 50, 50, 50, 50, 50],
                [50, 50, 50, 50, 50, 50, 50, 50, 50]
            ],
            '马': [
                [10, 20, 30, 40, 40, 40, 30, 20, 10],
                [20, 30, 40, 50, 50, 50, 40, 30, 20],
                [30, 40, 50, 60, 60, 60, 50, 40, 30],
                [40, 50, 60, 70, 70, 70, 60, 50, 40],
                [40, 50, 60, 70, 70, 70, 60, 50, 40],
                [30, 40, 50, 60, 60, 60, 50, 40, 30],
                [20, 30, 40, 50, 50, 50, 40, 30, 20],
                [10, 20, 30, 40, 40, 40, 30, 20, 10],
                [0, 10, 20, 30, 30, 30, 20, 10, 0],
                [0, 0, 10, 20, 20, 20, 10, 0, 0]
            ],
            '炮': [
                [20, 20, 20, 20, 20, 20, 20, 20, 20],
                [20, 40, 40, 40, 40, 40, 40, 40, 20],
                [20, 40, 60, 60, 60, 60, 60, 40, 20],
                [20, 40, 60, 80, 80, 80, 60, 40, 20],
                [20, 40, 60, 80, 80, 80, 60, 40, 20],
                [20, 40, 60, 60, 60, 60, 60, 40, 20],
                [20, 40, 40, 40, 40, 40, 40, 40, 20],
                [20, 20, 20, 20, 20, 20, 20, 20, 20],
                [20, 20, 20, 20, 20, 20, 20, 20, 20],
                [20, 20, 20, 20, 20, 20, 20, 20, 20]
            ],
            '兵': [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [10, 10, 10, 10, 10, 10, 10, 10, 10],
                [20, 20, 20, 20, 20, 20, 20, 20, 20],
                [40, 40, 40, 40, 40, 40, 40, 40, 40],
                [80, 80, 80, 80, 80, 80, 80, 80, 80],
                [200, 200, 200, 200, 200, 200, 200, 200, 200]
            ]
        };
        
        // 计算分数
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                const piece = board[row][col];
                if (piece) {
                    let value = pieceValues[piece.type] || 0;
                    
                    // 添加位置价值
                    if (positionValues[piece.type]) {
                        value += positionValues[piece.type][row][col];
                    }
                    
                    // 黑棋加分，红棋减分
                    if (piece.color === 'black') {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }
        
        return score;
    }

    // Minimax算法
    minimax(chess, depth, isMaximizing) {
        if (depth === 0 || chess.gameStatus !== 'playing') {
            return this.evaluateBoard(chess.board);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            const validMoves = this.getAllValidMoves(chess, 'black');
            
            for (const move of validMoves) {
                const tempChess = this.cloneChess(chess);
                tempChess.move(move.from.row, move.from.col, move.to.row, move.to.col);
                const score = this.minimax(tempChess, depth - 1, false);
                maxScore = Math.max(maxScore, score);
            }
            
            return maxScore;
        } else {
            let minScore = Infinity;
            const validMoves = this.getAllValidMoves(chess, 'red');
            
            for (const move of validMoves) {
                const tempChess = this.cloneChess(chess);
                tempChess.move(move.from.row, move.from.col, move.to.row, move.to.col);
                const score = this.minimax(tempChess, depth - 1, true);
                minScore = Math.min(minScore, score);
            }
            
            return minScore;
        }
    }

    // 克隆Chess对象
    cloneChess(chess) {
        const clonedChess = new Chess();
        clonedChess.board = JSON.parse(JSON.stringify(chess.board));
        clonedChess.currentPlayer = chess.currentPlayer;
        clonedChess.selectedPiece = chess.selectedPiece;
        clonedChess.moveHistory = JSON.parse(JSON.stringify(chess.moveHistory));
        clonedChess.gameStatus = chess.gameStatus;
        return clonedChess;
    }
}