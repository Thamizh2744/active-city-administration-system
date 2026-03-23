const mongoose = require("mongoose");
const Category = require("../models/Category");

const defaultCategories = [
  { name: "Road Infrastructure", description: "Report potholes, broken pavements, or road construction needs" },
  { name: "Sanitation & Waste", description: "Issues related to garbage collection, recycling, and street cleaning" },
  { name: "Water Supply", description: "Leaking pipes, water shortage, or contamination" },
  { name: "Street Lighting", description: "Street light outages or fallen cables" },
  { name: "Public Transport", description: "Public transport issues, bus stops, etc." },
  { name: "Waste Management", description: "Issues related to garbage collection and street cleaning" },
  { name: "Road Maintenance", description: "Report potholes, broken pavements, or road construction needs" },
  { name: "Electricity & Lighting", description: "Street light outages, power cuts, or fallen cables" },
  { name: "Public Parks", description: "Maintenance of parks, broken equipment, or gardening needs" },
  { name: "Sewerage & Drainage", description: "Blocked drains, flooded streets, or sewage leaks" },
  { name: "Traffic & Transport", description: "Broken traffic lights, public transport issues, or parking" },
  { name: "Public Health", description: "Stray animals, pest control, or sanitation issues" },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Auto-seed categories
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log("No categories found, auto-seeding default categories...");
      await Category.insertMany(defaultCategories.map(cat => ({ ...cat, _id: new mongoose.Types.ObjectId() })));
      console.log("Default categories seeded successfully");
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;