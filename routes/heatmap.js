var express = require("express");
var router = express.Router();
var rethinkdb = require("../schema/connect-rethinkdb");
const CircularJSON = require("circular-json");

var createHeatMap = require("../schema/schedule-create-heatmap"); // create connect to rethinkDB

router.get("/", (request, response) => {
  r.table("heatmaps").run(rethinkdb.connection, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      {
        const resJson = JSON.parse(CircularJSON.stringify(res))._responses;
        if (resJson.length > 0) {
          response.json({
            success: true,
            data: resJson[0].r,
            code: 200
          });
        } else {
          response.json({
            success: true,
            data: [],
            code: 200
          });
        }
      }
    }
  });
});

router.get("/active", (request, response) => {
  // console.log('start schedule');
  createHeatMap.runTaskDrawHeatMap();
  response.send('active success');
  response.end();
});

router.get("/:id", (request, response) => {
  response.json({
    success: true,
    data: "success",
    code: 200
  });
});

module.exports = router;
