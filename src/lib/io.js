import { Server } from 'socket.io';

import { server } from './server.js';

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    },
});

const onlineUserIds = new Set();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (typeof userId === 'string' && userId) {
        onlineUserIds.add(userId);
    }
    io.emit('getOnlineUsers', Array.from(onlineUserIds));

    socket.on('disconnect', () => {
        onlineUserIds.delete(userId);
        io.emit('getOnlineUsers', Array.from(onlineUserIds));
    })
});
