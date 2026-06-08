const WebSocket = require('ws');

// Paste the blocked Eagler IP here (Do NOT include wss://)
const BLOCKED_SERVER_IP = '://example-blocked-eagler-server.com'; 
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Unblocker running on port ${PORT}`);
});

wss.on('connection', (clientWs) => {
    console.log('Player connected! Tunnelling to blocked server...');

    // Open the pipeline to the real server
    const targetWs = new WebSocket(`wss://${BLOCKED_SERVER_IP}`);

    clientWs.on('message', (message) => {
        if (targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(message);
        }
    });

    targetWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data);
        }
    });

    clientWs.on('close', () => targetWs.close());
    targetWs.on('close', () => clientWs.close());

    clientWs.on('error', (err) => console.error('Your Client Error:', err));
    targetWs.on('error', (err) => console.error('Target Server Error:', err));
});
