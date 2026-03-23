const mongoose = require("mongoose");
const Category = require("./models/Category");

// Hardcoded for robustness
const MONGO_URI = "mongodb://127.0.0.1:27017/smartcity";

const categories = [
  { name: "Waste Management", description: "Issues related to garbage collection, recycling, and street cleaning" },
  { name: "Road Maintenance", description: "Report potholes, broken pavements, or road construction needs" },
  { name: "Water Supply", description: "Leaking pipes, water shortage, or contamination" },
  { name: "Electricity & Lighting", description: "Street light outages, power cuts, or fallen cables" },
  { name: "Public Parks", description: "Maintenance of parks, broken equipment, or gardening needs" },
  { name: "Sewerage & Drainage", description: "Blocked drains, flooded streets, or sewage leaks" },
  { name: "Traffic & Transport", description: "Broken traffic lights, public transport issues, or parking" },
  { name: "Public Health", description: "Stray animals, pest control, or sanitation issues" },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    
    // Clear existing to avoid duplicates if needed, or just insert new ones
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create(cat);
        console.log(`Added category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error seeding DB:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
