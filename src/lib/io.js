import { Server } from 'socket.io';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { cloudinary } from '../lib/cloudinary.js';
import { Message } from '../models/message.model.js';
import { server } from './server.js';

const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGIN,
        credentials: true,
    },
});

const sendMessageSchema = z.object({
    text: z.string().nullish(),
    image: z.any().nullish(),
}).superRefine(({ text, image }, ctx) => {
    if (!text && !image) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Message cannot be empty.',
        });
    }

    if (image && !Buffer.isBuffer(image)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Bad image.',
        });
    }
});

io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
        return next(new Error('No credentials provided.'));
    }

    const authToken = parse(cookieHeader).auth_token;
        
    if (!authToken) {
        return next(new Error('Unauthorized.'));
    }

    try {
        const userPayload = jwt.verify(authToken, process.env.JWT_SECRET);
        socket.data.user = userPayload;
        next();
    } catch(error) {
        next(new Error('Internal server error.'));
    }
});

const onlineUserIds = {};

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (typeof userId === 'string' && userId) {
        onlineUserIds[userId] = socket.id;
        // socket.join(userId);
    }
    io.emit('getOnlineUsers', Object.keys(onlineUserIds));

    socket.on('disconnect', () => {
        delete onlineUserIds[userId];
        io.emit('getOnlineUsers', Object.keys(onlineUserIds));
    });

    socket.on('joinRoom', (receiverId) => {
        socket.leave(Array.from(socket.rooms).at(1));

        if (typeof receiverId === 'string' && receiverId) {
            const chatId = [receiverId, userId].sort().join('-');
            socket.join(chatId);
        }
    });

    socket.on('message', async (data = {}, receiverId, cb) => {
        console.log('server received message:', data);
        const { text, image } = data;
        
            if (!receiverId || !userId) {
                // return io.to(userId).emit('message', { error: 'Bad request.' });
                return cb({ errors: [{ message: 'Bad request.' }] });
            }
        
            const { success, error } = sendMessageSchema.safeParse({ text, image });
        
            if (!success) {
                const { fieldErrors, formErrors } = error.flatten();
                const allErrors = [
                    ...Object.values(fieldErrors).flat().filter(Boolean),
                    ...formErrors,
                ];
                // return res.status(400).json({ formErrors: error.flatten() });
                // return io.to(userId).emit('message', { error: 'Invalid fields.' });
                return cb({ formErrors: allErrors });
            }
        
            try {
                let uploadResult = null;
        
                if (image) {
                    uploadResult = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream((error, result) => {
                            if (error) {
                                return reject(new Error(error.message));
                            }
            
                            return resolve(result);
                        }).end(image);
                    });
                }
        
                const newMessage = new Message({
                    senderId: userId,
                    receiverId,
                    text,
                    image: uploadResult?.secure_url,
                });
        
                await newMessage.save();

                // console.log(socket.rooms, userId);
                // const socketReceiver = onlineUserIds[receiverId];
                // if (socketReceiver) {
                //     io.to(socketReceiver).emit('message', { data: newMessage });
                // }
                const chatId = [receiverId, userId].sort().join('-');
                socket.to(chatId).emit('message', { data: newMessage });

                cb({ data: newMessage });
            } catch (error) {
                console.log('Server message error:', error);
                // io.to(userId).emit('message', { error: 'Internal server error.' });
                cb({ errors: [{ message: 'Internal server error.' }] });
            }
    });
});
