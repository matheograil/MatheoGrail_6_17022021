const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jsonwebtoken.verify(token, 'RANDOM_TOKEN_SECRET');
		const userId = decodedToken.userId;
		if (req.body.userId && req.body.userId !== userId) {
			throw "Identifiant de l'utilisateur invalide.";
		} else {
			next();
		}
	} catch {
		res.status(401).json({ success: false, message: "L'utilisateur doit être connecté." });
  	}
};