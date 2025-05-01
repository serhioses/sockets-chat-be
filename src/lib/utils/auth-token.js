import jwt from 'jsonwebtoken';

export function generateToken(user, res) {
    const token = jwt.sign({ ...user }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });

    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });

    return token;
}
