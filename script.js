const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const suggestionsBox = document.getElementById('suggestions-box');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');

const cityNameEl = document.getElementById('city-name');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');

const apiKey = "97d53d791631d6958e8262106566694f";

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getWeather(city);
        cityInput.value = '';
        suggestionsBox.innerHTML = '';
    }
});

cityInput.addEventListener('input', () => {
    const query = cityInput.value;
    if (query.length > 2) {
        getCitySuggestions(query);
    } else {
        suggestionsBox.innerHTML = '';
    }
});


/**
 * @param {string} city - The name of the city
 */
async function getWeather(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        updateWeatherUI(data);
        errorMessage.classList.add('hide');
        weatherInfo.classList.remove('hide');
    } catch (error) {
        console.error("Error fetching weather:", error);
        errorMessage.classList.remove('hide');
        weatherInfo.classList.add('hide');
    }
}

/**
 * @param {object} data
 */
function updateWeatherUI(data) {
    cityNameEl.textContent = data.name;
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    descriptionEl.textContent = data.weather[0].description;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} km/h`;

    const weatherMain = data.weather[0].main;
    let iconUrl = '';
    switch (weatherMain.toLowerCase()) {
        case 'clear':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/3222/3222807.png';
            break;
        case 'clouds':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/7084/7084486.png';
            break;
        case 'rain':
        case 'drizzle':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/4724/4724091.png';
            break;
        case 'thunderstorm':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/3104/3104612.png';
            break;
        case 'snow':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/6635/6635320.png';
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            iconUrl = 'https://cdn-icons-png.flaticon.com/512/514/514240.png';
            break;
        default:
            iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    }
    weatherIconEl.src = iconUrl;
    weatherIconEl.alt = data.weather[0].main;
}


/**
 * @param {string} query - The user's input string
 */
async function getCitySuggestions(query) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

    try {
        const response = await fetch(geoUrl);
        const data = await response.json();
        displaySuggestions(data);
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
    }
}

/**
 * @param {Array} suggestions
 */
function displaySuggestions(suggestions) {
    suggestionsBox.innerHTML = '';
    suggestions.forEach(city => {
        const div = document.createElement('div');
        div.textContent = `${city.name}, ${city.country}`;
        div.classList.add('suggestion-item');
        div.addEventListener('click', () => {
            cityInput.value = city.name;
            suggestionsBox.innerHTML = '';
            getWeather(city.name);
        });
        suggestionsBox.appendChild(div);
    });
}