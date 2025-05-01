import { Server } from 'socket.io';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { cloudinary } from '../lib/cloudinary.js';
import { Message } from '../models/message.model.js';
import { server } from './server.js';

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
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

const onlineUserIds = new Set();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (typeof userId === 'string' && userId) {
        onlineUserIds.add(userId);
        socket.join(userId);
    }
    io.emit('getOnlineUsers', Array.from(onlineUserIds));

    socket.on('disconnect', () => {
        onlineUserIds.delete(userId);
        io.emit('getOnlineUsers', Array.from(onlineUserIds));
    });

    socket.on('joinRoom', (id) => {
        // TODO: fix leaving rooms
        // const roomsToLeave = Array.from(socket.rooms).filter((roomName) => {
        //     return roomName !== socket.id && roomName !== socket.data?.user?.id;
        // });
        // if (roomsToLeave.length) {
        //     roomsToLeave.forEach((roomName) => {
        //         socket.leave(roomName);
        //     });
        // }

        if (typeof id === 'string' && id) {
            socket.join(id);
        }
    });

    socket.on('message', async (data = {}, receiverId) => {
        console.log('server received message:', data);
        const { text, image } = data;
            const userId = socket.data?.user?.id;
        
            if (!receiverId || !userId) {
                return io.to(userId).emit('message', { error: 'Bad request.' });
            }
        
            const { success, error } = sendMessageSchema.safeParse({ text, image });
        
            if (!success) {
                // return res.status(400).json({ formErrors: error.flatten() });
                return io.to(userId).emit('message', { error: 'Invalid fields.' });
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

                console.log(socket.rooms, userId);
                io.to(userId).emit('message', { data: newMessage });
            } catch (error) {
                console.log('Server message error:', error);
                io.to(userId).emit('message', { error: 'Internal server error.' });
            }
    });
});
