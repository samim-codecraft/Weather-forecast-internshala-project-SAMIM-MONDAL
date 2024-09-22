const apiKey = '98740f4ebc0d63bc0f8ba70090e5a091'; 
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

// Fetching weather data by city name
function getWeatherData(city) {
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities)); 
    updateRecentCitiesDropdown();
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(currentWeatherUrl)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        updateCurrentWeather(data);
        return fetch(forecastUrl);
      } else {
        alert(data.message);
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.cod === '200') {
        updateForecast(data);
      }
    })
    .catch(error => console.error('Error:', error));
}

// Update the current weather section
function updateCurrentWeather(data) {
  document.getElementById('current-weather').classList.remove('hidden');
  document.getElementById('location').textContent = `${data.name} (${new Date().toLocaleDateString()})`;
  document.getElementById('temperature').textContent = data.main.temp.toFixed(2);
  document.getElementById('wind').textContent = data.wind.speed;
  document.getElementById('humidity').textContent = data.main.humidity;
  document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  document.getElementById('weather-icon').classList.remove('hidden');
}

// Update the forecast section
function updateForecast(data) {
  const forecastContainer = document.getElementById('forecast');
  forecastContainer.innerHTML = ''; 

  const forecasts = data.list.filter(f => f.dt_txt.includes('00:00:00')); 

  forecasts.forEach(forecast => {
    const card = document.createElement('div');
    card.className = 'bg-gray-700 text-white text-center p-4 rounded-lg';
    card.innerHTML = `
      <h2 class="font-semibold">${new Date(forecast.dt * 1000).toLocaleDateString()}</h2>
      <div class="my-2">
        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon" class="w-16 mx-auto">
      </div>
      <p>Temp: <span class="font-bold">${forecast.main.temp.toFixed(2)}</span>&deg;C.</p>
      <p>Wind: <span class="font-bold">${forecast.wind.speed}</span> M/S</p>
      <p>Humidity: <span class="font-bold">${forecast.main.humidity}</span>%</p>
    `;
    forecastContainer.appendChild(card);
  });
}

// Update the recent cities in dropdown menu
function updateRecentCitiesDropdown() {
    const dropdown = document.getElementById('recent-cities-list');
    dropdown.innerHTML = ''; 
  
    recentCities.forEach(city => {
      const listItem = document.createElement('li');
      listItem.textContent = city;
      listItem.className = 'py-2 px-4 hover:bg-gray-300 cursor-pointer';
      
      listItem.addEventListener('click', () => {
        getWeatherData(city);
        dropdown.classList.add('hidden'); 
      });
  
      dropdown.appendChild(listItem);
    });
  }

// To get current location and it will automatic taken when page load
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      const locationUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      fetch(locationUrl)
        .then(response => response.json())
        .then(data => {
          if (data.cod === 200) {
            updateCurrentWeather(data);
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.cod === '200') {
            updateForecast(data);
          }
        })
        .catch(error => console.error('Error:', error));
    }, () => {
      alert('Access denied. Please enter a city name.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

document.getElementById('search-button').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    getWeatherData(city);
  });


// Hide the dropdown list
document.getElementById('current-location').addEventListener('click', () => {
    const dropdown = document.getElementById('recent-cities-list');
    dropdown.classList.add('hidden'); 
    getCurrentLocation();
  });
  
  document.getElementById('recent-cities-dropdown').addEventListener('click', () => {
    const dropdown = document.getElementById('recent-cities-list');
    dropdown.classList.toggle('hidden'); 
  });
  
  // Load recent cities from local storage on page load
  window.onload = () => {
    updateRecentCitiesDropdown(); 
    getCurrentLocation(); 
  };