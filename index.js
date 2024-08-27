import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = 3000;
const API_URL= "https://api.openweathermap.org/data/2.5/weather";

const config = {
  apiKey: `${process.env.weatherAPIKey}`,
}

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  res.render("index.ejs");
})

app.post("/city", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params:{
        q: req.body.city,
        appid: config.apiKey,
        units: "metric"
      }
    });
    const result = response.data
    console.log(result);
    const dtIn = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
    
    res.render("index.ejs", {
      city: result.name,
      country: result.sys.country,
      sunrise: result.sys.sunrise,
      sunset: result.sys.sunset,
      temp: result.main.temp,
      description: result.weather[0].description,
      icon: result.weather[0].icon,
      high: result.main.temp_max,
      low: result.main.temp_min,
      wind: result.wind.speed,
      humidity: result.main.humidity,
      timezone: currentTime(result.timezone, dtIn)
    }
    );
  } catch (error) {
    console.error("Error Details:", error.response ? error.response.data : error.message);
    res.status(500).json({message: "error fetching data"});
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

function currentTime(timezoneIn, dtIn) {
  let utcTime = dtIn * 1000; // Convert dtIn to milliseconds
  let localTime = new Date(utcTime + (timezoneIn * 1000));

  // Convert into 12-hour format with AM/PM
  let hour = localTime.getUTCHours();
  let ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // The hour '0' should be '12'

  let minutes = localTime.getUTCMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero to minutes if needed

  let weekday = localTime.toLocaleString('default', { weekday: 'long', timeZone: 'UTC' });
  let month = localTime.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  let date = localTime.getUTCDate();
  let year = localTime.getUTCFullYear();
  
  return `${hour}:${minutes} ${ampm}, ${weekday}, ${date} ${month} ${year}`;
}


