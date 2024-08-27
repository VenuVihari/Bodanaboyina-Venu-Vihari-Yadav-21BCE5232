const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const GameLogic = require('./gamelogic');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '../client', req.url === '/' ? 'index.html' : req.url);
    let extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404: Page Not Found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const wss = new WebSocket.Server({ server });

let game = new GameLogic();

wss.on('connection', (ws) => {
    console.log('New player connected.');

    ws.send(JSON.stringify({ type: 'init', state: game.getState() }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'move':
                const moveResult = game.processMove(data.move);
                console.log("Move result:", moveResult);
                if (moveResult.valid) {
                    broadcast({ type: 'update', state: game.getState() });
                    if (moveResult.winner) {
                        broadcast({ type: 'gameOver', winner: moveResult.winner });
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'invalidMove', reason: moveResult.reason }));
                }
                break;
        }
    });

    ws.on('close', () => {
        console.log('Player disconnected.');
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(3000, () => {
    console.log('Server started on port 3000');
});
