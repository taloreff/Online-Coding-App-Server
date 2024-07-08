import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import path from "path";
import { config } from "dotenv";
import './db/db.js';
import { codeblocksRoutes } from './api/codeblocks/codeblocks.routes.js'
import { setupSocketAPI } from './services/socket.service.js '
import { logger } from "./services/logger.service.js";


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
app.use(express.static(path.resolve('public')))

//Routes
app.use('/api/codeblocks', codeblocksRoutes)

setupSocketAPI(server)

app.get("/**", (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
});

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
