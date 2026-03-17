const Country = require("../../model/countrySchema");
const State = require('../../model/stateSchema');
const City = require('../../model/citySchema')

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

    return res.status(200).json({ message: 'Data added successfully', success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error', success: false });
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
