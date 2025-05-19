import { z } from 'zod';

import { cloudinary } from '../../lib/cloudinary.js';
import { genChatId } from '../../lib/utils/socket.js';
import { Message } from '../../models/message.model.js';

const sendMessageSchema = z.object({
    text: z.string().nullish(),
    image: z.any().nullish(),
}).superRefine(({ text, image }, ctx) => {
    if (!text && !image) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Message cannot be empty.' });
    }
    if (image && !Buffer.isBuffer(image)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bad image.' });
    }
});

export async function handleMessageEvent(socket, data = {}, receiverId, cb) {
    const userId = socket.data.user?.id;
    const { text, image } = data;

    if (!receiverId || !userId) {
        return cb({ errors: [{ message: 'Bad request.' }] });
    }

    const result = sendMessageSchema.safeParse({ text, image });

    if (!result.success) {
        const { fieldErrors, formErrors } = result.error.flatten();
        const allErrors = [
            ...Object.values(fieldErrors).flat().filter(Boolean),
            ...formErrors,
        ];

        return cb({ formErrors: allErrors });
    }

    try {
        let uploadResult = null;
        const folder = process.env.NODE_ENV === 'test' ? '__tests__' : undefined;
        const tags = process.env.NODE_ENV === 'test' ? ['e2e'] : undefined;

        if (image) {
            uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder, tags }, (error, result) => {
                    if (error) {
                        return reject(new Error(error.message))
                    };

                    resolve(result);
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

        const chatId = genChatId(receiverId, userId);
        socket.to(chatId).emit('message', { data: newMessage });

        cb({ data: newMessage });
    } catch (error) {
        console.error('Server message error:', error);
        cb({ errors: [{ message: 'Internal server error.' }] });
    }
}
