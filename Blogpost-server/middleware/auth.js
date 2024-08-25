const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized, token missing or malformed' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach decoded token data (like user ID) to the request object
        next();  // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
}

module.exports = { verifyToken };
