import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { config } from "dotenv";
import './db/db.js';
import { setupSocketAPI } from './services/socket.service.js'
import { codeblocksRoutes } from './api/codeblocks/codeblocks.routes.js'

config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5500;

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
app.use(express.json());
setupSocketAPI(server)

//Routes
app.use('/api/codeblocks', codeblocksRoutes)

app.get("/**", (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
