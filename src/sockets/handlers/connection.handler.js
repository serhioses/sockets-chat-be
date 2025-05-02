import { genChatId } from '../../lib/utils/socket.js';
import { handleMessageEvent } from './message.handler.js';

const onlineUserIds = {};

export function handleConnection(io, socket) {
    const userId = socket.handshake.query.userId;

    if (typeof userId === 'string' && userId) {
        onlineUserIds[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(onlineUserIds));

    socket.on('disconnect', () => {
        delete onlineUserIds[userId];
        io.emit('getOnlineUsers', Object.keys(onlineUserIds));
    });

    socket.on('joinRoom', (receiverId) => {
        socket.leave(Array.from(socket.rooms).at(1));

        if (receiverId && typeof receiverId === 'string') {
            const chatId = genChatId(receiverId, userId);

            socket.join(chatId);
        }
    });

    socket.on('message', (data, receiverId, cb) =>
        handleMessageEvent(socket, data, receiverId, cb)
    );
}
