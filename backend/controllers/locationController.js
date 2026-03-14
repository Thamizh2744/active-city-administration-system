const Location = require("../models/Location");

// @desc    Create new location
// @route   POST /api/locations
// @access  Private (Admin)
exports.createLocation = async (req, res) => {
  try {
    const { name, wards } = req.body;
    const locationExists = await Location.findOne({ name });
    
    if (locationExists) {
      return res.status(400).json({ message: "Location already exists" });
    }

    const location = await Location.create({ name, wards });
    res.status(201).json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
