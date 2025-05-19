import express from 'express';
import { createServer } from 'node:http';

import cookieParser from 'cookie-parser';
import cors from 'cors';

import { authRoutes } from '../routes/auth.route.js';
import { profileRoutes } from '../routes/profile.route.js';
import { chatRoutes } from '../routes/chat.route.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
}));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = createServer(app);

export { app, server };
