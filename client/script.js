console.log("Attempting to connect to WebSocket...");

const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
    console.log("WebSocket connection established!");
    ws.send(JSON.stringify({ type: 'init' }));
};

ws.onmessage = (event) => {
    console.log("Message received from server:", event.data);
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'init':
        case 'update':
            renderBoard(data.state.board);
            document.getElementById('status').innerText = `Current Player: ${data.state.currentPlayer}`;
            updateMoveHistory(data.state.moveHistory); // Update move history
            break;
        case 'invalidMove':
            alert(`Invalid Move: ${data.reason}`);
            break;
        case 'gameOver':
            alert(`Game Over! Winner: ${data.winner}`);
            break;
    }
};

function renderBoard(board) {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.innerText = cell || '';
            cellElement.onclick = () => handleCellClick(rowIndex, colIndex);
            boardElement.appendChild(cellElement);
        });
    });
}

let selectedCell = null;

function handleCellClick(row, col) {
    const cell = document.querySelector(`#board .cell:nth-child(${row * 5 + col + 1})`);
    const currentPlayer = document.getElementById('status').innerText.split(' ')[2];
    
    if (selectedCell) {
        const [selectedRow, selectedCol] = selectedCell;
        const piece = document.querySelector(`#board .cell:nth-child(${selectedRow * 5 + selectedCol + 1})`).innerText;
        
        const move = {
            piece,
            startPosition: selectedCell,
            endPosition: [row, col],
            currentPlayer,
        };
        
        sendMove(move);
        
        selectedCell = null;
        document.querySelector(`#board .cell:nth-child(${selectedRow * 5 + selectedCol + 1})`).classList.remove('selected');
    } else {
        if (cell.innerText && cell.innerText.startsWith(currentPlayer)) {
            selectedCell = [row, col];
            cell.classList.add('selected');
        } else {
            alert('Invalid selection.');
        }
    }
}

function sendMove(move) {
    console.log("Sending move:", move);
    ws.send(JSON.stringify({ type: 'move', move }));
}
function updateMoveHistory(moveHistory) {
    const tableBody = document.getElementById('moveHistoryTable');
    tableBody.innerHTML = '';

    const maxLength = Math.max(moveHistory.A.length, moveHistory.B.length);
    for (let i = 0; i < maxLength; i++) {
        const row = document.createElement('tr');
        const cellA = document.createElement('td');
        const cellB = document.createElement('td');

        cellA.textContent = moveHistory.A[i] || '';
        cellB.textContent = moveHistory.B[i] || '';

        row.appendChild(cellA);
        row.appendChild(cellB);
        tableBody.appendChild(row);
    }
}

updateMoveHistory(gameLogic.getState().moveHistory);
