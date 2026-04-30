const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces so LAN clients can connect

// Explicit CORS config — allows all origins, methods, and necessary headers
// This also handles the browser's preflight OPTIONS request correctly
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
// Note: cors() middleware automatically handles OPTIONS preflight when methods includes 'OPTIONS'

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/shops', require('./routes/shopRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Poth API is running' });
});

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // Fail fast — 10 seconds instead of 30
    connectTimeoutMS: 10000,
})
    .then(() => console.log('mongoDB Connected Successfully'))
    .catch((err) => {
        if (err.name === 'MongoNetworkTimeoutError') {
            console.error('MongoDB connection timed out. Check Atlas IP whitelist at cloud.mongodb.com → Security → Network Access');
        } else {
            console.error('MongoDB connection Error:', err.message);
        }
        process.exit(1);
    });

app.listen(PORT, HOST, () => {
    console.log(`Server is listening on http://localhost:${PORT}/`);
});
