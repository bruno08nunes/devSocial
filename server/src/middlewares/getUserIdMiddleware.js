const jwt = require("jsonwebtoken");

// Chave secreta para assinar e verificar tokens JWT (a mesma usada em authController.js)
const jwtSecret = process.env.JWT_SECRET || "senhajwt"; // Use a mesma do controller!

exports.getUserIdMIddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return next();
    }

    try {
        // Verificar o token
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        return next();
    } catch (error) {
        return next();
    }
};
