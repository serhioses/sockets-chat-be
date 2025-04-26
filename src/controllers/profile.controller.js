import { cloudinary } from '../lib/cloudinary.js';
import { User } from '../models/user.model.js';

export async function updateProfile(req, res) {
    const avatar = req.file;

    if (!avatar) {
        return res.status(400).json({ errors: [{ message: 'Avatar is not provided.' }] });
    }

    const { userId } = req.user;

    if (!userId) {
        return res.status(401).json({ errors: [{ message: 'Unauthorized.' }] });
    }

    try {
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream((error, result) => {
                if (error) {
                    return reject(new Error(error.message));
                }

                return resolve(result);
            }).end(avatar.buffer);
        });

        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { avatar: uploadResult.secure_url },
            { new: true },
        ).select(['-password', '-updatedAt', '-salt']);
        
        res.status(200).json({ data: { user: updatedUser } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}
