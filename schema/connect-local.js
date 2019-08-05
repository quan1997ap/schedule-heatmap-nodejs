r = require("rethinkdbdash")();

// rethink Option
const server = "re1.emmasoft.com.vn"; //"127.0.0.1:27017"  REPLACE WITH YOUR DB SERVER
const database = "quandev"; // REPLACE WITH YOUR DB NAME
const username = "quandev";
const password = "quandev-_6543quandev21";

// localhost Option
const port = 28015;
const host = "localhost"; //  REPLACE WITH YOUR DB SERVER
const databaseLocal = "giapha"; // REPLACE WITH YOUR DB NAME

var fs = require("fs");

var connection = null;

function keepConnection(pathToSSL) {
  setInterval(() => {
    if (!connection) {
      // trường hợp chưa có kết nối tới db => tạo kết nối
      connectDatabase(pathToSSL);
    } else if (connection.open == false) {
      // trường hợp kết nối tới db đang close (do db shutdown) => reconnect để open Connect
      connection.reconnect(
        { noreplyWait: false },
        (errorReconnect, _reconnection) => {
          if (errorReconnect) console.log(errorReconnect);
          else {
            connection = _reconnection;
          }
        }
      );
      console.log("connection is closed");
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

async function connectDatabase(pathToSSL) {
  if (!connection) {
    fs.readFile(pathToSSL, (err, ssl) => {
      if (err) {
        console.log("Can't read/find emma.crt ", err);
      } else {
        let rethinkdbOptions = {
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

        r.connect(rethinkdbOptions).then(successConnection => {
          console.log("RethinkDB connect successfully");
          connection = successConnection;

          connection.on("error", err => {
            try {
              // gặp lỗi trong quá trình connect => hủy connection và kết nối lại tới database (GÁN NULL ĐỂ CHECK CHO DỄ :)) 
              connection.close();
              connection = null;
              connectDatabase(pathToSSL);
            } catch (closeConnectionError) {
              console.log("closeConnectionError");
            }
          });
        });
      }
    });
  }
}

getCurrentTime = () => {
  let currentdate = new Date();
  let datetime =
    "Run at : " +
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  return datetime;
};

function getConnection() {
  return connection;
}

module.exports = {
  getConnection,
  connectDatabase,
  keepConnection
};
