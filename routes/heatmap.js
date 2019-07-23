var express = require("express");
var router = express.Router();
var rethinkdb = require("../schema/connect-rethinkdb");
const CircularJSON = require("circular-json");
var rethinkdbdash = require("../schema/connect-rethinkdb");

router.get("/", (request, response) => {
  rethinkdbdash.r.table('heatmaps')
  .run(rethinkdbdash.getConnection(), (err, res) => {
    if (err) {
      response.json({
        success: false,
        code: 500
      });
      console.log('c');
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
  rethinkdbdash.r.table('heatmaps')
  // .filter(
  //   r.row('date').during(
  //     r.epochTime(1512864000000 / 1000), 
  //     r.epochTime(1513209600000 / 1000),
  //     {leftBound: "open", rightBound: "closed"}
  //   )
  // )
  .run(rethinkdbdash.getConnection(), (err, res) => {
    if (err) {
      response.json({
        success: false,
        code: 500
      });
      console.log('c');
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


module.exports = router;
