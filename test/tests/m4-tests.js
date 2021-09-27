import {
  assertEqual,
  assertEqualApproximately,
  assertIsArray,
  assertInstanceOf,
  assertStrictEqual,
  assertStrictNotEqual,
} from '../assert.js';
import {describe, it, before} from '../mocha-support.js';

const m4 = twgl.m4;

function check(Type) {
  describe('using ' + Type, function() {
    const m = [
       0,  1,  2,  3,
       4,  5,  6,  7,
       8,  9, 10, 11,
      12, 13, 14, 15,
    ];

    before(function() {
      m4.setDefaultType(Type);
    });

    function testM4WithoutDest(func, expected) {
      const d = func();
      assertEqual(d, expected);
    }

    function testM4WithDest(func, expected) {
      expected = new Float32Array(expected);
      const d = new Float32Array(16);
      const c = func(d);
      assertStrictEqual(c, d);
      assertEqual(c, expected);
    }

    function testM4WithAndWithoutDest(func, expected) {
      if (Type === Float32Array) {
        expected = new Float32Array(expected);
      }
      testM4WithoutDest(func, expected);
      testM4WithDest(func, expected);
    }

    function testV3WithoutDest(func, expected) {
      const d = func();
      assertEqual(d, expected);
    }

    function testV3WithDest(func, expected) {
      const d = new Float32Array(3);
      const c = func(d);
      assertStrictEqual(c, d);
      assertEqual(c, expected);
    }

    function testV3WithAndWithoutDest(func, expected) {
      expected = new Float32Array(expected);
      testV3WithoutDest(func, expected);
      testV3WithDest(func, expected);
    }

    function shouldBeCloseArray(a, b) {
      const l = a.length;
      assertStrictEqual(l, b.length);
      for (let i = 0; i < l; ++i) {
        const v = a[i];
        assertEqualApproximately(v, b[i], 0.000001);
      }
    }

    it('should negate', function() {
      const expected = [
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
      const expected = m;
      testM4WithAndWithoutDest(function(dst) {
        const result = m4.copy(m, dst);
        assertStrictNotEqual(result, m);
        return result;
      }, expected);
    });

    it('should make identity', function() {
      const expected = [
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
      const expected = [
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
      const m2 = [
        4, 5, 6, 7,
        1, 2, 3, 4,
        9, 10, 11, 12,
        -1, -2, -3, -4,
      ];
      const expected = [
        m2[0 * 4 + 0] * m[0 * 4 + 0] + m2[0 * 4 + 1] * m[1 * 4 + 0] + m2[0 * 4 + 2] * m[2 * 4 + 0] + m2[0 * 4 + 3] * m[3 * 4 + 0],
        m2[0 * 4 + 0] * m[0 * 4 + 1] + m2[0 * 4 + 1] * m[1 * 4 + 1] + m2[0 * 4 + 2] * m[2 * 4 + 1] + m2[0 * 4 + 3] * m[3 * 4 + 1],
        m2[0 * 4 + 0] * m[0 * 4 + 2] + m2[0 * 4 + 1] * m[1 * 4 + 2] + m2[0 * 4 + 2] * m[2 * 4 + 2] + m2[0 * 4 + 3] * m[3 * 4 + 2],
        m2[0 * 4 + 0] * m[0 * 4 + 3] + m2[0 * 4 + 1] * m[1 * 4 + 3] + m2[0 * 4 + 2] * m[2 * 4 + 3] + m2[0 * 4 + 3] * m[3 * 4 + 3],
        m2[1 * 4 + 0] * m[0 * 4 + 0] + m2[1 * 4 + 1] * m[1 * 4 + 0] + m2[1 * 4 + 2] * m[2 * 4 + 0] + m2[1 * 4 + 3] * m[3 * 4 + 0],
        m2[1 * 4 + 0] * m[0 * 4 + 1] + m2[1 * 4 + 1] * m[1 * 4 + 1] + m2[1 * 4 + 2] * m[2 * 4 + 1] + m2[1 * 4 + 3] * m[3 * 4 + 1],
        m2[1 * 4 + 0] * m[0 * 4 + 2] + m2[1 * 4 + 1] * m[1 * 4 + 2] + m2[1 * 4 + 2] * m[2 * 4 + 2] + m2[1 * 4 + 3] * m[3 * 4 + 2],
        m2[1 * 4 + 0] * m[0 * 4 + 3] + m2[1 * 4 + 1] * m[1 * 4 + 3] + m2[1 * 4 + 2] * m[2 * 4 + 3] + m2[1 * 4 + 3] * m[3 * 4 + 3],
        m2[2 * 4 + 0] * m[0 * 4 + 0] + m2[2 * 4 + 1] * m[1 * 4 + 0] + m2[2 * 4 + 2] * m[2 * 4 + 0] + m2[2 * 4 + 3] * m[3 * 4 + 0],
        m2[2 * 4 + 0] * m[0 * 4 + 1] + m2[2 * 4 + 1] * m[1 * 4 + 1] + m2[2 * 4 + 2] * m[2 * 4 + 1] + m2[2 * 4 + 3] * m[3 * 4 + 1],
        m2[2 * 4 + 0] * m[0 * 4 + 2] + m2[2 * 4 + 1] * m[1 * 4 + 2] + m2[2 * 4 + 2] * m[2 * 4 + 2] + m2[2 * 4 + 3] * m[3 * 4 + 2],
        m2[2 * 4 + 0] * m[0 * 4 + 3] + m2[2 * 4 + 1] * m[1 * 4 + 3] + m2[2 * 4 + 2] * m[2 * 4 + 3] + m2[2 * 4 + 3] * m[3 * 4 + 3],
        m2[3 * 4 + 0] * m[0 * 4 + 0] + m2[3 * 4 + 1] * m[1 * 4 + 0] + m2[3 * 4 + 2] * m[2 * 4 + 0] + m2[3 * 4 + 3] * m[3 * 4 + 0],
        m2[3 * 4 + 0] * m[0 * 4 + 1] + m2[3 * 4 + 1] * m[1 * 4 + 1] + m2[3 * 4 + 2] * m[2 * 4 + 1] + m2[3 * 4 + 3] * m[3 * 4 + 1],
        m2[3 * 4 + 0] * m[0 * 4 + 2] + m2[3 * 4 + 1] * m[1 * 4 + 2] + m2[3 * 4 + 2] * m[2 * 4 + 2] + m2[3 * 4 + 3] * m[3 * 4 + 2],
        m2[3 * 4 + 0] * m[0 * 4 + 3] + m2[3 * 4 + 1] * m[1 * 4 + 3] + m2[3 * 4 + 2] * m[2 * 4 + 3] + m2[3 * 4 + 3] * m[3 * 4 + 3],
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.multiply(m, m2, dst);
      }, expected);
    });

    it('should inverse', function() {
      const m = [
        2, 1, 3, 0,
        1, 2, 1, 0,
        3, 1, 2, 0,
        4, 5, 6, 1,
      ];
      const expected = [
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
      const expected = [
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
      const expected = [12, 13, 14];
      testV3WithAndWithoutDest(function(dst) {
        return m4.getTranslation(m, dst);
      }, expected);
    });

    it('should get axis', function() {
      [
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
      [
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
      const fov = 2;
      const aspect = 4;
      const zNear = 10;
      const zFar = 30;
      const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
      const rangeInv = 1.0 / (zNear - zFar);
      const expected = [
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
      const left = 2;
      const right = 4;
      const top = 10;
      const bottom = 30;
      const near = 15;
      const far = 25;
      const expected = [
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
        2 / (near - far),
        0,

        (right + left) / (left - right),
        (top + bottom) / (bottom - top),
        (far + near) / (near - far),
        1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.ortho(left, right, bottom, top, near, far, dst);
      }, expected);
    });

    it('should compute correct ortho', function() {
      const left = -2;
      const right = 4;
      const top = 10;
      const bottom = 30;
      const near = 15;
      const far = 25;
      const m = m4.ortho(left, right, bottom, top, near, far);
      shouldBeCloseArray(m4.transformPoint(m, [left, bottom, -near]), [-1, -1, -1]);
      shouldBeCloseArray(m4.transformPoint(m, [right, top, -far]), [1, 1, 1]);
    });

    it('should compute frustum', function() {
      const left = 2;
      const right = 4;
      const top = 10;
      const bottom = 30;
      const near = 15;
      const far = 25;

      const dx = (right - left);
      const dy = (top - bottom);
      const dz = (near - far);

      const expected = [
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
      const eye = [1, 2, 3];
      const target = [11, 22, 33];
      const up = [-4, -5, -6];
      const expected = [
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
      const expected = [
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
      const expected = [
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
      const angle = 1.23;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const expected = [
        1,  0, 0, 0,
        0,  c, s, 0,
        0, -s, c, 0,
        0,  0, 0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.rotationX(angle, dst);
      }, expected);
    });

    it('should rotate x', function() {
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = m4.setDefaultType(Array);
      const expected = m4.multiply(m, m4.rotationX(angle));
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.rotateX(m, angle, dst);
      }, expected);
    });

    it('should make y rotation matrix', function() {
      const angle = 1.23;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const expected = [
        c, 0, -s, 0,
        0, 1,  0, 0,
        s, 0,  c, 0,
        0, 0,  0, 1,
      ];
      testM4WithAndWithoutDest(function(dst) {
        return m4.rotationY(angle, dst);
      }, expected);
    });

    it('should rotate y', function() {
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = m4.setDefaultType(Array);
      const expected = m4.multiply(m, m4.rotationY(angle));
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.rotateY(m, angle, dst);
      }, expected);
    });

    it('should make z rotation matrix', function() {
      const angle = 1.23;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const expected = [
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
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = m4.setDefaultType(Array);
      const expected = m4.multiply(m, m4.rotationZ(angle));
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.rotateZ(m, angle, dst);
      }, expected);
    });

    it('should make axis rotation matrix', function() {
      const axis = [0.5, 0.6, -0.7];
      const angle = 1.23;
      let x = axis[0];
      let y = axis[1];
      let z = axis[2];
      const n = Math.sqrt(x * x + y * y + z * z);
      x /= n;
      y /= n;
      z /= n;
      const xx = x * x;
      const yy = y * y;
      const zz = z * z;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const oneMinusCosine = 1 - c;
      const expected = [
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
      const axis = [0.5, 0.6, -0.7];
      const angle = 1.23;
      // switch to Array type to keep precision high for expected
      const oldType = m4.setDefaultType(Array);
      const expected = m4.multiply(m, m4.axisRotation(axis, angle));
      m4.setDefaultType(oldType);

      testM4WithAndWithoutDest(function(dst) {
        return m4.axisRotate(m, axis, angle, dst);
      }, expected);
    });

    it('should make scaling matrix', function() {
      const expected = [
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
      const expected = [
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
      const v0 = 2;
      const v1 = 3;
      const v2 = 4;
      const d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];
      const expected = [
        (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d,
        (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d,
        (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return m4.transformPoint(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform direction', function() {
      const v0 = 2;
      const v1 = 3;
      const v2 = 4;
      const expected = [
        v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0],
        v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1],
        v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2],
      ];
      testV3WithAndWithoutDest(function(dst) {
        return m4.transformDirection(m, [2, 3, 4], dst);
      }, expected);
    });

    it('should transform normal', function() {
      const m  = m4.translate(m4.scaling([0.1, 0.2, 0.3]), [1, 2, 3]);
      const mi = m4.inverse(m);
      const v0 = 2;
      const v1 = 3;
      const v2 = 4;
      const expected = [
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
    let d = m4.identity();
    assertIsArray(d);
    m4.setDefaultType(Float32Array);
    d = m4.identity();
    assertInstanceOf(d, Float32Array);
  });

  check(Array);
  check(Float32Array);
});

