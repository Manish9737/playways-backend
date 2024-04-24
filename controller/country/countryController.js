const Country = require("../../model/countrySchema");
const State = require('../../model/stateSchema');
const City = require('../../model/citySchema')

const addCountry = async (req, res, next) => {
  try {
    // Extract data for country, state, and city from the request body
    const { countryName, states } = req.body;

    // Create the country instance
    const country = new Country({ countryName });

    // Save the country to the database
    const savedCountry = await country.save();

    // Loop through the states array and save states with their cities
    const createdStates = [];
    for (const stateData of states) {
      const { stateName, cities } = stateData;

      // Create state instance with reference to the country
      const state = new State({ stateName, country: savedCountry._id });

      // Save the state to the database
      const savedState = await state.save();

      // Loop through cities array and save cities with their reference to the state
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

    return res.status(200).json({ message: 'Data added successfully', success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error', success: false });
  }
};

const addCities = async (req, res) => {
  try {
    const { countryName, states } = req.body;

    // Find the country by name or create a new one if it doesn't exist
    let country = await Country.findOne({ countryName });

    if (!country) {
      country = new Country({ countryName });
      await country.save();
    }

    // Loop through states and update/add data
    for (const stateData of states) {
      const { stateName, cities } = stateData;

      // Find the state by name and country
      let state = await State.findOne({ stateName, country: country._id });

      if (!state) {
        state = new State({ stateName, country: country._id });
      }

      // Loop through cities and add them to the state
      for (const cityData of cities) {
        const { cityName } = cityData;

        // Check if the city exists in the state
        const existingCity = await City.findOne({ cityName, state: state._id });

        if (!existingCity) {
          // If the city doesn't exist, create and save it
          const city = new City({ cityName, state: state._id });
          await city.save();
          state.cities.push(city._id);
        }
      }

      await state.save();
    }

    return res.status(200).json({ message: 'Cities added successfully', success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error', success: false });
  }
};

const getCountries = async (req, res, next) => {
  try {
    const countries = await Country.find({},' -states -__v');
    res.status(200).json({ countries, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
};

const getStates = async (req, res, next) => {
  try {
    const states = await State.find({},' -cities -__v');
    res.status(200).json({ states, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
};

const getCities = async (req, res, next) => {
  try {
    const cities = await City.find({},'  -__v' );
    res.status(200).json({ cities, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
};

const getAllData =  async (req, res) => {
  try {
    const countriesWithStatesAndCities = await Country.find({},'-_id -__v ')
      .populate({
        path: 'states',
        populate: {
          path: 'cities'
        }
      });

    if (!countriesWithStatesAndCities) {
      return res.status(404).json({ message: 'No data found', success: false });
    }

    res.status(200).json({ countries: countriesWithStatesAndCities, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', success: false });
  }
};

const updateCountry = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Assuming you have a valid country ID
    const updatedCountry = await Country.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCountry) {
      return res.status(404).json({ error: "Country not found" });
    }

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
  getCities
};
