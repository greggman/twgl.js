var path      = require('path');
var requirejs = require('requirejs');
var should    = require('should');

requirejs.config({
  nodeRequire: require,
  baseUrl: path.normalize(path.join(__dirname, '../../../src')),
});

var v3 = requirejs('./v3');

function check(Type) {
  describe('using ' + Type, function() {
    var v = [1, 2, 3];

    before(function() {
      v3.setDefaultType(Type);
    });

    function testV3WithoutDest(func, expected) {
      var d = func();
      d.should.eql(expected);
      d.should.be.instanceOf(Type);
    }

    function testV3WithDest(func, expected) {
      expected = new Float32Array(expected);
      var d = new Float32Array(3);
      var c = func(d);
      c.should.be.equal(d);
      c.should.be.eql(expected);
    }

    function testV3WithAndWithoutDest(func, expected) {
      if (Type === Float32Array) {
        expected = new Float32Array(expected);
      }
      testV3WithoutDest(func, expected);
      testV3WithDest(func, expected);
    }

    it('should add', function() {
      var expected = [
        3, 5, 7,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.add(v, [2, 3, 4], dst);
      }, expected);
    });

    it('should subtract', function() {
      var expected = [
        -1, -2, -3,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.subtract(v, [2, 4, 6], dst);
      }, expected);
    });

    it('should lerp', function() {
      var expected = [
        1.5, 3, 4.5,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.lerp(v, [2, 4, 6], 0.5, dst);
      }, expected);
    });

    it('should lerp under 0', function() {
      var expected = [
        0.5, 1, 1.5,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.lerp(v, [2, 4, 6], -0.5, dst);
      }, expected);
    });

    it('should lerp over 0', function() {
      var expected = [
        2.5, 5, 7.5,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.lerp(v, [2, 4, 6], 1.5, dst);
      }, expected);
    });

    it('should multiply by scalar', function() {
      var expected = [
        2, 4, 6,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.mulScalar(v, 2, dst);
      }, expected);
    });

    it('should divide by scalar', function() {
      var expected = [
        0.5, 1, 1.5,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.divScalar(v, 2, dst);
      }, expected);
    });

    it('should cross', function() {
      var expected = [
        2 * 6 - 3 * 4,
        3 * 2 - 1 * 6,
        1 * 4 - 2 * 2,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.cross(v, [2, 4, 6], dst);
      }, expected);
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

    it('should normalize', function() {
      var length = Math.sqrt(1 * 1 + 2 * 2 + 3 * 3);
      var expected = [
        1 / length,
        2 / length,
        3 / length,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.normalize(v, dst);
      }, expected);
    });

    it('should negate', function() {
      var expected = [
        -1, -2, -3,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.negate(v, dst);
      }, expected);
    });

    it('should copy', function() {
      var expected = [
        1, 2, 3,
      ];
      testV3WithAndWithoutDest(function(dst) {
        var result = v3.copy(v, dst);
        should.notStrictEqual(result, v);
        return result;
      }, expected);
    });

    it('should multiply', function() {
      var expected = [
        2, 8, 18,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.multiply(v, [2, 4, 6], dst);
      }, expected);
    });

    it('should divide', function() {
      var expected = [
        1/2, 2/3, 3/4,
      ];
      testV3WithAndWithoutDest(function(dst) {
        return v3.divide(v, [2, 3, 4], dst);
      }, expected);
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

