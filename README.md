# Weather App 🌤️

A beautiful, responsive weather application with dynamic backgrounds that change based on current weather conditions. Built with TypeScript, vanilla JavaScript, and the WeatherAPI.

## ✨ Features

- 🌍 **Auto-location detection** - Automatically detects your location on page load
- 🌈 **Dynamic backgrounds** - Gradient changes based on weather conditions (sunny, rainy, snowy, stormy, etc.)
- 🌙 **Night mode** - Automatically switches to dark theme when it's night time at the location
- 🌡️ **Temperature toggle** - Switch between Celsius and Fahrenheit
- 📱 **Responsive design** - Works beautifully on desktop and mobile
- 🎨 **Smooth animations** - Cards pop in with elegant transitions
- 📅 **5-day forecast** - See upcoming weather with icons
- ⏰ **Last updated time** - Know when the data was last refreshed

## 🎨 Screenshots

![Night Mode - London](screenshots/Screenshot%202025-11-12%20205303.png)
*Night mode with deep purple atmospheric gradient*

![Day Mode - Ho Chi Minh City](screenshots/Screenshot%202025-11-12%20205357.png)
*Cloudy day mode with soft pastel gradient*

![Clear Weather - Munich](screenshots/Screenshot%202025-11-12%20205545.png)
*Clear weather with warm sunset gradient*

## 🚀 Demo

[View on GitHub](https://github.com/illfindyouagain/weather-app)
<!-- Update with live deployment URL when available -->
<!-- Example: https://weather-app.vercel.app -->

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **API**: [WeatherAPI.com](https://www.weatherapi.com/)
- **Dependencies**: Axios, dotenv
- **Features**: Geolocation API, Fetch API, CSS Animations, Glassmorphism

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/illfindyouagain/weather-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd weather-app
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your WeatherAPI key:
   ```env
   WEATHER_API_KEY=your_api_key_here
   ```
   Get a free API key from [WeatherAPI.com](https://www.weatherapi.com/)

## 🎯 Usage

### Start the Application

Run the Express server which serves the frontend and handles API requests:
```bash
npm start
```
Then open http://localhost:8000 in your browser.

### Development Mode

For auto-restart on file changes:
```bash
npm run dev
```

## 🌈 Color Palettes

The app uses different color gradients for various weather conditions:

| Condition | Colors |
|-----------|--------|
| **Clear/Sunny** | Warm sunset tones (#FFE1B3 → #F98475 → #7B4E7A) |
| **Cloudy** | Cool pastel grays (#DCE2E9 → #A9B1C1 → #5A6073) |
| **Rainy** | Soft blue tones (#C8D9E6 → #7FA5C0 → #35516F) |
| **Storm** | Dark dramatic violets (#B7A9C9 → #6A5A87 → #1E2333) |
| **Snowy** | Cool whites & blues (#F5F9FC → #C5D5E4 → #6D86A0) |
| **Night** | Deep atmospheric indigos (#49307A → #2B2557 → #131424) |

## 📱 Features in Detail

### Auto-Location Detection
Uses the browser's Geolocation API to automatically detect your location and show relevant weather on page load. Falls back to London if location access is denied.

### Dynamic Backgrounds
The gradient background smoothly transitions (1s ease) between different color palettes based on:
- Current weather condition (sunny, rainy, snowy, stormy, cloudy, etc.)
- Time of day (automatically switches to night palette when `is_day === 0`)

### Temperature Units
Toggle between Celsius and Fahrenheit with a single click. Wind speed automatically converts between km/h and mph.

### Responsive Design
- Desktop: Full 3-column grid for forecast days
- Mobile: Stacks into single column for better readability
- Glassmorphism cards with backdrop blur effect

## 📁 Project Structure

```
weather-app/
├── public/               # Frontend files (served statically)
│   ├── index.html       # Main HTML file
│   ├── styles.css       # Responsive CSS with animations
│   └── app.js           # Client-side JavaScript
├── screenshots/          # App screenshots for README
│   ├── night-mode.png
│   ├── day-mode.png
│   └── clear-weather.png
├── server.js            # Express backend server (API proxy)
├── .env                 # Environment variables (API key) - NOT in Git
├── .gitignore          # Git ignore file
├── package.json        # Node.js dependencies and scripts
└── README.md           # This file
```

## 🔒 Security

This app implements security best practices:

- **API Key Protection**: The Weather API key is stored server-side in `.env` and never exposed to the client
- **Backend Proxy**: All API requests go through the Express server, keeping credentials secure
- **Environment Variables**: Sensitive data uses dotenv and is excluded from version control
- **No Client-Side Secrets**: Frontend code contains no API keys or sensitive information

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Weather data provided by [WeatherAPI.com](https://www.weatherapi.com/)
- Weather icons from WeatherAPI
- Inspired by modern weather app designs
- Color palette inspiration from sunset gradients

## 📝 Todo / Future Enhancements

- [ ] Add loading indicators and skeleton screens
- [ ] Implement hourly forecast view
- [ ] Add weather alerts and warnings
- [ ] Save favorite locations with localStorage
- [ ] Search autocomplete for city names
- [ ] Historical weather data
- [ ] Weather maps integration
- [ ] PWA support for offline access
- [ ] Extended weather details (UV index, air quality, etc.)
- [ ] Deploy to production (Render + Vercel/Netlify)

## 🚀 Deployment

### Backend (Node.js/Express)
Deploy `server.js` to:
- [Render](https://render.com) - Free tier available
- [Railway](https://railway.app) - Easy Node.js hosting
- [Fly.io](https://fly.io) - Free tier with good performance

### Frontend (Static Files)
Deploy `public/` folder to:
- [Vercel](https://vercel.com) - Excellent for static sites
- [Netlify](https://netlify.com) - Great CI/CD integration
- [GitHub Pages](https://pages.github.com) - Free hosting from your repo

**Environment Variables:** Don't forget to set `WEATHER_API_KEY` in your hosting platform's environment settings!

---

Made with ❤️ by [illfindyouagain](https://github.com/illfindyouagain)
