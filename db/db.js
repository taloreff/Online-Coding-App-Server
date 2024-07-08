import mongoose from "mongoose";
import { config } from 'dotenv';
import { logger } from '../services/logger.service.js';

config();

const mongoUrl = process.env.MONGO_URL;

mongoose
    .connect(mongoUrl)
    .then(() => logger.info("MongoDB connected"))
    .catch((err) => logger.error("MongoDB connection error:", err));