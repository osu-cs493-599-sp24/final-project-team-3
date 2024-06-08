const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;  // Ensure you have JWT_SECRET in your .env file

// Middleware to authenticate the token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).send({ error: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Failed to authenticate token' });
        }
        req.user = decoded;  // Add user payload to request
        next();
    });
};

// Middleware to authorize based on role
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ error: 'Unauthorized' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
