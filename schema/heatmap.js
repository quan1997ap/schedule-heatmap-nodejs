let mongoose = require("mongoose");

let heatmapSchema = new mongoose.Schema({
  longtime: {
    type: String,
    required: true,
    unique: true
  },
  imgurl: {
    type: String,
    required: true,
    unique: true
  },
  sketches: [
    {
      longtime: { type: String },
      imgurl: { type: String }
    }
  ]
});

module.exports = mongoose.model("User", heatmapSchema);

// https://www.quackit.com/mongodb/tutorial/mongodb_create_a_relationship.cfm
