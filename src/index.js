import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { authRoutes } from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import { profileRoutes } from './routes/profile.route.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB();
});
