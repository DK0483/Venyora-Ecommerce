const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get token from Authorization header
    const authHeader = req.header('Authorization');

    // 2. Check if header exists and follows "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Authentication Failed: No valid Bearer token provided.');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 3. Extract token (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // 4. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};