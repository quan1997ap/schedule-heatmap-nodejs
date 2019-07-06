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
            console.log("RethinkDB connection successful");
            this.connection = conn;
            connection = conn;
            let dbList = await this._getDBList();
            // console.log("Danh sach db", dbList);
            if (dbList && dbList.includes(dbName)) {
              console.log("DB is existed");
              // this._insertDataToTable(dbName, "person", connection);
              // this._editDataOfTable(dbName, "person", connection);
              // this._deleteDataOfTable(dbName, "person", connection);
              // this._getAllTable(dbName, "person", connection);
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
  

  // checkExist() {
  //   r.db("my_db")
  //     .table("my_table")
  //     .getAll("my_record_id_123")
  //     .contains();
  // }

  // _insertDataToTable(dbName, tableName, conn) {
  //   r.table(tableName)
  //     .insert([
  //       { email: "william@rethinkdb.com", password: "abc" },
  //       { email: "lara@rethinkdb.com", password: "abc" },
  //       { email: "william@rethinkdb.com", password: "abc" },
  //       { email: "lara@rethinkdb.com", password: "abc" },
  //       { email: "william@rethinkdb.com", password: "abc" },
  //       { email: "lara@rethinkdb.com", password: "abc" },
  //       { email: "william@rethinkdb.com", password: "abc" },
  //       { email: "lara@rethinkdb.com", password: "abc" },
  //       { email: "lara@rethinkdb.com", password: "abc" },
  //       { email: "lara@rethinkdb.com", password: "abc" }
  //     ])
  //     .run(conn, (err, res) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         {
  //           console.log(res);
  //         }
  //       }
  //     });
  // }

  // _getAllTable(dbName, tableName, conn) {
  //   r.db(dbName);
  //   r.table(tableName)
  //     .skip(2)
  //     .limit(2)
  //     .run(conn, (err, res) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         {
  //           // console.log('ok',res);
  //         }
  //       }
  //     });
  // }

  // _editDataOfTable(dbName, tableName, conn) {
  //   r.db(dbName);
  //   r.table(tableName)
  //     .filter({ id: "1" })
  //     .update({
  //       password: "abcabc1"
  //     })
  //     .run(conn, (err, res) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         {
  //           console.log(res);
  //         }
  //       }
  //     });
  // }

  // _deleteDataOfTable(dbName, tableName, conn) {
  //   r.db(dbName);
  //   r.table(tableName)
  //     .filter({ id: "1" })
  //     .delete()
  //     .run(conn, (err, res) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         {
  //           console.log(res);
  //         }
  //       }
  //     });
  // }

  // _createDatabase(dbName) {
  //   r.dbCreate(dbName).run(connection, function createDB(err, result) {
  //     if (err) throw err;
  //     else {
  //       console.log(JSON.stringify(result, null, 2));
  //     }
  //   });
  // }

  // _createTable(dbName, tableName) {
  //   r.db(dbName)
  //     .tableCreate(tableName)
  //     .run(connection, function(err, result) {
  //       if (err) throw err;
  //       console.log(JSON.stringify(result, null, 2));
  //     });
  // }

}

module.exports = new Database();
