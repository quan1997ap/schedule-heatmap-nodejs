TemperatureMap.prototype.getColor = function(levels, value) {
  let color;
  switch (this.heatmapType) {
    case "temperature":
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
      } else if (0 <= value && value < 2) {
        color = [97, 201, 225];
      } else if (2 <= value && value < 4) {
        color = [115, 204, 220];
      } else if (4 <= value && value < 6) {
        color = [116, 197, 158];
      } else if (6 <= value && value < 8) {
        color = [151, 201, 61];
      } else if (8 <= value && value < 10) {
        color = [205, 219, 45];
      } else if (10 <= value && value < 12) {
        color = [218, 220, 52];
      } else if (12 <= value && value < 14) {
        color = [243, 234, 64];
      } else if (14 <= value && value < 16) {
        color = [250, 230, 39];
      } else if (16 <= value && value < 18) {
        color = [255, 205, 46];
      } else if (18 <= value && value < 20) {
        color = [250, 172, 42];
      } else if (20 <= value && value <= 22) {
        color = [246, 161, 35];
      } else if (22 <= value && value < 24) {
        color = [247, 152, 45];
      } else if (24 <= value && value < 26) {
        color = [244, 126, 36];
      } else if (26 <= value && value < 28) {
        color = [239, 83, 39];
      } else if (28 <= value && value < 30) {
        color = [237, 34, 41];
      } else if (30 <= value && value < 32) {
        color = [237, 50, 82];
      } else if (32 <= value && value < 34) {
        color = [239, 74, 78];
      } else if (34 <= value && value < 36) {
        color = [216, 30, 44];
      } else if (36 <= value && value < 38) {
        color = [193, 30, 49];
      } else if (38 <= value && value < 40) {
        color = [183, 22, 46];
      } else if (40 <= value && value < 42) {
        color = [170, 23, 51];
      } else if (42 <= value && value < 44) {
        color = [155, 21, 53];
      } else if (44 <= value && value < 46) {
        color = [142, 19, 54];
      } else if (46 <= value && value < 48) {
        color = [130, 17, 55];
      } else if (48 <= value && value < 50) {
        color = [117, 16, 55];
      } else if (50 <= value && value <= 99999) {
        color = [255, 255, 255];
      } else if (value > 99999) {
        color = [255, 255, 255];
      } else {
        color = [0, 0, 0];
      }
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
