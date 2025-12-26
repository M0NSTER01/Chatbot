require('dotenv').config(); // Load environment variables
const http = require('http');
const { GoogleGenerativeAI } = require('@google/generative-ai');


let express = require("express");
let { createServer } = require("http");
let { Server } = require("socket.io");
let path = require("path");
let app = express();
const cors = require("cors");
const { send } = require("process");

app.use(cors());
let server = createServer(app);
let io = new Server(server, {
    cors: { origin: "*" } 
});


// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
