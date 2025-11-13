import { WeatherData, ForecastData } from '../types';

export function formatWeatherData(weatherData: WeatherData): string {
    return `${weatherData.location}: ${weatherData.temperature}°C, ${weatherData.condition} (Humidity: ${weatherData.humidity}%, Wind: ${weatherData.wind} km/h)`;
}

export function formatForecastData(forecastData: ForecastData): string[] {
    return forecastData.forecast.map(day => 
        `${day.date}: ${day.minTemp}°C - ${day.maxTemp}°C, ${day.condition}`
    );
}