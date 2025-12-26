require('dotenv').config(); // Load environment variables
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // React app URL
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Make this function async to wait for Gemini's response
    socket.on('sendMessage', async (message) => {
        console.log('Message received from user:', message.text);

        try {
            // 1. Send user message to Gemini
            const result = await model.generateContent(message.text);
            const response = await result.response;
            const text = response.text();

            // 2. Emit Gemini's response back to the frontend
            socket.emit('receiveMessage', { text: text, sender: 'bot' });
            
        } catch (error) {
            console.error("Error generating response:", error);
            socket.emit('receiveMessage', { 
                text: "Sorry, I'm having trouble thinking right now.", 
                sender: 'bot' 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
