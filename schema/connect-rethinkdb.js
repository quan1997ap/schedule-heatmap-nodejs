r = require("rethinkdb");
const server = "re1.emmasoft.com.vn"; //"127.0.0.1:27017"  REPLACE WITH YOUR DB SERVER
const database = "quandev"; // REPLACE WITH YOUR DB NAME
const username = "quandev";
const password = "quandev-_6543quandev21";
var fs = require("fs");

var connection = null;
class Database {
  constructor() {
    this.connection = connection;
    this._connect(database); // connect to db name giapha
  }

  _getDBList() {
    return new Promise(function(resolve, reject) {
      r.dbList().run(connection, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  _connect(dbName) {
    fs.readFile("./schema/emma.crt", (err, ssl) => {
      if (err) {
        console.log("can't read/find emma.crt ", err);
      } else {
        r.connect({
          host: server,
          port: 28015,
          db: dbName,
          username: username,
          password: password,
          ssl: {
            ca: ssl
          }
        })
          .then(async conn => {
            console.log("RethinkDB connect successfully");
            this.connection = conn;
            connection = conn;
            let dbList = await this._getDBList();
            // console.log("Danh sach db", dbList);
            if (dbList && dbList.includes(dbName)) {
              console.log("DB is existed");
            } else {
              console.log("DB is not existed");
              this._createDatabase(dbName);
            }
          })
          .catch(err => {
            console.log("RethinkDB connection error");
            console.log(err);
          });
      }
    });
  }

}

module.exports = new Database();
