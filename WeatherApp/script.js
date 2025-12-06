
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const cityInput = document.getElementById('city-input');
            const searchBtn = document.getElementById('search-btn');
            const currentLocationBtn = document.getElementById('current-location-btn');
            const saveLocationBtn = document.getElementById('save-location-btn');
            const manageLocationsBtn = document.getElementById('manage-locations-btn');
            const checkRouteBtn = document.getElementById('check-route-btn');
            const weatherDisplay = document.getElementById('weather-display');
            const loading = document.getElementById('loading');
            const errorMessage = document.getElementById('error-message');
            
            // Weather data elements
            const cityName = document.getElementById('city-name');
            const currentDate = document.getElementById('current-date');
            const temperature = document.getElementById('temperature');
            const weatherIcon = document.getElementById('weather-icon');
            const weatherDescription = document.getElementById('weather-description');
            const feelsLike = document.getElementById('feels-like');
            const humidity = document.getElementById('humidity');
            const windSpeed = document.getElementById('wind-speed');
            const pressure = document.getElementById('pressure');
            const elevation = document.getElementById('elevation');
            const localTime = document.getElementById('local-time');
            const timeZone = document.getElementById('time-zone');
            const elevationAdjustment = document.getElementById('elevation-adjustment');
            
            // Lists
            const locationsList = document.getElementById('locations-list');
            const stationsList = document.getElementById('stations-list');
            const routeWeather = document.getElementById('route-weather');
            
            // API Configuration
            const API_KEY = '5f472b7acba333cd8a035ea85a0d4d4c'; // Using a free OpenWeatherMap API key
            const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
            const GEOCODE_URL = 'https://api.openweathermap.org/geo/1.0/direct';
            
            // Map initialization
            let map = L.map('map').setView([40.7128, -74.0060], 10); // Default to New York
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Initialize saved locations from localStorage
            let savedLocations = JSON.parse(localStorage.getItem('savedLocations')) || [];
            
            // Set current date
            function setCurrentDate() {
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                currentDate.textContent = now.toLocaleDateString('en-US', options);
            }
            
            // Get weather data from API
            async function getWeatherData(city) {
                try {
                    // Show loading state
                    loading.style.display = 'block';
                    weatherDisplay.style.display = 'none';
                    errorMessage.style.display = 'none';
                    
                    const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
                    
                    if (!response.ok) {
                        throw new Error('City not found');
                    }
                    
                    const data = await response.json();
                    
                    // Update UI with weather data
                    updateWeatherUI(data);
                    
                    // Update map
                    updateMap(data.coord.lat, data.coord.lon, data.name);
                    
                    // Show weather display
                    loading.style.display = 'none';
                    weatherDisplay.style.display = 'block';
                    
                } catch (error) {
                    // Show error message
                    loading.style.display = 'none';
                    errorMessage.style.display = 'block';
                    console.error('Error fetching weather data:', error);
                }
            }
            
            // Get weather by coordinates
            async function getWeatherByCoords(lat, lon) {
                try {
                    loading.style.display = 'block';
                    weatherDisplay.style.display = 'none';
                    errorMessage.style.display = 'none';
                    
                    const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                    
                    if (!response.ok) {
                        throw new Error('Location not found');
                    }
                    
                    const data = await response.json();
                    
                    // Update UI with weather data
                    updateWeatherUI(data);
                    
                    // Update map
                    updateMap(lat, lon, data.name);
                    
                    loading.style.display = 'none';
                    weatherDisplay.style.display = 'block';
                    
                } catch (error) {
                    loading.style.display = 'none';
                    errorMessage.style.display = 'block';
                    console.error('Error fetching weather data:', error);
                }
            }
            
            // Update UI with weather data
            function updateWeatherUI(data) {
                cityName.textContent = data.name;
                temperature.textContent = Math.round(data.main.temp);
                weatherDescription.textContent = data.weather[0].description;
                feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
                humidity.textContent = `${data.main.humidity}%`;
                windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
                pressure.textContent = `${data.main.pressure} hPa`;
                
                // Mock elevation data (in a real app, this would come from the API)
                const mockElevation = Math.floor(Math.random() * 1000);
                elevation.textContent = mockElevation;
                
                // Mock time zone data
                const now = new Date();
                const options = { hour: '2-digit', minute: '2-digit' };
                localTime.textContent = now.toLocaleTimeString('en-US', options);
                timeZone.textContent = 'GMT-4'; // This would come from the API in a real app
                
                // Set weather icon based on condition
                setWeatherIcon(data.weather[0].main, data.weather[0].description);
                
                // Update elevation adjustment
                elevationAdjustment.textContent = `-${Math.floor(mockElevation / 300) * 2}°C (approx)`;
                
                // Update nearby stations
                updateNearbyStations(data.coord.lat, data.coord.lon);
            }
            
            // Set weather icon based on condition
            function setWeatherIcon(condition, description) {
                let iconClass = 'fas fa-';
                
                switch(condition.toLowerCase()) {
                    case 'clear':
                        iconClass += 'sun';
                        break;
                    case 'clouds':
                        if (description.includes('few') || description.includes('scattered')) {
                            iconClass += 'cloud-sun';
                        } else {
                            iconClass += 'cloud';
                        }
                        break;
                    case 'rain':
                    case 'drizzle':
                        iconClass += 'cloud-rain';
                        break;
                    case 'thunderstorm':
                        iconClass += 'bolt';
                        break;
                    case 'snow':
                        iconClass += 'snowflake';
                        break;
                    case 'mist':
                    case 'smoke':
                    case 'haze':
                    case 'dust':
                    case 'fog':
                    case 'sand':
                    case 'ash':
                    case 'squall':
                    case 'tornado':
                        iconClass += 'smog';
                        break;
                    default:
                        iconClass += 'sun';
                }
                
                weatherIcon.className = iconClass;
            }
            
            // Update map with current location
            function updateMap(lat, lon, name) {
                map.setView([lat, lon], 10);
                
                // Clear existing markers
                map.eachLayer(function(layer) {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
                
                // Add new marker
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(`<b>${name}</b><br>Current weather location`)
                    .openPopup();
            }
            
            // Get current location
            function getCurrentLocation() {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        position => {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            getWeatherByCoords(lat, lon);
                        },
                        error => {
                            console.error('Error getting location:', error);
                            alert('Unable to retrieve your location. Please check your browser permissions.');
                        }
                    );
                } else {
                    alert('Geolocation is not supported by this browser.');
                }
            }
            
            // Save current location
            function saveCurrentLocation() {
                const locationName = cityName.textContent;
                
                // Check if location is already saved
                if (savedLocations.some(loc => loc.name === locationName)) {
                    alert('This location is already saved.');
                    return;
                }
                
                // Add to saved locations
                savedLocations.push({
                    name: locationName,
                    timestamp: new Date().toISOString()
                });
                
                // Save to localStorage
                localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
                
                // Update locations list
                updateLocationsList();
                
                alert(`"${locationName}" has been saved to your locations.`);
            }
            
            // Update locations list
            function updateLocationsList() {
                locationsList.innerHTML = '';
                
                if (savedLocations.length === 0) {
                    locationsList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No saved locations yet.</p>';
                    return;
                }
                
                savedLocations.forEach((location, index) => {
                    const locationItem = document.createElement('div');
                    locationItem.className = 'location-item';
                    locationItem.innerHTML = `
                        <div>
                            <div style="font-weight: bold;">${location.name}</div>
                            <div style="font-size: 0.8rem; opacity: 0.7;">Saved: ${new Date(location.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div class="location-actions">
                            <button class="load-location" data-index="${index}">
                                <i class="fas fa-search"></i>
                            </button>
                            <button class="delete-location" data-index="${index}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    locationsList.appendChild(locationItem);
                });
                
                // Add event listeners to location actions
                document.querySelectorAll('.load-location').forEach(button => {
                    button.addEventListener('click', function() {
                        const index = this.getAttribute('data-index');
                        const location = savedLocations[index];
                        getWeatherData(location.name);
                    });
                });
                
                document.querySelectorAll('.delete-location').forEach(button => {
                    button.addEventListener('click', function() {
                        const index = this.getAttribute('data-index');
                        const locationName = savedLocations[index].name;
                        savedLocations.splice(index, 1);
                        localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
                        updateLocationsList();
                        alert(`"${locationName}" has been removed from your locations.`);
                    });
                });
            }
            
            // Update nearby stations (mock data)
            function updateNearbyStations(lat, lon) {
                stationsList.innerHTML = '';
                
                // Generate mock station data
                const stations = [
                    { name: 'Central Weather Station', distance: '2.1 km' },
                    { name: 'North Observatory', distance: '5.3 km' },
                    { name: 'Airport Weather Center', distance: '8.7 km' },
                    { name: 'South Monitoring Station', distance: '12.4 km' }
                ];
                
                stations.forEach(station => {
                    const stationItem = document.createElement('div');
                    stationItem.className = 'station-item';
                    stationItem.innerHTML = `
                        <div>${station.name}</div>
                        <div class="station-distance">${station.distance}</div>
                    `;
                    stationsList.appendChild(stationItem);
                });
            }
            
            // Check route weather (mock implementation)
            function checkRouteWeather() {
                const start = document.getElementById('route-start').value;
                const end = document.getElementById('route-end').value;
                
                if (!start || !end) {
                    alert('Please enter both starting point and destination.');
                    return;
                }
                
                routeWeather.innerHTML = `
                    <div class="route-point">
                        <h3>${start}</h3>
                        <div class="temperature">22°C</div>
                        <div class="weather-description">Sunny</div>
                    </div>
                    <div class="route-point">
                        <h3>${end}</h3>
                        <div class="temperature">18°C</div>
                        <div class="weather-description">Cloudy</div>
                    </div>
                `;
            }
            
            // Event Listeners
            searchBtn.addEventListener('click', function() {
                const city = cityInput.value.trim();
                if (city) {
                    getWeatherData(city);
                }
            });
            
            cityInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const city = cityInput.value.trim();
                    if (city) {
                        getWeatherData(city);
                    }
                }
            });
            
            currentLocationBtn.addEventListener('click', getCurrentLocation);
            saveLocationBtn.addEventListener('click', saveCurrentLocation);
            manageLocationsBtn.addEventListener('click', updateLocationsList);
            checkRouteBtn.addEventListener('click', checkRouteWeather);
            
            // Initialize with default city and current date
            setCurrentDate();
            getWeatherData('New York');
            updateLocationsList();
        });
    