const API_KEY = "97d53d791631d6958e8262106566694f";

let units = localStorage.getItem("units") || "metric";
let theme = localStorage.getItem("theme") || "light";

document.documentElement.setAttribute("data-theme", theme);
document.getElementById("unitToggle").innerText =
  units === "metric" ? "°C" : "°F";


document.getElementById("themeToggle").onclick = () => {
  theme = theme === "light" ? "dark" : "light";
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
};

document.getElementById("unitToggle").onclick = () => {
  units = units === "metric" ? "imperial" : "metric";
  localStorage.setItem("units", units);
  document.getElementById("unitToggle").innerText =
    units === "metric" ? "°C" : "°F";
  getWeather();
};


document.getElementById("searchBtn").onclick = getWeather;


document.getElementById("cityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeather();
});


async function getWeather() {
  let city = document.getElementById("cityInput").value.trim();
  if (!city) city = "New Delhi";

  const URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=${units}`;
  const res = await fetch(URL);
  const data = await res.json();

  if (data.cod !== 200) {
    alert("City Not Found");
    return;
  }

  displayCurrent(data);

  const { lat, lon } = data.coord;
  getHourly(lat, lon);
  getForecast(lat, lon);
  getAQI(lat, lon);
}


function displayCurrent(d) {
  document.getElementById("cityName").innerText = `${d.name}, ${d.sys.country}`;
  document.getElementById("temperature").innerText =
    d.main.temp + (units === "metric" ? "°C" : "°F");
  document.getElementById("weatherText").innerText = d.weather[0].description;
  document.getElementById("humidity").innerText = d.main.humidity;
  document.getElementById("wind").innerText =
    d.wind.speed + (units === "metric" ? " m/s" : " mph");
  document.getElementById(
    "icon"
  ).src = `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;

  applyBg(d.weather[0].main.toLowerCase());
}

function applyBg(cond) {
  document.body.className = "";
  if (cond.includes("rain")) document.body.classList.add("rainy");
  if (cond.includes("cloud")) document.body.classList.add("cloudy");
  if (cond.includes("snow")) document.body.classList.add("snowy");
  if (cond.includes("clear")) document.body.classList.add("sunny");
}


async function getHourly(lat, lon) {
  const URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const res = await fetch(URL);
  const data = await res.json();

  const box = document.getElementById("hourly");
  box.innerHTML = "";

  data.list.slice(0, 8).forEach((item) => {
    let t = item.dt_txt.split(" ")[1].slice(0, 5);

    box.innerHTML += `
      <div class="card">
        <p>${t}</p>
        <img src="https://openweathermap.org/img/wn/${
          item.weather[0].icon
        }.png">
        <p>${item.main.temp}${units === "metric" ? "°C" : "°F"}</p>
      </div>
    `;
  });
}


async function getForecast(lat, lon) {
  const URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  const res = await fetch(URL);
  const data = await res.json();

  const box = document.getElementById("forecast");
  box.innerHTML = "";

  let daily = {};

  data.list.forEach((item) => {
    let d = item.dt_txt.split(" ")[0];
    if (!daily[d]) daily[d] = [];
    daily[d].push(item);
  });

  Object.keys(daily)
    .slice(0, 5)
    .forEach((day) => {
      let arr = daily[day];
      let temps = arr.map((i) => i.main.temp);
      let icon = arr[0].weather[0].icon;

      box.innerHTML += `
      <div class="card">
        <p>${day}</p>
        <img src="https://openweathermap.org/img/wn/${icon}.png">
        <p>Min: ${Math.min(...temps)}</p>
        <p>Max: ${Math.max(...temps)}</p>
      </div>
    `;
    });
}

async function getAQI(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  const data = await res.json();

  const pm = data.list[0].components.pm2_5;
  let aqi = convertAQI(pm);

  document.getElementById("aqi").innerText = aqi;
}


function convertAQI(pm) {
  if (pm <= 30) return scale(pm, 0, 30, 0, 50);
  if (pm <= 60) return scale(pm, 31, 60, 51, 100);
  if (pm <= 90) return scale(pm, 61, 90, 101, 200);
  if (pm <= 120) return scale(pm, 91, 120, 201, 300);
  if (pm <= 250) return scale(pm, 121, 250, 301, 400);
  if (pm <= 350) return scale(pm, 251, 350, 401, 500);
  return 500;
}

function scale(C, lo, hi, aqLo, aqHi) {
  return Math.round(((aqHi - aqLo) / (hi - lo)) * (C - lo) + aqLo);
}

getWeather();


