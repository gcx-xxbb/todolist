/**
 * 中国象棋AI类
 * 实现5个难度等级的AI对手
 */
class ChessAI {
    constructor(level = 'medium') {
        this.setLevel(level);
    }

    setLevel(level) {
        this.level = level;
        switch (level) {
            case 'beginner':
                this.maxDepth = 1;
                this.useAlphaBeta = false;
                this.searchRadius = 2;
                break;
            case 'easy':
                this.maxDepth = 2;
                this.useAlphaBeta = false;
                this.searchRadius = 3;
                break;
            case 'medium':
                this.maxDepth = 3;
                this.useAlphaBeta = true;
                this.searchRadius = 4;
                break;
            case 'hard':
                this.maxDepth = 3;
                this.useAlphaBeta = true;
                this.searchRadius = 4;
                break;
            case 'expert':
                this.maxDepth = 4;
                this.useAlphaBeta = true;
                this.searchRadius = 4;
                break;
            default:
                this.maxDepth = 3;
                this.useAlphaBeta = true;
                this.searchRadius = 4;
                this.randomness = 0.2;
        }
    }

    getMove(game) {
        const board = game.getBoard();
        const currentPlayer = game.getCurrentPlayer();

        if (game.moveHistory.length === 0) {
            return this.getOpeningMove(board, currentPlayer);
        }

        if (this.level === 'beginner' || this.level === 'easy') {
            return this.getMoveHeuristic(board, currentPlayer);
        }

        return this.getMoveMinimax(game, currentPlayer);
    }

    getOpeningMove(board, player) {
        const moves = this.getAllCandidateMoves(board, player);

        if (moves.length === 0) return null;

        const preferredCols = [4, 3, 5, 2, 6, 1, 7, 0, 8];
        const preferredRows = player === 'red' ? [6, 3, 7, 5, 8, 4, 9] : [3, 6, 2, 4, 1, 5, 0];

        for (const move of moves) {
            for (const col of preferredCols) {
                if (move.col === col) {
                    for (const row of preferredRows) {
                        if (move.row === row) {
                            return move;
                        }
                    }
                }
            }
        }

        return moves[0];
    }

    getMoveHeuristic(board, player) {
        const candidateMoves = this.getAllCandidateMoves(board, player);

        if (candidateMoves.length === 0) return null;

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of candidateMoves) {
            const score = this.evaluateMove(board, move, player);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (bestMove) {
            return bestMove;
        }
        return candidateMoves[0];
    }

    getMoveMinimax(game, player) {
        const board = game.getBoard();
        const candidateMoves = this.getAllCandidateMoves(board, player);

        if (candidateMoves.length === 0) return null;
        if (candidateMoves.length === 1) return candidateMoves[0];

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of candidateMoves) {
            const tempBoard = board.map(row => [...row]);
            tempBoard[move.row][move.col] = tempBoard[move.fromRow][move.fromCol];
            tempBoard[move.fromRow][move.fromCol] = null;

            let score;
            if (this.useAlphaBeta) {
                score = this.minimax(tempBoard, this.maxDepth - 1, -Infinity, Infinity, false, this.getOpponent(player), game);
            } else {
                score = this.minimaxBasic(tempBoard, this.maxDepth - 1, false, this.getOpponent(player), game);
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || candidateMoves[0];
    }

    minimax(board, depth, alpha, beta, isMaximizing, player, game) {
        if (depth === 0) {
            return this.evaluateBoard(board, player);
        }

        const moves = this.getAllCandidateMoves(board, player);

        if (moves.length === 0) {
            return this.evaluateBoard(board, player) - depth * 100;
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[move.row][move.col] = tempBoard[move.fromRow][move.fromCol];
                tempBoard[move.fromRow][move.fromCol] = null;

                const evalScore = this.minimax(tempBoard, depth - 1, alpha, beta, false, this.getOpponent(player), game);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[move.row][move.col] = tempBoard[move.fromRow][move.fromCol];
                tempBoard[move.fromRow][move.fromCol] = null;

                const evalScore = this.minimax(tempBoard, depth - 1, alpha, beta, true, this.getOpponent(player), game);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    minimaxBasic(board, depth, isMaximizing, player, game) {
        if (depth === 0) {
            return this.evaluateBoard(board, player);
        }

        const moves = this.getAllCandidateMoves(board, player);

        if (moves.length === 0) {
            return this.evaluateBoard(board, player) - depth * 100;
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[move.row][move.col] = tempBoard[move.fromRow][move.fromCol];
                tempBoard[move.fromRow][move.fromCol] = null;

                const evalScore = this.minimaxBasic(tempBoard, depth - 1, false, this.getOpponent(player), game);
                maxEval = Math.max(maxEval, evalScore);
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const tempBoard = board.map(row => [...row]);
                tempBoard[move.row][move.col] = tempBoard[move.fromRow][move.fromCol];
                tempBoard[move.fromRow][move.fromCol] = null;

                const evalScore = this.minimaxBasic(tempBoard, depth - 1, true, this.getOpponent(player), game);
                minEval = Math.min(minEval, evalScore);
            }
            return minEval;
        }
    }

    evaluateBoard(board, player) {
        let score = 0;
        const opponent = this.getOpponent(player);

        const pieceValues = {
            '帅': 10000, '将': 10000,
            '车': 1000, '马': 450, '炮': 450,
            '相': 200, '象': 200,
            '士': 200, '仕': 200,
            '兵': 100, '卒': 100
        };

        const playerBonus = this.getPositionBonus(board, player, true);
        const opponentBonus = this.getPositionBonus(board, opponent, false);

        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                const piece = board[r][c];
                if (piece) {
                    const value = pieceValues[piece.type] || 100;
                    if (piece.color === player) {
                        score += value + (playerBonus[piece.type]?.[r]?.[c] || 0);
                    } else {
                        score -= value + (opponentBonus[piece.type]?.[r]?.[c] || 0);
                    }
                }
            }
        }

        if (this.isInCheck(board, player)) {
            score -= 200;
        }
        if (this.isInCheck(board, opponent)) {
            score += 300;
        }

        return score;
    }

    getPositionBonus(board, player, isForPlayer) {
        const bonus = {};
        const isRed = player === 'red';

        bonus['兵'] = board.map((_, r) => board[0].map((_, c) => {
            if (isRed) {
                if (r <= 4) return 20;
                if (r <= 6) return 10;
                return 0;
            } else {
                if (r >= 5) return 20;
                if (r >= 3) return 10;
                return 0;
            }
        }));

        bonus['卒'] = bonus['兵'];

        bonus['相'] = board.map((_, r) => board[0].map((_, c) => {
            if (isRed && r >= 5) return 15;
            if (!isRed && r <= 4) return 15;
            return 0;
        }));

        bonus['象'] = bonus['相'];

        bonus['马'] = board.map((_, r) => board[0].map((_, c) => {
            const centerCol = 4;
            const colDist = Math.abs(c - centerCol);
            if (colDist <= 1) return 5;
            return 0;
        }));

        bonus['车'] = board.map((_, r) => board[0].map((_, c) => {
            const centerCol = 4;
            const colDist = Math.abs(c - centerCol);
            if (colDist === 0) return 5;
            if (colDist <= 2) return 2;
            return 0;
        }));

        bonus['炮'] = bonus['车'];

        ['帅', '将', '士', '仕'].forEach(type => {
            bonus[type] = board.map(() => board[0].map(() => 0));
        });

        return bonus;
    }

    isInCheck(board, color) {
        let generalPos = null;
        const generalType = color === 'red' ? '帅' : '将';

        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                if (board[r][c]?.type === generalType) {
                    generalPos = { row: r, col: c };
                    break;
                }
            }
            if (generalPos) break;
        }

        if (!generalPos) return false;

        const enemyColor = color === 'red' ? 'black' : 'red';

        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                const piece = board[r][c];
                if (piece && piece.color === enemyColor) {
                    if (this.canAttack(board, r, c, generalPos.row, generalPos.col, piece)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    canAttack(board, fromRow, fromCol, toRow, toCol, piece) {
        switch (piece.type) {
            case '车':
                return this.canChariotAttack(board, fromRow, fromCol, toRow, toCol);
            case '马':
                return this.canHorseAttack(board, fromRow, fromCol, toRow, toCol);
            case '炮':
                return this.canCannonAttack(board, fromRow, fromCol, toRow, toCol);
            case '兵':
            case '卒':
                return this.canPawnAttack(fromRow, fromCol, toRow, toCol, piece.color);
            case '帅':
            case '将':
                return this.canGeneralAttack(fromRow, fromCol, toRow, toCol, piece.color);
            case '士':
            case '仕':
                return this.canAdvisorAttack(fromRow, fromCol, toRow, toCol, piece.color);
            case '相':
            case '象':
                return this.canElephantAttack(board, fromRow, fromCol, toRow, toCol, piece.color);
            default:
                return false;
        }
    }

    canChariotAttack(board, fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;

        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let c = start; c < end; c++) {
                if (board[fromRow][c]) return false;
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let r = start; r < end; r++) {
                if (board[r][fromCol]) return false;
            }
        }

        return true;
    }

    canHorseAttack(board, fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            if (rowDiff === 2) {
                const midRow = fromRow + (toRow > fromRow ? 1 : -1);
                if (board[midRow][fromCol]) return false;
            } else {
                const midCol = fromCol + (toCol > fromCol ? 1 : -1);
                if (board[fromRow][midCol]) return false;
            }
            return true;
        }

        return false;
    }

    canCannonAttack(board, fromRow, fromCol, toRow, toCol) {
        if (fromRow !== toRow && fromCol !== toCol) return false;

        let pieceCount = 0;

        if (fromRow === toRow) {
            const start = Math.min(fromCol, toCol) + 1;
            const end = Math.max(fromCol, toCol);
            for (let c = start; c < end; c++) {
                if (board[fromRow][c]) pieceCount++;
            }
        } else {
            const start = Math.min(fromRow, toRow) + 1;
            const end = Math.max(fromRow, toRow);
            for (let r = start; r < end; r++) {
                if (board[r][fromCol]) pieceCount++;
            }
        }

        const target = board[toRow][toCol];
        if (target) {
            return pieceCount === 1;
        } else {
            return pieceCount === 0;
        }
    }

    canPawnAttack(fromRow, fromCol, toRow, toCol, color) {
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

    canGeneralAttack(fromRow, fromCol, toRow, toCol, color) {
        const inPalace = (r, c) => {
            if (color === 'red') return r >= 7 && r <= 9 && c >= 3 && c <= 5;
            return r >= 0 && r <= 2 && c >= 3 && c <= 5;
        };

        if (!inPalace(toRow, toCol)) return false;

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    canAdvisorAttack(fromRow, fromCol, toRow, toCol, color) {
        const inPalace = (r, c) => {
            if (color === 'red') return r >= 7 && r <= 9 && c >= 3 && c <= 5;
            return r >= 0 && r <= 2 && c >= 3 && c <= 5;
        };

        if (!inPalace(toRow, toCol)) return false;

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        return rowDiff === 1 && colDiff === 1;
    }

    canElephantAttack(board, fromRow, fromCol, toRow, toCol, color) {
        if (color === 'red' && toRow < 5) return false;
        if (color === 'black' && toRow > 4) return false;

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);

        if (rowDiff === 2 && colDiff === 2) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            return !board[midRow][midCol];
        }

        return false;
    }

    getAllCandidateMoves(board, player) {
        const moves = [];

        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[r].length; c++) {
                const piece = board[r][c];
                if (piece && piece.color === player) {
                    const pieceMoves = this.getPieceMoves(board, r, c, piece);
                    moves.push(...pieceMoves);
                }
            }
        }

        return moves.filter(move => !this.wouldBeInCheck(board, move, player));
    }

    getPieceMoves(board, row, col, piece) {
        const moves = [];
        const directions = this.getMoveDirections(piece);
        const isLongRange = ['车', '炮'].includes(piece.type);

        for (const dir of directions) {
            let newRow = row + dir.dr;
            let newCol = col + dir.dc;

            while (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
                const target = board[newRow][newCol];

                if (target && target.color === piece.color) {
                    break;
                }

                if (this.isValidMoveForPiece(board, row, col, newRow, newCol, piece)) {
                    moves.push({ fromRow: row, fromCol: col, row: newRow, col: newCol });
                }

                if (!isLongRange) {
                    break;
                }

                if (target) {
                    break;
                }

                newRow += dir.dr;
                newCol += dir.dc;
            }
        }

        return moves;
    }

    getMoveDirections(piece) {
        switch (piece.type) {
            case '帅':
            case '将':
                return [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
            case '士':
            case '仕':
                return [{ dr: 1, dc: 1 }, { dr: 1, dc: -1 }, { dr: -1, dc: 1 }, { dr: -1, dc: -1 }];
            case '车':
                return [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
            case '炮':
                return [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 }, { dr: -1, dc: 0 }];
            case '马':
                return [
                    { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
                    { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
                    { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
                    { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
                ];
            case '相':
            case '象':
                return [{ dr: 2, dc: 2 }, { dr: 2, dc: -2 }, { dr: -2, dc: 2 }, { dr: -2, dc: -2 }];
            case '兵':
            case '卒':
                return [{ dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: 1 }, { dr: 0, dc: -1 }];
            default:
                return [];
        }
    }

    isValidMoveForPiece(board, fromRow, fromCol, toRow, toCol, piece) {
        switch (piece.type) {
            case '车':
                return this.canChariotAttack(board, fromRow, fromCol, toRow, toCol);
            case '炮':
                return this.canCannonAttack(board, fromRow, fromCol, toRow, toCol);
            case '马':
                return this.canHorseAttack(board, fromRow, fromCol, toRow, toCol);
            case '相':
            case '象':
                return this.canElephantAttack(board, fromRow, fromCol, toRow, toCol, piece.color);
            case '士':
            case '仕':
                return this.canAdvisorAttack(fromRow, fromCol, toRow, toCol, piece.color);
            case '帅':
            case '将':
                return this.canGeneralAttack(fromRow, fromCol, toRow, toCol, piece.color);
            case '兵':
            case '卒':
                return this.canPawnAttack(fromRow, fromCol, toRow, toCol, piece.color);
            default:
                return false;
        }
    }

    wouldBeInCheck(board, move, player) {
        const tempBoard = board.map(row => [...row]);
        tempBoard[move.row][move.col] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = null;

        return this.isInCheck(tempBoard, player);
    }

    evaluateMove(board, move, player) {
        let score = 0;

        const target = board[move.row][move.col];
        if (target) {
            const pieceValues = {
                '车': 1000, '马': 450, '炮': 450,
                '相': 200, '象': 200, '士': 200, '仕': 200,
                '兵': 100, '卒': 100
            };
            score += pieceValues[target.type] || 50;
        }

        const centerDistance = Math.abs(move.col - 4) + Math.abs(move.row - 4.5);
        score -= centerDistance * 2;

        if (move.row < 3 || move.row > 6) {
            score += 20;
        }

        return score;
    }

    getOpponent(player) {
        return player === 'red' ? 'black' : 'red';
    }
}

window.ChessAI = ChessAI;