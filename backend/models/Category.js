const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: true,
  //   unique: true,
  // },
  // description: {
  //   type: String,
  // },
  [
  {
    "name": "Infrastructure",
    "description": "Issues related to roads, bridges, and public infrastructure"
  },
  {
    "name": "Water Supply",
    "description": "Problems related to water distribution and supply"
  },
  {
    "name": "Electricity",
    "description": "Power outages, street lights, and electrical issues"
  },
  {
    "name": "Sanitation",
    "description": "Garbage collection, drainage, and cleanliness issues"
  },
  {
    "name": "Healthcare",
    "description": "Public health services and medical facility issues"
  },
  {
    "name": "Education",
    "description": "Schools, colleges, and education-related complaints"
  },
  {
    "name": "Transportation",
    "description": "Public transport and traffic-related issues"
  },
  {
    "name": "Public Safety",
    "description": "Police, security, and safety concerns"
  }
]
});

module.exports = mongoose.model("Category", CategorySchema);
