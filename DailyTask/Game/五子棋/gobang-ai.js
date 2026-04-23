class GobangAI {
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
                this.maxDepth = 4;
                this.useAlphaBeta = true;
                this.searchRadius = 5;
                break;
            case 'expert':
                this.maxDepth = 5;
                this.useAlphaBeta = true;
                this.searchRadius = 6;
                break;
            default:
                this.maxDepth = 3;
                this.useAlphaBeta = true;
                this.searchRadius = 4;
        }
    }

    getMove(game) {
        const board = game.getBoard();
        const currentPlayer = game.getCurrentPlayer();

        if (game.moveHistory.length === 0) {
            return this.getFirstMove(board);
        }

        switch (this.level) {
            case 'beginner':
                return this.getMoveBeginner(board, currentPlayer);
            case 'easy':
                return this.getMoveEasy(board, currentPlayer);
            case 'medium':
            case 'hard':
            case 'expert':
                return this.getMoveMinimax(board, currentPlayer);
            default:
                return this.getMoveMinimax(board, currentPlayer);
        }
    }

    getFirstMove(board) {
        const center = Math.floor(board.length / 2);
        return { row: center, col: center };
    }

    getMoveBeginner(board, player) {
        const validMoves = this.getValidMoves(board);
        if (validMoves.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    getMoveEasy(board, player) {
        const attackMove = this.findBestMove(board, player, 1);
        if (attackMove) return attackMove;

        const defenseMove = this.findBestMove(board, this.getOpponent(player), 1);
        if (defenseMove) return defenseMove;

        return this.getMoveBeginner(board, player);
    }

    getMoveMinimax(board, player) {
        const validMoves = this.getValidMovesWithRadius(board);

        if (validMoves.length === 0) return null;
        if (validMoves.length === 1) return validMoves[0];

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of validMoves) {
            board[move.row][move.col] = player;
            let score;
            if (this.useAlphaBeta) {
                score = this.minimax(board, this.maxDepth - 1, -Infinity, Infinity, false, this.getOpponent(player));
            } else {
                score = this.minimaxBasic(board, this.maxDepth - 1, false, this.getOpponent(player));
            }
            board[move.row][move.col] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || validMoves[0];
    }

    minimax(board, depth, alpha, beta, isMaximizing, player) {
        const opponent = this.getOpponent(player);

        if (depth === 0) {
            return this.evaluateBoard(board, player);
        }

        const validMoves = this.getValidMovesWithRadius(board);

        if (validMoves.length === 0) {
            return this.evaluateBoard(board, player);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of validMoves) {
                board[move.row][move.col] = player;
                const evalScore = this.minimax(board, depth - 1, alpha, beta, false, opponent);
                board[move.row][move.col] = null;
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of validMoves) {
                board[move.row][move.col] = opponent;
                const evalScore = this.minimax(board, depth - 1, alpha, beta, true, player);
                board[move.row][move.col] = null;
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    minimaxBasic(board, depth, isMaximizing, player) {
        const opponent = this.getOpponent(player);

        if (depth === 0) {
            return this.evaluateBoard(board, player);
        }

        const validMoves = this.getValidMovesWithRadius(board);

        if (validMoves.length === 0) {
            return this.evaluateBoard(board, player);
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of validMoves) {
                board[move.row][move.col] = player;
                const evalScore = this.minimaxBasic(board, depth - 1, false, opponent);
                board[move.row][move.col] = null;
                maxEval = Math.max(maxEval, evalScore);
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of validMoves) {
                board[move.row][move.col] = opponent;
                const evalScore = this.minimaxBasic(board, depth - 1, true, player);
                board[move.row][move.col] = null;
                minEval = Math.min(minEval, evalScore);
            }
            return minEval;
        }
    }

    evaluateBoard(board, player) {
        let score = 0;
        const opponent = this.getOpponent(player);

        const patterns = [
            { count: 5, score: 100000 },
            { count: 4, open: true, score: 10000 },
            { count: 4, open: false, score: 1000 },
            { count: 3, open: true, score: 5000 },
            { count: 3, open: false, score: 500 },
            { count: 2, open: true, score: 100 },
            { count: 2, open: false, score: 10 },
        ];

        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board.length; c++) {
                if (board[r][c] === player) {
                    score += this.evaluatePosition(board, r, c, player, patterns);
                } else if (board[r][c] === opponent) {
                    score -= this.evaluatePosition(board, r, c, opponent, patterns);
                }
            }
        }

        return score;
    }

    evaluatePosition(board, row, col, player, patterns) {
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];

        let totalScore = 0;

        for (const { dr, dc } of directions) {
            let count = 1;
            let openEnds = 0;

            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === player) {
                count++;
                r += dr;
                c += dc;
            }
            if (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === null) {
                openEnds++;
            }

            r = row - dr;
            c = col - dc;
            while (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === player) {
                count++;
                r -= dr;
                c -= dc;
            }
            if (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === null) {
                openEnds++;
            }

            for (const pattern of patterns) {
                if (count >= pattern.count) {
                    if (pattern.open && openEnds === 2) {
                        totalScore += pattern.score;
                    } else if (!pattern.open && openEnds === 1) {
                        totalScore += pattern.score;
                    } else if (openEnds === 2) {
                        totalScore += pattern.score * 0.5;
                    }
                }
            }
        }

        return totalScore;
    }

    findBestMove(board, player, minCount) {
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];

        let bestMove = null;
        let bestScore = 0;

        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board.length; c++) {
                if (board[r][c] !== null) continue;

                let moveScore = 0;
                for (const { dr, dc } of directions) {
                    const info = this.analyzeLine(board, r, c, dr, dc, player);
                    if (info.count >= minCount) {
                        moveScore += info.count * 10;
                        if (info.open) moveScore += 5;
                    }
                }

                if (moveScore > bestScore) {
                    bestScore = moveScore;
                    bestMove = { row: r, col: c };
                }
            }
        }

        return bestMove;
    }

    analyzeLine(board, row, col, dr, dc, player) {
        let count = 0;
        let open = false;

        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }
        if (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === null) {
            open = true;
        }

        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }
        if (r >= 0 && r < board.length && c >= 0 && c < board.length && board[r][c] === null) {
            open = true;
        }

        return { count, open };
    }

    getValidMoves(board) {
        const moves = [];
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board.length; c++) {
                if (board[r][c] === null) {
                    moves.push({ row: r, col: c });
                }
            }
        }
        return moves;
    }

    getValidMovesWithRadius(board) {
        if (board.length === 0) return [];

        let hasStones = false;
        let minR = board.length, maxR = 0, minC = board.length, maxC = 0;

        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board.length; c++) {
                if (board[r][c] !== null) {
                    hasStones = true;
                    minR = Math.min(minR, r);
                    maxR = Math.max(maxR, r);
                    minC = Math.min(minC, c);
                    maxC = Math.max(maxC, c);
                }
            }
        }

        const moves = [];
        const radius = this.searchRadius;

        if (!hasStones) {
            const center = Math.floor(board.length / 2);
            return [{ row: center, col: center }];
        }

        for (let r = Math.max(0, minR - radius); r <= Math.min(board.length - 1, maxR + radius); r++) {
            for (let c = Math.max(0, minC - radius); c <= Math.min(board.length - 1, maxC + radius); c++) {
                if (board[r][c] === null) {
                    if (this.hasNeighbor(board, r, c, 2)) {
                        moves.push({ row: r, col: c });
                    }
                }
            }
        }

        if (moves.length === 0) {
            for (let r = 0; r < board.length; r++) {
                for (let c = 0; c < board.length; c++) {
                    if (board[r][c] === null) {
                        moves.push({ row: r, col: c });
                    }
                }
            }
        }

        return moves;
    }

    hasNeighbor(board, row, col, distance) {
        for (let dr = -distance; dr <= distance; dr++) {
            for (let dc = -distance; dc <= distance; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < board.length && c >= 0 && c < board.length) {
                    if (board[r][c] !== null) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getOpponent(player) {
        return player === 'black' ? 'white' : 'black';
    }
}

window.GobangAI = GobangAI;