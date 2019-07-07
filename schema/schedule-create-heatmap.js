var axios = require("axios");
var TemperatureMap = require("../public/javascript-librarys/temperatureMap");
const { createCanvas, loadImage } = require("canvas");
var axios = require("axios");
const fs = require("fs"); // di tu thu muc goc cua ung  dung
let provinceData, enviObjectData;

let startTime = new Date(Date.now());
let endTime = new Date(startTime.getTime() + 5000);
var schedule = require("node-schedule");
var rethinkdb = require("../schema/connect-rethinkdb");

// https://www.npmjs.com/package/node-schedule
// thoi gian bat dau, ket thuc , sau 1s chay lai (chú ý dấu *)
// { start: startTime, end: endTime, rule: '*/1 * * * * *' }
// cứ vào 42 phút các giờ sẽ chạy lại
// '42 * * * *'
// thực hiện cứ 5 phút 1 lần
// '*/5 * * * *'
// 1s chạy lại 1 lần
// '*/1 * * * * *'
// https://nominatim.openstreetmap.org/search.php?q=ha+noi+viet+nam&polygon_geojson=1&viewbox=
// https://nominatim.openstreetmap.org/search.php?q=ha+noi+viet+nam&polygon_geojson=1&format=json

function createHeatMapBase64(
  pointAffectNumber,
  knownPoints,
  boundaryCanvas,
  width,
  height,
  heatmapType
) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  drw0 = new TemperatureMap(ctx, heatmapType);

  // mức độ chi tiết cao nhất
  // drw0.setDataPoints(knownPoints, boundaryCanvas ,width, height);
  // drw0.drawFull(true, function () { });

  // mức độ chi tiết vừa
  // drw0.setDataPoints(knownPoints, boundaryCanvas ,width, height);
  // drw0.drawFull(false, function () { drw0.drawPoints(); });

  // mức độ chi tiết thấp
  drw0.setDataPoints(knownPoints, boundaryCanvas, width, height); //  tạo dữ liệu để vẽ arrAllPoint, arrBoundaryCanvas, width, height
  drw0.drawLow(pointAffectNumber, 2, false); // bỏ callback

  return canvas.toDataURL();
}

// function distanceBetween2Points(la1, lo1, la2, lo2) {
//   var R = 6.371;
//   var dLat = (la2 - la1) * (Math.PI / 180);
//   var dLon = (lo2 - lo1) * (Math.PI / 180);
//   var la1ToRad = la1 * (Math.PI / 180);
//   var la2ToRad = la2 * (Math.PI / 180);
//   var a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(la1ToRad) *
//       Math.cos(la2ToRad) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   var d = R * c;
//   return d;
// }
// // nội suy điểm từ mảng đã biết
// function interpolationBoundary(interpolationArr, knowPointArr, p) {
//   var boundaryInterpolation = [];
//   let interpolationArrLength = interpolationArr.length;
//   let knowPointArrLength = knowPointArr.length;

//   for (let i = 0; i < interpolationArrLength; i++) {
//     var tuso = 0;
//     var mauso = 0;
//     for (var j = 0; j < knowPointArrLength; j++) {
//       tuso =
//         tuso +
//         knowPointArr[j].value /
//           Math.pow(
//             distanceBetween2Points(
//               interpolationArr[i].x,
//               interpolationArr[i].y,
//               knowPointArr[j].x,
//               knowPointArr[j].y
//             ),
//             p
//           );
//       mauso =
//         mauso +
//         1 /
//           Math.pow(
//             distanceBetween2Points(
//               interpolationArr[i].x,
//               interpolationArr[i].y,
//               knowPointArr[j].x,
//               knowPointArr[j].y
//             ),
//             p
//           );
//     }
//     boundaryInterpolation.push({
//       x: interpolationArr[i].x,
//       y: interpolationArr[i].y,
//       value: parseFloat((tuso / mauso).toFixed(3))
//     });
//   }

//   return boundaryInterpolation;
// }

function getBoundingBoxRectangle(boundingArr) {
  let minLat, maxLat, minLng, maxLng;
  minLng = boundingArr[0][0];
  maxLng = boundingArr[0][0];
  minLat = boundingArr[0][1];
  maxLat = boundingArr[0][1];
  boundingArr.forEach(coordinateArr => {
    if (minLng > coordinateArr[0]) {
      minLng = coordinateArr[0];
    } else if (maxLng < coordinateArr[0]) {
      maxLng = coordinateArr[0];
    }
    if (minLat > coordinateArr[1]) {
      minLat = coordinateArr[1];
    } else if (maxLat < coordinateArr[1]) {
      maxLat = coordinateArr[1];
    }
  });
  return { minLat: minLat, maxLat: maxLat, minLng: minLng, maxLng: maxLng };

  // console.log(minLat, maxLat, minLng, maxLng);
  // ho chi minh hcn
  //  {lat: 10.1399458, lng: 106.3567159},
  //  {lat: 10.1399458, lng: 107.0276712},
  //  {lat: 11.1595357, lng: 107.0276712},
  //  {lat: 11.1595357, lng: 106.3567159}
  // getBoundingBoxRectangle(provinceData[0].boundary);
}

function getBoundingOfProvinceById(provinceId, provinceList) {
  // cy Lặp => đúng thì thay kết quả và trả về, sai thì thôi;
  let length = provinceList.length;
  let i;
  let result = { result: false, boundary: [] };
  if (length > 0) {
    for (i = 0; i < length; i++) {
      if (
        provinceId === provinceList[i].id &&
        provinceId !== "" &&
        provinceId !== undefined
      ) {
        // console.log(i, '-' ,provinceList[i].id, '- ', provinceId )
        result = { result: true, boundary: provinceList[i].boundary };
        // break;
      }
    }
  }
  return result;
}

function getCurrentWeatherData() {
  return new Promise((resolve, reject) => {
    var aqiData, tempData, pm25Data, humidityData;
    var weatherData = [];
    axios
      .post("https://pamair.org/pamenviad/no/ref/122", { method: "get" })
      .then(resPHHAPI => {
        console.log("get Pamair data success");
        let currentData = resPHHAPI.data.PHHAPI.body; // du lieu cua cac tinh
        if (currentData.length > 0) {
          currentData.forEach(provinceData => {
            let averageTempVal = 0;
            let countStationInProvince = 0;

            let stationDataOfProvince = Object.create({});
            if (provinceData.children.length > 0) {
              // du lieu cua cac tinh
              stationDataOfProvince.districtId = provinceData.districtId;
              stationDataOfProvince.districtName = provinceData.name;
              stationDataOfProvince.stationList = [];
              provinceData.children.forEach(districtData => {
                if (districtData.children.length > 0) {
                  // du lieu cua cac huyện
                  districtData.children.forEach(subdistrictData => {
                    let stationData = Object.create({});
                    stationData.aqi_us_1h = subdistrictData.aqi_us_1h;
                    // get ( 0: Humidity ) ; ( 1: PM2.5 ) ; ( 2: Temp )

                    let valueHumidity =
                      subdistrictData.children[0] &&
                      subdistrictData.children[0].lastvalue &&
                      subdistrictData.children[0].lastvalue[0] &&
                      subdistrictData.children[0].lastvalue[0].value
                        ? parseFloat(
                            subdistrictData.children[0].lastvalue[0].value
                          )
                        : -999999;
                    let valuePM2 =
                      subdistrictData.children[1] &&
                      subdistrictData.children[1].lastvalue &&
                      subdistrictData.children[1].lastvalue[0] &&
                      subdistrictData.children[1].lastvalue[0].value
                        ? parseFloat(
                            subdistrictData.children[1].lastvalue[0].value
                          )
                        : -999999;
                    let valueTemp =
                      subdistrictData.children[2] &&
                      subdistrictData.children[2].lastvalue &&
                      subdistrictData.children[2].lastvalue[0] &&
                      subdistrictData.children[2].lastvalue[0].value
                        ? parseFloat(
                            subdistrictData.children[2].lastvalue[0].value
                          )
                        : -999999;
                    let AQI = subdistrictData.aqi_us_1h
                      ? subdistrictData.aqi_us_1h
                      : -999999;

                    stationData.value = valueTemp;

                    stationData.aqi_us_1h_longtime =
                      subdistrictData.aqi_us_1h_longtime;
                    stationData.lat = subdistrictData.lat;
                    stationData.x = subdistrictData.lat;
                    stationData.lng = subdistrictData.lng;
                    stationData.y = subdistrictData.lng;
                    stationData.localId = subdistrictData.lng;
                    stationData.siteId = subdistrictData.siteId;
                    stationData.subdistrictName = subdistrictData.name;
                    if (stationData.value != -999999) {
                      // chỉ lấy các điểm có dữ liệu
                      stationDataOfProvince.stationList.push(stationData);
                      countStationInProvince++;
                      averageTempVal += parseFloat(stationData.value);
                    }
                  });
                }
              });
              averageTempVal = averageTempVal / countStationInProvince;
              stationDataOfProvince.averageTempVal = averageTempVal;
            }
            weatherData.push(stationDataOfProvince);
          });
        }
        resolve(weatherData);
      })
      .catch(err => reject(err));
  });
}

function readFile(pathname) {
  // read file and convert to object
  return new Promise((resolve, reject) => {
    fs.readFile(pathname, (err, objectJson) => {
      if (err) {
        reject(err);
      } else {
        let ObjectData = JSON.parse(objectJson);
        resolve(ObjectData);
      }
    });
  });
}

function writeFile(pathname, content) {
  fs.writeFile(pathname, content, function(err) {
    if (err) {
      return console.error(err);
    }
    console.log("Ghi du lieu vao file thanh cong!");
  });
}

function getCurrentTime() {
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
}

function insertDataToTable(heatmapData) {
  r.db("quandev");
  r.table("heatmaps")
    .insert([{ heatmap: heatmapData, create_at: getCurrentTime() }])
    .run(rethinkdb.connection, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        {
          console.log(res);
        }
      }
    });
}

async function mainFunction() {
  const degX = 0.00929791 / 5; // 1deg(lat) trên GG map ứng với = 0.00929791 Km
  const degY = 0.00903758 / 5; // degX <=> 100m 1 ô

  let provinceList = await readFile("./public/json/provinces.json"); // dữ liệu tỉnh
  let enviObjects = await readFile("./public/json/envi_object.json"); // tên thông số
  let currentWeatherData = await getCurrentWeatherData(); // dữ liệu các tỉnh tại thời điểm hiện tại;

  currentWeatherData.forEach(weatherData => {
    let resCheckProvince = getBoundingOfProvinceById(
      weatherData.districtId,
      provinceList
    );
    if (resCheckProvince.result === true) {
      // nếu tỉnh nằm  trong các tỉnh đã có dữ liệu boundary => tạo heat map
      // boundary của tỉnh sẽ vẽ canvas
      let boundaryProvinceCanvas = resCheckProvince.boundary;
      // lấy các giá trị của hình chữ nhật bao quanh canvas( sử dụng để gán heatMapImg trên ggmap)
      let boundingBoxRectangle = getBoundingBoxRectangle(
        boundaryProvinceCanvas
      );
      let minLat = boundingBoxRectangle.minLat;
      let maxLat = boundingBoxRectangle.maxLat;
      let minLng = boundingBoxRectangle.minLng;
      let maxLng = boundingBoxRectangle.maxLng;

      let tbc = weatherData.averageTempVal;
      let number_X = parseInt((maxLat - minLat) / degX); // width height Canvas (theo số ô) // số ô  trên 1 trục(1 ô có chiều rộng 0.1 km)
      let number_Y = parseInt((maxLng - minLng) / degY);

      //tạo boundary với dữ liệu nội suy
      let boundaryLength = boundaryProvinceCanvas.length; // số điểm tác động lên việc nội suy
      let boundaryOfHeatMapCanvas = []; // Đường viền sau khi chia về khoảng cách trong canvas
      for (let count = 0; count < boundaryLength; count++) {
        boundaryOfHeatMapCanvas.push({
          y: parseInt((boundaryProvinceCanvas[count][1] - minLat) / degX),
          x: parseInt((boundaryProvinceCanvas[count][0] - minLng) / degY)
        });
      }

      // mảng các điểm đã biết
      let knownPoints = [];
      for (let k = 0; k < weatherData.stationList.length - 1; k++) {
        knownPoints.push({
          y: parseInt((weatherData.stationList[k].lat - minLat) / degX),
          x: parseInt((weatherData.stationList[k].lng - minLng) / degY),
          value: weatherData.stationList[k].value
        });
      }
      var pointAffectNumber = knownPoints.length;
      let heatMapImg = createHeatMapBase64(
        pointAffectNumber,
        knownPoints,
        boundaryOfHeatMapCanvas,
        number_Y,
        number_X,
        "temperature"
      ); //temperature humidity AQI
      insertDataToTable(heatMapImg);
      console.log("heatMap created");
      // writeFile("./public/json/heatmap.txt", heatMapImg);
    }
  });
}

let runTaskDrawHeatMap = () => {
  schedule.scheduleJob({ start: startTime, rule: "*/10 * * * * *" }, function() {
    mainFunction();
  });
};

module.exports.runTaskDrawHeatMap = runTaskDrawHeatMap;

