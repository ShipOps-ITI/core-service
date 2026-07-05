const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "ShipOps Core Service is running"
    });
});

module.exports = app;