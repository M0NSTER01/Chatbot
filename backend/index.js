const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // React app URL
        methods: ['GET', 'POST'],
    },

});

app.use(cors());

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);


    socket.on('sendMessage', (message) => {
        console.log('Message received from user:', message.text);  // ← Add this

        const botResponse = `Bot says: ${message.text}`;

        socket.emit('receiveMessage', { text: botResponse, sender: 'bot' });
    });
});

socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
});

server.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
