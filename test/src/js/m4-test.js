var path      = require('path');
var requirejs = require('requirejs');
var should    = require('should');

requirejs.config({
  nodeRequire: require,
  baseUrl: path.normalize(path.join(__dirname, '../../../src')),
});

var m4 = requirejs('./m4');

function check(Type) {
  describe('using ' + Type, function() {
    var m = [
       0,  1,  2,  3,
       4,  5,  6,  7,
       8,  9, 10, 11,
      12, 13, 14, 15,
    ];

    before(function() {
      m4.setDefaultType(Type);
    });

    function testM4WithoutDest(func, expected) {
      var d = func();
      d.should.eql(expected);
    }

    function testM4WithDest(func, expected) {
      expected = new Float32Array(expected);
      var d = new Float32Array(16);
      var c = func(d);
      c.should.be.equal(d);
      c.should.be.eql(expected);
    }

    function testM4WithAndWithoutDest(func, expected) {
      if (Type === Float32Array) {
        expected = new Float32Array(expected);
      }
      testM4WithoutDest(func, expected);
      testM4WithDest(func, expected);
    }

    function testV3WithoutDest(func, expected) {
      var d = func();
      d.should.eql(expected);
    }

    function testV3WithDest(func, expected) {
      var d = new Float32Array(3);
      var c = func(d);
      c.should.be.equal(d);
      c.should.be.eql(expected);
    }

    function testV3WithAndWithoutDest(func, expected) {
      expected = new Float32Array(expected);
      testV3WithoutDest(func, expected);
      testV3WithDest(func, expected);
    }

    it('should negate', function() {
      var expected = [
        -0,  -1,  -2,  -3,
        -4,  -5,  -6,  -7,
        -8,  -9, -10, -11,
       -12, -13, -14, -15,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.negate(m, dst);
      }, expected);
    });

    it('should copy', function() {
      var expected = m;
      testM4WithAndWithoutDest(function(dst) {
        var result = m4.copy(m, dst);
        should.notStrictEqual(result, m);
        return result;
      }, expected);
    });

    it('should make identity', function() {
      var expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.identity(dst);
      }, expected);
    });

    it('should transpose', function() {
      var expected = [
        0, 4, 8, 12,
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.transpose(m, dst);
      }, expected);
    });

    it('should multiply', function() {
      var m2 = [
        4, 5, 6, 7,
        1, 2, 3, 4,
        9, 10, 11, 12,
        -1, -2, -3, -4,
      ];
      var expected = [
        m[0 * 4 + 0] * m2[0 * 4 + 0] + m[0 * 4 + 1] * m2[1 * 4 + 0] + m[0 * 4 + 2] * m2[2 * 4 + 0] + m[0 * 4 + 3] * m2[3 * 4 + 0],
        m[0 * 4 + 0] * m2[0 * 4 + 1] + m[0 * 4 + 1] * m2[1 * 4 + 1] + m[0 * 4 + 2] * m2[2 * 4 + 1] + m[0 * 4 + 3] * m2[3 * 4 + 1],
        m[0 * 4 + 0] * m2[0 * 4 + 2] + m[0 * 4 + 1] * m2[1 * 4 + 2] + m[0 * 4 + 2] * m2[2 * 4 + 2] + m[0 * 4 + 3] * m2[3 * 4 + 2],
        m[0 * 4 + 0] * m2[0 * 4 + 3] + m[0 * 4 + 1] * m2[1 * 4 + 3] + m[0 * 4 + 2] * m2[2 * 4 + 3] + m[0 * 4 + 3] * m2[3 * 4 + 3],
        m[1 * 4 + 0] * m2[0 * 4 + 0] + m[1 * 4 + 1] * m2[1 * 4 + 0] + m[1 * 4 + 2] * m2[2 * 4 + 0] + m[1 * 4 + 3] * m2[3 * 4 + 0],
        m[1 * 4 + 0] * m2[0 * 4 + 1] + m[1 * 4 + 1] * m2[1 * 4 + 1] + m[1 * 4 + 2] * m2[2 * 4 + 1] + m[1 * 4 + 3] * m2[3 * 4 + 1],
        m[1 * 4 + 0] * m2[0 * 4 + 2] + m[1 * 4 + 1] * m2[1 * 4 + 2] + m[1 * 4 + 2] * m2[2 * 4 + 2] + m[1 * 4 + 3] * m2[3 * 4 + 2],
        m[1 * 4 + 0] * m2[0 * 4 + 3] + m[1 * 4 + 1] * m2[1 * 4 + 3] + m[1 * 4 + 2] * m2[2 * 4 + 3] + m[1 * 4 + 3] * m2[3 * 4 + 3],
        m[2 * 4 + 0] * m2[0 * 4 + 0] + m[2 * 4 + 1] * m2[1 * 4 + 0] + m[2 * 4 + 2] * m2[2 * 4 + 0] + m[2 * 4 + 3] * m2[3 * 4 + 0],
        m[2 * 4 + 0] * m2[0 * 4 + 1] + m[2 * 4 + 1] * m2[1 * 4 + 1] + m[2 * 4 + 2] * m2[2 * 4 + 1] + m[2 * 4 + 3] * m2[3 * 4 + 1],
        m[2 * 4 + 0] * m2[0 * 4 + 2] + m[2 * 4 + 1] * m2[1 * 4 + 2] + m[2 * 4 + 2] * m2[2 * 4 + 2] + m[2 * 4 + 3] * m2[3 * 4 + 2],
        m[2 * 4 + 0] * m2[0 * 4 + 3] + m[2 * 4 + 1] * m2[1 * 4 + 3] + m[2 * 4 + 2] * m2[2 * 4 + 3] + m[2 * 4 + 3] * m2[3 * 4 + 3],
        m[3 * 4 + 0] * m2[0 * 4 + 0] + m[3 * 4 + 1] * m2[1 * 4 + 0] + m[3 * 4 + 2] * m2[2 * 4 + 0] + m[3 * 4 + 3] * m2[3 * 4 + 0],
        m[3 * 4 + 0] * m2[0 * 4 + 1] + m[3 * 4 + 1] * m2[1 * 4 + 1] + m[3 * 4 + 2] * m2[2 * 4 + 1] + m[3 * 4 + 3] * m2[3 * 4 + 1],
        m[3 * 4 + 0] * m2[0 * 4 + 2] + m[3 * 4 + 1] * m2[1 * 4 + 2] + m[3 * 4 + 2] * m2[2 * 4 + 2] + m[3 * 4 + 3] * m2[3 * 4 + 2],
        m[3 * 4 + 0] * m2[0 * 4 + 3] + m[3 * 4 + 1] * m2[1 * 4 + 3] + m[3 * 4 + 2] * m2[2 * 4 + 3] + m[3 * 4 + 3] * m2[3 * 4 + 3],
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.multiply(m, m2, dst);
      }, expected);
    });

    it('should inverse', function() {
      var m = [
        2, 1, 3, 0,
        1, 2, 1, 0,
        3, 1, 2, 0,
        4, 5, 6, 1,
      ];
      var expected = [
        -0.375,
        -0.125,
        0.625,
        -0,
        -0.125,
        0.625,
        -0.125,
        -0,
        0.625,
        -0.125,
        -0.375,
        -0,
        -1.625,
        -1.875,
        0.375,
        1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.inverse(m, dst);
      }, expected);
    });

    it('should set translation', function() {
      var expected = [
        0,  1,  2,  3,
        4,  5,  6,  7,
        8,  9, 10, 11,
       11, 22, 33, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.setTranslation(m, [11, 22, 33], dst);
      }, expected);
    });

    it('should get translation', function() {
      var expected = [12, 13, 14];
      testV3WithAndWithoutDest(function(dst) {
        return m4.getTranslation(m, dst);
      }, expected);
    });

    it('should get axis', function() {
      var expected = [
        [0, 1, 2],
        [4, 5, 6],
        [8, 9, 10],
      ].forEach(function(expected, ndx) {
        testV3WithAndWithoutDest(function(dst) {
          return m4.getAxis(m, ndx, dst);
        }, expected);
      });
    });

    it('should set axis', function() {
      var expected = [
        [
          11, 22, 33,  3,
           4,  5,  6,  7,
           8,  9, 10, 11,
          12, 13, 14, 15,
        ],
        [
           0,  1,  2,  3,
          11, 22, 33,  7,
           8,  9, 10, 11,
          12, 13, 14, 15,
        ],
        [
           0,  1,  2,  3,
           4,  5,  6,  7,
          11, 22, 33, 11,
          12, 13, 14, 15,
        ],
      ].forEach(function(expected, ndx) {
        testM4WithAndWithoutDest(function(dst) {
          return m4.setAxis(m, [11, 22, 33], ndx, dst);
        }, expected);
      });
    });

    it('should compute perspective', function() {
      var fov = 2;
      var aspect = 4;
      var zNear = 10;
      var zFar = 30;
      var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
      var rangeInv = 1.0 / (zNear - zFar);
      var expected = [
        f / aspect,
        0,
        0,
        0,

        0,
        f,
        0,
        0,

        0,
        0,
        (zNear + zFar) * rangeInv,
        -1,

        0,
        0,
        zNear * zFar * rangeInv * 2,
        0,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.perspective(fov, aspect, zNear, zFar, dst);
      }, expected);
    });

    it('should compute ortho', function() {
      var left = 2;
      var right = 4;
      var top = 10;
      var bottom = 30;
      var near = 15;
      var far = 25;
      var expected = [
        2 / (right - left),
        0,
        0,
        0,

        0,
        2 / (top - bottom),
        0,
        0,

        0,
        0,
        -1 / (far - near),
        0,

        (right + left) / (left - right),
        (top + bottom) / (bottom - top),
        -near / (near - far),
        1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.ortho(left, right, bottom, top, near, far, dst);
      }, expected);
    });

    it('should compute frustum', function() {
      var left = 2;
      var right = 4;
      var top = 10;
      var bottom = 30;
      var near = 15;
      var far = 25;

      var dx = (right - left);
      var dy = (top - bottom);
      var dz = (near - far);

      var expected = [
        2 * near / dx,
        0,
        0,
        0,
        0,
        2 * near / dy,
        0,
        0,
        (left + right) / dx,
        (top + bottom) / dy,
        far / dz,
        -1,
        0,
        0,
        near * far / dz,
        0,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.frustum(left, right, bottom, top, near, far, dst);
      }, expected);
    });

    it('should make lookAt matrix', function() {
      var eye = [1, 2, 3];
      var target = [11, 22, 33];
      var up = [-4, -5, -6];
      var expected = [
        0.40824833512306213,
        -0.8164966106414795,
        0.40824824571609497,
        0,
        -0.8728715181350708,
        -0.21821792423725128,
        0.4364357888698578,
        0,
        -0.26726123690605164,
        -0.5345224738121033,
        -0.8017837405204773,
        0,
        1,
        2,
        3,
        1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.lookAt(eye, target, up, dst);
      }, expected);
    });

    it('should make translation matrix', function() {
      var expected = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        2, 3, 4, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.translation([2, 3, 4], dst);
      }, expected);
    });

    it('should translate', function() {
      var expected = [
        0,  1,  2,  3,
        4,  5,  6,  7,
        8,  9, 10, 11,
       12 + 0 * 2 + 4 * 3 + 8 * 4,
       13 + 1 * 2 + 5 * 3 + 9 * 4,
       14 + 2 * 2 + 6 * 3 + 10 * 4,
       15 + 3 * 2 + 7 * 3 + 11 * 4,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.translate(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should make x rotation matrix', function() {
      var angle = 1.23;
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var expected = [
        1, 0, 0, 0,
        0, c, s, 0,
        0,-s, c, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.rotationX(angle, dst);
      }, expected);
    });

    it('should rotate x', function() {
      var angle = 1.23;
      // switch to Array type to keep precision high for expected
      var oldType = m4.setDefaultType(Array);
      var expected = m4.multiply(m4.rotationX(angle), m);
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.rotateX(m, angle, dst);
      }, expected);
    });

    it('should make y rotation matrix', function() {
      var angle = 1.23;
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var expected = [
        c, 0,-s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.rotationY(angle, dst);
      }, expected);
    });

    it('should rotate y', function() {
      var angle = 1.23;
      // switch to Array type to keep precision high for expected
      var oldType = m4.setDefaultType(Array);
      var expected = m4.multiply(m4.rotationY(angle), m);
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.rotateY(m, angle, dst);
      }, expected);
    });

    it('should make z rotation matrix', function() {
      var angle = 1.23;
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var expected = [
        c, s, 0, 0,
       -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.rotationZ(angle, dst);
      }, expected);
    });

    it('should rotate z', function() {
      var angle = 1.23;
      // switch to Array type to keep precision high for expected
      var oldType = m4.setDefaultType(Array);
      var expected = m4.multiply(m4.rotationZ(angle), m);
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.rotateZ(m, angle, dst);
      }, expected);
    });

    it('should make axis rotation matrix', function() {
      var axis = [0.5, 0.6, -0.7];
      var angle = 1.23;
      var x = axis[0];
      var y = axis[1];
      var z = axis[2];
      var n = Math.sqrt(x * x + y * y + z * z);
      x /= n;
      y /= n;
      z /= n;
      var xx = x * x;
      var yy = y * y;
      var zz = z * z;
      var c = Math.cos(angle);
      var s = Math.sin(angle);
      var oneMinusCosine = 1 - c;
      var expected = [
        xx + (1 - xx) * c,
        x * y * oneMinusCosine + z * s,
        x * z * oneMinusCosine - y * s,
        0,

        x * y * oneMinusCosine - z * s,
        yy + (1 - yy) * c,
        y * z * oneMinusCosine + x * s,
        0,

        x * z * oneMinusCosine + y * s,
        y * z * oneMinusCosine - x * s,
        zz + (1 - zz) * c,
        0,

        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.axisRotation(axis, angle, dst);
      }, expected);
    });

    it('should axis rotate', function() {
      var axis = [0.5, 0.6, -0.7];
      var angle = 1.23;
      // switch to Array type to keep precision high for expected
      var oldType = m4.setDefaultType(Array);
      var expected = m4.multiply(m4.axisRotation(axis, angle), m);
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.axisRotate(m, axis, angle, dst);
      }, expected);
    });

    it('should make scaling matrix', function() {
      var expected = [
        2, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 4, 0,
        0, 0, 0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.scaling([2, 3, 4], dst);
      }, expected);
    });

    it('should scale', function() {
      var expected = [
         0,  2,  4,  6,
        12, 15, 18, 21,
        32, 36, 40, 44,
        12, 13, 14, 15,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.scale(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform point', function() {
      var v0 = 2;
      var v1 = 3;
      var v2 = 4;
      var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];
      var expected = [
        (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d,
        (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d,
        (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return m4.transformPoint(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform direction', function() {
      var v0 = 2;
      var v1 = 3;
      var v2 = 4;
      var expected = [
        v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0],
        v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1],
        v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2],
      ];
      testV3WithAndWithoutDest(function(dst) {
        return m4.transformDirection(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform normal', function() {
      var m  = m4.translate(m4.scaling([0.1, 0.2, 0.3]), [1, 2, 3]);
      var mi = m4.inverse(m);
      var v0 = 2;
      var v1 = 3;
      var v2 = 4;
      var expected = [
        v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2],
        v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2],
        v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2],
      ];
      testV3WithAndWithoutDest(function(dst) {
        return m4.transformNormal(m, [2, 3, 4], dst);
      }, expected);
    });

  });
}

describe('m4', function() {

  it('should set default type', function() {
    m4.setDefaultType(Array);
    var d = m4.identity();
    d.should.be.Array();
    m4.setDefaultType(Float32Array);
    d = m4.identity();
    d.should.be.instanceOf(Float32Array);
  });

  check(Array);
  check(Float32Array);
});

