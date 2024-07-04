import mongoose from "mongoose";
import { config } from 'dotenv';

config();

const mongoUrl = process.env.MONGO_URL;

mongoose
    .connect(mongoUrl)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));