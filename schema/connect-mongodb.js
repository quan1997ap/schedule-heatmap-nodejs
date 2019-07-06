let mongoose = require("mongoose");

const server = "127.0.0.1:27017"; // REPLACE WITH YOUR DB SERVER
const database = "GiaPhaDB"; // REPLACE WITH YOUR DB NAME
const userName = "";
const passWord = "";
class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(`mongodb://${server}/${database}`, {useNewUrlParser: true})
      .then(() => {
        console.log("MongoDB connection successful");
      })
      .catch(err => {
        console.error("MongoDB connection error");
      });
  }
}

module.exports = new Database();
