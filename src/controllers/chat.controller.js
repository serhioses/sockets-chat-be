import { Message } from '../models/message.model.js';
import { User } from '../models/user.model.js';
import { UserDTO } from '../dtos/user.dto.js';

export async function getChatUsers(req, res) {
    const userId = req?.user?.id;

    try {
        const users = await User.find({ _id: { $ne: userId } }).select(['-password', '-updatedAt', '-salt']);

        const usersDTO = users.map((u) => {
            return new UserDTO(u);
        });

        res.status(200).json({ data: usersDTO });
    } catch (error) {
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}

export async function getChatMessages(req, res) {
    const { contactId } = req.params;
    const userId = req?.user?.id;

    if (!contactId || !userId) {
        res.status(200).json({ errors: [{ message: 'Bad request.' }] });
    }

    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: contactId },
                { senderId: contactId, receiverId: userId },
            ],
        });

        res.status(200).json({ data: messages });
    } catch (error) {
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}
