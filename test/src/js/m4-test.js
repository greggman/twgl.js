var path      = require('path');
var requirejs = require('requirejs');
var should    = require('should');

requirejs.config({
  nodeRequire: require,
  baseUrl: path.normalize(path.join(__dirname, '../../../src')),
});

var m4 = requirejs('./m4');

describe('m4', function() {

    it('should scale', function() {
        var m = [
           0,  1,  2,  3,
           4,  5,  6,  7,
           8,  9, 10, 11,
          12, 13, 14, 15,
        ];
        var d = m4.scale(m, [2,3,4]);
        var expect = new Float32Array([
           0,  2,  4,  6,
          12, 15, 18, 21,
          32, 36, 40, 44,
          12, 13, 14, 15,
        ]);
        d.should.eql(expect);
    });

});

