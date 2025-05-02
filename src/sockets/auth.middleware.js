import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

export function socketAuthMiddleware(socket, next) {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
        return next(new Error('No credentials provided.'))
    };

    const authToken = parse(cookieHeader).auth_token;

    if (!authToken) {
        return next(new Error('Unauthorized.'))
    };

    try {
        const user = jwt.verify(authToken, process.env.JWT_SECRET);
        socket.data.user = user;

        next();
    } catch (err) {
        next(new Error('Invalid token.'));
    }
}
