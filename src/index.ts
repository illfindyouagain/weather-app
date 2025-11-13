import { WeatherService } from './services/weatherService';

// Get API key from environment variable
const API_KEY = process.env.WEATHER_API_KEY || '';
const weatherService = new WeatherService(API_KEY);

async function init() {
    try {
        const location = 'London';
        
        const currentWeather = await weatherService.getWeather(location);
        console.log('Current Weather:', currentWeather);

        const forecast = await weatherService.getForecast(location, 5);
        console.log('Weather Forecast:', forecast);
    } catch (error) {
        console.error('Error initializing the weather app:', error);
    }
}

init();