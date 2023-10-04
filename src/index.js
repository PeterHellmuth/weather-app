import "./style.css";

const img = document.querySelector("img");
const currentWeather = document.getElementById("current-weather");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const weatherResults = document.getElementById("weather-results");
const toggleCheckbox = document.getElementById("toggle-checkbox");
const toggleCheckboxLabel = document.getElementById("toggle-checkbox-label");
toggleCheckbox.addEventListener("change", toggleChanged);
let fahrenheit = true;
let currentSearchLocation = "";

searchButton.addEventListener("click", searchButtonClicked);

function searchButtonClicked() {
  currentSearchLocation = searchInput.value;
  searchForWeather(currentSearchLocation, true);
}

async function searchForWeather(location, updateGif) {
  getWeatherData(location)
    .then((weatherData) => {
      if (weatherData) {
        const currentTempString = fahrenheit
          ? `${weatherData.current.temp_f} °F`
          : `${weatherData.current.temp_c} °C`;
        currentWeather.innerText = `Current condition in ${weatherData.location.name}, ${weatherData.location.country}: ${weatherData.current.condition.text} and ${currentTempString}`;
        if (updateGif) {
          getWeatherGif(weatherData.current.condition.text);
        }
        while (weatherResults.hasChildNodes()) {
          weatherResults.removeChild(weatherResults.lastChild);
        }

        weatherData.forecast.forecastday.forEach((data) => {
          let minTemp = 0;
          if (fahrenheit) {
            minTemp = `${data.day.mintemp_f} °F`;
          } else {
            minTemp = `${data.day.mintemp_c} °C`;
          }
          let maxTemp = 0;
          if (fahrenheit) {
            maxTemp = `${data.day.maxtemp_f} °F`;
          } else {
            maxTemp = `${data.day.maxtemp_c} °C`;
          }
          weatherResults.appendChild(
            generateForecastDiv({
              date: data.date,
              condition: data.day.condition.text,
              minTemp,
              maxTemp,
            }),
          );
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

async function getWeatherData(location) {
  const response = await fetch(
    `http://api.weatherapi.com/v1/forecast.json?key=540bd18d1cc04b16a53115218230310&days=3&q=${location}`,
    { mode: "cors" },
  );

  if (response?.ok) {
    return generatePageElement(response.json());
  }
  while (weatherResults.hasChildNodes()) {
    weatherResults.removeChild(weatherResults.lastChild);
  }
  appendElem(weatherResults, "p", "Please enter a location.");
}

async function getWeatherGif(searchTerm) {
  const response = await fetch(
    `https://api.giphy.com/v1/gifs/translate?api_key=231r3etXbnHubal6zroI8Rg62bviaC2f&s=${searchTerm}`,
    { mode: "cors" },
  );
  const urlData = await response.json();
  img.src = urlData.data.images.original.url;
}

function generatePageElement(weatherData) {
  return weatherData;
}

function toggleChanged() {
  fahrenheit = toggleCheckbox.checked;
  if (fahrenheit) {
    toggleCheckboxLabel.innerText = "Fahrenheit";
  } else {
    toggleCheckboxLabel.innerText = "Celsius";
  }
  searchForWeather(currentSearchLocation, false);
}

function appendElem(
  parentElem,
  type,
  innerText = null,
  classIn = null,
  id = null,
) {
  const childElem = document.createElement(`${type}`);
  id ? (childElem.id = id) : null;
  classIn ? childElem.classList.add(classIn) : null;
  innerText ? (childElem.innerText = innerText) : null;
  parentElem.appendChild(childElem);
  return childElem;
}

function generateForecastDiv(weatherData) {
  const returnDiv = document.createElement("div");
  returnDiv.classList.add("forecast-card");

  appendElem(returnDiv, "h1", weatherData.date);
  appendElem(returnDiv, "p", `Conditions: ${weatherData.condition}`);
  appendElem(returnDiv, "p", `Min Temperature: ${weatherData.minTemp}`);
  appendElem(returnDiv, "p", `Max Temperature: ${weatherData.maxTemp}`);

  return returnDiv;
}
