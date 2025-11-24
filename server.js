const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Serve static files from public directory
app.use(express.static('public'));

// API proxy endpoint for current weather
app.get('/api/weather/current/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const response = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: error.response?.data?.error?.message || 'Failed to fetch weather data' 
        });
    }
});

// API proxy endpoint for forecast
app.get('/api/weather/forecast/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const days = req.query.days || 5;
        const response = await axios.get(
            `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${city}&days=${days}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: error.response?.data?.error?.message || 'Failed to fetch forecast data' 
        });
    }
});

// API proxy endpoint for city search
app.get('/api/weather/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const response = await axios.get(
            `https://api.weatherapi.com/v1/search.json?key=${process.env.WEATHER_API_KEY}&q=${query}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ 
            error: error.response?.data?.error?.message || 'Failed to search cities' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Weather app server running on http://localhost:${PORT}`);
});