let mongoose = require("mongoose");
var environment = require("../config/config");
// http://mongodb.github.io/node-mongodb-native/2.0/tutorials/enterprise_features/

// function connectMongoDb() {
//   mongoose
//     .connect(
//       `mongodb://${environment.mongodb.server}/${environment.mongodb.database}`,
//       { useNewUrlParser: true }
//     )
//     .then(() => {
//       console.log("MongoDB connect successful");
//     })
//     .catch(err => {
//       console.error("MongoDB connect error");
//     });
// }

// module.exports = {
//   connectMongoDb
// };

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(
        `mongodb://${environment.mongodb.server}/${
          environment.mongodb.database
        }`,
        { useNewUrlParser: true }
      )
      .then(() => {
        console.log("MongoDB connection successful");
      })
      .catch(err => {
        console.error("MongoDB connection error");
      });
  }
}

module.exports = new Database();
