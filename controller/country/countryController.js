const Country = require("../../model/countrySchema");
const State = require("../../model/stateSchema");
const City = require("../../model/citySchema");
const redis = require("../../config/redis");

const COUNTRIES_KEY = "geo:countries";
const STATES_KEY = "geo:states";
const CITIES_KEY = "geo:cities";
const ALL_DATA_KEY = "geo:all";

const addCountry = async (req, res, next) => {
  try {
    const { countryName, states } = req.body;

    const country = new Country({ countryName });

    const savedCountry = await country.save();

    const createdStates = [];
    for (const stateData of states) {
      const { stateName, cities } = stateData;

      const state = new State({ stateName, country: savedCountry._id });

      const savedState = await state.save();

      const createdCities = [];
      for (const cityData of cities) {
        const city = new City({ cityName: cityData.cityName });
        city.state = savedState._id;
        const savedCity = await city.save();
        createdCities.push(savedCity);
      }

      savedState.cities = createdCities;
      await savedState.save();
      createdStates.push(savedState);
    }

    savedCountry.states = createdStates;
    await savedCountry.save();

    await redis.del(COUNTRIES_KEY);
    await redis.del(STATES_KEY);
    await redis.del(CITIES_KEY);
    await redis.del(ALL_DATA_KEY);

    return res
      .status(200)
      .json({ message: "Data added successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal server error", success: false });
  }
};

const addCities = async (req, res) => {
  try {
    const { countryName, states } = req.body;

    let country = await Country.findOne({ countryName });

    if (!country) {
      country = new Country({ countryName });
      await country.save();
    }

    for (const stateData of states) {
      const { stateName, cities } = stateData;

      let state = await State.findOne({ stateName, country: country._id });

      if (!state) {
        state = new State({ stateName, country: country._id });
      }

      for (const cityData of cities) {
        const { cityName } = cityData;

        const existingCity = await City.findOne({ cityName, state: state._id });

        if (!existingCity) {
          const city = new City({ cityName, state: state._id });
          await city.save();
          state.cities.push(city._id);
        }
      }

      await state.save();
    }

    await redis.del(COUNTRIES_KEY);
    await redis.del(STATES_KEY);
    await redis.del(CITIES_KEY);
    await redis.del(ALL_DATA_KEY);

    return res
      .status(200)
      .json({ message: "Cities added successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal server error", success: false });
  }
};

const getCountries = async (req, res, next) => {
  try {
    const cached = await redis.get(COUNTRIES_KEY);

    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        countries: JSON.parse(cached),
      });
    }
    const countries = await Country.find({}, " -states -__v").lean();
    await redis.set(COUNTRIES_KEY, JSON.stringify(countries), { ex: 3600 });

    res.status(200).json({
      success: true,
      source: "db",
      countries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getStates = async (req, res, next) => {
  try {
    const cached = await redis.get(STATES_KEY);

    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        states: JSON.parse(cached),
      });
    }

    const states = await State.find({}, " -cities -__v").lean();

    await redis.set(STATES_KEY, JSON.stringify(states), { ex: 3600 });

    res.json({ success: true, source: "db", states });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getCities = async (req, res, next) => {
  try {
    const cached = await redis.get(CITIES_KEY);

    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        cities: JSON.parse(cached),
      });
    }

    const cities = await City.find({}, "  -__v").lean();

    await redis.set(CITIES_KEY, JSON.stringify(cities), { ex: 3600 });

    res.json({ success: true, source: "db", cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const getAllData = async (req, res) => {
  try {
    const cached = await redis.get(ALL_DATA_KEY);

    if (cached) {
      return res.json({
        success: true,
        source: "cache",
        countries: JSON.parse(cached),
      });
    }

    const countriesWithStatesAndCities = await Country.find(
      {},
      "-_id -__v ",
    ).populate({
      path: "states",
      populate: {
        path: "cities",
      },
    });

    if (!countriesWithStatesAndCities) {
      return res.status(404).json({ message: "No data found", success: false });
    }

    await redis.set(ALL_DATA_KEY, JSON.stringify(countriesWithStatesAndCities), { ex: 3600 });

    res.json({
      success: true,
      source: "db",
      countries: countriesWithStatesAndCities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const updateCountry = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedCountry = await Country.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCountry) {
      return res.status(404).json({ error: "Country not found" });
    }

    await redis.del(COUNTRIES_KEY);
    await redis.del(ALL_DATA_KEY);

    res
      .status(200)
      .json({ message: "Country updated successfully", data: updatedCountry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  addCountry,
  updateCountry,
  getAllData,
  addCities,
  getCountries,
  getStates,
  getCities,
};
