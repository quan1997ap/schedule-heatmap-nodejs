"use strict";
// chú thích
// Hàm get giá trị của điểm nội suy
// => -255 : các điểm nằm bên ngoài đường bao
// => -256 : các điểm nằm bên trong đường bao nhưng không có giá trị(nằm cách xa các điểm đã biết => chú ý tham số limitAffect)
// => -255 : các điểm nằm bên ngoài đường bao
// => thay đổi tham số limitAffect 100000 <=> 10000
var TemperatureMap = function(ctx, heatmapType, zoom) {
  this.zoom = zoom;
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

// https://css-tricks.com/converting-color-spaces-in-javascript/
// chuyển color
function degToHsl(deg) {
  let h;
  let s = 100;
  let l = 50;
  if (deg <= 40) {
    h = parseInt(270 - 6.75 * deg); // degMax = 40*C => Hmax = 270 => 1 *c = 6.75 khoang (270/ 40)
    return { h, s, l };
  } else if (deg > 40 && deg < 50) {
    // 50 *c = 288*
    h = (50 * 288) / deg;
    let s = 100;
    let l = 50;
    return { h, s, l };
  } else if (deg >= 50) {
    return { h: 300, s: 100, l: 30 };
  }
}

function hslToRgb(h, s, l) {
  s = s / 100;
  l = l / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}

function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0;

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

    // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return [+r, +g, +b];
}

TemperatureMap.prototype.getColor = function(levels, value) {
  let color;
  switch (this.heatmapType) {
    case "Temp":
      // length = 10;

      let blueColor = [
          [101, 202, 221],
          [116, 204, 198],
          [127, 206, 183],
          [138, 207, 166],
          [152, 210, 147],
          [163, 211, 129],
          [176, 213, 112],
          [187, 215, 98],
          [199, 217, 79],
          [215, 220, 56]
        ],yellowColor = [
          [219, 219, 52],
          [222, 211, 49],
          [225, 205, 48],
          [228, 200, 46],
          [230, 194, 45],
          [233, 187, 42],
          [236, 182, 41],
          [238, 176, 39],
          [241, 170, 37],
          [246, 163, 36]
        ],
        orangeColor = [
          [245, 157, 34],
          [244, 151, 35],
          [243, 146, 34],
          [242, 141, 34],
          [240, 133, 33],
          [239, 127, 33],
          [238, 121, 32],
          [236, 115, 32],
          [234, 108, 31],
          [234, 104, 31]
        ],
        redColor = [
          [232, 98, 30],
          [231, 90, 29],
          [229, 80, 27],
          [227, 72, 26],
          [226, 64, 26],
          [223, 54, 24],
          [223, 54, 24],
          [221, 44, 22],
          [217, 25, 20],
          [216, 19, 19]
        ],
        brown_redColor = [
          [216, 19, 19],
          [208, 19, 19],
          [202, 19, 19],
          [196, 18, 18],
          [190, 18, 18],
          [185, 18, 18],
          [179, 18, 18],
          [173, 17, 17],
          [167, 17, 17],
          [159, 16, 16]
        ];

      if (-99999 <= value && value < -48) {
        color = [16, 18, 51];
      } else if (-48 <= value && value < -46) {
        color = [21, 19, 63];
      } else if (-46 <= value && value < -44) {
        color = [31, 27, 78];
      } else if (-44 <= value && value < -42) {
        color = [42, 39, 101];
      } else if (-42 <= value && value < -40) {
        color = [74, 37, 103];
      } else if (-40 <= value && value < -38) {
        color = [83, 31, 86];
      } else if (-38 <= value && value < -36) {
        color = [105, 37, 105];
      } else if (-36 <= value && value < -34) {
        color = [127, 41, 127];
      } else if (-34 <= value && value < -32) {
        color = [145, 39, 141];
      } else if (-32 <= value && value < -30) {
        color = [160, 60, 149];
      } else if (-30 <= value && value < -28) {
        color = [153, 65, 143];
      } else if (-28 <= value && value < -26) {
        color = [170, 71, 153];
      } else if (-26 <= value && value < -24) {
        color = [178, 77, 156];
      } else if (-24 <= value && value < -22) {
        color = [186, 86, 159];
      } else if (-22 <= value && value < -20) {
        color = [154, 83, 159];
      } else if (-20 <= value && value < -18) {
        color = [138, 82, 160];
      } else if (-18 <= value && value < -16) {
        color = [126, 82, 160];
      } else if (-16 <= value && value < -14) {
        color = [94, 85, 163];
      } else if (-14 <= value && value < -12) {
        color = [59, 85, 164];
      } else if (-12 <= value && value < -10) {
        color = [62, 96, 171];
      } else if (-10 <= value && value < -8) {
        color = [66, 107, 178];
      } else if (-8 <= value && value < -6) {
        color = [62, 113, 183];
      } else if (-6 <= value && value < -4) {
        color = [72, 156, 213];
      } else if (-4 <= value && value < -2) {
        color = [59, 197, 243];
      } else if (-2 <= value && value < 0) {
        color = [98, 202, 230];
      }
      // 0 => 10
      else if (0 <= value && value < 10) {
        let indexColor = parseInt(value % 10);
        color = blueColor[indexColor];
      }
      // 10 => 20
      else if (10 <= value && value < 20) {
        let indexColor = parseInt(value % 10);
        color = yellowColor[indexColor];
      }
      // 20 => 30
      else if (20 <= value && value < 30) {
        let indexColor = parseInt(value % 10);
        color = orangeColor[indexColor];
      }
      // 30 => 40
      else if (30 <= value && value < 40) {
        let indexColor = parseInt(value % 10);
        color = redColor[indexColor];
      }
      // 40 => 50
      else if (40 <= value && value < 50) {
        let indexColor = parseInt(value % 10);
        color = brown_redColor[indexColor];
      }
      //  50 =>
      else if (50 <= value && value <= 99999) {
        color = [255, 255, 255];
      } else if (value > 99999) {
        color = [255, 255, 255];
      } else {
        color = [0, 0, 0];
      }

      break;

    case "tempHLS":
      color = hslToRgb(degToHsl(value).h, degToHsl(value).s, degToHsl(value).l);
      break;

    case "Humidity":
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
      } else if (value > 100) {
        color = [46, 64, 101];
      }
      break;

    case "AQI":
      if (value > 0) {
        // value = parseInt(value/2);
        // color =  hslToRgb(degToHsl(value).h , degToHsl(value).s , degToHsl(value).l);

        if (0 <= value && value <= 10) {
          color = [27, 155, 87];
        } else if (10 < value && value <= 20) {
          color = [27, 175, 87];
        } else if (20 < value && value <= 30) {
          color = [27, 190, 87];
        } else if (30 < value && value <= 40) {
          color = [111, 190, 87];
        } else if (40 < value && value <= 50) {
          color = [149, 190, 87];
        } else if (50 < value && value <= 60) {
          color = [208, 214, 0];
        } else if (60 < value && value <= 70) {
          color = [232, 214, 0];
        } else if (70 < value && value <= 80) {
          color = [255, 214, 0];
        } else if (80 < value && value <= 90) {
          color = [255, 191, 0];
        } else if (90 < value && value <= 100) {
          color = [255, 181, 0];
        }

        if (100 <= value && value <= 110) {
          color = [255, 166, 0];
        } else if (110 < value && value <= 120) {
          color = [255, 145, 0];
        } else if (120 < value && value <= 130) {
          color = [246, 126, 11];
        } else if (130 < value && value <= 140) {
          color = [246, 111, 11];
        } else if (140 < value && value <= 150) {
          color = [246, 91, 11];
        } else if (150 < value && value <= 160) {
          color = [246, 75, 11];
        } else if (160 < value && value <= 170) {
          color = [246, 44, 11];
        } else if (170 < value && value <= 180) {
          color = [213, 40, 40];
        } else if (180 < value && value <= 190) {
          color = [188, 40, 40];
        } else if (190 < value && value <= 200) {
          color = [171, 40, 40];
        }

        if (210 <= value && value <= 210) {
          color = [143, 63, 190];
        } else if (210 < value && value <= 220) {
          color = [143, 63, 173];
        } else if (220 < value && value <= 230) {
          color = [143, 63, 150];
        } else if (230 < value && value <= 240) {
          color = [143, 63, 128];
        } else if (240 < value && value <= 250) {
          color = [143, 63, 105];
        } else if (250 < value && value <= 260) {
          color = [125, 51, 96];
        } else if (260 < value && value <= 270) {
          color = [125, 1, 73];
        } else if (270 < value && value <= 280) {
          color = [255, 214, 0];
        } else if (280 < value && value <= 290) {
          color = [125, 1, 34];
        } else if (290 < value && value <= 500) {
          color = [112, 1, 34];
        }
      } else {
        color = [0, 0, 0];
      }
      break;
    default:
      break;
  }
  return color;
};

// TemperatureMap.prototype.getPointValue = function(limit, point) {
//   var counter = 0,
//     arr = [],
//     tmp = 0.0,
//     dis = 0.0,
//     inv = 0.0,
//     t = 0.0,
//     b = 0.0,
//     pwr = 2,
//     ptr;

//   if (TemperatureMap.pointInPolygon(point, this.polygon)) {
//     for (counter = 0; counter < this.points.length; counter = counter + 1) {
//       dis = TemperatureMap.squareDistance(point, this.points[counter]);
//       // if (dis === 0) {
//       if (0 <= dis && dis <= 1) {
//         // khi vẽ, nếu điểm nội suy trung với điểm có sẵn thì không nội suy nữa mà lấy luôn giá trị
//         return this.points[counter].value;
//       }
//       arr[counter] = [dis, counter]; // khoang cach vs stt
//     }

//     arr.sort(function(a, b) {
//       return a[0] - b[0];
//     });

//     // noi suy diem
//     for (counter = 0; counter < arr.length; counter = counter + 1) {
//       ptr = arr[counter];
//       inv = 1 / Math.pow(ptr[0], pwr); // 1/ (khoảng cách ^2)
//       t = t + inv * this.points[ptr[1]].value; // gia tri noi suy cua diem
//       b = b + inv;
//     }
//     return b !== 0 ? t / b : -256;
//   } else {
//     return -255;
//   }
// };

TemperatureMap.prototype.getPointValue = function(limit, point) {
  var counter = 0,
    arr = [],
    arrTg = [],
    tmp = 0.0,
    dis = 0.0,
    inv = 0.0,
    t = 0.0,
    b = 0.0,
    pwr = 2,
    ptr;
  let optionArr = [[], [], [], [], [], [], [], [], []];

  if (TemperatureMap.pointInPolygon(point, this.polygon)) {
    for (let counter = 0; counter < this.points.length; counter = counter + 1) {
      dis = TemperatureMap.squareDistance(point, this.points[counter]);
      // if (dis === 0) {
      if (0 <= dis && dis <= 5) {
        // khi vẽ, nếu điểm nội suy trung với điểm có sẵn thì không nội suy nữa mà lấy luôn giá trị
        return this.points[counter].value;
      }

      arrTg[counter] = [dis, this.points[counter].value];

      //start
      // for (let opt = 0; opt <= 7; opt++) {
      //   let distance = (opt + 1) * 1.5 * 25000;
      //   if (dis < distance) {
      //     if (optionArr[opt] == undefined || optionArr[opt].length == 0) {
      //       optionArr[opt] = Object.assign([], optionArr[opt]);
      //       optionArr[opt].push([dis, this.points[counter].value, opt]);
      //     } else if (optionArr[opt].length > 0 && optionArr[opt] != undefined) {
      //       optionArr[opt].push([dis, this.points[counter].value, opt]);
      //     }
      //   }
      // }

      // optionArr.forEach(arr => {
      //   arr.sort(function(a, b) {
      //     return a[0] - b[0];
      //   });
      // });

      // let requirePoint = 3;
      // for (let arrIndex = 0; arrIndex < optionArr.length; arrIndex++) {
      //   if (arrIndex == 0 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else if (arrIndex == 1 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else if (arrIndex == 2 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else if (arrIndex == 3 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else if (arrIndex == 4 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else if (arrIndex == 5 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else if (arrIndex == 6 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else if (arrIndex == 7 && optionArr[arrIndex].length > requirePoint) {
      //     arr = optionArr[arrIndex].slice(0,requirePoint);
      //     break;
      //   } else {
      //     arr = arrTg;
      //   }
      // }
      //end
    }

    arr = arrTg;

    // noi suy diem
    for (counter = 0; counter < arr.length; counter = counter + 1) {
      ptr = arr[counter];
      inv = 1 / Math.pow(ptr[0], pwr); // 1/ (khoảng cách ^2)
      // t = t + inv * this.points[ptr[1]].value; // gia tri noi suy cua diem
      t = t + inv * ptr[1];
      b = b + inv;
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
  this.limits.yMax = boundaryPointsUseGetLimit[lengthBoundary].y;
  // this.limits.yMax = boundaryPointsUseGetLimit[lengthBoundary - 1].y;

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
      if (val !== -255 && val !== -256) {
        ctx.beginPath(); //<== beginpath
        col = self.getColor(false, val);
        str = "rgba(" + col[0] + ", " + col[1] + ", " + col[2] + ", ";
        // tạo gradient
        gradient = ctx.createRadialGradient(
          x * this.zoom,
          y * this.zoom,
          0,
          x * this.zoom,
          y * this.zoom,
          res * this.zoom
        );
        gradient.addColorStop(0, str + "1)");
        gradient.addColorStop(1, str + "1)");
        ctx.fillStyle = "#fcfcfc"; //<=== must be filled white for properly render
        ctx.fillStyle = gradient;
        ctx.fillRect(
          (x - res) * this.zoom,
          (y - res) * this.zoom,
          dbl * this.zoom,
          dbl * this.zoom
        );
        ctx.fill();
        ctx.closePath(); //<== must be closed
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
        if (val !== -255 && val != 256) {
          col = self.getColor(levels, val);
          data[idx] = col[0];
          data[idx + 1] = col[1];
          data[idx + 2] = col[2];
          data[idx + 3] = 255;
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
  //   ctx.arc(pnt.x, pnt.y, 0, 0, PI2, false);
  //   ctx.fill();

  //   ctx.lineWidth = 1;
  //   ctx.strokeStyle = "rgb(" + col[0] + ", " + col[1] + ", " + col[2] + ")";
  //   ctx.beginPath();
  //   ctx.arc(pnt.x, pnt.y, 0, 0, PI2, false);
  //   ctx.stroke();

  //   ctx.textAlign = "center";
  //   ctx.textBaseline = "middle";
  //   ctx.fillStyle = "rgb(0, 0, 0)";
  //   ctx.fillText(pnt.value, pnt.x, pnt.y);
  // }

  if (typeof callback === "function") {
    callback();
  }
};

// Phải export // fix err TypeError: TemperatureMap is not a constructor

module.exports = TemperatureMap;
