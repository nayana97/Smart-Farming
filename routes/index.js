var express = require('express');
var request = require('request');
var iot = require('ibmiotf');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Smart Farming' });
// });

 var weather_host =  "https://798a9cdd-0ff4-4f47-84ba-cab67982ce71:d6v0RcXhTP@twcservice.mybluemix.net";
function weatherAPI(path, qs, done) {
  var url = weather_host + path;
  console.log(url, qs);
  request({
      url: url,
      method: "GET",
      headers: {
          "Content-Type": "application/json;charset=utf-8",
          "Accept": "application/json"
      },
      qs: qs
  }, function(err, req, data) {
      if (err) {
          done(err);
      } else {
          if (req.statusCode >= 200 && req.statusCode < 400) {
              try {
                  done(null, JSON.parse(data));
              } catch(e) {
                  console.log(e);
                  done(e);
              }
          } else {
              console.log(err);
              done({ message: req.statusCode, data: data });
          }
      }
  });
}

router.get('/api/forecast/daily', function(req, res) {
  var geocode = (req.query.geocode || "45.43,-75.68").split(",");
  weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/daily/3day.json", {
      units: req.query.units || "m",
      language: req.query.language || "en"
  }, function(err, result) {
      if (err) {
        console.log(err);
          res.send(err).status(400);
      } else {
        console.log("10 days Forecast");
          res.json(result);
      }
  });
});

router.get('/api/forecast/hourly', function(req, res) {
  var geocode = (req.query.geocode || "45.43,-75.68").split(",");
  weatherAPI("/api/weather/v1/geocode/" + geocode[0] + "/" + geocode[1] + "/forecast/hourly/48hour.json", {
      units: req.query.units || "m",
      language: req.query.language || "en"
  }, function(err, result) {
      if (err) {
          res.send(err).status(400);
      } else {
        console.log("24 hours Forecast");
          result.forecasts.length = 24;    // we require only 24 hours for UI
          res.json(result);
      }
  });
});
var appClientConfig = {
  "org" :'ubt80u' ,
  "id" : 'katalyst',
  "domain": "internetofthings.ibmcloud.com",
  "auth-key" : 'a-ubt80u-qizvepq1sd',
  "auth-token" : 'a?qYHQnVNpUKJo!7F2'
}

var appClient = new iot.IotfApplication(appClientConfig);

router.get('/api/iot/getLastEvent', function(req, res) {
 appClient.getLastEvents('SoilMoisture', '9880444904', 'event'). then (function onSuccess (response) {
    console.log("Success");
    var b = new Buffer(response[0].payload, 'base64')
    console.log(response);
    res.json(b.toString());

  }, function onError (argument) {
    
    console.log("Fail");
    res.status(403).send(argument);
    console.log(argument);
  });
});



module.exports = router;

