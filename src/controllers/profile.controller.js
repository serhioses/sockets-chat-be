import { UserDTO } from '../dtos/user.dto.js';
import { cloudinary } from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils/auth-token.js';
import { User } from '../models/user.model.js';

export async function updateProfile(req, res) {
    const avatar = req.file;

    if (!Buffer.isBuffer(avatar?.buffer)) {
        return res.status(200).json({ errors: [{ message: 'Avatar is not provided.' }] });
    }

    const userId = req?.user?.id;

    if (!userId) {
        return res.status(200).json({ errors: [{ message: 'Unauthorized.' }] });
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

        const userDTO = new UserDTO(updatedUser);
        
        generateToken(userDTO, res);
        
        res.status(200).json({ data: userDTO });
    } catch (error) {
        console.log(error);
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}
