import { z } from 'zod';
import { cloudinary } from '../lib/cloudinary.js';
import { Message } from '../models/message.model.js';
import { User } from '../models/user.model.js';

export async function getChatUsers(req, res) {
    const userId = req?.user?.userId;

    try {
        const users = await User.find({ _id: { $ne: userId } }).select(['-password', '-updatedAt', '-salt']);

        res.status(200).json({ data: { users } });
    } catch (error) {
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}

export async function getChatMessages(req, res) {
    const { contactId } = req.params;
    const userId = req?.user?.userId;

    if (!contactId || !userId) {
        res.status(400).json({ errors: [{ message: 'Bad request.' }] });
    }

    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: contactId },
                { senderId: contactId, receiverId: userId },
            ],
        });

        res.status(200).json({ data: { messages } });
    } catch (error) {
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}

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

    if (image && !Buffer.isBuffer(image.buffer)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Bad image.',
        });
    }
});
export async function sendChatMessage(req, res) {
    const { text } = req.body;
    const image = req.file;
    const { contactId } = req.params;
    const userId = req?.user?.userId;

    if (!contactId || !userId) {
        return res.status(400).json({ errors: [{ message: 'Bad request.' }] });
    }

    const { success, error } = sendMessageSchema.safeParse({ text, image });

    if (!success) {
        return res.status(400).json({ formErrors: error.flatten() });
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
                }).end(image.buffer);
            });
        }

        const newMessage = new Message({
            senderId: userId,
            receiverId: contactId,
            text,
            image: uploadResult?.secure_url,
        });

        await newMessage.save();

        // TODO: add realtime
        res.status(201).json({ data: { newMessage } });
    } catch (error) {
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}
