import { Server } from 'socket.io';

import { server } from '../lib/server.js';
import { socketAuthMiddleware } from './auth.middleware.js';
import { handleConnection } from './handlers/connection.handler.js';

export function initSocket(serverInstance = server) {
    const io = new Server(serverInstance, {
        cors: {
            origin: process.env.ALLOWED_ORIGIN,
            credentials: true,
        },
    });

    io.use(socketAuthMiddleware);
    io.on('connection', (socket) => handleConnection(io, socket));
}
