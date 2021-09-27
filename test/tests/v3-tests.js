import {
  assertEqual,
  assertInstanceOf,
  assertLessThan,
  assertStrictEqual,
  assertStrictNotEqual,
  assertIsArray,
} from '../assert.js';
import {describe, it, before} from '../mocha-support.js';

const v3 = twgl.v3;

function check(Type) {
  describe('using ' + Type, function() {
    const v = [1, 2, 3];

    before(function() {
      v3.setDefaultType(Type);
    });

    function elementsEqual(a, b) {
      assertStrictEqual(a.length, b.length);
      for (let i = 0; i < a.length; ++i) {
        const diff = Math.abs(a[i] - b[i]);
        assertLessThan(diff, 0.0000001);
      }
    }

    function testV3WithoutDest(func, expected, b) {
      const d = func(v.slice(), b);
      assertEqual(d, expected);
      assertInstanceOf(d, Type);
    }

    function testV3WithoutDest1(func, expected) {
      const d = func(v.slice());
      assertEqual(d, expected);
      assertInstanceOf(d, Type);
    }

    function testV3WithDest(func, expected, b) {
      expected = new Float32Array(expected);
      let d = new Float32Array(3);
      let c = func(v.slice(), b, d);
      assertStrictEqual(c, d);
      assertEqual(c, expected);

      d = v.slice();
      const bOrig = b.slice();
      c = func(d, b, d);
      elementsEqual(c, expected);
      assertEqual(b, bOrig);

      d = b.slice();
      const vOrig = v.slice();
      c = func(v, d, d);
      elementsEqual(c, expected);
      assertEqual(v, vOrig);
    }

    function testV3WithDest1(func, expected) {
      expected = new Float32Array(expected);
      let d = new Float32Array(3);
      let c = func(v.slice(), d);
      assertStrictEqual(c, d);
      assertEqual(c, expected);

      d = v.slice();
      c = func(d, d);
      elementsEqual(c, expected);
    }

    function testV3WithAndWithoutDest(func, expected, b) {
      if (Type === Float32Array) {
        expected = new Float32Array(expected);
      }
      testV3WithoutDest(func, expected, b);
      testV3WithDest(func, expected, b);
    }

    function testV3WithAndWithoutDest1(func, expected) {
      if (Type === Float32Array) {
        expected = new Float32Array(expected);
      }
      testV3WithoutDest1(func, expected);
      testV3WithDest1(func, expected);
    }

    it('should add', function() {
      const expected = [
        3, 5, 7,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.add(a, b, dst);
      }, expected, [2, 3, 4]);
    });

    it('should subtract', function() {
      const expected = [
        -1, -2, -3,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.subtract(a, b, dst);
      }, expected, [2, 4, 6]);
    });

    it('should lerp', function() {
      const expected = [
        1.5, 3, 4.5,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.lerp(a, b, 0.5, dst);
      }, expected, [2, 4, 6]);
    });

    it('should lerp under 0', function() {
      const expected = [
        0.5, 1, 1.5,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.lerp(a, b, -0.5, dst);
      }, expected, [2, 4, 6]);
    });

    it('should lerp over 0', function() {
      const expected = [
        2.5, 5, 7.5,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.lerp(a, b, 1.5, dst);
      }, expected, [2, 4, 6]);
    });

    it('should multiply by scalar', function() {
      const expected = [
        2, 4, 6,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.mulScalar(a, 2, dst);
      }, expected);
    });

    it('should divide by scalar', function() {
      const expected = [
        0.5, 1, 1.5,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.divScalar(a, 2, dst);
      }, expected);
    });

    it('should cross', function() {
      const expected = [
        2 * 6 - 3 * 4,
        3 * 2 - 1 * 6,
        1 * 4 - 2 * 2,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.cross(a, b, dst);
      }, expected, [2, 4, 6]);
    });

    it('should compute dot product', function() {
      const expected = 1 * 2 + 2 * 4 + 3 * 6;
      const value = v3.dot(v, [2, 4, 6]);
      assertStrictEqual(value, expected);
    });

    it('should compute length', function() {
      const expected = Math.sqrt(1 * 1 + 2 * 2 + 3 * 3);
      const value = v3.length(v);
      assertStrictEqual(value, expected);
    });

    it('should compute length squared', function() {
      const expected = 1 * 1 + 2 * 2 + 3 * 3;
      const value = v3.lengthSq(v);
      assertStrictEqual(value, expected);
    });

    it('should compute distance', function() {
      const expected = Math.sqrt(2 * 2 + 3 * 3 + 4 * 4);
      const value = v3.distance(v, [3, 5, 7]);
      assertStrictEqual(value, expected);
    });

    it('should compute distance squared', function() {
      const expected = 2 * 2 + 3 * 3 + 4 * 4;
      const value = v3.distanceSq(v, [3, 5, 7]);
      assertStrictEqual(value, expected);
    });

    it('should normalize', function() {
      const length = Math.sqrt(1 * 1 + 2 * 2 + 3 * 3);
      const expected = [
        1 / length,
        2 / length,
        3 / length,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.normalize(a, dst);
      }, expected);
    });

    it('should negate', function() {
      const expected = [
        -1, -2, -3,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.negate(a, dst);
      }, expected);
    });

    it('should copy', function() {
      const expected = [
        1, 2, 3,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        const result = v3.copy(a, dst);
        assertStrictNotEqual(result, v);
        return result;
      }, expected);
    });

    it('should multiply', function() {
      const expected = [
        2, 8, 18,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.multiply(a, b, dst);
      }, expected, [2, 4, 6]);
    });

    it('should divide', function() {
      const expected = [
        1 / 2, 2 / 3, 3 / 4,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.divide(a, b, dst);
      }, expected, [2, 3, 4]);
    });
  });
}

describe('v3', function() {

  it('should set default type', function() {
    v3.setDefaultType(Array);
    let d = v3.create(1, 2, 3);
    assertIsArray(d);
    v3.setDefaultType(Float32Array);
    d = v3.create(1, 2, 3);
    assertInstanceOf(d, Float32Array);
  });

  check(Array);
  check(Float32Array);

});

