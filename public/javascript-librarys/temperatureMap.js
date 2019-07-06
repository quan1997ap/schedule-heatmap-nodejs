"use strict";
// chú thích
// Hàm get giá trị của điểm nội suy
// => -255 : các điểm nằm bên ngoài đường bao
// => -256 : các điểm nằm bên trong đường bao nhưng không có giá trị(nằm cách xa các điểm đã biết => chú ý tham số limitAffect)
// => -255 : các điểm nằm bên ngoài đường bao
// => thay đổi tham số limitAffect 100000 <=> 10000
var TemperatureMap = function(ctx, heatmapType) {
  this.ctx = ctx;
  this.points = [];
  this.polygon = [];
  this.heatmapType = heatmapType;
  this.limitAffect = 100000; // giới hạn ảnh hưởng của các điểm lên điểm nội suy = bình phương khoảng cách giữa 2 điểm => 2 điểm cách nhau 100 ô => sẽ không có tác động trong việc nội suy
  this.limits = {
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0
  };
  this.size = { height: ctx.canvas.height, width: ctx.canvas.width };
};

TemperatureMap.crossProduct = function(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
};

TemperatureMap.pointInPolygon = function(point, vs) {
  var x = point.x,
    y = point.y,
    inside = false,
    i = 0,
    j = 0,
    xi = 0,
    xj = 0,
    yi = 0,
    yj = 0,
    intersect = false;

  j = vs.length - 1;
  for (i = 0; i < vs.length; i = i + 1) {
    xi = vs[i].x;
    yi = vs[i].y;
    xj = vs[j].x;
    yj = vs[j].y;

    intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
    j = i;
  }
  return inside;
};

TemperatureMap.squareDistance = function(p0, p1) {
  var x = p0.x - p1.x,
    y = p0.y - p1.y;

  return x * x + y * y;
};

TemperatureMap.hslToRgb = function (h, s, l) {

  var r, g, b, hue2rgb, q, p;

  if (s === 0) {
      r = g = b = l;
  } else {
      hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) {
              t += 1;
          } else if (t > 1) {
              t -= 1;
          }

          if (t >= 0.66) {
              return p;
          } else if (t >= 0.5) {
              return p + (q - p) * (0.66 - t) * 6;
          } else if (t >= 0.33) {
              return q;
          } else {
              return p + (q - p) * 6 * t;
          }
      };

      q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      p = 2 * l - q;
      r = hue2rgb(p, q, h + 0.33);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 0.33);
  }

  return [(r * 255) | 0, (g * 255) | 0, (b * 255) | 0]; // (x << 0) = Math.floor(x)
};

TemperatureMap.prototype.getColor = function(levels, value) {
  let color;
  switch (this.heatmapType) {
    case "temperature":
      var val = value,
        tmp = 0,
        lim = 0.55,
        min = -10,
        max = 45,
        dif = max - min,
        lvs = 15;

      if (val < min) {
        val = min;
      }
      if (val > max) {
        val = max;
      }

      tmp = 1 - (1 - lim) - ((val - min) * lim) / dif;

      if (levels) {
        tmp = Math.round(tmp * lvs) / lvs;
      }
      color =  TemperatureMap.hslToRgb(tmp, 1, 0.5);
      break;
    case "humidity":
      if (0 <= value && value < 5) {
        color = [153, 92, 52];
      } else if (5 <= value && value < 10) {
        color = [162, 99, 57];
      } else if (10 <= value && value < 15) {
        color = [166, 103, 59];
      } else if (15 <= value && value < 20) {
        color = [170, 108, 64];
      } else if (20 <= value && value < 25) {
        color = [172, 118, 66];
      } else if (25 <= value && value < 30) {
        color = [174, 132, 68];
      } else if (30 <= value && value < 35) {
        color = [169, 152, 72];
      } else if (35 <= value && value < 40) {
        color = [139, 163, 80];
      } else if (40 <= value && value < 45) {
        color = [89, 176, 87];
      } else if (45 <= value && value < 50) {
        color = [69, 172, 126];
      } else if (50 <= value && value < 55) {
        color = [56, 167, 157];
      } else if (55 <= value && value < 60) {
        color = [57, 159, 166];
      } else if (60 <= value && value < 65) {
        color = [59, 150, 173];
      } else if (65 <= value && value < 70) {
        color = [57, 142, 173];
      } else if (70 <= value && value < 75) {
        color = [46, 136, 173];
      } else if (75 <= value && value < 80) {
        color = [45, 125, 168];
      } else if (80 <= value && value < 85) {
        color = [50, 110, 159];
      } else if (85 <= value && value < 90) {
        color = [57, 88, 132];
      } else if (90 <= value && value < 95) {
        color = [59, 75, 116];
      } else if (95 <= value && value <= 100) {
        color = [46, 64, 101];
      }
      break;
    case "AQI":
      value = parseInt(value);
      if (0 <= value && value <= 50) {
        color = [27, 190, 87];
      } else if (51 <= value && value <= 100) {
        color = [255, 214, 0];
      } else if (101 <= value && value <= 150) {
        color = [246, 126, 11];
      } else if (151 <= value && value <= 200) {
        color = [213, 40, 40];
      } else if (201 <= value && value < 300) {
        color = [143, 63, 150];
      } else if (value > 300) {
        color = [125, 1, 34];
      }
      break;
    default:
      break;
  }
  return color;
};

TemperatureMap.prototype.getPointValue = function(limit, point) {
  var counter = 0,
    arr = [],
    tmp = 0.0,
    dis = 0.0,
    inv = 0.0,
    t = 0.0,
    b = 0.0,
    pwr = 2,
    ptr;

  if (TemperatureMap.pointInPolygon(point, this.polygon)) {
    for (counter = 0; counter < this.points.length; counter = counter + 1) {
      dis = TemperatureMap.squareDistance(point, this.points[counter]);
      // if (dis === 0) {
      if (0 <= dis && dis <= 0.2) {
        // khi vẽ, nếu điểm nội suy trung với điểm có sẵn thì không nội suy nữa mà lấy luôn giá trị
        return this.points[counter].value;
      }
      arr[counter] = [dis, counter]; // khoang cach vs stt
    }

    arr.sort(function(a, b) {
      return a[0] - b[0];
    });

    // noi suy diem
    for (counter = 0; counter < limit; counter = counter + 1) {
      ptr = arr[counter];
      if (ptr[0] < this.limitAffect) {
        inv = 1 / Math.pow(ptr[0], pwr); // 1/ (khoảng cách ^2)
        t = t + inv * this.points[ptr[1]].value; // gia tri noi suy cua diem
        b = b + inv;
      }
    }
    return b !== 0 ? t / b : -256;
  } else {
    return -255;
  }
};

TemperatureMap.prototype.setConvexhullPolygon = function(
  points,
  boundaryPoints,
  width,
  height
) {
  // hiểu rõ thuật toán
  // limits.yMin / yMax / xMin/ xMax
  // nó sẽ cần 1 mảng chứa các phần tử có lat và long ( lớn nhất và bé nhất, để khi vẽ, sẽ không phải vẽ các điểm có Lat, Long nhỏ hơn)
  // điều đó có nghĩa là :
  // nếu chỉ đưa và các phần tử đã biết giá trị(knowPoints) ( chú ý rằng từ các điểm này không xác định được được yMin / yMax / xMin/ xMax  )
  // mà yMin / yMax / xMin/ xMax nằm trong các điểm của mảng boundaryPoints
  // => phải tìm trong tất cả các điểm ( hoặc chỉ trong mảng boundaryPoints)

  var i = 0;
  var boundaryPointsUseGetLimit = Object.assign([], boundaryPoints);
  var lengthBoundary = boundaryPointsUseGetLimit.length - 1;

  // set poligon
  // Sort by 'y' to get yMin/yMax
  boundaryPointsUseGetLimit.sort(function(a, b) {
    return a.y === b.y ? a.x - b.x : a.y - b.y;
  });

  this.limits.yMin = boundaryPointsUseGetLimit[0].y;
  this.limits.yMax = boundaryPointsUseGetLimit[lengthBoundary - 1].y;

  // Sort by 'x' to get convex hull polygon and xMin/xMax
  boundaryPointsUseGetLimit.sort(function(a, b) {
    return a.x === b.x ? a.y - b.y : a.x - b.x;
  });

  this.limits.xMin = boundaryPointsUseGetLimit[0].x;
  this.limits.xMax = boundaryPointsUseGetLimit[lengthBoundary - 1].x;

  // console.log(this.limits, this.points.length, boundaryPoints.length)

  var boundaryPointsRevertOy = [];
  var boundaryPointslength = boundaryPoints.length;
  for (var i1 = 0; i1 < boundaryPointslength; i1++) {
    boundaryPointsRevertOy.push({
      x: boundaryPoints[i1].x,
      y: height - boundaryPoints[i1].y
    });
  }

  this.polygon = boundaryPointsRevertOy;
  //   this.polygon = boundaryPoints;
};

TemperatureMap.prototype.setDataPoints = function(
  knowPointArr,
  boundaryArr,
  width,
  height
) {
  // set chieu dai rong cua canvas
  this.width = width;
  this.height = height;

  var knowPointsRevertOy = [];
  var knowPointslength = knowPointArr.length;

  for (var c1 = 0; c1 < knowPointslength; c1++) {
    knowPointsRevertOy.push({
      x: knowPointArr[c1].x,
      y: height - knowPointArr[c1].y,
      value: knowPointArr[c1].value
    });
  }

  this.points = knowPointsRevertOy;
  this.setConvexhullPolygon(this.points, boundaryArr, width, height);
};

TemperatureMap.prototype.drawLow = function(limit, res, clean, callback) {
  var self = this,
    ctx = this.ctx,
    dbl = 2 * res,
    col = [],
    cnt = 0,
    x = 0,
    y = 0,
    val = 0.0,
    str = "",
    xBeg = self.limits.xMin,
    yBeg = self.limits.yMin,
    xEnd = self.limits.xMax,
    yEnd = self.limits.yMax,
    lim = limit > self.points.length ? self.points.length : limit,
    gradient;
  ctx.clearRect(0, 0, this.size.width, this.size.height);
  ctx.width += 0; //<=== Resizing the canvas will cause the canvas to get cleared.

  // Draw aproximation
  for (x = xBeg; x < xEnd; x = x + res) {
    for (y = yBeg; y < yEnd; y = y + res) {
      val = self.getPointValue(lim, { x: x, y: y });
      if (val !== -255) {
        ctx.beginPath(); //<== beginpath
        col = self.getColor(false, val);
        str = "rgba(" + col[0] + ", " + col[1] + ", " + col[2] + ", ";
        // tạo gradient
        gradient = ctx.createRadialGradient(x, y, 0, x, y, res);
        gradient.addColorStop(0, str + "0.5)");
        gradient.addColorStop(1, str + "0.1)");
        ctx.fillStyle = "#fcfcfc"; //<=== must be filled white for properly render
        ctx.fillStyle = gradient;
        ctx.fillRect(x - res, y - res, dbl, dbl);
        ctx.fill();
        ctx.closePath(); //<== must be closed
      }
      // if (val == -255){
      //   ctx.beginPath(); //<== beginpath
      //   col = self.getColor(false, val);
      //   str = "rgba(0, 0, 0" + ", ";
      //   gradient = ctx.createRadialGradient(x, y, 1, x, y, res);
      //   gradient.addColorStop(0, str + "0)");
      //   gradient.addColorStop(1, str + "0)");
      //   ctx.fillStyle = "#191919"; //<=== must be filled white for properly render
      //   ctx.fillStyle = gradient;
      //   ctx.fillRect(x - res, y - res, dbl, dbl);
      //   ctx.fill();
      //   ctx.closePath(); //<== must be closed
      // }
      else if (val == -256) {
        ctx.beginPath(); //<== beginpath
        col = self.getColor(false, val);
        str = "rgba(248, 249, 250" + ", ";
        gradient = ctx.createRadialGradient(x, y, 1, x, y, res);
        gradient.addColorStop(0, str + "0.2)");
        gradient.addColorStop(1, str + "0)");
        ctx.fillStyle = "#191919";
        ctx.fillStyle = gradient;
        ctx.fillRect(x - res, y - res, dbl, dbl);
        ctx.fill();
        ctx.closePath();
      }
    }
  }

  // Erase polygon outsides xóa các điểm nằm ngoài
  if (clean && self.polygon.length > 1) {
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.moveTo(self.polygon[0].x, self.polygon[0].y);
    for (cnt = 1; cnt < self.polygon.length; cnt = cnt + 1) {
      ctx.lineTo(self.polygon[cnt].x, self.polygon[cnt].y);
    }
    ctx.lineTo(self.polygon[0].x, self.polygon[0].y);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  if (typeof callback === "function") {
    callback();
  }
};

// vẽ với mật độ chi tiết nhất
TemperatureMap.prototype.drawFull = function(levels, callback) {
  "use strict";
  var self = this,
    ctx = this.ctx,
    img = this.ctx.getImageData(0, 0, self.width, self.height),
    data = img.data,
    step = 0,
    col = [],
    cnt = 0,
    idx = 0,
    x = self.limits.xMin,
    y = self.limits.yMin,
    w = self.width * 4,
    wy = w * y,
    lim = self.points.length,
    val = 0.0,
    tBeg = 0,
    tDif = 0,
    xBeg = self.limits.xMin,
    xEnd = self.limits.xMax,
    yEnd = self.limits.yMax,
    bucleSteps = 100.0,
    recursive = function() {
      tBeg = new Date().getTime();
      for (cnt = 0; cnt < bucleSteps; cnt = cnt + 1) {
        val = self.getPointValue(lim, { x: x, y: y });
        idx = x * 4 + wy;
        if (val !== -255) {
          col = self.getColor(levels, val);
          data[idx] = col[0];
          data[idx + 1] = col[1];
          data[idx + 2] = col[2];
          data[idx + 3] = 128;
        }
        x = x + 1;
        if (x > xEnd) {
          x = xBeg;
          y = y + 1;
          wy = w * y;
        }
      }

      tDif = new Date().getTime() - tBeg;
      if (tDif === 0) {
        tDif = 1;
      }
      // bucleSteps = ((16 * bucleSteps) / tDif) * 0.5;
      bucleSteps = (bucleSteps << 3) / tDif;

      ctx.putImageData(img, 0, 0);

      if (y < yEnd) {
        recursive();
      } else if (typeof callback === "function") {
        callback();
      }
    };

  recursive();
};

// vẽ heat map ở mức độ vừa
TemperatureMap.prototype.drawPoints = function(callback) {
  var self = this,
    PI2 = 2 * Math.PI,
    ctx = this.ctx;
  var col = [],
    idx = 0,
    pnt;

  // for (idx = 0; idx < self.points.length; idx = idx + 1) {
  //   pnt = self.points[idx];

  //   col = self.getColor(false, pnt.value);

  //   ctx.fillStyle = "rgba(255, 255, 255, 128)";
  //   ctx.beginPath();
  //   ctx.arc(pnt.x, pnt.y, 8, 0, PI2, false);
  //   ctx.fill();

  //   ctx.lineWidth = 1;
  //   ctx.strokeStyle = "rgb(" + col[0] + ", " + col[1] + ", " + col[2] + ")";
  //   ctx.beginPath();
  //   ctx.arc(pnt.x, pnt.y, 8, 0, PI2, false);
  //   ctx.stroke();

  //   ctx.textAlign = "center";
  //   ctx.textBaseline = "middle";
  //   ctx.fillStyle = "rgb(0, 0, 0)";
  //   ctx.fillText(Math.round(pnt.value), pnt.x, pnt.y);
  // }

  if (typeof callback === "function") {
    callback();
  }
};

// Phải export // fix err TypeError: TemperatureMap is not a constructor

module.exports = TemperatureMap;
