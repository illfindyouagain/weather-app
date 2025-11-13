import { WeatherData, ForecastData } from '../types';

export class WeatherService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string = '') {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.weatherapi.com/v1';
    }

    async getWeather(location: string): Promise<WeatherData> {
        const response = await fetch(`${this.baseUrl}/current.json?key=${this.apiKey}&q=${location}`);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();
        return this.formatWeatherData(data);
    }

    async getForecast(location: string, days: number): Promise<ForecastData> {
        const response = await fetch(`${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${location}&days=${days}`);
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        const data = await response.json();
        return this.formatForecastData(data);
    }

    private formatWeatherData(data: any): WeatherData {
        return {
            location: data.location.name,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
            humidity: data.current.humidity,
            wind: data.current.wind_kph,
        };
    }

    private formatForecastData(data: any): ForecastData {
        return {
            location: data.location.name,
            forecast: data.forecast.forecastday.map((day: any) => ({
                date: day.date,
                maxTemp: day.day.maxtemp_c,
                minTemp: day.day.mintemp_c,
                condition: day.day.condition.text,
            })),
        };
    }
}