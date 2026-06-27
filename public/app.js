const BASE_URL = '/api/weather';

const fahrenheitLocales = ['en-US', 'en-LR', 'my'];
const userLocale = navigator.language || 'en-US';
let isCelsius = !fahrenheitLocales.some(l => userLocale.startsWith(l));
let weatherData = null;
let suggestController = null;
const unitLabel = () => isCelsius ? '°C' : '°F';


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

// Create animated background blobs
function initBlobs() {
    [1, 2, 3].forEach(i => {
        const b = document.createElement('div');
        b.className = `blob blob-${i}`;
        appBg.appendChild(b);
    });
}

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const toggleUnitBtn = document.getElementById('toggleUnit');
const errorDiv = document.getElementById('error');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');
const appBg = document.getElementById('appBg');
const suggestionsDiv = document.getElementById('suggestions');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { hideSuggestions(); handleSearch(); }
});
cityInput.addEventListener('input', debounce(handleSuggestions, 280));
cityInput.addEventListener('keydown', navigateSuggestions);
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-row')) hideSuggestions();
});
toggleUnitBtn.addEventListener('click', toggleUnit);

// Initialize with geolocation
window.addEventListener('load', () => {
    initBlobs();
    renderSavedLocations();
    setupPullToRefresh();
    detectLocation();
});

document.getElementById('alertDismiss').addEventListener('click', () => {
    document.getElementById('alertBanner').classList.add('hidden');
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
    setLoading(true);
    try {
        hideError();

        const data = await fetch(`${BASE_URL}/forecast/${encodeURIComponent(city)}?days=3`).then(res => {
            if (!res.ok) throw new Error('City not found');
            return res.json();
        });

        weatherData = data;
        saveLocation(data.location.name);

        updateBackground(data);
        displayCurrentWeather(data);
        displayHourly(data);
        displayForecast(data);
        displayAlerts(data);
        attachTileEffects();

    } catch (error) {
        showError(error.message || 'Failed to fetch weather data');
        currentWeatherDiv.classList.add('hidden');
        forecastDiv.classList.add('hidden');
    } finally {
        setLoading(false);
    }
}

function displayCurrentWeather(data) {
    const temp = isCelsius ? data.current.temp_c : data.current.temp_f;
    const windSpeed = isCelsius ? data.current.wind_kph : data.current.wind_mph;
    const windUnit = isCelsius ? 'km/h' : 'mph';
    
    document.getElementById('cityName').textContent = data.location.name;
    document.getElementById('regionName').textContent = [data.location.region, data.location.country].filter(Boolean).join(', ');
    animateTemp(Math.round(temp));
    document.getElementById('tempUnit').textContent = unitLabel();
    document.getElementById('condition').textContent = data.current.condition.text;
    document.getElementById('humidity').textContent = data.current.humidity + '%';
    document.getElementById('wind').textContent = windSpeed + ' ' + windUnit;

    const feelsLike = isCelsius ? data.current.feelslike_c : data.current.feelslike_f;
    document.getElementById('feelsLike').textContent = Math.round(feelsLike) + unitLabel();
    document.getElementById('uvIndex').textContent = data.current.uv;

    document.getElementById('weatherIcon').innerHTML =
        getWeatherIconSVG(data.current.condition.text, data.current.is_day === 0);

    // last_updated is already local time for the queried city — display as-is
    const [, timePart] = data.current.last_updated.split(' ');
    const [hh, mm] = timePart.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    document.getElementById('lastUpdated').textContent = `Updated ${h12}:${String(mm).padStart(2,'0')} ${ampm}`;
    
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
        
        const date = new Date(day.date + 'T12:00:00');
        const minTemp = isCelsius ? day.day.mintemp_c : day.day.mintemp_f;
        const maxTemp = isCelsius ? day.day.maxtemp_c : day.day.maxtemp_f;
        const dow = date.toLocaleDateString('en-US', { weekday: 'short' });
        dayDiv.innerHTML = `
            <div class="forecast-dow">${dow}</div>
            <div class="forecast-icon">${getWeatherIconSVG(day.day.condition.text, false)}</div>
            <div class="forecast-hi">${Math.round(maxTemp)}°</div>
            <div class="forecast-lo">${Math.round(minTemp)}°</div>
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
    if (weatherData) {
        displayCurrentWeather(weatherData);
        displayHourly(weatherData);
        displayForecast(weatherData);
    }
}

function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

async function handleSuggestions() {
    const q = cityInput.value.trim();
    if (q.length < 2) { hideSuggestions(); return; }
    if (suggestController) suggestController.abort();
    suggestController = new AbortController();
    try {
        const results = await fetch(`${BASE_URL}/search/${encodeURIComponent(q)}`, { signal: suggestController.signal }).then(r => r.json());
        if (!Array.isArray(results) || results.length === 0) { hideSuggestions(); return; }
        renderSuggestions(results.slice(0, 6));
    } catch (e) {
        if (e.name !== 'AbortError') hideSuggestions();
    }
}

function renderSuggestions(results) {
    suggestionsDiv.innerHTML = '';
    results.forEach((r, i) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.dataset.index = i;
        const cityEl = document.createElement('span');
        cityEl.className = 'suggestion-city';
        cityEl.textContent = r.name;
        const regionEl = document.createElement('span');
        regionEl.className = 'suggestion-region';
        regionEl.textContent = [r.region, r.country].filter(Boolean).join(', ');
        item.appendChild(cityEl);
        item.appendChild(regionEl);
        item.addEventListener('mousemove', onTileMove);
        item.addEventListener('mouseleave', onTileLeave);
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            cityInput.value = r.name;
            hideSuggestions();
            fetchWeather(r.name);
        });
        suggestionsDiv.appendChild(item);
    });
    suggestionsDiv.classList.remove('hidden');
}

function hideSuggestions() {
    suggestionsDiv.classList.add('hidden');
    suggestionsDiv.innerHTML = '';
}

function navigateSuggestions(e) {
    const items = suggestionsDiv.querySelectorAll('.suggestion-item');
    if (!items.length) return;
    const active = suggestionsDiv.querySelector('.suggestion-item.active');
    let idx = active ? parseInt(active.dataset.index) : -1;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = Math.min(idx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = Math.max(idx - 1, 0);
    } else if (e.key === 'Escape') {
        hideSuggestions(); return;
    } else { return; }

    items.forEach(el => el.classList.remove('active'));
    items[idx].classList.add('active');
    cityInput.value = items[idx].querySelector('.suggestion-city').textContent;
}

function attachTileEffects() {
    document.querySelectorAll('.forecast-day, .detail-chip').forEach(tile => {
        tile.addEventListener('mousemove', onTileMove);
        tile.addEventListener('mouseleave', onTileLeave);
    });
}

function onTileMove(e) {
    const rect = this.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    this.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    this.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    const tiltX = (y - 0.5) * -16;
    const tiltY = (x - 0.5) * 16;
    this.style.transition = 'background 0.2s';
    this.style.transform = `perspective(500px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.04)`;
}

function onTileLeave() {
    this.style.removeProperty('--mx');
    this.style.removeProperty('--my');
    this.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), background 0.2s';
    this.style.transform = '';
}

function setLoading(on) {
    searchBtn.disabled = on;
    searchBtn.textContent = on ? '…' : 'Go';
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
        () => {
            showError('Allow location access or search for a city above.');
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

function getConditionType(text, isNight) {
    const c = text.toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) return 'storm';
    if (c.includes('snow') || c.includes('sleet') || c.includes('blizzard') || c.includes('ice')) return 'snow';
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return 'rain';
    if (c.includes('mist') || c.includes('fog') || c.includes('haze') || c.includes('freezing')) return 'mist';
    if (c.includes('overcast')) return 'overcast';
    if (c.includes('cloud') || c.includes('partly')) return isNight ? 'cloudy-night' : 'cloudy-day';
    return isNight ? 'clear-night' : 'clear-day';
}

function getWeatherIconSVG(conditionText, isNight) {
    const type = getConditionType(conditionText, isNight);
    switch (type) {
        case 'clear-day': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <g style="transform-origin:36px 36px;animation:wx-spin 12s linear infinite">
                ${[0,45,90,135,180,225,270,315].map(a => `
                  <line x1="36" y1="8" x2="36" y2="16"
                    stroke="#FFD93D" stroke-width="3" stroke-linecap="round"
                    style="transform-origin:36px 36px;transform:rotate(${a}deg)"/>`).join('')}
              </g>
              <circle cx="36" cy="36" r="13" fill="#FFD93D"/>
              <circle cx="36" cy="36" r="10" fill="#FFB300" opacity="0.5"/>
            </svg>`;

        case 'clear-night': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="moon-mask">
                  <circle cx="34" cy="36" r="18" fill="white"/>
                  <circle cx="43" cy="29" r="14" fill="black"/>
                </mask>
              </defs>
              <circle cx="34" cy="36" r="18" fill="#E8EAF6" mask="url(#moon-mask)"/>
              <circle cx="54" cy="16" r="2" fill="white" style="animation:wx-twinkle 2.1s ease-in-out infinite"/>
              <circle cx="60" cy="30" r="1.5" fill="white" style="animation:wx-twinkle 2.8s ease-in-out infinite 0.4s"/>
              <circle cx="58" cy="44" r="1" fill="white" style="animation:wx-twinkle 1.9s ease-in-out infinite 0.9s"/>
            </svg>`;

        case 'cloudy-day': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <g style="transform-origin:24px 30px;animation:wx-spin 12s linear infinite">
                ${[0,60,120,180,240,300].map(a => `
                  <line x1="24" y1="10" x2="24" y2="16"
                    stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round"
                    style="transform-origin:24px 30px;transform:rotate(${a}deg)"/>`).join('')}
              </g>
              <circle cx="24" cy="30" r="9" fill="#FFD93D"/>
              <g style="animation:wx-float 4s ease-in-out infinite">
                <path d="M18 50 Q18 38 28 38 Q30 30 40 30 Q52 30 52 42 Q58 42 58 50 Z"
                  fill="white" opacity="0.95"/>
              </g>
            </svg>`;

        case 'cloudy-night': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="moon-mask2">
                  <circle cx="22" cy="28" r="13" fill="white"/>
                  <circle cx="29" cy="22" r="10" fill="black"/>
                </mask>
              </defs>
              <circle cx="22" cy="28" r="13" fill="#C5CAE9" mask="url(#moon-mask2)"/>
              <g style="animation:wx-float 4s ease-in-out infinite">
                <path d="M18 52 Q18 40 28 40 Q30 32 40 32 Q52 32 52 44 Q58 44 58 52 Z"
                  fill="white" opacity="0.9"/>
              </g>
            </svg>`;

        case 'overcast': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <g style="animation:wx-float 5s ease-in-out infinite">
                <path d="M12 52 Q12 38 24 38 Q26 28 38 28 Q52 28 52 40 Q60 40 60 52 Z"
                  fill="white" opacity="0.85"/>
              </g>
            </svg>`;

        case 'rain': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <g style="animation:wx-float 4s ease-in-out infinite">
                <path d="M12 42 Q12 30 22 30 Q24 22 34 22 Q46 22 46 32 Q53 32 53 42 Z"
                  fill="white" opacity="0.9"/>
              </g>
              <line x1="22" y1="50" x2="19" y2="62" stroke="#90CAF9" stroke-width="2.5" stroke-linecap="round" style="animation:wx-rain 1.0s linear infinite"/>
              <line x1="32" y1="50" x2="29" y2="62" stroke="#90CAF9" stroke-width="2.5" stroke-linecap="round" style="animation:wx-rain 1.0s linear infinite 0.25s"/>
              <line x1="42" y1="50" x2="39" y2="62" stroke="#90CAF9" stroke-width="2.5" stroke-linecap="round" style="animation:wx-rain 1.0s linear infinite 0.5s"/>
            </svg>`;

        case 'snow': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <g style="animation:wx-float 4s ease-in-out infinite">
                <path d="M12 42 Q12 30 22 30 Q24 22 34 22 Q46 22 46 32 Q53 32 53 42 Z"
                  fill="white" opacity="0.9"/>
              </g>
              <circle cx="22" cy="54" r="2.5" fill="white" style="animation:wx-snow 1.4s linear infinite"/>
              <circle cx="32" cy="56" r="2" fill="white" style="animation:wx-snow 1.4s linear infinite 0.35s"/>
              <circle cx="42" cy="54" r="2.5" fill="white" style="animation:wx-snow 1.4s linear infinite 0.7s"/>
            </svg>`;

        case 'storm': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <g style="animation:wx-float 4s ease-in-out infinite">
                <path d="M10 44 Q10 32 22 32 Q24 22 36 22 Q50 22 50 34 Q58 34 58 44 Z"
                  fill="#B0BEC5" opacity="0.95"/>
              </g>
              <polygon points="38,46 32,58 36,58 30,70 44,54 39,54"
                fill="#FFD93D" style="animation:wx-flash 2s ease-in-out infinite"/>
            </svg>`;

        case 'mist': return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <line x1="14" y1="28" x2="58" y2="28" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.7" style="animation:wx-drift 3s ease-in-out infinite"/>
              <line x1="20" y1="38" x2="62" y2="38" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.55" style="animation:wx-drift 3s ease-in-out infinite 0.5s reverse"/>
              <line x1="10" y1="48" x2="52" y2="48" stroke="white" stroke-width="3" stroke-linecap="round" opacity="0.4" style="animation:wx-drift 3s ease-in-out infinite 1s"/>
            </svg>`;

        default: return `
            <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
              <g style="transform-origin:36px 36px;animation:wx-spin 12s linear infinite">
                ${[0,45,90,135,180,225,270,315].map(a => `
                  <line x1="36" y1="8" x2="36" y2="16"
                    stroke="#FFD93D" stroke-width="3" stroke-linecap="round"
                    style="transform-origin:36px 36px;transform:rotate(${a}deg)"/>`).join('')}
              </g>
              <circle cx="36" cy="36" r="13" fill="#FFD93D"/>
            </svg>`;
    }
}

// ── Saved locations ──
function getSavedLocations() {
    try { return JSON.parse(localStorage.getItem('savedLocations') || '[]'); }
    catch { return []; }
}

function saveLocation(name) {
    let saved = getSavedLocations().filter(s => s.toLowerCase() !== name.toLowerCase());
    saved.unshift(name);
    localStorage.setItem('savedLocations', JSON.stringify(saved.slice(0, 5)));
    renderSavedLocations();
}

function renderSavedLocations() {
    const saved = getSavedLocations();
    const container = document.getElementById('savedLocations');
    if (!saved.length) { container.classList.add('hidden'); return; }
    container.innerHTML = '';
    saved.forEach(name => {
        const chip = document.createElement('button');
        chip.className = 'saved-chip';
        chip.textContent = name;
        chip.addEventListener('click', () => { cityInput.value = name; hideSuggestions(); fetchWeather(name); });
        container.appendChild(chip);
    });
    container.classList.remove('hidden');
}

// ── Weather alerts ──
function displayAlerts(data) {
    const banner = document.getElementById('alertBanner');
    const alerts = data.alerts?.alert;
    if (!alerts || alerts.length === 0) { banner.classList.add('hidden'); return; }
    document.getElementById('alertText').textContent = alerts[0].headline;
    banner.classList.remove('hidden');
}

// ── Hourly forecast ──
function displayHourly(data) {
    const hourlyDiv = document.getElementById('hourly');
    const hourlyItemsDiv = document.getElementById('hourlyItems');
    hourlyItemsDiv.innerHTML = '';

    const [, locTime] = data.location.localtime.split(' ');
    const localHour = parseInt(locTime.split(':')[0]);

    const todayHours = data.forecast.forecastday[0].hour;
    const tomorrowHours = data.forecast.forecastday[1]?.hour || [];
    const allHours = [...todayHours, ...tomorrowHours];

    const startIdx = todayHours.findIndex(h => {
        const [, t] = h.time.split(' ');
        return parseInt(t) === localHour;
    });
    const next12 = allHours.slice(startIdx >= 0 ? startIdx : 0, (startIdx >= 0 ? startIdx : 0) + 12);

    next12.forEach((hour, i) => {
        const item = document.createElement('div');
        item.className = 'hourly-item' + (i === 0 ? ' now' : '');
        const [, t] = hour.time.split(' ');
        const hh = parseInt(t.split(':')[0]);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh % 12 || 12;
        const temp = isCelsius ? Math.round(hour.temp_c) : Math.round(hour.temp_f);
        item.innerHTML = `
            <div class="hourly-time">${i === 0 ? 'Now' : h12 + ' ' + ampm}</div>
            <div class="hourly-icon">${getWeatherIconSVG(hour.condition.text, hour.is_day === 0)}</div>
            <div class="hourly-temp">${temp}°</div>
        `;
        hourlyItemsDiv.appendChild(item);
    });

    hourlyDiv.classList.remove('hidden', 'update-pop');
    void hourlyDiv.offsetWidth;
    hourlyDiv.classList.add('update-pop');
}

// ── Temperature counter animation ──
function animateTemp(target) {
    const el = document.getElementById('temperature');
    const from = parseInt(el.textContent) || target;
    if (from === target || el.textContent === '—') { el.textContent = target; return; }
    const duration = 450;
    const start = performance.now();
    (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (target - from) * eased);
        if (p < 1) requestAnimationFrame(tick);
    })(start);
}

// ── Pull-to-refresh ──
function setupPullToRefresh() {
    const indicator = document.getElementById('pullIndicator');
    let startY = 0;
    let active = false;
    const THRESHOLD = 70;

    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) { startY = e.touches[0].clientY; active = true; }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!active) return;
        const delta = e.touches[0].clientY - startY;
        if (delta > 10) {
            const progress = Math.min(delta / THRESHOLD, 1);
            indicator.style.opacity = progress;
            indicator.style.transform = `translateX(-50%) translateY(${Math.min(delta * 0.5, 50) - 60}px)`;
            indicator.textContent = delta >= THRESHOLD ? '↑ Release to refresh' : '↓ Pull to refresh';
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!active) return;
        const delta = e.changedTouches[0].clientY - startY;
        active = false;
        indicator.style.opacity = 0;
        indicator.style.transform = 'translateX(-50%) translateY(-60px)';
        if (delta >= THRESHOLD && weatherData) fetchWeather(weatherData.location.name);
    }, { passive: true });
}

function updateBackground(data) {
    const isNight = data.current.is_day === 0;
    const condition = data.current.condition.text;
    const colors = getWeatherGradient(condition, isNight);

    if (isNight) {
        document.body.classList.add('app--night');
    } else {
        document.body.classList.remove('app--night');
    }

    // Base background — darkened version of palette midpoint
    appBg.style.background = colors[4];

    // Drive blob colors from weather palette
    const blobs = appBg.querySelectorAll('.blob');
    if (blobs[0]) blobs[0].style.background = colors[0];
    if (blobs[1]) blobs[1].style.background = colors[2];
    if (blobs[2]) blobs[2].style.background = colors[4];
}
