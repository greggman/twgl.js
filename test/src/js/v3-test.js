import * as v3 from '../../../src/v3.js';

function check(Type) {
  describe('using ' + Type, function() {
    var v = [1, 2, 3];

    before(function() {
      v3.setDefaultType(Type);
    });

    function elementsEqual(a, b) {
      should(a.length).equal(b.length);
      for (var i = 0; i < a.length; ++i) {
        var diff = Math.abs(a[i] - b[i]);
        diff.should.be.lessThan(0.0000001);
      }
    }

    function testV3WithoutDest(func, expected, b) {
      var d = func(v.slice(), b);
      d.should.eql(expected);
      d.should.be.instanceOf(Type);
    }

    function testV3WithoutDest1(func, expected) {
      var d = func(v.slice());
      d.should.eql(expected);
      d.should.be.instanceOf(Type);
    }

    function testV3WithDest(func, expected, b) {
      expected = new Float32Array(expected);
      var d = new Float32Array(3);
      var c = func(v.slice(), b, d);
      c.should.be.equal(d);
      c.should.be.eql(expected);

      d = v.slice();
      const bOrig = b.slice();
      c = func(d, b, d);
      elementsEqual(c, expected);
      b.should.be.eql(bOrig);

      d = b.slice();
      const vOrig = v.slice();
      c = func(v, d, d);
      elementsEqual(c, expected);
      v.should.be.eql(vOrig);
    }

    function testV3WithDest1(func, expected) {
      expected = new Float32Array(expected);
      var d = new Float32Array(3);
      var c = func(v.slice(), d);
      c.should.be.equal(d);
      c.should.be.eql(expected);

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
      var expected = [
        3, 5, 7,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.add(a, b, dst);
      }, expected, [2, 3, 4]);
    });

    it('should subtract', function() {
      var expected = [
        -1, -2, -3,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.subtract(a, b, dst);
      }, expected, [2, 4, 6]);
    });

    it('should lerp', function() {
      var expected = [
        1.5, 3, 4.5,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.lerp(a, b, 0.5, dst);
      }, expected, [2, 4, 6]);
    });

    it('should lerp under 0', function() {
      var expected = [
        0.5, 1, 1.5,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.lerp(a, b, -0.5, dst);
      }, expected, [2, 4, 6]);
    });

    it('should lerp over 0', function() {
      var expected = [
        2.5, 5, 7.5,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.lerp(a, b, 1.5, dst);
      }, expected, [2, 4, 6]);
    });

    it('should multiply by scalar', function() {
      var expected = [
        2, 4, 6,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.mulScalar(a, 2, dst);
      }, expected);
    });

    it('should divide by scalar', function() {
      var expected = [
        0.5, 1, 1.5,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.divScalar(a, 2, dst);
      }, expected);
    });

    it('should cross', function() {
      var expected = [
        2 * 6 - 3 * 4,
        3 * 2 - 1 * 6,
        1 * 4 - 2 * 2,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.cross(a, b, dst);
      }, expected, [2, 4, 6]);
    });

    it('should compute dot product', function() {
      var expected = 1 * 2 + 2 * 4 + 3 * 6;
      var value = v3.dot(v, [2, 4, 6]);
      value.should.be.equal(expected);
    });

    it('should compute length', function() {
      var expected = Math.sqrt(1 * 1 + 2 * 2 + 3 * 3);
      var value = v3.length(v);
      value.should.be.equal(expected);
    });

    it('should compute length squared', function() {
      var expected = 1 * 1 + 2 * 2 + 3 * 3;
      var value = v3.lengthSq(v);
      value.should.be.equal(expected);
    });

    it('should compute distance', function() {
      var expected = Math.sqrt(2 * 2 + 3 * 3 + 4 * 4);
      var value = v3.distance(v, [3, 5, 7]);
      value.should.be.equal(expected);
    });

    it('should compute distance squared', function() {
      var expected = 2 * 2 + 3 * 3 + 4 * 4;
      var value = v3.distanceSq(v, [3, 5, 7]);
      value.should.be.equal(expected);
    });

    it('should normalize', function() {
      var length = Math.sqrt(1 * 1 + 2 * 2 + 3 * 3);
      var expected = [
        1 / length,
        2 / length,
        3 / length,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.normalize(a, dst);
      }, expected);
    });

    it('should negate', function() {
      var expected = [
        -1, -2, -3,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        return v3.negate(a, dst);
      }, expected);
    });

    it('should copy', function() {
      var expected = [
        1, 2, 3,
      ];
      testV3WithAndWithoutDest1(function(a, dst) {
        var result = v3.copy(a, dst);
        should.notStrictEqual(result, v);
        return result;
      }, expected);
    });

    it('should multiply', function() {
      var expected = [
        2, 8, 18,
      ];
      testV3WithAndWithoutDest(function(a, b, dst) {
        return v3.multiply(a, b, dst);
      }, expected, [2, 4, 6]);
    });

    it('should divide', function() {
      var expected = [
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
    var d = v3.create(1, 2, 3);
    d.should.be.Array();
    v3.setDefaultType(Float32Array);
    d = v3.create(1, 2, 3);
    d.should.be.instanceOf(Float32Array);
  });

  check(Array);
  check(Float32Array);

});

