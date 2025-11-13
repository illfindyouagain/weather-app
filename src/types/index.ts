export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    wind: number;
}

export interface ForecastDay {
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
}

export interface ForecastData {
    location: string;
    forecast: ForecastDay[];
}