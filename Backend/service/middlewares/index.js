
const jwt = require('jsonwebtoken');
const ApiResponse = require('../helpers/api-response.helper');

// Async error kezelő - Promise rejection kezelés
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('Async error:', error);
        return ApiResponse.serverError(res, error);
    });
};

// JWT token ellenőrzés
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return ApiResponse.error(res, 'auth.errors.token_required', 401);
    }

    jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key', (err, decoded) => {
        if (err) {
            return ApiResponse.error(res, 'auth.errors.invalid_token', 403);
        }
        req.user = decoded;
        next();
    });
};

// Kötelező mezők ellenőrzése
const validateRequired = (...fields) => (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
        console.log(`Missing fields: ${missing.join(', ')}`);
        return ApiResponse.validationError(res);
    }
    next();
};

// Email sablon validálás
const validateEmailTemplate = (req, res, next) => {
    const { emailTemplate } = req.body;
    if (!emailTemplate || !emailTemplate.subject || !emailTemplate.html) {
        return ApiResponse.validationError(res, 'EMAIL_TEMPLATE_INVALID');
    }
    next();
};

module.exports = {
    asyncHandler,
    authenticateToken,
    validateRequired,
    validateEmailTemplate
};
