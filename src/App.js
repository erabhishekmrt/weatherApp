import "./style.css";
import React, { useState } from "react";
import axios from "axios";

function App() {
  //State Definations
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [showCitiesDrop, setShowCitiesDrop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentWeather, setCurrentWeather] = useState("");
  const [fiveDaysForcast, setFiveDaysForcast] = useState([]);
  const [unit, setUnit] = useState(0);
  //State Definations

  //Function to get Temperature in Fahrenheit
  const getTempinF = (temp) => {
    return (temp * (9 / 5) + 32).toFixed(2);
  };

  //Function to Get Wind Direction from the Degrees
  const getWindDirection = (deg) => {
    const dirArray = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
      "N",
    ];
    var index = deg % 360;
    index = Math.floor(index / 22.5) + 1;
    return dirArray[index];
  };

  //Function To Fetch Weather Data from API
  const getWeather = () => {
    axios
      .get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${
          document.getElementById("city").value
        }&limit=5&appid=f80a2229012f61ee1f97277377444d12`
      )
      .then((data) => {
        var lat = data.data[0].lat;
        var long = data.data[0].lon;
        document.getElementById("con").classList.remove("padT");
        document.getElementById("in").classList.remove("heightT");
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${data.data[0].lat}&lon=${data.data[0].lon}&appid=f80a2229012f61ee1f97277377444d12&units=metric`
          )
          .then((data) => {
            setCurrentWeather(data.data);
            axios
              .get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=f80a2229012f61ee1f97277377444d12&units=metric`
              )
              .then((data) => {
                console.log(data);
                var arrForcast = [];
                var initialDate = data.data.list[0].dt_txt.substr(0, 10);
                var index = 0;
                arrForcast.push([0, 1, 0]);
                data.data.list.map((val, ind) => {
                  if (val.dt_txt.substr(0, 10) == initialDate) {
                    arrForcast[index] = [
                      arrForcast[index][0] + val.main.temp,
                      arrForcast[index][1] + 1,
                      arrForcast[index][2],
                    ];
                    if (val.dt_txt.substr(11, 9) == "15:00:00") {
                      arrForcast[index][2] = Math.floor(ind);
                    }
                  } else {
                    initialDate = val.dt_txt.substr(0, 10);
                    arrForcast.push([0, 1, 0]);
                    index++;
                  }
                });

                if (arrForcast.length > 5) {
                  arrForcast.shift();
                }
                if (arrForcast[4][2] == 0) {
                  arrForcast[4][2] = 39;
                }
                setFiveDaysForcast([data.data.list, arrForcast]);
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
        setShowModal(true);
      });
  };

  //Function to get Current Geolocation from the Browser
  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function (position) {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        axios
          .get(
            `https://api.api-ninjas.com/v1/reversegeocoding?lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            {
              headers: {
                "X-Api-Key": "6iMrRPkoRKaIKJhIvQZJfw==WgNVP7s2mHliXf30",
              },
            }
          )
          .then((data) => {
            document.getElementById("city").value = data.data[0].name;
          })
          .catch((err) => console.log(err));
      });
    } else {
      console.log("Unable to Detect the Location");
    }
  };
  return (
    <div>
      {showModal ? (
        <div className="modal-container">
          <div className="modal-inner">
            Entered City is not found. Please Enter the Correct City and Search
            it Again.
            <br />
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowModal(!showModal);
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="container padT" id="con">
        <div className="header">
          <span className="logo-text">Weather Update</span>
        </div>
        <div className="input heightT" id="in">
          <span className="input-text">Enter the City Name</span>
          <div className="input-container">
            <input
              type="text"
              id="city"
              className="input-location"
              onFocus={() => {
                setShowCitiesDrop(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowCitiesDrop(false);
                }, 500);
              }}
            />
            <div className="go-btn" onClick={getWeather}>
              &gt;
            </div>
            {showCitiesDrop ? (
              <div className="drop-cities">
                <div className="my-loc" onClick={getLocation}>
                  <img
                    src="https://static.thenounproject.com/png/3918613-200.png"
                    width="25px"
                  />
                  <div>Get Your Location</div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        {currentWeather ? (
          <div className="input">
            <div className="weather-container">
              <div className="currentW">
                <b>Current Weather</b>
                <span>
                  <input
                    type="radio"
                    name="tempUnit"
                    checked={unit == 0 ? true : false}
                    onClick={() => {
                      setUnit(0);
                    }}
                  />{" "}
                  &deg;C
                  <input
                    type="radio"
                    name="tempUnit"
                    checked={unit == 0 ? false : true}
                    className="marginLeft"
                    onClick={() => {
                      setUnit(1);
                    }}
                  />
                  &deg;F
                </span>
              </div>
              <div className="horizontal-separator"></div>
              <div className="inner-weather-container">
                <div className="one-col">
                  <div className="weatherIcn">
                    <img
                      src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                    />
                    {unit == 0 ? (
                      <span>{currentWeather.main.temp}&deg;C</span>
                    ) : (
                      <span>{getTempinF(currentWeather.main.temp)}&deg;F</span>
                    )}
                  </div>
                  <span>{currentWeather.weather[0].description}</span>
                </div>
                <div className="vertical-separator"></div>
                <div className="two-col">
                  <div className="weather-data">
                    <span>Max. Temp. </span>
                    <span>
                      {unit == 0 ? (
                        <span>{currentWeather.main.temp_max}&deg;C</span>
                      ) : (
                        <span>
                          {getTempinF(currentWeather.main.temp_max)}&deg;F
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="horizontal-separator"></div>
                  <div className="weather-data">
                    <span>Min. Temp. </span>
                    <span>
                      {unit == 0 ? (
                        <span>{currentWeather.main.temp_min}&deg;C</span>
                      ) : (
                        <span>
                          {getTempinF(currentWeather.main.temp_min)}&deg;F
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="horizontal-separator"></div>
                  <div className="weather-data">
                    <span>Wind Speed </span>
                    <span className="inline-block">
                      {currentWeather.wind.speed}M/S
                    </span>
                  </div>
                  <div className="horizontal-separator"></div>
                  <div className="weather-data">
                    <span>Wind Direction</span>
                    <span>{getWindDirection(currentWeather.wind.deg)}</span>
                  </div>
                </div>
              </div>
              <div className="horizontal-separator"></div>
              <div className="currentW">
                <b>5-Days Forcast</b>
              </div>
              {fiveDaysForcast.length ? (
                <div className="fiveDayP">
                  {fiveDaysForcast[1].map((val) => {
                    return (
                      <div className="fiveDay">
                        <p>{fiveDaysForcast[0][val[2]].dt_txt.substr(0, 10)}</p>
                        <div className="weatherIcn fived">
                          <img
                            src={`https://openweathermap.org/img/wn/${
                              fiveDaysForcast[0][val[2]].weather[0].icon
                            }@2x.png`}
                          />
                          <p>
                            {unit == 0 ? (
                              <span>{(val[0] / val[1]).toFixed(2)}&deg;C</span>
                            ) : (
                              <span>{getTempinF(val[0] / val[1])}&deg;F</span>
                            )}
                          </p>
                        </div>
                        <p>
                          {fiveDaysForcast[0][val[2]].weather[0].description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default App;
