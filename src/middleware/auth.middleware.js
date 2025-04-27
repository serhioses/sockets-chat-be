import jwt from 'jsonwebtoken';

export function protectRoute(req, res, next) {
    const authToken = req.cookies.auth_token;
    
    if (!authToken) {
        return res.status(200).json({ errors: [{ message: 'Unauthorized.' }] });
    }

    try {
        // TODO: refresh token
        const userPayload = jwt.verify(authToken, process.env.JWT_SECRET);

        req.user = userPayload;

        next();
    } catch(error) {
        res.status(500).json({ errors: [{ message: 'Internal server error.' }] }); 
    }
}
