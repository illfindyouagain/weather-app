const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

// Serve static files from public directory
app.use(express.static('public'));

// Validate and normalize a location/search string before sending it upstream.
// Returns the cleaned value, or null if it fails validation.
function cleanQuery(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > 100) return null;
    return trimmed;
}

// API proxy endpoint for current weather
app.get('/api/weather/current/:city', async (req, res) => {
    const city = cleanQuery(req.params.city);
    if (!city) {
        return res.status(400).json({ error: 'Invalid city name' });
    }
    try {
        const response = await axios.get(`${WEATHER_API_BASE}/current.json`, {
            params: { key: process.env.WEATHER_API_KEY, q: city }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error?.message || 'Failed to fetch weather data'
        });
    }
});

// API proxy endpoint for forecast
app.get('/api/weather/forecast/:city', async (req, res) => {
    const city = cleanQuery(req.params.city);
    if (!city) {
        return res.status(400).json({ error: 'Invalid city name' });
    }
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 5, 1), 14);
    try {
        const response = await axios.get(`${WEATHER_API_BASE}/forecast.json`, {
            params: { key: process.env.WEATHER_API_KEY, q: city, days }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.error?.message || 'Failed to fetch forecast data'
        });
    }
});

// API proxy endpoint for city search
app.get('/api/weather/search/:query', async (req, res) => {
    const query = cleanQuery(req.params.query);
    if (!query) {
        return res.status(400).json({ error: 'Invalid search query' });
    }
    try {
        const response = await axios.get(`${WEATHER_API_BASE}/search.json`, {
            params: { key: process.env.WEATHER_API_KEY, q: query }
        });
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
