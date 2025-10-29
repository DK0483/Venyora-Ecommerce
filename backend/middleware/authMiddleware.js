const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Get token from the Authorization header
    const authHeader = req.header('Authorization');

    // 2. Check if the header exists and is in the "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('Authentication Failed: No valid Bearer token provided.');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 3. Extract the actual token string (skipping "Bearer ")
    const token = authHeader.split(' ')[1];

    // 4. Verify token
    try {
        // Verify the token using the secret key (which is hardcoded to "my_jwt_secret_key_12345")
        const decoded = jwt.verify(token, "my_jwt_secret_key_12345");
        
        // Add user payload (containing the user ID) to the request object
        req.user = decoded.user; 
        next(); // Authorization successful, proceed to the route handler
    } catch (err) {
        // If JWT verification fails (expired, modified, invalid secret)
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ message: 'Token is not valid' });
    }
};