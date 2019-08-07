var express = require("express");
var router = express.Router();
var rethinkdb = require("../schema/connect-rethinkdb");
const CircularJSON = require("circular-json");
var rethinkdbdash = require("../schema/connect-rethinkdb");

router.get("/", (request, response) => {
  rethinkdbdash.r
    .table("heatmaps")
    .run(rethinkdbdash.getConnection(), (err, res) => {
      if (err) {
        response.json({
          success: false,
          code: 500
        });
      } else {
        {
          // const resJson = JSON.parse(CircularJSON.stringify(res))._responses;
          response.json({
            success: true,
            data: res,
            code: 200
          });
        }
      }
    });
});

router.get("/current-day", (request, response) => {
  rethinkdbdash.r
    .table("heatmaps")
    .run(rethinkdbdash.getConnection(), (err, res) => {
      if (err) {
        response.json({
          success: false,
          code: 500
        });
        res.end();
      } else {
        {
          // const resJson = JSON.parse(CircularJSON.stringify(res))._responses;
          response.json({
            success: true,
            data: res,
            code: 200
          });
        }
      }
    });
});

// http://localhost:8080/images/a.png
// https://pam-air.herokuapp.com/images/hnoi-20190807_-_2_0_SHT1X.jpg

module.exports = router;
