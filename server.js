const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(__dirname, 'countries_states_cities.json');
app.use(cors());
function loadCountriesData() {
  const rawData = fs.readFileSync(dataPath);
  return JSON.parse(rawData);
}

// GET /countries - returns list of all country names
app.get('/countries', (req, res) => {
  try {
    const data = loadCountriesData();
    const countries = data.map(country => country.name);
    res.json(countries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load countries' });
  }
});

// GET /country={countryName}/states - returns list of state names for that country
app.get('/country=:countryName/states', (req, res) => {
  try {
    const data = loadCountriesData();
    const { countryName } = req.params;

    const country = data.find(
      c => c.name.toLowerCase() === decodeURIComponent(countryName).toLowerCase()
    );

    if (!country) {
      return res.status(404).json({ error: `Country '${countryName}' not found` });
    }

    const states = country.states.map(state => state.name);
    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load states' });
  }
});

// GET /country={countryName}/state={stateName}/cities - returns list of city names for that state
app.get('/country=:countryName/state=:stateName/cities', (req, res) => {
  try {
    const data = loadCountriesData();
    const { countryName, stateName } = req.params;

    const country = data.find(
      c => c.name.toLowerCase() === decodeURIComponent(countryName).toLowerCase()
    );
    if (!country) {
      return res.status(404).json({ error: `Country '${countryName}' not found` });
    }

    const state = country.states.find(
      s => s.name.toLowerCase() === decodeURIComponent(stateName).toLowerCase()
    );
    if (!state) {
      return res
        .status(404)
        .json({ error: `State '${stateName}' not found in '${countryName}'` });
    }

    const cities = state.cities.map(city => city.name);
    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load cities' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
