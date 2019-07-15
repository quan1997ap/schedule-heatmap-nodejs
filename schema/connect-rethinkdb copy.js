r = require("rethinkdb");
// const host = "re1.emmasoft.com.vn"; //  REPLACE WITH YOUR DB SERVER
// const database = "quandev"; // REPLACE WITH YOUR DB NAME
// const username = "quandev";
// const password = "quandev-_6543quandev21";

const port = 28015;
const host = "localhost"; //  REPLACE WITH YOUR DB SERVER
const database = "giapha"; // REPLACE WITH YOUR DB NAME

var fs = require("fs");

var connection = null;
class Database {
  constructor() {
    this.connection = null;
    this._connect(database); // connect to db name giapha

    setInterval(() =>{
      if (connection){console.log('connection - success')}
      else{
        console.log('connection - error');
        connection
        .close()
        .then(function() {
          this._connect(database);
        })
        .error(function(err) {
          // process the error
        });
      }
    }, 3000)
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
        // let options = {
        //   host: host,
        //   port: port,
        //   db: dbName,
        //   username: username,
        //   password: password,
        //   ssl: {
        //     ca: ssl
        //   }
        // };

        let options = {
          host: host,
          port: port,
          db: dbName
        };

        r.connect(options)
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
