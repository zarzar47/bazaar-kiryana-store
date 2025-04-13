const auth = require('basic-auth');
const Database = require('./Model/Database.js'); // Import the Database class

async function basicAuth(req, res, next) {
    const user = auth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm="Inventory System"');
        return res.status(401).send('Authentication required.');
    }

    try {
        const db = new Database(); // Create an instance of the Database class
        const retrievedUser = await db.GetUser(user.name); // Fetch user details from the database
        if (!retrievedUser || retrievedUser.user_Pass !== user.pass) {
            res.set('WWW-Authenticate', 'Basic realm="Inventory System"');

            return res.status(401).send('Invalid credentials.');
        }

        req.user = user.name; // Store username if needed
        next();
    } catch (error) {
        return res.status(500).send({ error: 'Internal server error', details: error.message });
    }
}

module.exports = basicAuth;
