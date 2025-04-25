import jwt from 'jsonwebtoken';

export function protectRoute(req, res, next) {
    const authToken = req.cookies.auth_token;
    
    if (!authToken) {
        return res.status(401).json({ errors: [{ message: 'Unauthorized.' }] });
    }

    try {
        // TODO: refresh token
        const userPayload = jwt.verify(authToken, process.env.JWT_SECRET);
    } catch(error) {
        return res.status(401).json({ errors: [{ message: 'Unauthorized.' }] }); 
    }

    next();
}
