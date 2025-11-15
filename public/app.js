// API key is now securely stored on the backend
const BASE_URL = '/api/weather';

let isCelsius = true;
let currentData = null;
let forecastData = null;

// Weather condition color palettes
const weatherGradients = {
    clear: ['#FFE1B3', '#FFB48A', '#F98475', '#D46A84', '#7B4E7A'],
    sunny: ['#FFE1B3', '#FFB48A', '#F98475', '#D46A84', '#7B4E7A'],
    cloudy: ['#DCE2E9', '#C3CBD7', '#A9B1C1', '#7F879C', '#5A6073'],
    overcast: ['#DCE2E9', '#C3CBD7', '#A9B1C1', '#7F879C', '#5A6073'],
    rainy: ['#C8D9E6', '#A7C0D6', '#7FA5C0', '#567D9C', '#35516F'],
    rain: ['#C8D9E6', '#A7C0D6', '#7FA5C0', '#567D9C', '#35516F'],
    drizzle: ['#C8D9E6', '#A7C0D6', '#7FA5C0', '#567D9C', '#35516F'],
    storm: ['#B7A9C9', '#8F7DA5', '#6A5A87', '#443D5C', '#1E2333'],
    thunder: ['#B7A9C9', '#8F7DA5', '#6A5A87', '#443D5C', '#1E2333'],
    snow: ['#F5F9FC', '#DDE8F1', '#C5D5E4', '#9FBACD', '#6D86A0'],
    snowy: ['#F5F9FC', '#DDE8F1', '#C5D5E4', '#9FBACD', '#6D86A0'],
    mist: ['#C8D9E6', '#A7C0D6', '#7FA5C0', '#567D9C', '#35516F'],
    fog: ['#DCE2E9', '#C3CBD7', '#A9B1C1', '#7F879C', '#5A6073'],
    night: ['#49307A', '#3A2A69', '#2B2557', '#1E1F3A', '#131424'],
    default: ['#F8B195', '#F67280', '#C06C84', '#6C5B7B', '#355C7D']
};

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const toggleUnitBtn = document.getElementById('toggleUnit');
const errorDiv = document.getElementById('error');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
toggleUnitBtn.addEventListener('click', toggleUnit);

// Initialize with geolocation
window.addEventListener('load', () => {
    detectLocation();
});

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    await fetchWeather(city);
}

async function fetchWeather(city) {
    try {
        hideError();
        
        // Fetch current weather and forecast in parallel from our backend API
        const [current, forecast] = await Promise.all([
            fetch(`${BASE_URL}/current/${encodeURIComponent(city)}`).then(res => {
                if (!res.ok) throw new Error('City not found');
                return res.json();
            }),
            fetch(`${BASE_URL}/forecast/${encodeURIComponent(city)}?days=5`).then(res => {
                if (!res.ok) throw new Error('Failed to fetch forecast');
                return res.json();
            })
        ]);

        currentData = current;
        forecastData = forecast;
        
        // Update background based on weather condition
        updateBackground(current);
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
        currentWeatherDiv.classList.add('hidden');
        forecastDiv.classList.add('hidden');
    }
}

function displayCurrentWeather(data) {
    const temp = isCelsius ? data.current.temp_c : data.current.temp_f;
    const windSpeed = isCelsius ? data.current.wind_kph : data.current.wind_mph;
    const windUnit = isCelsius ? 'km/h' : 'mph';
    
    document.getElementById('cityName').textContent = data.location.name;
    document.getElementById('temperature').textContent = Math.round(temp);
    document.getElementById('tempUnit').textContent = isCelsius ? '°C' : '°F';
    document.getElementById('condition').textContent = data.current.condition.text;
    document.getElementById('humidity').textContent = data.current.humidity + '%';
    document.getElementById('wind').textContent = windSpeed + ' ' + windUnit;
    
    // Display last updated time
    const lastUpdated = new Date(data.current.last_updated);
    const timeString = lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    document.getElementById('lastUpdated').textContent = `Updated at ${timeString}`;
    
    // Add pop animation
    currentWeatherDiv.classList.remove('update-pop');
    void currentWeatherDiv.offsetWidth; // Trigger reflow
    currentWeatherDiv.classList.add('update-pop');
    
    currentWeatherDiv.classList.remove('hidden');
}

function displayForecast(data) {
    const forecastDaysDiv = document.getElementById('forecastDays');
    forecastDaysDiv.innerHTML = '';
    
    data.forecast.forecastday.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'forecast-day';
        
        const date = new Date(day.date);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        const minTemp = isCelsius ? day.day.mintemp_c : day.day.mintemp_f;
        const maxTemp = isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f;
        
        dayDiv.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-condition">
                <img src="https:${day.day.condition.icon}" class="forecast-icon" alt="Weather icon">
                ${day.day.condition.text}
            </div>
            <div class="forecast-temp">${Math.round(minTemp)}° / ${Math.round(maxTemp)}°</div>
        `;
        
        forecastDaysDiv.appendChild(dayDiv);
    });
    
    // Add pop animation
    forecastDiv.classList.remove('update-pop');
    void forecastDiv.offsetWidth; // Trigger reflow
    forecastDiv.classList.add('update-pop');
    
    forecastDiv.classList.remove('hidden');
}

function toggleUnit() {
    isCelsius = !isCelsius;
    toggleUnitBtn.textContent = isCelsius ? '°F' : '°C';
    
    if (currentData && forecastData) {
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

async function detectLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        fetchWeather('London');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeather(`${latitude},${longitude}`);
        },
        (error) => {
            console.error('Geolocation error:', error);
            fetchWeather('London');
        }
    );
}

function getWeatherGradient(condition, isNight) {
    if (isNight) {
        return weatherGradients.night;
    }
    
    const conditionLower = condition.toLowerCase();
    
    for (const [key, gradient] of Object.entries(weatherGradients)) {
        if (conditionLower.includes(key)) {
            return gradient;
        }
    }
    
    return weatherGradients.default;
}

function updateBackground(data) {
    const isNight = data.current.is_day === 0;
    const condition = data.current.condition.text;
    const colors = getWeatherGradient(condition, isNight);
    
    // Apply or remove night mode class
    if (isNight) {
        document.body.classList.add('app--night');
    } else {
        document.body.classList.remove('app--night');
    }
    
    const gradient = `linear-gradient(180deg, ${colors.join(', ')})`;
    document.body.style.background = gradient;
}
