const jwt = require('jsonwebtoken');
require("dotenv").config(); // Load environment variables from .env file

const SECRET = `${process.env.secret_key}`; // move to env in production

// very basic implementation for showcase
function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };
