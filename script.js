const apiKey = "9f145d3c5c665e2f30cbafcaec3b7cf5"
const weatherAPI = "https://api.openweathermap.org"
// Global variables
var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'd91f911bcf2c0f925fb6535547a5ddc9';

// DOM element references
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var searchHistoryContainer = document.querySelector('#history');

// Fetches weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.
//location argument is an object 

//{
//lat: 23423;
//lon: arsfe;
//}

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function renderItems(data) {
    // renderCurrentWeather(city, data.current, data.timezone);
    renderForecast(data.daily, data.timezone);
}

//var search = "raleigh"
//delete fetchweather

function getCoordinates(city) {
    fetch(`${weatherApiRootUrl}/data/2.5/weather?q=${city}&appid=${weatherApiKey}`)
        .then(res => res.json())
        .then(data => {
            getWeather(data.coord.lat, data.coord.lon, data.name)
        })
}
function renderButtons() {
    var arrOfCities = JSON.parse(localStorage.getItem("history")) || [];
    searchHistoryContainer.innerHTML =""
    for(i=0; i < arrOfCities.length;i++) {
        var newButton = document.createElement("button")
        newButton.textContent = arrOfCities[i];
        newButton.addEventListener("click", function(e) {
            getCoordinates(e.target.textContent)
        })

        searchHistoryContainer.append(newButton)

    }
}

renderButtons()
function getWeather(lat, lon, cityName) {
    //const apiUrl = `${weatherAPI}/geo/1.0/direct?q=${search}&limit=5&appid=${apiKey}`
    var apiUrl = `${weatherApiRootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`;

    fetch(apiUrl).then(function (response) {
        return response.json()
    }).then(function (data) {
        if (!data) {
            alert("no location found")
        } else {
            console.log("Data", data)
            var history = []
            if(localStorage.getItem("history")){
                history = JSON.parse(localStorage.getItem("history"))
            }
            history.push(cityName)
            localStorage.setItem("history", JSON.stringify(history))
            renderButtons()
            renderItems(data);
        }

    })

        .catch(function (err) {
            console.error(err)
        })

}
//add event listner
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var city = searchInput.value
    getCoordinates(city)

    //fetchcityCoords(city:
})

// Function to display 5 day forecast.
function renderForecast(dailyForecast, timezone) {
    // Create unix timestamps for start and end of 5 day forecast
    var startDt = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
    var endDt = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();

    var headingCol = document.createElement('div');
    var heading = document.createElement('h4');

    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);

    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
    for (var i = 0; i < dailyForecast.length; i++) {
        // The api returns forecast data which may include 12pm on the same day and
        // always includes the next 7 days. The api documentation does not provide
        // information on the behavior for including the same day. Results may have
        // 7 or 8 items.
        if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
            renderForecastCard(dailyForecast[i], timezone);
        }
    }
}

  function renderForecastCard(forecast, timezone) {
    // variables for data from api
    var unixTs = forecast.dt;
    var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    var iconDescription = forecast.weather[0].description;
    var tempF = forecast.temp.day;
    var { humidity } = forecast;
    var windMph = forecast.wind_speed;

    // Create elements for a card
    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h5');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');

    // Add content to elements
    cardTitle.textContent = dayjs.unix(unixTs).tz(timezone).format('M/D/YYYY');
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${tempF} °F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    forecastContainer.append(col);
  }


