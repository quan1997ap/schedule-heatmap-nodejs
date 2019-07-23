var fs = require("fs");
var r = require("rethinkdbdash")({
  pool: false,
  // cursor: true,
  ssl: true
});

// rethink Option
const server = "re1.emmasoft.com.vn"; //"127.0.0.1:27017"  REPLACE WITH YOUR DB SERVER
const database = "quandev"; // REPLACE WITH YOUR DB NAME
const databaseLocal = "quandev";
const username = "quandev";
const password = "quandev-_6543quandev21";
const port = 28015;

var connection = null;

function keepConnection() {
  setInterval(() => {
    if (!connection) {
      // trường hợp chưa có kết nối tới db => tạo kết nối
      connectDatabase();
    } else if (connection.open == false) {
      // trường hợp kết nối tới db đang close (do db shutdown) => reconnect để open Connect
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
      console.log("Connection is closed");
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

function connectDatabase() {
  if (!connection) {
    fs.readFile("./schema/emma.crt", (err, ssl) => {
      // vì gọi từ app.js vào để tìm file emma.crt
      if (err) {
        console.log("Can't read/find emma.crt ", err);
      } else {
        let rethinkdbLocalOptions = {
          db: databaseLocal,
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
          host: server,
          port: port,
          db: database,
          username: username,
          user: username,
          password: password,
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
              connectDatabase();
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
  connectDatabase,
  keepConnection
};
