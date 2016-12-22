define([
    './twgl',
    './m4',
    './v3',
    './primitives',
  ], function(
    twgl,
    m4,
    v3,
    primitives
  ) {

    "use strict";

    twgl.m4 = m4;
    twgl.v3 = v3;
    twgl.primitives = primitives;
    return twgl;
});




