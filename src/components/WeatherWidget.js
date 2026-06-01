// src/components/WeatherWidget.js
/* eslint-disable */
import { useState, useEffect } from "react";

const WEATHER_CODES = {
  0:  { label: "Clear sky",       icon: "☀️" },
  1:  { label: "Mainly clear",    icon: "🌤️" },
  2:  { label: "Partly cloudy",   icon: "⛅" },
  3:  { label: "Overcast",        icon: "☁️" },
  45: { label: "Foggy",           icon: "🌫️" },
  48: { label: "Icy fog",         icon: "🌫️" },
  51: { label: "Light drizzle",   icon: "🌦️" },
  61: { label: "Light rain",      icon: "🌧️" },
  63: { label: "Moderate rain",   icon: "🌧️" },
  65: { label: "Heavy rain",      icon: "🌧️" },
  71: { label: "Light snow",      icon: "🌨️" },
  80: { label: "Rain showers",    icon: "🌦️" },
  95: { label: "Thunderstorm",    icon: "⛈️" },
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { label: "Unknown", icon: "🌡️" };
}

export default function WeatherWidget() {
  const [weather, setWeather]   = useState(null);
  const [location, setLocation] = useState("Locating…");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(function() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        fetchWeather(lat, lon);
        fetchLocationName(lat, lon);
      },
      function(err) {
        setError("Location access denied");
        setLoading(false);
      }
    );
  }, []);

  function fetchWeather(lat, lon) {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
      "&longitude=" + lon +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
      "&temperature_unit=celsius&wind_speed_unit=kmh"
    )
    .then(function(r) { return r.json(); })
    .then(function(data) {
      setWeather(data.current);
      setLoading(false);
    })
    .catch(function() {
      setError("Weather unavailable");
      setLoading(false);
    });
  }

  function fetchLocationName(lat, lon) {
    fetch(
      "https://nominatim.openstreetmap.org/reverse?lat=" + lat +
      "&lon=" + lon + "&format=json"
    )
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var suburb = data.address.suburb || data.address.town || data.address.city || "";
      var state  = data.address.state || "";
      setLocation(suburb + (state ? ", " + state : ""));
    })
    .catch(function() { setLocation(""); });
  }

  if (loading) {
    return (
      <div className="weather-widget">
        <div className="weather-loading">Loading weather…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget">
        <div className="weather-loading">{error}</div>
      </div>
    );
  }

  var info = getWeatherInfo(weather.weather_code);
  var temp = Math.round(weather.temperature_2m);
  var humidity = Math.round(weather.relative_humidity_2m);
  var wind = Math.round(weather.wind_speed_10m);

  return (
    <div className="weather-widget">
      <div className="weather-top">
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
            <div className="weather-temp">{temp}</div>
            <div className="weather-unit">°C</div>
          </div>
          <div className="weather-desc">{info.label}</div>
          <div className="weather-location">📍 {location}</div>
        </div>
        <div className="weather-icon">{info.icon}</div>
      </div>
      <div className="weather-meta">
        <div className="weather-meta-item">💧 {humidity}%</div>
        <div className="weather-meta-item">💨 {wind} km/h</div>
      </div>
    </div>
  );
}
