const { Stock_in, Sale, Immediate_remove, Get_Products, Get_Product_Movements, Add_New_Product, Remove_Products} = require("./Controllers/ProductController.js");
// Requiring module
const express = require('express');
const rateLimit = require('express-rate-limit');
const basicAuth = require("./basicAuth.js");
const cors = require('cors');

// Creating express object
const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500', // your frontend origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // allow credentials (cookies, authorization headers, etc.)
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
}));

//basic Auth implementation
app.use(basicAuth)

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data

app.post('/api/products/stock-in', Stock_in);
app.post('/api/products/manual-removal', Immediate_remove);
app.post('/api/products/sale', Sale);
app.get('/api/products/', Get_Products);
app.get('/api/products/movement/:id', Get_Product_Movements); // using get instead of post helps to maintain RESTful principels
app.post('/api/products/addProd', Add_New_Product); // using get instead of post helps to maintain RESTful principels
app.delete('/api/products/removeProd', Remove_Products);
// Middleware to parse JSON bodies

// Port Number
const PORT = process.env.PORT || 5000;

// Server Setup
app.listen(PORT,console.log(
  `Server started on port ${PORT}`));
