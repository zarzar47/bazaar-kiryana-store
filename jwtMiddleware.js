const jwt = require('jsonwebtoken');
require("dotenv").config(); // Load environment variables from .env file

const SECRET = `${process.env.secret_key}`; // move to env in production

function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Token required');

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send('Invalid or expired token');
  }
}

module.exports = jwtAuth;
