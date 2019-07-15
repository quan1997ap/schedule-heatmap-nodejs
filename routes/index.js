var express = require('express');
var router = express.Router();
var http = require('http');
/* GET home page. */
router.get('/', function(req, res, next) {
  setInterval(function() {
    console.log('wakeup - server - heroku');
    http.get("http://pam-air.herokuapp.com/");
  }, 300000); // every 5 minutes (300000)
  res.render('index', { title: 'Express' });
});

module.exports = router;
