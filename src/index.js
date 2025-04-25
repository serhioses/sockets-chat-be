import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { authRoutes } from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import { profileRoutes } from './routes/profile.route.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
