import { z } from 'zod';

import { generateToken } from '../lib/utils/auth-token.js';
import { User } from '../models/user.model.js';
import { comparePasswords, genSalt, hashPassword } from '../lib/utils/password-hasher.js';
import { UserDTO } from '../dtos/user.dto.js';

const signupSchema = z.object({
    fullName: z.string().min(1, 'Full name must be at least 1 character long.').max(64, 'Full name cannot be more than 64 characters.'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
});
export async function signup(req, res) {
    const { fullName, email, password } = req.body;
    const { success, error } = signupSchema.safeParse({ fullName, email, password });

    if (!success) {
        const { fieldErrors, formErrors } = error.flatten();

        const allErrors = [
            ...Object.values(fieldErrors).flat().filter(Boolean),
            ...formErrors,
        ];
        return res.status(200).json({ formErrors: allErrors });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(200).json({ errors: [{ message: 'User with this email already exist.' }] })
    }

    const salt = genSalt();

    try {
        const hashedPassword = await hashPassword(password, salt);
        const newUser = new User({
            fullName,
            salt,
            email,
            password: hashedPassword,
        });

        if (!newUser) {
            return res.status(200).json({ errors: [{ message: 'Invalid user data.' }] });
            
        }
        
        await newUser.save();

        const userDTO = new UserDTO(newUser);
        
        generateToken(userDTO, res);

        return res.status(201).json({ data: userDTO });
    } catch (error) {
        console.log('Error in signup controller', error.message);
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
});
export async function login(req, res) {
    const { email, password } = req.body;
    const { success, error } = loginSchema.safeParse({ email, password });

    if (!success) {
        const { fieldErrors, formErrors } = error.flatten();
        const allErrors = [
            ...Object.values(fieldErrors).flat().filter(Boolean),
            ...formErrors,
        ];

        return res.status(200).json({ formErrors: allErrors });
    }

    const userFromDB = await User.findOne({ email });

    if (!userFromDB) {
        return res.status(200).json({ errors: [{ message: 'User not found.' }] });
    }

    try {
        const isPasswordValid = await comparePasswords({
            passwordString: password,
            hashedPassword: userFromDB.password,
            salt: userFromDB.salt,
        });

        if (!isPasswordValid) {
            return res.status(200).json({ errors: [{ message: 'Invalid credentials.' }] });
        }
        
        const userDTO = new UserDTO(userFromDB);

        generateToken(userDTO, res);

        return res.status(200).json({ data: userDTO });
    } catch (error) {
        console.log('Error in login controller', error.message);
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] });
    }
}

export function logout(_, res) {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    
    res.status(200).json({ data: { success: true } });
}

export function getMe(req, res) {
    res.status(200).json({ data: req.user });
}
