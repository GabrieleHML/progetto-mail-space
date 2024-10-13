const jwt = require('jsonwebtoken');
const { jwt_secret_key } = require('../config');

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, jwt_secret_key, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;  // Contiene i dati dell'utente autenticato
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { authenticateJWT };
