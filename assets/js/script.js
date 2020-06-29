// Variables
var inputCityEl = document.getElementById('inputCity');
var btnEl = document.getElementById("btn");
var savedCityContainerEl = document.getElementById("savedCityContainer");
var dayForecastListEl = document.getElementById("dayForecastList");
var dayForecastHeaderEl = document.getElementById("dayForecastHeader");
var temperatureEl = document.getElementById("temperature");
var humidityEl = document.getElementById("humidity");
var windEl = document.getElementById("wind");
var uvEl = document.getElementById("uv");
var fiveDayForecastEl = document.getElementById("fiveDayForecast");
var cityList = JSON.parse(localStorage.getItem('cities')) || [];

// Store the cities from the user input
function storeCities() {
  var cityToBeAdded = inputCityEl.value;
  console.log(cityToBeAdded);

  // confirm there are no duplicates
  if (cityList.indexOf(cityToBeAdded) === -1) {
    cityList.push(cityToBeAdded);
    localStorage.setItem("cities", JSON.stringify(cityList));
  }

  // Add the recently searched cities to the CityList
  renderCities();

  // Make the forecast request
  searchWeather(cityToBeAdded);
}

// Display the stored cities in the Left Column
function renderCities() {
  var cities = JSON.parse(localStorage.getItem("cities")) || [];
  savedCityContainerEl.innerHTML = "";
  for (var i = 0; i < cities.length; i++) {
    var savedCityListItem = document.createElement("LI");
    savedCityListItem.addEventListener('click', e => {
      if (e.target.tagName == 'LI') {
        searchWeather(e.target.innerText)
      }
    })
    savedCityListItem.className = 'list-group-item savedCityListItem role="button"';
    savedCityListItem.innerText = cities[i];
    savedCityContainerEl.appendChild(savedCityListItem);
  }
};

renderCities();

// **********************************************************************************

// Search the Open Weathermap API for Weather Details
function searchWeather(inputCity) {

  // today's forecast fetch
  fetch(
    'https://api.openweathermap.org/data/2.5/weather?units=imperial&appid=1db6310f555fa74480683e435e7419b5&q=' +
    inputCity
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {

      // UV forecast fetch
      fetch(
        "https://api.openweathermap.org/data/2.5/uvi?appid=1db6310f555fa74480683e435e7419b5&q=&lat=" + response.coord.lat + "&lon=" + response.coord.lon
      )

        .then(function (uvResponse) {
          return uvResponse.json();
        })
        .then(function (uvResponse) {

          // UV Color Coding Logic
          if (uvResponse.value >= 8) {
            uvEl.style.backgroundColor = "red";
          } else if (uvResponse.value >= 6) {
            uvEl.style.backgroundColor = "orange"
          } else if (uvResponse.value >= 3) {
            uvEl.style.backgroundColor = "yellow"
          } else if (uvResponse.value < 3) {
            uvEl.style.backgroundColor = "green"
          }

          uvEl.innerText = "UV Index: " + uvResponse.value;


        })

      if (cityList.indexOf(inputCity) === -1) {
        cityList.push(inputCity);
      }

      // convert dt to date via moment.js
      var convertedDate = moment.unix(response.dt)

      // get weather icon
      console.log(response.weather[0].icon);
      var weatherIconUrl = "https://openweathermap.org/img/wn/" + response.weather[0].icon + '@2x.png';
      console.log(weatherIconUrl);
      var weatherIcon = document.createElement("IMG");
      weatherIcon.id = "weatherIcon";
      weatherIcon.src = weatherIconUrl;
      console.log(weatherIcon);


      // Day Forecast - header - cityList, Date, Icon
      dayForecastHeaderEl.innerText = response.name + " " + convertedDate.format("MM/DD/YYYY");
      dayForecastHeaderEl.appendChild(weatherIcon);

      // Day Forecast - details
      temperatureEl.innerText = "Temperature: " + response.main.temp + '°F';
      humidityEl.innerText = "Humidity: " + response.main.humidity + "%";
      windEl.innerText = "Wind Speed: " + response.wind.speed + "MPH";

      dayForecastListEl.appendChild(humidityEl);

    });

  // **********************************************************************************

  // 5 day forecast fetch
  fetch(
    'https://api.openweathermap.org/data/2.5/forecast?appid=1db6310f555fa74480683e435e7419b5&q=' + inputCity
  )

    .then(function (fiveDayResponse) {
      return fiveDayResponse.json();
    })
    .then(function (fiveDayResponse) {
      fiveDayForecastEl.innerHTML = ""
      for (var i = 0; i < fiveDayResponse.list.length; i += 8) {

        var fiveDayForecastCol = document.createElement("DIV");
        fiveDayForecastCol.className = "col-md-2"

        var fiveDayForecastCard = document.createElement("DIV");
        fiveDayForecastCard.classList.add('card', 'text-white', 'bg-primary', 'mb-3');

        var bodyEl = document.createElement("DIV");
        bodyEl.classList.add('card', 'p-2', 'bg-primary');

        var fiveDayDate = moment.unix(fiveDayResponse.list[i].dt);

        var bodyDate = document.createElement("H5");
        bodyDate.classList.add('card-title', 'bg-primary');
        bodyDate.textContent = fiveDayDate.format("MM/DD/YYYY")

        var bodyImg = document.createElement("IMG");
        bodyImg.classList.add('card-img');
        bodyImg.setAttribute(
          'src',
          'https://openweathermap.org/img/wn/' +
          fiveDayResponse.list[i].weather[0].icon +
          '@2x.png'
        )

        var fahrenheit = (fiveDayResponse.list[i].main.temp - 273.15) * (9 / 5) + 32;

        var bodyTemp = document.createElement("P");
        bodyTemp.classList.add('card-text', 'bg-primary');
        bodyTemp.textContent = "Temp: " + fahrenheit.toFixed(2) + '°F'

        var bodyHum = document.createElement("P");
        bodyHum.classList.add('card-text', 'bg-primary');
        bodyHum.textContent = 'Humidity: ' + fiveDayResponse.list[i].main.humidity + "%"


        fiveDayForecastCol.appendChild(fiveDayForecastCard);
        fiveDayForecastCard.appendChild(bodyEl);
        bodyEl.appendChild(bodyDate);
        bodyEl.appendChild(bodyImg);
        bodyEl.appendChild(bodyTemp);
        bodyEl.appendChild(bodyHum);
        fiveDayForecastEl.appendChild(fiveDayForecastCol);
      }
      console.log(fiveDayResponse)
    })
  renderCities();
}

btnEl.addEventListener("click", function () {
  storeCities();
});
