class GameLogic {
    constructor() {
        this.resetGame();
    }

    resetGame() {
        this.board = Array(5).fill(null).map(() => Array(5).fill(null));
        this.players = ['A', 'B'];
        this.turn = 0;
        this.moveHistory = { A: [], B: [] };  // Initialize move history for both players
        this.initBoard();
    }

    initBoard() {
        this.board[0] = ['A-P1', 'A-H1', 'A-H2', 'A-P1', 'A-H1'];
        this.board[4] = ['B-P1', 'B-H1', 'B-H2', 'B-P1', 'B-H1'];
    }

    getState() {
        return {
            board: this.board,
            currentPlayer: this.players[this.turn],
            moveHistory: this.moveHistory 
        };
    }

    processMove(move) {
        const { piece, startPosition, endPosition, currentPlayer } = move;
        const [startRow, startCol] = startPosition;
        const [endRow, endCol] = endPosition;

        if (piece.startsWith(currentPlayer) && this.board[startRow][startCol] === piece) {
            const newPosition = this.calculateNewPosition(startRow, startCol, endRow, endCol, piece);
            if (newPosition && this.isValidPosition(newPosition, piece)) {
                this.executeMove(startRow, startCol, endRow, endCol, piece);

                this.moveHistory[currentPlayer].push(`Moved ${piece} from (${startRow}, ${startCol}) to (${endRow}, ${endCol})`);

                if (this.checkWinCondition()) {
                    return { valid: true, winner: currentPlayer };
                }

                this.turn = 1 - this.turn; // Switch turns
                return { valid: true };
            }
        }

        return { valid: false, reason: 'Invalid move' };
    }

    calculateNewPosition(startRow, startCol, endRow, endCol, piece) {
        const pieceType = piece.split('-')[1];

        if (pieceType === 'P1') {
            // P1 can only move 1 step vertically or horizontally
            if ((Math.abs(endRow - startRow) === 1 && endCol === startCol) || 
                (Math.abs(endCol - startCol) === 1 && endRow === startRow)) {
                return { row: endRow, col: endCol };
            }
        } else if (pieceType === 'H1') {
            // H1 must move exactly 2 steps in any straight direction (not diagonal)
            if ((Math.abs(endRow - startRow) === 2 && endCol === startCol) || 
                (Math.abs(endCol - startCol) === 2 && endRow === startRow)) {
                return { row: endRow, col: endCol };
            }
        } else if (pieceType === 'H2') {
            // H2 must move exactly 2 steps diagonally
            if (Math.abs(endRow - startRow) === 2 && Math.abs(endCol - startCol) === 2) {
                return { row: endRow, col: endCol };
            }
        }
        return null;
    }

    isValidPosition(position, piece) {
        const { row, col } = position;
        return row >= 0 && row < 5 && col >= 0 && col < 5 && 
               (this.board[row][col] === null || !this.board[row][col].startsWith(piece[0]));
    }

    executeMove(startRow, startCol, endRow, endCol, piece) {
        const opponent = this.players[1 - this.turn];

        // Eliminate all opponent's pieces in the path
        if (startRow === endRow) { 
            // Horizontal move
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[startRow][col] && this.board[startRow][col].startsWith(opponent)) {
                    this.board[startRow][col] = null;
                }
            }
        } else if (startCol === endCol) { 
            // Vertical move
            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][startCol] && this.board[row][startCol].startsWith(opponent)) {
                    this.board[row][startCol] = null;
                }
            }
        } else if (Math.abs(startRow - endRow) === Math.abs(startCol - endCol)) { 
            // Diagonal move
            const rowIncrement = endRow > startRow ? 1 : -1;
            const colIncrement = endCol > startCol ? 1 : -1;
            let row = startRow + rowIncrement;
            let col = startCol + colIncrement;
            while (row !== endRow && col !== endCol) {
                if (this.board[row][col] && this.board[row][col].startsWith(opponent)) {
                    this.board[row][col] = null;
                }
                row += rowIncrement;
                col += colIncrement;
            }
        }

        // Move the piece to the new position
        this.board[endRow][endCol] = piece;
        this.board[startRow][startCol] = null;
    }

    checkWinCondition() {
        const opponentPieces = this.board.flat().filter(cell => cell && cell.startsWith(this.players[1 - this.turn]));
        return opponentPieces.length === 0;
    }
}

module.exports = GameLogic;