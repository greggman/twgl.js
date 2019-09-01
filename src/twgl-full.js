import * as m4 from './m4.js';
import * as v3 from './v3.js';
import * as primitives from './primitives.js';

import api from './twgl.js';
api.m4 = m4;
api.v3 = v3;
api.primitives = primitives;
export default api;

export * from './twgl.js';

export {
  m4,
  v3,
  primitives,
};
