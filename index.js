const { Stock_in, Sale, Immediate_remove, Get_Products, Get_Product_Movements, Add_New_Product, Remove_Products} = require("./Controllers/ProductController.js");
// Requiring module
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const jwtAuth = require('./jwtMiddleware');

// Creating express object
const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500', // your frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // allow credentials (cookies, authorization headers, etc.)
}));

//rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
}));

const { generateToken } = require('./jwt.js');

app.post('/login', (req, res) => {
  const { storeId, password } = req.body;
  if (password === 'supersecret') {  // placeholder
    const token = generateToken({ storeId });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data

// each http request protected by jwt auth middleware
app.post('/api/products/stock-in', jwtAuth, Stock_in);
app.post('/api/products/manual-removal',jwtAuth, Immediate_remove);
app.post('/api/products/sale',jwtAuth, Sale);
app.get('/api/products/',jwtAuth, Get_Products);
app.get('/api/products/movement/:id',jwtAuth, Get_Product_Movements); // using get instead of post helps to maintain RESTful principels
app.post('/api/products/addProd',jwtAuth, Add_New_Product); // using get instead of post helps to maintain RESTful principels
app.post('/api/products/removeProd',jwtAuth, Remove_Products);
// Middleware to parse JSON bodies
const inventoryEmitter = require('./eventEmitter');
inventoryEmitter.on('sale_event', (event) => {
  console.log('Asynchronous Handler - Logging Sale Event:', event);
  // In a real app, this would trigger sync with central DB.
});

// Port Number
const PORT = process.env.PORT || 5000;

// Server Setup
app.listen(PORT,console.log(
  `Server started on port ${PORT}`));
