const WebSocket = require('ws');

// UPDATED: Points to the correct Java backend network domain
const BLOCKED_SERVER_IP = 'java.mc-pulsesmp.net'; 
const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Proxy running on port ${PORT}`);
});

wss.on('connection', (clientWs) => {
    console.log('Player connected! Tunneling data to Pulse SMP...');
    
    // Connect cleanly using the correct domain name
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

    clientWs.on('error', (err) => console.error('Eagler Client Error:', err));
    targetWs.on('error', (err) => console.error('Pulse SMP Server Error:', err));
});
