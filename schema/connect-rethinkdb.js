var fs = require("fs");
var r = require("rethinkdbdash")({
  pool: false,
  ssl: true
});
var environment = require("../config/config");

// rethink Option
// const server = "re1.emmasoft.com.vn"; //"127.0.0.1:27017"  REPLACE WITH YOUR DB SERVER
// const database = "quandev"; // REPLACE WITH YOUR DB NAME
// const databaseLocal = "quandev";
// const username = "quandev";
// const password = "quandev-_6543quandev21";
// const port = 28015;

var connection = null;

function keepConnection(pathToSSL) {
  setInterval(() => {
    if (!connection) {
      // trường hợp chưa có kết nối tới db => tạo kết nối
      connectRethinkDb(pathToSSL);
    } else if (connection.open == false) {
      // trường hợp kết nối tới db đang close (do db shutdown) => reconnect để open Connect
      console.log("Connection is closed");
      connection.reconnect(
        { noreplyWait: false },
        (errorReconnect, _reconnection) => {
          if (errorReconnect) console.log("Failed to reconnect");
          else {
            console.log("Reconnect success");
            connection = _reconnection;
          }
        }
      );
    }
  }, 3000);
}

function getDBList() {
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

function connectRethinkDb(pathToSSL) {
  if (!connection) {
    fs.readFile(pathToSSL, (err, ssl) => {
      // vì gọi từ app.js vào để tìm file emma.crt
      console.log(__dirname);
      if (err) {
        console.log("Can't read/find emma.crt ", err);
      } else {
        let rethinkdbLocalOptions = {
          db: environment.databaseLocal,
          pool: false,
          buffer: 1000,
          max: 300,
          timeout: 100,
          pingInterval: 10,
          timeoutError: 1000, // thoi gian chờ trước khi reconnect
          silent: true,
          servers: [{ host: "192.168.0.100", port: 28015 }]
        };

        let rethinkdbOptions = {
          host: environment.rethinkdb.server,
          port: environment.rethinkdb.port,
          db: environment.rethinkdb.database,
          username: environment.rethinkdb.username,
          user: environment.rethinkdb.username,
          password: environment.rethinkdb.password,
          pool: false,
          buffer: 1000,
          max: 300,
          timeout: 100,
          pingInterval: 10,
          timeoutError: 1000, // thoi gian chờ trước khi reconnect
          silent: true,
          ssl: {
            ca: ssl
          }
        };

        r.connect(rethinkdbOptions).then(successConnection => {
          console.log("RethinkDB connect successfully");
          connection = successConnection;

          connection.on("error", err => {
            try {
              // gặp lỗi trong quá trình connect => hủy connection và kết nối lại tới database (GÁN NULL ĐỂ CHECK CHO DỄ :))
              connection.close();
              connection = null;
              connectRethinkDb(pathToSSL);
            } catch (closeConnectionError) {
              console.log("closeConnectionError");
            }
          });
        });
      }
    });
  }
}

function getConnection() {
  return connection;
}

module.exports = {
  r,
  getConnection,
  connectRethinkDb,
  keepConnection
};
