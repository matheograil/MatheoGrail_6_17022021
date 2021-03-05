// Modules nécessaires.
const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jsonwebtoken.verify(token, process.env.JWT_TOKEN);
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            res.status(400).json({ error: 'Les identifiants sont incorrects.' });
        } else {
            next();
        }
    } catch {
        res.status(401).json({ error: "L'utilisateur doit être connecté." });
      }
};