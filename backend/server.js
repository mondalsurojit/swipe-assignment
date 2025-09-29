require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(routes);

// Start server
app.listen(PORT, '0.0.0.0', () => console.log(`Swipe server running on port ${PORT}`));
